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

export const getCurrTimeDataToString = (): {
  currYear: string;
  currMonth: string;
  currDate: string;
  currTimeStamp: string;
} => {
  const currDateTime = new Date();
  const currYear = currDateTime.getFullYear().toString();

  const formatWithLeadingZero = (num: number): string =>
    num < 10 ? `0${num}` : num.toString();

  const currMonth = formatWithLeadingZero(currDateTime.getMonth() + 1);
  const currDate = formatWithLeadingZero(currDateTime.getDate());
  const currTimeStamp = currDateTime.getTime().toString();

  return { currYear, currMonth, currDate, currTimeStamp };
};

export const getDateInterval = (beginingDate?: Date, endingDate?: Date) => {
  if (!beginingDate && !endingDate) {
    return { startDate: undefined, endDate: undefined };
  }

  const { startOfTheDay, endOfTheDay } = prepareDateInterval(
    beginingDate ? new Date(beginingDate) : null,
    endingDate ? new Date(endingDate) : null,
  );

  return { startDate: startOfTheDay, endDate: endOfTheDay };
};
