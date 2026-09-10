const Activity=require('../models/Activity');const {state}=require('../config/database');const {store,withBase}=require('../data/memoryStore');
async function record(owner,data){if(state.connected)return Activity.create({...data,owner});const a=withBase({...data,owner});store.activities.unshift(a);return a}
async function recent(owner,limit=8){if(state.connected)return Activity.find({owner}).sort({createdAt:-1}).limit(limit).lean();return store.activities.filter(x=>x.owner===owner).slice(0,limit)}
module.exports={record,recent};
