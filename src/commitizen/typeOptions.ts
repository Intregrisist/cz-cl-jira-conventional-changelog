import map from 'lodash/map';
import omit from 'lodash/omit';
import {ChoiceOptions} from './utils/createChoices';

export const typeOptionsWithTitle: ChoiceOptions = [
  {
    description: 'A new feature',
    title: 'Features',
    value: 'feat',
  },
  {
    description: 'A bug fix',
    title: 'Bug Fixes',
    value: 'fix',
  },
  {
    description: 'Documentation only changes',
    title: 'Documentation',
    value: 'docs',
  },
  {
    description:
      'A code change that neither fixes a bug nor adds a feature (formatting, performance improvement, etc)',
    title: 'Code Refactoring',
    value: 'refactor',
  },
  {
    description: 'Adding missing tests or correcting existing tests',
    title: 'Tests',
    value: 'test',
  },
  {
    description:
      'Changes that affect the build system or external dependencies (npm, webpack, typescript)',
    title: 'Builds',
    value: 'build',
  },
  {
    description:
      'Changes to our CI configuration files and scripts (NOTE: Does not bump the version)',
    title: 'Continuous Integrations',
    value: 'ci',
  },
  {
    description: "Other changes that don't modify src or test files",
    title: 'Chores',
    value: 'chore',
  },
  {
    description: 'Reverts a previous commit',
    title: 'Reverts',
    value: 'revert',
  },
];

export const typeOptionsWithoutTitle = map(typeOptionsWithTitle, option =>
  omit(option, ['title'])
);
