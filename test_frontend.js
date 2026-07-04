const data = { date: '2026-09-10', startTime: '13:00', endTime: '15:00' };
const startDateTime = new Date(`${data.date}T${data.startTime}`);
const endDateTime = new Date(`${data.date}T${data.endTime}`);
const startHour = startDateTime.getHours();
const endHour = endDateTime.getHours();
console.log('startHour:', startHour, 'endHour:', endHour);
console.log('condition:', startHour < 11 || endHour > 23 || (endHour === 23 && endDateTime.getMinutes() > 0));
