import { cpus } from 'os';
import cluster from 'cluster';
import { createServer } from 'https';
import type { ServerOptions } from 'https';
import type { Application } from 'express';
import type winston from 'winston';

class Cluster {
  #app: Application;

  #logger: winston.Logger;

  #env: string;

  #port: number | string;

  #serverOptions: ServerOptions;

  constructor(
    app: Application,
    logger: winston.Logger,
    config: { env: string, port: number | string },
    serverOptions: ServerOptions,
  ) {
    this.#app = app;
    this.#logger = logger;
    this.#env = config.env;
    this.#port = config.port;
    this.#serverOptions = serverOptions;
  }

  public listen(): void {
    const Https = createServer(this.#serverOptions, this.#app);
    if (this.#env === 'development') {
      Https.listen(this.#port, () => {
        this.#logger.info(`🚀 App listening on pid ${process.pid} and the port ${this.#port}`);
      });
    }

    if (this.#env === 'production') {
      const numCPU = cpus().length;
      if (cluster.isPrimary) {
        // eslint-disable-next-line no-plusplus
        for (let no = 0; no < numCPU; no++) {
          cluster.fork();
        }
        cluster.on('exit', () => {
          cluster.fork();
        });
      } else {
        Https.listen(this.#port, () => {
          this.#logger.info(`🚀 App listening on pid ${process.pid} and the port ${this.#port}`);
        });
      }
    }
  }
}

export default Cluster;
