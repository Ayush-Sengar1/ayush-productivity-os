const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
function toast(message,kind='success'){const el=$('#toast');if(!el)return;el.textContent=message;el.className='toast show '+kind;setTimeout(()=>el.className='toast',3200)}
function openTaskModal(){const m=$('#task-modal');if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');setTimeout(()=>$('#quick-task-form input[name=title]')?.focus(),80)}
function closeModals(){$$('.modal-backdrop,.palette-backdrop,.notifications-panel').forEach(x=>{x.classList.remove('open');x.setAttribute('aria-hidden','true')})}
function openPalette(){const p=$('#command-palette');if(!p)return;p.classList.add('open');p.setAttribute('aria-hidden','false');setTimeout(()=>$('#palette-input')?.focus(),80)}
function csrfToken(){return $('meta[name=csrf-token]')?.content||''}
async function json(url,options={}){const method=(options.method||'GET').toUpperCase();const headers={'Content-Type':'application/json',...(options.headers||{})};if(!['GET','HEAD','OPTIONS'].includes(method))headers['X-CSRF-Token']=csrfToken();const r=await fetch(url,{...options,headers});const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||'Request failed');return data}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function loadNotifications(){const panel=$('#notifications-panel');const list=$('#notification-list');if(!panel||!list)return;panel.classList.add('open');panel.setAttribute('aria-hidden','false');list.innerHTML='<div class="notification-empty">Loading notifications…</div>';try{const data=await json('/api/notifications');list.innerHTML=data.items.length?data.items.map(item=>`<button class="notification-item ${item.read?'':'unread'}" data-notification-id="${escapeHtml(item._id)}"><span class="notification-icon"><i data-lucide="${item.type==='task_reminder'?'alarm-clock':'bell'}"></i></span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.message)}</small></span></button>`).join(''):'<div class="notification-empty">You’re all caught up.</div>';window.lucide?.createIcons()}catch(error){list.innerHTML='<div class="notification-empty">Could not load notifications.</div>'}}
document.addEventListener('click',async e=>{
  const command=e.target.closest('[data-command]')?.dataset.command;
  if(command==='new-task')openTaskModal();
  if(command==='search')openPalette();
  if(command==='notifications')loadNotifications();
  if(command==='menu')$('.sidebar')?.classList.toggle('mobile-open');
  if(e.target.closest('[data-close-modal]'))closeModals();
  if(e.target.closest('[data-close-notifications]'))closeModals();
  if(e.target.closest('[data-notifications-read-all]')){try{await json('/api/notifications/read-all',{method:'POST'});toast('Notifications marked as read');await loadNotifications()}catch(error){toast(error.message,'error')}}
  const notification=e.target.closest('[data-notification-id]');if(notification){try{await json('/api/notifications/'+notification.dataset.notificationId+'/read',{method:'POST'});notification.remove()}catch(error){toast(error.message,'error')}}
  const open=e.target.closest('[data-open-inline]');if(open)$('#'+open.dataset.openInline)?.classList.toggle('hidden');
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals();if((e.key==='k'&&(e.metaKey||e.ctrlKey))||e.key==='/'){if(document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA'){e.preventDefault();openPalette()}}if(e.key.toLowerCase()==='n'&&document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA')openTaskModal()});
$('#quick-task-form')?.addEventListener('submit',async e=>{e.preventDefault();try{const values=Object.fromEntries(new FormData(e.target));const parsed=(await json('/api/tasks/parse',{method:'POST',body:JSON.stringify({text:values.title})})).parsed;const payload={...values,title:parsed.title||values.title,dueDate:values.dueDate||parsed.dueDate,dueTime:values.dueTime||parsed.dueTime,tags:values.tags||parsed.tags.join(','),priority:values.priority==='medium'&&parsed.priority!=='medium'?parsed.priority:values.priority,reminderEnabled:values.reminderEnabled==='on',reminderMinutes:values.reminderMinutes||15,recurrence:values.recurrenceEnabled==='on'?{enabled:true,frequency:values.recurrenceFrequency||'daily',interval:Number(values.recurrenceInterval||1)}:(parsed.recurrence||{enabled:false})};await json('/api/tasks',{method:'POST',body:JSON.stringify(payload)});closeModals();toast('Task added to your workspace');setTimeout(()=>location.reload(),500)}catch(err){toast(err.message,'error')}});
document.addEventListener('DOMContentLoaded',()=>{window.lucide?.createIcons()});
