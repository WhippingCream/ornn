import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const cmdQuestion = (question: string): string => {
  let result: string;

  console.log(question);

  rl.on('line', function (line) {
    result = line;
    rl.close();
  });

  return result;
};
