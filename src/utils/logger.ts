import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';

class Logger {
  #logDir: string;

  #logFormat = winston.format.printf(({ timestamp, level, message }: { [key: string]: string }) => `${timestamp} ${level}: ${message}`);

  public logger: winston.Logger;

  public stream = {
    write: (message: string): void => {
      this.logger.info(message.substring(0, message.lastIndexOf('\n')));
    },
  };

  constructor(logDir: string) {
    this.#logDir = logDir;
    this.logger = this.#winstonLogger();
  }

  #createDirectory(): void {
    if (!existsSync(this.#logDir)) {
      mkdirSync(this.#logDir);
    }
  }

  #winstonLogger(): winston.Logger {
    const logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        this.#logFormat,
      ),
      transports: [
        // debug log setting
        new WinstonDaily({
          level: 'debug',
          datePattern: 'YYYY-MM-DD',
          dirname: `${this.#logDir}/debug`, // log file /logs/debug/*.log in save
          filename: '%DATE%.log',
          maxFiles: 30, // 30 Days saved
          json: false,
          zippedArchive: true,
        }),
        // error log setting
        new WinstonDaily({
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          dirname: `${this.#logDir}/error`, // log file /logs/error/*.log in save
          filename: '%DATE%.log',
          maxFiles: 30, // 30 Days saved
          handleExceptions: true,
          json: false,
          zippedArchive: true,
        }),
      ],
    });

    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(winston.format.splat(), winston.format.colorize()),
      }),
    );
    return logger;
  }
}

export default Logger;
