import dotenv from 'dotenv';
import { httpServer } from './src/httpServer';
import { createWebSocketServer } from './src/wsServer';
import { logMessage, LogTypeEnum } from './src/wsServer/utils';

dotenv.config();

const HTTP_PORT = parseInt(process.env.PORT || '8181', 10);
const WS_PORT = parseInt(process.env.PORT || '3000', 10);

httpServer.listen(HTTP_PORT);
logMessage(LogTypeEnum.run, `Start static http server on http://localhost:${HTTP_PORT}`);

createWebSocketServer(WS_PORT);
logMessage(LogTypeEnum.run, `Start websocket server on http://localhost:${WS_PORT}`);
