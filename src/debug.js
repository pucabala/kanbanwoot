const isDebug = process.env.REACT_APP_DEBUG === 'true';

export function debugLog(...args) {
  if (isDebug) {
    // eslint-disable-next-line no-console
    console.log('[DEBUG]', ...args);

    // Também escreve no /dev/stdout se estiver em ambiente Node.js
    if (typeof process !== 'undefined' && process.stdout && process.stdout.write) {
      process.stdout.write('[DEBUG] ' + args.map(String).join(' ') + '\n');
    }
  }
}