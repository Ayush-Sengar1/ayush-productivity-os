const test=require('node:test');
const assert=require('node:assert/strict');
const {parseQuickCapture}=require('../src/services/quickCaptureService');
const {nextOccurrence}=require('../src/services/recurrenceService');
const taskService=require('../src/services/taskService');
const taskRepository=require('../src/repositories/taskRepository');
const notificationService=require('../src/services/notificationService');
const {store}=require('../src/data/memoryStore');
const {state}=require('../src/config/database');

function reset(){for(const key of Object.keys(store))store[key].length=0;state.connected=false;}

test('quick capture parses dates, time, priority, and tags',()=>{
  const parsed=parseQuickCapture('Finish resume tomorrow at 7pm #career high',new Date(2026,8,8,12));
  assert.equal(parsed.title,'Finish resume');assert.equal(parsed.dueDate,'2026-09-09');assert.equal(parsed.dueTime,'19:00');assert.equal(parsed.priority,'high');assert.deepEqual(parsed.tags,['career']);
});

test('quick capture creates a recurring weekday definition',()=>{
  const parsed=parseQuickCapture('Study DSA every Monday, Wednesday and Friday at 7pm #study',new Date(2026,8,8,12));
  assert.equal(parsed.title,'Study DSA');assert.equal(parsed.taskType,'recurring');assert.deepEqual(parsed.recurrence.weekdays,[1,3,5]);assert.equal(parsed.dueTime,'19:00');
});

test('recurrence calculates the next occurrence',()=>{
  const next=nextOccurrence({dueDate:new Date(2026,8,8),recurrence:{enabled:true,frequency:'custom',weekdays:[1,3,5]}},new Date(2026,8,8));
  assert.equal(next.toISOString().slice(0,10),'2026-09-09');
});

test('completing a recurring task creates one next occurrence only',async()=>{
  reset();const owner='test-owner';
  const task=await taskService.create(owner,{title:'Study DSA',dueDate:'2026-09-08',taskType:'recurring',recurrence:{enabled:true,frequency:'daily',interval:1}});
  await taskService.complete(owner,task._id);await taskService.complete(owner,task._id);
  const items=await taskRepository.list(owner,{});assert.equal(items.length,2);assert.equal(items.filter(item=>item.status==='todo').length,1);assert.equal(items.filter(item=>item.status==='completed').length,1);
});

test('reminder synchronization is idempotent',async()=>{
  reset();const owner='test-owner';const task=await taskService.create(owner,{title:'Submit application',dueDate:'2020-01-01',reminderEnabled:true,reminderMinutes:15});
  const first=await notificationService.syncForOwner(owner);const second=await notificationService.syncForOwner(owner);assert.equal(first.created,1);assert.equal(second.created,0);assert.equal((await notificationService.list(owner)).length,1);await notificationService.markAllRead(owner);assert.equal((await notificationService.list(owner)).length,0);assert.ok(task);
});
