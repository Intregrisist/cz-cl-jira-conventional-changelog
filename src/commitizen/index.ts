import {DefaultEngineOptions} from './constants';
import engine from './engine';

export default engine({
  ...DefaultEngineOptions,
  scopes: ['test'],
  skipScope: false,
  customScope: true,
});
