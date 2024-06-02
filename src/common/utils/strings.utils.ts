import { getCurrTimeDataToString } from './dates.utils';

export const getFirstAndLastChars = (str: string): string =>
  str[0].toUpperCase() + str.charAt(str.length - 1).toUpperCase();

export const getFourFirstChars = (str: string): string => {
  str = str.replace(/\s/g, '').toUpperCase();

  if (str.length >= 4) {
    return str.substring(0, 4);
  }
  return str.padEnd(4, 'O');
};

export const encodeNumberToString = (num: number): string =>
  num.toString(36).toUpperCase();

export const getTwoLastCharsOfStr = (str: string): string => {
  if (str.length >= 2) {
    return str.slice(-2);
  }
  return str.padStart(2, '0');
};

export const prepareUniqueCode = (
  mainStr: string,
  type: { name: string },
): string => {
  const firstFourCharsOfCustomer = getFourFirstChars(mainStr);
  const firstAndLastCharsOfTruckType = getFirstAndLastChars(type.name);
  const { currYear, currMonth, currDate, currTimeStamp } =
    getCurrTimeDataToString();

  const numberToEncode = parseInt(
    `${currMonth}${currDate}${currTimeStamp}`,
    10,
  );
  const twoLastDigitOfCurrYear = getTwoLastCharsOfStr(currYear);
  const encodedString = encodeNumberToString(numberToEncode);
  return `${firstFourCharsOfCustomer}${firstAndLastCharsOfTruckType}${twoLastDigitOfCurrYear}${encodedString}`;
};
