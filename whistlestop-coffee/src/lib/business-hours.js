import { prisma } from '@/lib/prisma';

/**
 * Converts JavaScript's numeric day format into the enum values stored in Prisma.
 *
 * JavaScript: 0 = Sunday, 1 = Monday, ... 6 = Saturday
 *
 * Prisma DayOfWeek: SUNDAY, MONDAY, ... SATURDAY
 */
function getTodayEnum(date = new Date()) {
  const days = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];

  return days[date.getDay()];
}

/**
 * Converts a "HH:mm" time string into total minutes.
 *
 * Example:
 * "06:30" becomes 390.
 */
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

/**
 * Checks whether the kiosk is currently open.
 */
export async function getKioskOpenStatus() {
  const now = new Date();
  const today = getTodayEnum(now);

  const station = await prisma.station.findFirst({
    where: {
      isActive: true,
    },
    include: {
      openingHours: {
        where: {
          dayOfWeek: today,
        },
      },
    },
  });

  if (!station) {
    return {
      isOpen: false,
      message: 'Kiosk is not available right now.',
    };
  }

  const todayHours = station.openingHours[0];

  if (!todayHours || todayHours.isClosed) {
    return {
      isOpen: false,
      message: 'The kiosk is closed today.',
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(todayHours.openTime);
  const closeMinutes = timeToMinutes(todayHours.closeTime);

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  return {
    isOpen,
    message: isOpen
      ? 'The kiosk is open.'
      : `The kiosk is closed. Opening hours today are ${todayHours.openTime} to ${todayHours.closeTime}.`,
    stationId: station.id,
    openTime: todayHours.openTime,
    closeTime: todayHours.closeTime,
    isClosed: todayHours.isClosed,
  };
}
