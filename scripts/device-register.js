const { default: axios } = require('axios');
const readlineSync = require('readline-sync');

const credential = {
  email: null,
  password: null,
};

async function run() {
  credential.email = readlineSync.question('KakaoTalk    Email: ');
  credential.password = readlineSync.question('KakaoTalk Password: ', {
    hideEchoBack: true,
  });

  try {
    await axios({
      method: 'put',
      url: 'http://localhost:3000/api/v1/kakao/credentials',
      data: credential,
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  try {
    await axios({
      method: 'put',
      url: 'http://localhost:3000/api/v1/kakao/auth/request-passcord',
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  const passcord = readlineSync.question(
    'Check your mobile device\n          Passcord: ',
  );
  try {
    await axios({
      method: 'put',
      url: 'http://localhost:3000/api/v1/kakao/auth/register-device',
      data: {
        passcord,
      },
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  try {
    await axios({
      method: 'put',
      url: 'http://localhost:3000/api/v1/kakao/talk/login',
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Success');
}

run();
