import { Court, TimeSlot } from '@/types';

function toHour(time: string | undefined, fallback: number) {
  if (!time || typeof time !== 'string' || !time.includes(':')) return fallback;
  const [hour] = time.split(':').map(Number);
  return Number.isFinite(hour) ? hour : fallback;
}

export function generateCourtSlotsForDate(court: Court, date: string): TimeSlot[] {
  if (Array.isArray(court.slots) && court.slots.length > 0) {
    return court.slots.map((slot, index) => ({
      id: `ts-${court.id}-${date}-${slot.startTime}-${index}`,
      courtId: court.id,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: slot.available !== false,
      blocked: false,
    }));
  }

  const startHour = toHour(court.operatingHoursStart, 6);
  const endHour = toHour(court.operatingHoursEnd, startHour + 1);
  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour < endHour; hour += 1) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    slots.push({
      id: `ts-${court.id}-${date}-${startTime}`,
      courtId: court.id,
      date,
      startTime,
      endTime,
      available: true,
      blocked: false,
    });
  }

  return slots;
}