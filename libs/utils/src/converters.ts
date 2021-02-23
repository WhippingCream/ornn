import { DateTime } from 'luxon';
import { CommonDate, CommonTime } from './interfaces';

const str2boolConverter = (src: string): boolean | null => {
  const stringBool = src.replace(/['"]+/g, '');

  let result = null;
  if (stringBool === 'true' || stringBool === 't' || stringBool === '참') {
    result = true;
  } else if (
    stringBool === 'false' ||
    stringBool === 'f' ||
    stringBool === '거짓'
  ) {
    result = false;
  }
  return result;
};

const str2intConverter = (src: string): number | null => {
  const result = parseInt(src, 10);

  return isNaN(result) ? null : result;
};

const str2numConverter = (src: string): number | null => {
  const result = Number(src);

  return isNaN(result) ? null : result;
};

const str2timeConverter = (src: string): CommonTime | null => {
  // HH:mm
  if (/^([01]\d|2[0-3]):?([0-5]\d)$/.test(src)) {
    const { hour, minute } = DateTime.fromFormat(src, 'HH:mm');
    return { hour, minute };
  }

  // HH:mm:dd
  if (/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/.test(src)) {
    const { hour, minute, second } = DateTime.fromFormat(src, 'HH:mm:ss');
    return { hour, minute, second };
  }

  return null;
};

const str2dateConverter = (src: string): CommonDate | null => {
  // MM/dd | MM.dd => MM-dd
  const _src = src.replace(/[/\.]+/g, '-');

  // MM-dd
  if (/^(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/.test(_src)) {
    const { month, day } = DateTime.fromFormat(_src, 'MM-dd');
    return { month, day };
  }

  return null;
};

export const converters = {
  str2bool: str2boolConverter,
  str2int: str2intConverter,
  str2num: str2numConverter,
  str2time: str2timeConverter,
  str2date: str2dateConverter,
};
