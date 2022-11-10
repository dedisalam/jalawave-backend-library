import { cpus } from 'os';
import cluster from 'cluster';
import type { Application } from 'express';
import type winston from 'winston';

class Cluster {
  #app: Application;

  #logger: winston.Logger;

  #env: string;

  #port: number | string;

  constructor(
    app: Application,
    logger: winston.Logger,
    config: { env: string, port: number | string },
  ) {
    this.#app = app;
    this.#logger = logger;
    this.#env = config.env;
    this.#port = config.port;
  }

  public listen(): void {
    if (this.#env === 'development') {
      this.#app.listen(this.#port, () => {
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
        this.#app.listen(this.#port, () => {
          this.#logger.info(`🚀 App listening on pid ${process.pid} and the port ${this.#port}`);
        });
      }
    }
  }
}

export default Cluster;
