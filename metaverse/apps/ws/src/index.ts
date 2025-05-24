import { WebSocketServer } from 'ws';
import { User } from './User';
import dotenv from 'dotenv';
import { PORT } from './config';
dotenv.config();
const port =  typeof PORT === 'string' ? parseInt(PORT, 10) : PORT || 8080
console.log(`WebSocket server is running on port ${port}`);

try {
  const wss = new WebSocketServer({ port: port});

wss.on('connection', function connection(ws) {
  console.log('connected');

  let user = new User(ws);

  ws.on('close', function close() {
    user?.destroy();
  })

  // ws.send('something');
});
} catch (error) {
 console.error('Error starting WebSocket server:', error); 
}
