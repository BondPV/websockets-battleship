import dotenv from 'dotenv';
import { httpServer } from './src/httpServer';

dotenv.config();

const HTTP_PORT = parseInt(process.env.PORT || '8181', 10);

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
