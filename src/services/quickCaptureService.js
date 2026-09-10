function pad(value){return String(value).padStart(2,'0')}
function dateKey(date){return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`}
function nextWeekday(now, target){const date=new Date(now);date.setHours(0,0,0,0);let delta=(target-date.getDay()+7)%7;if(delta===0)delta=7;date.setDate(date.getDate()+delta);return date}
function parseTime(text){const match=text.match(/(?:\bat\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);if(!match)return null;let hour=Number(match[1]);const minute=Number(match[2]||0);const meridiem=match[3].toLowerCase();if(hour<1||hour>12||minute>59)return null;if(meridiem==='pm'&&hour!==12)hour+=12;if(meridiem==='am'&&hour===12)hour=0;return {value:`${pad(hour)}:${pad(minute)}`,token:match[0]}}
function parseQuickCapture(input, now=new Date()){
  const original=String(input||'').trim();
  if(!original)return {title:'',dueDate:undefined,dueTime:undefined,priority:'medium',tags:[],taskType:'one_time'};
  let text=original;
  const tags=[...text.matchAll(/(^|\s)#([a-z0-9][a-z0-9_-]*)/gi)].map(match=>match[2].toLowerCase());
  text=text.replace(/(^|\s)#[a-z0-9][a-z0-9_-]*/gi,' ');
  let priority='medium';
  const priorityMatch=text.match(/(^|\s)(critical|urgent|high|medium|low)(?=\s|$)/i);
  if(priorityMatch){priority=priorityMatch[2].toLowerCase()==='urgent'?'critical':priorityMatch[2].toLowerCase();text=text.replace(priorityMatch[0],' ')}
  let dueDate;
  let recurrence={enabled:false,frequency:'daily',interval:1,weekdays:[]};
  const iso=text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if(iso){const date=new Date(Number(iso[1]),Number(iso[2])-1,Number(iso[3]));if(!Number.isNaN(date.getTime()))dueDate=dateKey(date);text=text.replace(iso[0],' ')}
  const relative=text.match(/\b(today|tomorrow)\b/i);
  if(relative){const date=new Date(now);date.setHours(0,0,0,0);if(relative[1].toLowerCase()==='tomorrow')date.setDate(date.getDate()+1);dueDate=dateKey(date);text=text.replace(relative[0],' ')}
  const names=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const weekdayMatches=[...text.matchAll(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi)];
  if(weekdayMatches.length){
    const weekdays=[...new Set(weekdayMatches.map(match=>names.indexOf(match[1].toLowerCase())))];
    const recurring=/\bevery\s+/i.test(text);
    dueDate=dateKey(nextWeekday(now,weekdays[0]));
    if(recurring)recurrence={enabled:true,frequency:'custom',interval:1,weekdays};
    text=text.replace(/\bevery\s+/ig,' ').replace(/\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/ig,' ');
    if(recurring)text=text.replace(/[,]/g,' ').replace(/\band\b/ig,' ');
  }
  const time=parseTime(text);if(time)text=text.replace(time.token,' ');
  const title=text.replace(/\s+/g,' ').replace(/\s+(?:at|by|on|every)\s*$/i,'').trim();
  return {title,dueDate,dueTime:time?.value,priority,tags:[...new Set(tags)],taskType:recurrence.enabled?'recurring':(dueDate?'short_term':'one_time'),recurrence,raw:original};
}
module.exports={parseQuickCapture,dateKey};
