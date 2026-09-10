const mongoose = require('mongoose');
const schema = new mongoose.Schema({owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},title:String,message:String,type:{type:String,default:'info'},read:{type:Boolean,default:false},link:String},{timestamps:true}); module.exports = mongoose.model('Notification', schema);
