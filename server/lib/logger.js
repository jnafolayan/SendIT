import dotenv from 'dotenv';

dotenv.config();

/**
 * Handles logging activities throughout the code.
 */
class Logger {
  constructor(level) {
    this.level = level;
  }

  debug(...args) {
    if (this.level === 'debug') {
      console.debug(...args); // eslint-disable-line no-console
    }
  }

  info(...args) {
    if (this.level !== 'debug') {
      console.info(...args); // eslint-disable-line no-console
    }
  }

  error(...args) {
    if (this.level === 'debug') {
      console.error(...args); // eslint-disable-line no-console
    }
  }

  warn(...args) {
    if (this.level === 'debug') {
      console.warn(...args); // eslint-disable-line no-console
    }
  }
}

const log = new Logger(process.env.NODE_ENV === 'development' ? 'debug' : 'production');

export default log;
