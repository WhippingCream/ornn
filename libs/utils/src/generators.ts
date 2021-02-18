import { v1, v4 } from 'uuid';

export const generateString = (length: number) => {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return randomString;
};

export const generateUUID = (version: 1 | 4): string =>
  version === 1 ? v1() : v4();
