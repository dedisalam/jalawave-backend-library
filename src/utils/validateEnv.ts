import { cleanEnv, port, str } from 'envalid';

function validateEnv(): void {
  cleanEnv<{ NODE_ENV: string, PORT: number }>(process.env, {
    NODE_ENV: str(),
    PORT: port(),
  });
}

export default validateEnv;
