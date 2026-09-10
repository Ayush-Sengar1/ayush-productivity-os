const Goal=require('../models/Goal');const {state}=require('../config/database');const {store,withBase}=require('../data/memoryStore');
async function list(owner){if(state.connected)return Goal.find({owner}).sort({status:1,targetDate:1}).lean();return store.goals.filter(x=>x.owner===owner).sort((a,b)=>new Date(a.targetDate||'2999')-new Date(b.targetDate||'2999'))}
async function create(owner,data){if(state.connected)return Goal.create({...data,owner});const g=withBase({...data,owner});store.goals.push(g);return g}
async function update(owner,id,data){if(state.connected)return Goal.findOneAndUpdate({_id:id,owner},{$set:data},{new:true}).lean();const g=store.goals.find(x=>x.owner===owner&&x._id===id);if(g)Object.assign(g,data,{updatedAt:new Date()});return g}
module.exports={list,create,update};
