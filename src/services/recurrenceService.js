function startOfDay(value){const date=new Date(value);date.setHours(0,0,0,0);return date}
function dateKey(value){return startOfDay(value).toISOString().slice(0,10)}
function clampDay(year,month,day){return Math.min(day,new Date(year,month+1,0).getDate())}
function nextOccurrence(task,from=new Date()){
  if(!task.recurrence?.enabled)return null;
  const recurrence=task.recurrence;const current=startOfDay(from);const interval=Math.max(1,Number(recurrence.interval||1));let candidate=new Date(current);
  if(recurrence.frequency==='daily'){candidate.setDate(candidate.getDate()+interval)}
  else if(recurrence.frequency==='weekdays'){do candidate.setDate(candidate.getDate()+1);while([0,6].includes(candidate.getDay()))}
  else if(recurrence.frequency==='weekly'||recurrence.frequency==='biweekly'){
    const step=7*(recurrence.frequency==='biweekly'?2:1)*interval;candidate.setDate(candidate.getDate()+step);
  }else if(recurrence.frequency==='monthly'){
    const day=Number(recurrence.dayOfMonth||task.dueDate&&new Date(task.dueDate).getDate()||current.getDate());candidate.setMonth(candidate.getMonth()+interval,1);candidate.setDate(clampDay(candidate.getFullYear(),candidate.getMonth(),day));
  }else if(recurrence.frequency==='yearly'){
    const month=task.dueDate?new Date(task.dueDate).getMonth():current.getMonth();const day=task.dueDate?new Date(task.dueDate).getDate():current.getDate();candidate.setFullYear(candidate.getFullYear()+interval,month,1);candidate.setDate(clampDay(candidate.getFullYear(),month,day));
  }else if(recurrence.frequency==='custom'){
    const weekdays=(recurrence.weekdays||[]).map(Number);if(!weekdays.length)return null;for(let i=1;i<=14*interval;i++){const probe=new Date(current);probe.setDate(current.getDate()+i);if(weekdays.includes(probe.getDay())){candidate=probe;break}}
  }
  if(recurrence.endsAt&&candidate>new Date(recurrence.endsAt))return null;
  candidate.setHours(12,0,0,0);
  return candidate;
}
function normalizeRecurrence(input={}){return {enabled:Boolean(input.enabled),frequency:input.frequency||'daily',interval:Math.max(1,Number(input.interval||1)),weekdays:Array.isArray(input.weekdays)?input.weekdays.map(Number).filter(day=>day>=0&&day<=6):[],dayOfMonth:input.dayOfMonth?Number(input.dayOfMonth):undefined,endsAt:input.endsAt||undefined}}
function occurrenceKey(task,date){return `${task._id}:${dateKey(date)}`}
module.exports={nextOccurrence,normalizeRecurrence,occurrenceKey,dateKey};
