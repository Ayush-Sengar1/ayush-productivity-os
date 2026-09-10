const Note=require('../models/Note');const {state}=require('../config/database');const {store,withBase}=require('../data/memoryStore');
async function list(owner){if(state.connected)return Note.find({owner}).sort({updatedAt:-1}).lean();return store.notes.filter(x=>x.owner===owner).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt))}
async function create(owner,data){if(state.connected)return Note.create({...data,owner});const n=withBase({...data,owner});store.notes.push(n);return n}
module.exports={list,create};
