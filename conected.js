import { v4 as uuidv4 } from 'uuid';
import { readdir } from 'node:fs';
import { join } from 'node:path';

const loadActions = async (ruta) => {
  const archivos = await new Promise((resolve, reject) => {
    readdir(ruta, (err, archivos) => {
      if(err) reject(err);
      resolve(archivos);
    });
  });

  const actions = archivos.reduce(async (prev, archivo) => {
    if (!archivo.endsWith('.js')) return prev;
    const { default: action } = await import(join(ruta,archivo));
    if(typeof action !== 'function') return prev;
    prev[archivo.replace('.js','')] = action;
    return prev;
  },{});
  return actions;
}

export default async ({
  name = '',
  authData = { nlPort: 0, nlToken: '', nlConnectToken: '' }, 
  ruta }) => {
  try {

    const { nlPort, nlToken, nlConnectToken } = authData

    const client = new WebSocket(`ws://localhost:${nlPort}?extensionId=${name}&connectToken=${nlConnectToken}`);

    client.onopen = () => console.log('Connected to Neutralino');

    const actions = await loadActions(join(import.meta.dir,'actions'));

    const send = (event, data) => {
      client.send(JSON.stringify({
        id: uuidv4(),
        method: 'app.broadcast',
        accessToken: nlToken,
        data: {
          event,
          data
        }
      }));
    };

    client.onmessage = (e) => {
      if (typeof e.data === 'string') {
        let message = JSON.parse(e.data);
        if(actions[message.event]){
          actions[message.event]( message.data, send );
        }
      }
    };

    client.onclose = () => process.exit();

    client.onerror = (error) => {
      console.log('Error ', error);
    };

  } catch (error) {
    console.error('Error ', error);
  }

}