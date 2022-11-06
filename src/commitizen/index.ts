import defaults from './defaults';
import engine from './engine';

export * from './engine';
export * from './types';

export default engine({
  ...defaults,
  scopes: ['test'],
  skipScope: false,
  customScope: true,
});
