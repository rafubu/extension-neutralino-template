import { v4 as uuidv4 } from 'uuid';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Logger from 'loger'

const loadActions = async (ruta) => {
  const archivos = await readdir(ruta);
  return await new Promise(async (resolve) => {
    const actions = {};
    for (const archivo of archivos) {
      if (!archivo.endsWith('.js')) return;
      const action = await import(join(ruta, archivo)).then(mod => mod.default);
      if (typeof action === 'function') {
        actions[archivo.replace('.js', '')] = action;
      }
    }
    resolve(actions);
  });
}

export default async ({ nlPort, nlToken, nlConnectToken, nlExtensionId }) => {
  try {

    const client = new WebSocket(`ws://localhost:${nlPort}?extensionId=${nlExtensionId}&connectToken=${nlConnectToken}`);

    //client.onopen = () => Logger.log('Conected to Neutralinojs server');

    const path = join(import.meta.dir, 'actions')
    const actions = await loadActions(path);

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
      //Logger.log('Message received', e.data);
      if (typeof e.data === 'string') {
        let message = JSON.parse(e.data);
        if (actions[message.event]) {
          actions[message.event](message.data, send);
        }
      }
    };

    client.onclose = () => {
      Logger.log('Conection closed');
      process.exit(0)
    };

    client.onerror = (error) => {
      Logger.log('Error ', error);
      process.exit(0);
    };

  } catch (error) {
    Logger.log('Error ', error);
    process.exit(1);
  }

}