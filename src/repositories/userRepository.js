const User = require('../models/User'); const {state}=require('../config/database'); const {store,withBase}=require('../data/memoryStore');
async function findByEmail(email){if(state.connected)return User.findOne({email:email.toLowerCase()}).lean();return store.users.find(u=>u.email===email.toLowerCase())||null}
async function findById(id){if(state.connected)return User.findById(id).lean();return store.users.find(u=>u._id===id)||null}
async function create(data){if(state.connected)return User.create(data);const user=withBase(data);store.users.push(user);return user}
async function update(id,data){if(state.connected)return User.findByIdAndUpdate(id,data,{new:true}).lean();const u=store.users.find(x=>x._id===id);if(u)Object.assign(u,data,{updatedAt:new Date()});return u}
module.exports={findByEmail,findById,create,update};
