import { WebSocketServer } from 'ws';
import { User } from './User';
import dotenv from 'dotenv';
import { PORT } from './config';
dotenv.config();


const wss = new WebSocketServer({ port: typeof PORT === 'string' ? parseInt(PORT, 10) : PORT || 8080 });

wss.on('connection', function connection(ws) {
  console.log('connected');

  let user = new User(ws);

  ws.on('close', function close() {
    user?.destroy();
  })

  // ws.send('something');
});
