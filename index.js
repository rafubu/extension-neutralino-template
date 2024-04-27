 import path from 'path'
 const { join } = path;
 import conected from './conected.js';
 import pkg from './package.json'

 // "command": "bun ${NL_PATH}/extensions/bunexample/index.ts"

const main = async () => {

  try {
  // Importing the auth info from the Neutralinojs server
  const ruta = join(import.meta.dir,'..','..','.tmp');
  const jsonData = await import(join(ruta,'auth_info.json'));
  const authData = jsonData.default;

  await conected({ name: `js.neutralino.${pkg.name}`, authData, ruta });

  } catch (error) {
    console.error('Error ', error);
  }
}

main()