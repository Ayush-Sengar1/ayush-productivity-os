const taskRepository=require('../repositories/taskRepository');
const notificationService=require('../services/notificationService');
async function syncOwnerReminders(owner){return notificationService.syncForOwner(owner)}
function startReminderJob({intervalMs=60000}={}){const timer=setInterval(async()=>{try{await notificationService.syncAllKnownOwners()}catch(error){console.warn('Reminder scan failed:',error.message)}},intervalMs);timer.unref?.();return timer}
module.exports={syncOwnerReminders,startReminderJob};
