const app=require('./app');
const env=require('./config/env');
const {connectDatabase}=require('./config/database');
const {startReminderJob}=require('./jobs/reminderJob');

async function start(){
  await connectDatabase();
  const server=app.listen(env.port,()=>console.log('Productivity OS running at http://localhost:'+env.port));
  startReminderJob({intervalMs:60000});
  return server;
}
if(require.main===module)start().catch(error=>{console.error(error);process.exit(1)});
module.exports={start};
