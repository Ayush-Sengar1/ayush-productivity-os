const mongoose = require('mongoose');
const schema = new mongoose.Schema({owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},name:{type:String,required:true,trim:true,maxLength:120},description:String,color:{type:String,default:'#21b88a'},frequency:{type:{type:String,enum:['daily','weekly','custom'],default:'daily'},days:[{type:Number,min:0,max:6}],interval:{type:Number,default:1}},targetPerWeek:{type:Number,default:7,min:1,max:7},active:{type:Boolean,default:true}},{timestamps:true});
module.exports = mongoose.model('Habit', schema);
