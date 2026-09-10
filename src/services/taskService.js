const {randomUUID}=require('node:crypto');
const tasks=require('../repositories/taskRepository');
const activity=require('./activityService');
const {normalizeRecurrence,nextOccurrence,dateKey}=require('./recurrenceService');
const {parseQuickCapture}=require('./quickCaptureService');

function cleanTags(tags){
  const values=Array.isArray(tags)?tags:String(tags||'').split(',');
  return [...new Set(values.flatMap(value=>String(value).split(/\s+/)).map(value=>value.trim().toLowerCase().replace(/^#/,'')).filter(Boolean))];
}
function asBoolean(value){return value===true||value==='true'||value==='1'||value==='on';}
function normalize(input={}){
  const parsed=input.quickCapture?parseQuickCapture(input.title):null;
  const source=parsed?{...parsed,...input,title:input.title||parsed.title}:input;
  return {
    title:String(source.title||'').trim(),
    description:String(source.description||'').trim(),
    status:source.status||'todo',
    priority:source.priority||parsed?.priority||'medium',
    dueDate:source.dueDate||parsed?.dueDate||undefined,
    dueTime:source.dueTime||parsed?.dueTime||undefined,
    startDate:source.startDate||undefined,
    estimatedDuration:source.estimatedDuration?Number(source.estimatedDuration):undefined,
    actualDuration:source.actualDuration?Number(source.actualDuration):undefined,
    tags:cleanTags(source.tags?.length?source.tags:parsed?.tags),
    category:String(source.category||'').trim(),
    project:source.project||undefined,
    goal:source.goal||undefined,
    milestone:source.milestone||undefined,
    assignee:source.assignee||undefined,
    parentTask:source.parentTask||undefined,
    taskType:source.taskType||parsed?.taskType||'one_time',
    recurrenceSeriesId:source.recurrenceSeriesId||undefined,
    occurrenceDate:source.occurrenceDate||undefined,
    notes:String(source.notes||'').trim(),
    attachments:Array.isArray(source.attachments)?source.attachments:[],
    reminder:{enabled:asBoolean(source.reminderEnabled)||asBoolean(source.reminder?.enabled),minutesBefore:Math.max(1,Number(source.reminderMinutes||source.reminder?.minutesBefore||15))},
    recurrence:normalizeRecurrence(source.recurrence||{}),
    completedAt:source.status==='completed'?source.completedAt||new Date():undefined
  };
}
async function create(owner,input){
  const data=normalize(input);if(!data.title)throw new Error('Task title is required');
  if(data.recurrence.enabled&&!data.recurrenceSeriesId)data.recurrenceSeriesId=randomUUID();
  const task=await tasks.create(owner,data);
  await activity.record(owner,{type:'task_created',entityType:'task',entityId:String(task._id),message:'Created task: '+data.title});
  return task;
}
async function complete(owner,id){
  const original=await tasks.findById(owner,id);
  const task=await tasks.update(owner,id,{status:'completed',completedAt:new Date()});
  if(task)await activity.record(owner,{type:'task_completed',entityType:'task',entityId:String(id),message:'Completed task: '+task.title});
  if(task&&original?.recurrence?.enabled){
    const next=nextOccurrence(original,original.dueDate||new Date());
    if(next){
      const series=original.recurrenceSeriesId||randomUUID();const existing=await tasks.list(owner,{});
      const alreadyExists=existing.some(item=>item.recurrenceSeriesId===series&&item.occurrenceDate&&dateKey(item.occurrenceDate)===dateKey(next));
      if(!alreadyExists)await create(owner,{title:original.title,description:original.description,priority:original.priority,dueDate:next.toISOString().slice(0,10),dueTime:original.dueTime,startDate:original.startDate,estimatedDuration:original.estimatedDuration,tags:original.tags,category:original.category,project:original.project,goal:original.goal,taskType:original.taskType,notes:original.notes,reminder:original.reminder,recurrence:original.recurrence,recurrenceSeriesId:series,occurrenceDate:next});
    }
  }
  return task;
}
async function update(owner,id,input){
  const data=normalize(input);delete data.title;
  const task=await tasks.update(owner,id,data);
  if(task)await activity.record(owner,{type:'task_updated',entityType:'task',entityId:String(id),message:'Updated task: '+task.title});
  return task;
}
async function duplicate(owner,id){
  const original=await tasks.findById(owner,id);if(!original)return null;
  return create(owner,{title:`${original.title} (copy)`,description:original.description,priority:original.priority,dueDate:original.dueDate?new Date(original.dueDate).toISOString().slice(0,10):undefined,dueTime:original.dueTime,tags:original.tags,category:original.category,project:original.project,goal:original.goal,taskType:original.taskType,notes:original.notes});
}
async function snooze(owner,id,days=1){
  const original=await tasks.findById(owner,id);if(!original)return null;
  const date=new Date(original.dueDate||Date.now());date.setHours(0,0,0,0);date.setDate(date.getDate()+Math.max(1,Number(days)||1));
  return tasks.update(owner,id,{dueDate:date,dueTime:original.dueTime,status:'todo'});
}
async function reschedule(owner,id,dueDate,dueTime){
  if(!dueDate)throw new Error('A due date is required');
  return tasks.update(owner,id,{dueDate,dueTime:dueTime||undefined,status:'todo'});
}
async function createSubtask(owner,parentId,input){
  const parent=await tasks.findById(owner,parentId);if(!parent)return null;
  return create(owner,{...input,parentTask:parentId,project:input.project||parent.project,goal:input.goal||parent.goal});
}
async function list(owner,filters){return tasks.list(owner,filters)}
async function summary(owner){
  const all=await tasks.list(owner,{});const now=new Date();const start=new Date(now);start.setHours(0,0,0,0);const tomorrow=new Date(start);tomorrow.setDate(start.getDate()+1);const week=new Date(start);week.setDate(start.getDate()-6);
  const dueToday=all.filter(t=>t.dueDate&&new Date(t.dueDate)>=start&&new Date(t.dueDate)<tomorrow&&t.status!=='completed'&&t.status!=='cancelled');
  const overdue=all.filter(t=>t.dueDate&&new Date(t.dueDate)<start&&t.status!=='completed'&&t.status!=='cancelled');
  const completedToday=all.filter(t=>t.status==='completed'&&t.completedAt&&new Date(t.completedAt)>=start);
  const completedWeek=all.filter(t=>t.status==='completed'&&t.completedAt&&new Date(t.completedAt)>=week);
  const upcoming=all.filter(t=>t.dueDate&&new Date(t.dueDate)>=tomorrow&&t.status!=='completed'&&t.status!=='cancelled').slice(0,6);
  return {all,dueToday,overdue,completedToday,completedWeek,upcoming};
}
module.exports={create,complete,update,duplicate,snooze,reschedule,createSubtask,list,summary,normalize,parseQuickCapture};
