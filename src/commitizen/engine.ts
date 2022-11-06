import {PromptModule} from 'inquirer';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import padEnd from 'lodash/padEnd';

import defaults from './defaults';
import {Types} from './types';

type Inquirer = {
  prompt: PromptModule;
};

export type EngineOptions = {
  // type
  defaultType?: string;
  types: Types;
  // jira
  defaultJiraIssue?: string;
  jiraOptional?: boolean;
  jiraPrefix?: string;
  jiraMode?: boolean;
  // scope
  customScope?: boolean;
  defaultScope?: string;
  scopes?: string[];
  skipScope?: boolean;
  // subject
  maxHeaderWidth?: number;
  exclamationMark?: boolean;

  // body
  skipDescription?: boolean;
  defaultBody?: string;
  // isBreaking
  skipBreaking?: boolean;
  // isIssueAffected, issues
  defaultIssues?: string;
};

function generateChoices(types: Types) {
  const length = reduce(
    types,
    (result, value, key) => (key.length > result ? key.length : result),
    5
  );
  return map(types, (type, key) => ({
    name: `${padEnd(key, length + 1)}: ${type.description}`,
    value: key,
  }));
}

function engine(options: Partial<EngineOptions> = defaults) {
  const {
    defaultBody,
    defaultJiraIssue,
    defaultIssues,
    defaultScope,
    defaultType,
    customScope,
    jiraMode,
    jiraOptional,
    jiraPrefix,
    scopes,
    skipBreaking,
    skipDescription,
    skipScope,
    types,
  } = {
    ...defaults,
    ...options,
  };
  const hasScopes = !!scopes?.length;
  const parsedScopes = customScope ? scopes?.concat(['custom']) : scopes;

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prompter(
      inquirer: Inquirer,
      commit: (message: string) => void,
      testMode?: boolean
    ) {
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'type',
            message: "Select the type of change that you're committing:",
            choices: generateChoices(types),
            default: defaultType,
          },
          {
            type: 'input',
            name: 'jira',
            message: `Enter space separated JIRA issue(s) (${jiraPrefix}-123)${
              jiraOptional ? ' (optional)' : ''
            }`,
            when: jiraMode,
            default: defaultJiraIssue || '',
            validate: function (jira) {
              // TODO: Validation doesn't show error feedback
              // TODO: Improve regex to support multiple Jira tickets
              return (
                (jiraOptional && !jira) ||
                /^(?<!([a-zA-Z0-9]{1,10})-?)[a-zA-Z0-9]+-\d+$/.test(jira)
              );
            },
            filter: function (jira) {
              return jira.toUpperCase();
            },
          },
          {
            type: hasScopes ? 'list' : 'input',
            name: 'scope',
            when: !skipScope,
            choices: hasScopes ? parsedScopes : undefined,
            message:
              'What is the scope of this change (e.g. component or file name): ' +
              (hasScopes ? '(select from the list)' : '(press enter to skip)'),
            // TODO: If hasScope then the defaultScope must be part of the scopes.
            default: defaultScope,
            filter: function (value) {
              return value.trim().toLowerCase();
            },
          },
          {
            type: 'input',
            name: 'customScope',
            when: ({scope}) => scope === 'custom',
            message: 'Type custom scope (press enter to skip)',
          },
          // {
          //   type: 'limitedInput',
          //   name: 'subject',
          //   message:
          //     'Write a short, imperative tense description of the change:',
          //   default: options.defaultSubject,
          //   maxLength: maxHeaderWidth - (options.exclamationMark ? 1 : 0),
          //   leadingLabel: answers => {
          //     let scope = '';
          //     const providedScope = getProvidedScope(answers);
          //     if (providedScope && providedScope !== 'none') {
          //       scope = `(${providedScope})`;
          //     }
          //
          //     const jiraWithDecorators = decorateJiraIssue(
          //       answers.jira,
          //       options
          //     );
          //     return getJiraIssueLocation(
          //       options.jiraLocation,
          //       answers.type,
          //       scope,
          //       jiraWithDecorators,
          //       ''
          //     ).trim();
          //   },
          //   validate: input =>
          //     input.length >= minHeaderWidth ||
          //     `The subject must have at least ${minHeaderWidth} characters`,
          //   filter: function (subject) {
          //     return filterSubject(subject);
          //   },
          // },
          {
            type: 'input',
            name: 'body',
            when: !skipDescription,
            message:
              'Provide a longer description of the change: (press enter to skip)\n',
            default: defaultBody,
          },
          {
            type: 'confirm',
            name: 'isBreaking',
            when: !skipBreaking,
            message: 'Are there any breaking changes?',
            default: false,
          },
          {
            type: 'confirm',
            name: 'isBreaking',
            message:
              'You do know that this will bump the major version, are you sure?',
            default: false,
            when: function (answers) {
              return answers.isBreaking;
            },
          },
          {
            type: 'input',
            name: 'breaking',
            message: 'Describe the breaking changes:\n',
            when: function (answers) {
              return answers.isBreaking;
            },
          },
          {
            type: 'confirm',
            name: 'isIssueAffected',
            message: 'Does this change affect any open issues?',
            default: !!defaultIssues,
            when: !options.jiraMode,
          },
          {
            type: 'input',
            name: 'issuesBody',
            default: '-',
            message:
              'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself:\n',
            when: function (answers) {
              return (
                answers.isIssueAffected &&
                !answers.body &&
                !answers.breakingBody
              );
            },
          },
          {
            type: 'input',
            name: 'issues',
            message: 'Add issue references (e.g. "fix #123", "re #123".):\n',
            when: function (answers) {
              return answers.isIssueAffected;
            },
            default: defaultIssues ? defaultIssues : undefined,
          },
        ])
        .then(async answers => {
          console.log('answers', answers);
        })
        .catch(e => {
          console.log(e);
        });
    },
  };
}

export default engine;
