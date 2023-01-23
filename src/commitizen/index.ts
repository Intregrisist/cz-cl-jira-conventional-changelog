import {DefaultEngineOptions} from './constants';
import engine from './engine';

export default engine({
  ...DefaultEngineOptions,
  jiraLocation: 'post-body',
  scopes: [
    {
      description: 'TEST',
      value: 'test',
    },
  ],
  skipScope: false,
  customScope: true,
  additionalFooter: [
    {
      message: 'Enter reviewers',
      token: 'Reviewed-by',
    },
  ],
});
