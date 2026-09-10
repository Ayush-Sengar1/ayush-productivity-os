const mongoose = require('mongoose');
const schema = new mongoose.Schema({owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},title:{type:String,required:true,trim:true},project:{type:mongoose.Schema.Types.ObjectId,ref:'Project'},goal:{type:mongoose.Schema.Types.ObjectId,ref:'Goal'},dueDate:Date,status:{type:String,enum:['todo','in_progress','completed'],default:'todo'},progress:{type:Number,min:0,max:100,default:0}},{timestamps:true});
module.exports = mongoose.model('Milestone', schema);
