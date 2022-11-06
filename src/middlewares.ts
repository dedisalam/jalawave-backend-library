import morgan from 'morgan';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import type { CorsOptions } from 'cors';
import type winston from 'winston';
import type { Application } from 'express';
import type Middleware from './interfaces';

class Middlewares {
  #app: Application;

  #logger: winston.Logger;

  #stream: morgan.StreamOptions;

  #env: string;

  constructor(
    app: Application,
    Logger: {
      logger: winston.Logger,
      stream: morgan.StreamOptions,
    },
    config: {
      env: string
    },
  ) {
    this.#app = app;
    this.#logger = Logger.logger;
    this.#stream = Logger.stream;
    this.#env = config.env;
  }

  public MiddlewareError: Middleware['MiddlewareError'] = (error, req, res, next) => {
    try {
      const status = error.status || 500;
      const message = error.message || JSON.stringify({ message: 'Something went wrong' });

      this.#logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);

      res.status(status).json(JSON.parse(message));
    } catch (err) {
      next(err);
    }
  };

  public initializeErrorHandling: Middleware['initializeErrorHandling'] = () => {
    this.#app.use(this.MiddlewareError);
  };

  public initializeMiddlewares: Middleware['initializeMiddlewares'] = (config) => {
    const {
      LOG_FORMAT, CREDENTIALS,
    } = config;
    const stream = this.#stream;

    const whitelist = ['http://202.51.232.124:5000', 'http://202.51.232.124:5001'];
    const corsOptions: CorsOptions = {
      origin(origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: CREDENTIALS,
    };

    this.#app.use(morgan(LOG_FORMAT, { stream }));
    this.#app.use(cors(corsOptions));
    this.#app.use(hpp());
    this.#app.use(helmet());
    this.#app.use(compression());
    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));
    this.#app.use(cookieParser());
  };

  public initializeRoutes: Middleware['initializeRoutes'] = (routes) => {
    routes.forEach((route) => {
      this.#app.use('/', route.router);
    });
  };

  public connectToDatabase: Middleware['connectToDatabase'] = (db, config) => {
    if (this.#env !== 'production') {
      db.set('debug', true);
    }

    db.connect(config.url, config.options).then(() => {
      this.#logger.info('database connected');
    }).catch(() => {
      this.#logger.error('connection to database error');
    });
  };
}
export default Middlewares;
