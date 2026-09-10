const mongoose = require('mongoose');
const schema = new mongoose.Schema({owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},type:String,entityType:String,entityId:String,message:String,metadata:mongoose.Schema.Types.Mixed},{timestamps:true}); module.exports = mongoose.model('Activity', schema);
