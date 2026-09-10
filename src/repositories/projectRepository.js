const Project=require('../models/Project');const {state}=require('../config/database');const {store,withBase}=require('../data/memoryStore');
async function list(owner){if(state.connected)return Project.find({owner}).sort({status:1,deadline:1}).lean();return store.projects.filter(x=>x.owner===owner).sort((a,b)=>new Date(a.deadline||'2999')-new Date(b.deadline||'2999'))}
async function create(owner,data){if(state.connected)return Project.create({...data,owner});const p=withBase({...data,owner});store.projects.push(p);return p}
async function findById(owner,id){if(state.connected)return Project.findOne({_id:id,owner}).lean();return store.projects.find(x=>x.owner===owner&&x._id===id)||null}
module.exports={list,create,findById};
