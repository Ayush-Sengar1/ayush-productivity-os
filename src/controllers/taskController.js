const taskService=require('../services/taskService');
const taskRepository=require('../repositories/taskRepository');

async function list(req,res,next){try{const items=await taskService.list(req.session.user.id,{status:req.query.status,priority:req.query.priority,project:req.query.project,goal:req.query.goal,milestone:req.query.milestone,search:req.query.search,from:req.query.from,to:req.query.to});res.json({items})}catch(e){next(e)}}
async function get(req,res,next){try{const item=await taskRepository.findById(req.session.user.id,req.params.id);if(!item)return res.status(404).json({error:'Task not found'});res.json({task:item})}catch(e){next(e)}}
async function parse(req,res){const parsed=taskService.parseQuickCapture(req.body.text||req.body.title||'');res.json({parsed})}
async function create(req,res,next){try{const task=await taskService.create(req.session.user.id,req.body);res.status(201).json({task})}catch(e){next(e)}}
async function update(req,res,next){try{const task=await taskService.update(req.session.user.id,req.params.id,req.body);if(!task)return res.status(404).json({error:'Task not found'});res.json({task})}catch(e){next(e)}}
async function complete(req,res,next){try{const task=await taskService.complete(req.session.user.id,req.params.id);if(!task)return res.status(404).json({error:'Task not found'});res.json({task})}catch(e){next(e)}}
async function duplicate(req,res,next){try{const task=await taskService.duplicate(req.session.user.id,req.params.id);if(!task)return res.status(404).json({error:'Task not found'});res.status(201).json({task})}catch(e){next(e)}}
async function snooze(req,res,next){try{const task=await taskService.snooze(req.session.user.id,req.params.id,req.body.days||1);if(!task)return res.status(404).json({error:'Task not found'});res.json({task})}catch(e){next(e)}}
async function reschedule(req,res,next){try{const task=await taskService.reschedule(req.session.user.id,req.params.id,req.body.dueDate,req.body.dueTime);if(!task)return res.status(404).json({error:'Task not found'});res.json({task})}catch(e){next(e)}}
async function subtask(req,res,next){try{const task=await taskService.createSubtask(req.session.user.id,req.params.id,req.body);if(!task)return res.status(404).json({error:'Parent task not found'});res.status(201).json({task})}catch(e){next(e)}}
async function remove(req,res,next){try{const result=await taskRepository.remove(req.session.user.id,req.params.id);res.json(result)}catch(e){next(e)}}
module.exports={list,get,parse,create,update,complete,duplicate,snooze,reschedule,subtask,remove};
