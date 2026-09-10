const { randomUUID } = require('node:crypto');
const store = { users: [], tasks: [], projects: [], goals: [], milestones: [], habits: [], habitLogs: [], notes: [], notifications: [], activities: [] };
const id = () => randomUUID();
const now = () => new Date();
function withBase(data, owner) { return { _id: id(), owner, createdAt: now(), updatedAt: now(), ...data }; }
module.exports = { store, id, now, withBase };
