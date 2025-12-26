export interface ITimeMark {
  /** минуты от начала дня */
  minutesFromStart: number;
  label: string;
}

export function generateTimeMarks(options: {
  startHour: number;
  endHour: number;
  stepMinutes: number;
}): ITimeMark[] {
  const { startHour, endHour, stepMinutes } = options;
  const marks: ITimeMark[] = [];

  const totalMinutes = (endHour - startHour) * 60;
  for (let m = 0; m <= totalMinutes; m += stepMinutes) {
    const minutesFromStart = m;
    const hours = startHour + Math.floor(m / 60);
    const minutes = m % 60;
    marks.push({
      minutesFromStart,
      label: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    });
  }

  return marks;
}
