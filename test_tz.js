process.env.TZ = 'Asia/Kolkata';
const d = new Date('2026-07-10T05:30:00.000Z');
console.log('Hour with TZ:', d.getHours());
