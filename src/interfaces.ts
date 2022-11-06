import type {
  set, connect, ConnectOptions,
} from 'mongoose';
import type {
  NextFunction, Request, Response, Router,
} from 'express';

interface Error {
  status: number,
  message: string
}
interface Config {
  LOG_FORMAT: string
  ORIGIN: string
  CREDENTIALS: boolean
}
interface Routes {
  path?: string;
  router: Router;
}
interface ConfigDatabase {
  url: string,
  options: ConnectOptions
}
interface Middleware {
  MiddlewareError: (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;
  initializeMiddlewares: (config: Config) => void
  initializeErrorHandling: () => void
  initializeRoutes: (routes: Routes[]) => void
  connectToDatabase: (
    db: { connect: typeof connect, set: typeof set },
    config: ConfigDatabase
  ) => void
}

export default Middleware;
