const Notification=require('../models/Notification');
const User=require('../models/User');
const {state}=require('../config/database');
const {store,withBase}=require('../data/memoryStore');
const taskRepository=require('../repositories/taskRepository');

async function list(owner,{unreadOnly=true,limit=20}={}){
  if(state.connected){
    const query={owner};
    if(unreadOnly)query.read=false;
    return Notification.find(query).sort({createdAt:-1}).limit(Math.min(Number(limit)||20,100)).lean();
  }
  return store.notifications.filter(item=>item.owner===owner&&(!unreadOnly||!item.read)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,Math.min(Number(limit)||20,100));
}
async function create(owner,data){
  const payload={owner,title:String(data.title||'Notification').trim(),message:String(data.message||'').trim(),type:data.type||'info',link:data.link||undefined,read:false};
  if(state.connected)return Notification.create(payload);
  const item=withBase(payload,owner);store.notifications.push(item);return item;
}
async function markRead(owner,id){
  if(state.connected)return Notification.findOneAndUpdate({_id:id,owner},{$set:{read:true}},{new:true}).lean();
  const item=store.notifications.find(x=>x.owner===owner&&x._id===id);if(item){item.read=true;item.updatedAt=new Date()}return item||null;
}
async function markAllRead(owner){
  if(state.connected)return Notification.updateMany({owner,read:false},{$set:{read:true}});
  let count=0;store.notifications.filter(x=>x.owner===owner&&!x.read).forEach(x=>{x.read=true;x.updatedAt=new Date();count++});return {modifiedCount:count};
}
async function syncForOwner(owner){
  const now=new Date();const tasks=await taskRepository.list(owner,{});const existing=await list(owner,{unreadOnly:false,limit:100});let created=0;
  for(const task of tasks){
    if(!task.reminder?.enabled||!task.dueDate||['completed','cancelled'].includes(task.status))continue;
    const due=new Date(task.dueDate);if(task.dueTime){const [hours,minutes]=String(task.dueTime).split(':').map(Number);if(Number.isFinite(hours)){due.setHours(hours,Number.isFinite(minutes)?minutes:0,0,0)}}
    const remindAt=new Date(due.getTime()-Number(task.reminder.minutesBefore||15)*60000);if(remindAt>now)continue;
    const link=`/tasks?task=${task._id}`;if(existing.some(x=>x.type==='task_reminder'&&x.link===link))continue;
    await create(owner,{title:'Task reminder',message:`${task.title} is due ${due<=now?'now':'soon'}.`,type:'task_reminder',link});created++;
  }
  return {created};
}
async function syncAllKnownOwners(){
  const owners=state.connected?await User.find({}, {_id:1}).lean():store.users.map(x=>({_id:x._id}));
  for(const owner of owners)await syncForOwner(String(owner._id));
}
module.exports={list,create,markRead,markAllRead,syncForOwner,syncAllKnownOwners};
