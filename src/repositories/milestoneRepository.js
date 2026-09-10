const Milestone=require('../models/Milestone');
const {state}=require('../config/database');
const {store,withBase}=require('../data/memoryStore');
async function list(owner,filters={}){if(state.connected){const query={owner};if(filters.project)query.project=filters.project;if(filters.goal)query.goal=filters.goal;return Milestone.find(query).sort({status:1,dueDate:1}).lean()}return store.milestones.filter(item=>item.owner===owner&&(!filters.project||String(item.project)===String(filters.project))&&(!filters.goal||String(item.goal)===String(filters.goal))).sort((a,b)=>new Date(a.dueDate||'2999')-new Date(b.dueDate||'2999'))}
async function create(owner,data){if(state.connected)return Milestone.create({...data,owner});const item=withBase({...data,owner});store.milestones.push(item);return item}
async function update(owner,id,data){if(state.connected)return Milestone.findOneAndUpdate({_id:id,owner},{$set:data},{new:true}).lean();const item=store.milestones.find(x=>x.owner===owner&&x._id===id);if(item)Object.assign(item,data,{updatedAt:new Date()});return item||null}
async function findById(owner,id){if(state.connected)return Milestone.findOne({_id:id,owner}).lean();return store.milestones.find(x=>x.owner===owner&&x._id===id)||null}
module.exports={list,create,update,findById};
