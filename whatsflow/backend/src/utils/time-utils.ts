/**
 * Check if current time falls within any of the specified time ranges
 * @param schedule Array of time ranges [{from: "HH:MM", to: "HH:MM"}]
 * @returns true if current time is within any range, or if schedule is empty (24/7)
 */
export function isWithinSchedule(schedule?: { from: string; to: string }[]): boolean {
  // If no schedule defined, AI is active 24/7
  if (!schedule || schedule.length === 0) {
    return true;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const range of schedule) {
    const [fromHour, fromMin] = range.from.split(':').map(Number);
    const [toHour, toMin] = range.to.split(':').map(Number);

    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;

    // Handle ranges that cross midnight (e.g., 18:00 to 07:00)
    if (fromMinutes > toMinutes) {
      // Range crosses midnight
      if (currentMinutes >= fromMinutes || currentMinutes < toMinutes) {
        return true;
      }
    } else {
      // Normal range within same day
      if (currentMinutes >= fromMinutes && currentMinutes < toMinutes) {
        return true;
      }
    }
  }

  return false;
}
