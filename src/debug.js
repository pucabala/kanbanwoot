const isDebug = process.env.REACT_APP_DEBUG === 'true';

export function debugLog(...args) {
  if (isDebug) {
    // eslint-disable-next-line no-console
    console.log('[DEBUG]', ...args);
  }
}