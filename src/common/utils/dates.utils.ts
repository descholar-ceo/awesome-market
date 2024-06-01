export const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const prepareDateInterval = (
  fromDate?: Date,
  toDate?: Date,
  currentDate: Date = new Date(),
): { startOfTheDay: Date; endOfTheDay: Date } => {
  const getStartOfDay = (date: Date) =>
    new Date(`${formatDate(date)}T00:00:00`);
  const getEndOfDay = (date: Date) => new Date(`${formatDate(date)}T23:59:59`);

  let startOfTheDay: Date;
  let endOfTheDay: Date;

  if (fromDate) {
    startOfTheDay = getStartOfDay(fromDate);
    endOfTheDay = toDate ? getEndOfDay(toDate) : getEndOfDay(currentDate);
  } else {
    startOfTheDay = getStartOfDay(currentDate);
    endOfTheDay = getEndOfDay(currentDate);
  }

  return { startOfTheDay, endOfTheDay };
};
