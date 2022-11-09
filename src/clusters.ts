import { cpus } from 'os';
import cluster from 'cluster';
import https from 'https';
import type { Application } from 'express';
import type winston from 'winston';

class Cluster {
  #app: Application;

  #logger: winston.Logger;

  #env: string;

  #port: number | string;

  #serverOption: https.ServerOptions;

  constructor(
    app: Application,
    logger: winston.Logger,
    config: { env: string, port: number | string },
    serverOption: https.ServerOptions,
  ) {
    this.#app = app;
    this.#logger = logger;
    this.#env = config.env;
    this.#port = config.port;
    this.#serverOption = serverOption;
  }

  public listen(): void {
    const server = https.createServer(this.#serverOption, this.#app);
    if (this.#env === 'development') {
      server.listen(this.#port, () => {
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
        server.listen(this.#port, () => {
          this.#logger.info(`🚀 App listening on pid ${process.pid} and the port ${this.#port}`);
        });
      }
    }
  }
}

export default Cluster;
