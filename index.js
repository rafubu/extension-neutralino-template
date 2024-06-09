import conected from './conected.js';
import Logger from 'loger';

// "command": "bun ${NL_PATH}/extensions/bunexample/index.ts"

const main = async () => {
  try {
    const authData = await readStdin()
    conected(authData);
  } catch (error) {
    Logger.log('Error ', error);
    console.error('Error ', error);
    process.exit(1);
  }
}

const readStdin = async () => {
  let jsonData = '';
  for await (const chunk of Bun.stdin.stream()) {
    // chunk is Uint8Array
    // this converts it to text (assumes ASCII encoding)
    jsonData += Buffer.from(chunk).toString();
    //Logger.log('jsonData', jsonData);
  }

  return JSON.parse(jsonData);
}

main()