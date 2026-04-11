export function generateCourtSlots(court, date) {
  if (Array.isArray(court.slots) && court.slots.length > 0) {
    return court.slots.map((slot, index) => ({
      id: `${court.name}-${date}-${slot.startTime}-${index}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: slot.available !== false,
    }));
  }

  const [startHour] = court.operatingHoursStart.split(':').map(Number);
  const [endHour] = court.operatingHoursEnd.split(':').map(Number);
  const slots = [];

  for (let hour = startHour; hour < endHour; hour += 1) {
    slots.push({
      id: `${court.name}-${date}-${hour}`,
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + 1).padStart(2, '0')}:00`,
      available: true,
    });
  }

  return slots;
}
