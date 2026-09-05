export interface OpenStatusResult {
  isOpen: boolean;
  statusText: string;
  badgeColor: string;
  nextScheduleText: string;
}

/**
 * Retorna se a cafeteria está aberta agora com base nos horários:
 * Seg-Sex: 08:00 - 20:00
 * Sáb: 09:00 - 21:00
 * Dom: 09:00 - 18:00
 */
export function getStoreOpenStatus(customDate?: Date): OpenStatusResult {
  const now = customDate || new Date();
  const day = now.getDay(); // 0 = Domingo, 1-5 = Seg-Sex, 6 = Sábado
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  let openTimeMinutes = 8 * 60; // 08:00
  let closeTimeMinutes = 20 * 60; // 20:00
  let dayScheduleName = 'Segunda a sexta';
  let hoursText = '08:00 às 20:00';

  if (day === 0) {
    // Domingo
    openTimeMinutes = 9 * 60;
    closeTimeMinutes = 18 * 60;
    dayScheduleName = 'Domingo';
    hoursText = '09:00 às 18:00';
  } else if (day === 6) {
    // Sábado
    openTimeMinutes = 9 * 60;
    closeTimeMinutes = 21 * 60;
    dayScheduleName = 'Sábado';
    hoursText = '09:00 às 21:00';
  }

  const isOpen = currentMinutes >= openTimeMinutes && currentMinutes < closeTimeMinutes;

  if (isOpen) {
    const closingInMinutes = closeTimeMinutes - currentMinutes;
    const closingInHours = Math.floor(closingInMinutes / 60);

    return {
      isOpen: true,
      statusText: 'Aberto agora',
      badgeColor: 'bg-[#6B8B70] text-[#F7F4EF]',
      nextScheduleText: `Fecha às ${Math.floor(closeTimeMinutes / 60).toString().padStart(2, '0')}:${(closeTimeMinutes % 60).toString().padStart(2, '0')}`,
    };
  } else {
    return {
      isOpen: false,
      statusText: 'Fechado no momento',
      badgeColor: 'bg-[#2C3E35]/15 text-[#2C3E35]',
      nextScheduleText: `Abre às ${Math.floor(openTimeMinutes / 60).toString().padStart(2, '0')}:00 (${dayScheduleName})`,
    };
  }
}
