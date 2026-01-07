// Dexie.js Database Definition
const db = new Dexie('HealthOS_Pro_V1');
db.version(1).stores({
    entries: 'date', 
    settings: 'key',
    goals: 'id'
});
window.db = db; // Export global