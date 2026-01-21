class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
    this.logLevel = this.isDevelopment ? 'debug' : 'error';
  }

  debug(...args) {
    if (this.isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  }

  log(...args) {
    if (this.isDevelopment) {
      console.log('[LOG]', ...args);
    }
  }

  info(...args) {
    if (this.isDevelopment || this.logLevel === 'info') {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args) {
    console.warn('[WARN]', ...args);
  }

  error(...args) {
    console.error('[ERROR]', ...args);
  }

  group(label) {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  time(label) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();
export default logger;
