const mongoose = require('mongoose');
const schema = new mongoose.Schema({owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},habit:{type:mongoose.Schema.Types.ObjectId,ref:'Habit',required:true,index:true},date:{type:Date,required:true,index:true},completed:{type:Boolean,default:true},note:String},{timestamps:true});
schema.index({habit:1,date:1},{unique:true}); module.exports = mongoose.model('HabitLog', schema);
