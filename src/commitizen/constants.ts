import wrap from 'word-wrap';
import {EngineOptions} from './types';
import {ListChoice, ListChoices} from './utils/createOptionalListQuestion';
import map from 'lodash/map';
import omit from 'lodash/omit';

export const SCOPE_CUSTOM_OPTION: ListChoice = {
  description: 'Enter a custom scope',
  value: '[custom]',
};

export const SCOPE_SKIP_OPTION: ListChoice = {
  description: 'Do not add a scope',
  value: '[skip]',
};

export const SCOPE_ACTION_VALUES = [SCOPE_CUSTOM_OPTION, SCOPE_SKIP_OPTION].map(
  choice => choice.value
);

export const DEFAULT_WRAP_OPTIONS: wrap.IOptions = {
  trim: true,
  cut: false,
  newline: '\n',
  indent: '',
  width: 100,
} as const;

export const JIRA_LOCATIONS = {
  PRE_TYPE: 'pre-type',
  PRE_DESCRIPTION: 'pre-description',
  POST_DESCRIPTION: 'post-description',
  POST_BODY: 'post-body',
} as const;

export const TYPE_LIST_CHOICES: ListChoices = [
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

// TODO: Why do we need this without the title?
export const TYPE_LIST_CHOICES_WITHOUT_TITLE = map(TYPE_LIST_CHOICES, option =>
  omit(option, ['title'])
);

export const DefaultEngineOptions: EngineOptions = {
  types: TYPE_LIST_CHOICES_WITHOUT_TITLE,
  skipScope: true,
  skipDescription: false,
  skipBreaking: false,
  customScope: false,
  maxHeaderWidth: 72,
  // minHeaderWidth: 2,
  maxBodyWidth: 100,
  jiraOptional: false,
  // jiraLocation: 'pre-description',
  // jiraPrepend: '',
  // jiraAppend: '',
  exclamationMark: false,
};
