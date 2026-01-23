class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
    this.logLevel = this.isDevelopment ? 'debug' : 'error';
  }

  debug(...args) {
    console.log('[DEBUG]', ...args);
  }

  log(...args) {
    console.log('[LOG]', ...args);
  }

  info(...args) {
    console.info('[INFO]', ...args);
  }

  warn(...args) {
    console.warn('[WARN]', ...args);
  }

  error(...args) {
    console.error('[ERROR]', ...args);
  }

  group(label) {
    console.group(label);
  }

  groupEnd() {
    console.groupEnd();
  }

  time(label) {
    console.time(label);
  }

  timeEnd(label) {
    console.timeEnd(label);
  }
}

export const logger = new Logger();
export default logger;
