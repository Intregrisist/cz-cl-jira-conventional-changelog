// eslint-disable-next-line node/no-extraneous-import
import Inquirer from 'inquirer';
import MaxLengthInputPrompt from 'inquirer-maxlength-input-prompt';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import padEnd from 'lodash/padEnd';
import padStart from 'lodash/padStart';
import mapValues from 'lodash/mapValues';
import chalk from 'chalk';
import boxen from 'boxen';
import {execSync} from 'child_process';

import {DefaultEngineOptions} from './constants';
import {Types} from './types';
import commitGenerator, {getTitle} from './commitGenerator';

export type JiraLocation =
  | 'pre-type' // TODO: Remove support, does not meet Conventional Commits 1.0.0
  | 'pre-description'
  | 'post-description'
  | 'post-body';

export type EngineOptions = {
  // other
  maxHeaderWidth: number;
  maxBodyWidth: number;

  // type
  defaultType?: string;
  types: Types;
  // jira
  defaultJiraIssue?: string; // TODO: Remove since this is always changing
  jiraOptional?: boolean;
  jiraPrefix?: string;
  jiraMode?: boolean;
  jiraPrepend?: string;
  jiraAppend?: string;
  jiraLocation?: JiraLocation;
  // scope
  customScope?: boolean;
  defaultScope?: string;
  scopes?: string[];
  skipScope?: boolean;
  // subject
  exclamationMark?: boolean;

  // body
  skipDescription?: boolean;
  defaultBody?: string;
  // isBreaking
  skipBreaking?: boolean;
  // isIssueAffected, issues
  defaultIssues?: string;
};

export type PromptAnswers = {
  type: string;
  jira?: string;
  scope?: string;
  customScope?: string;
  body?: string;
  isBreaking?: boolean;
  breaking?: string;
  isIssueAffected?: boolean;
  issuesBody?: string;
  issues?: string;
  subject: string;
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

function getJiraIssueFromBranchName() {
  const branchName = execSync('git branch --show-current').toString().trim();
  const jiraIssueRegex =
    /(?<jiraIssue>(?<!([a-zA-Z0-9]{1,10})-?)[a-zA-Z0-9]+-\d+)/;
  const matchResult = branchName.match(jiraIssueRegex);
  return matchResult?.groups?.jiraIssue || '';
}

function engine(options: Partial<EngineOptions> = DefaultEngineOptions) {
  const mergedOptions = {
    ...DefaultEngineOptions,
    ...options,
  };
  const {
    customScope,
    defaultBody,
    defaultIssues,
    defaultScope,
    defaultType,
    jiraMode,
    jiraOptional,
    jiraPrefix,
    maxHeaderWidth,
    scopes,
    skipBreaking,
    skipDescription,
    skipScope,
    types,
  } = mergedOptions;
  const hasScopes = !!scopes?.length;
  const parsedScopes = customScope ? scopes?.concat(['custom']) : scopes;
  const defaultJiraIssue = getJiraIssueFromBranchName();

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prompter(inquirer: typeof Inquirer, commit: (message: string) => void) {
      inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'type',
            message: "Select the type of change that you're committing:",
            choices: generateChoices(types),
            ...(defaultType
              ? {
                  default: defaultType,
                }
              : null),
          },
          {
            type: 'input',
            name: 'jira',
            message: `Enter comma separated JIRA issue(s)${
              jiraOptional ? ' (optional)' : ''
            }:`,
            when: jiraMode,
            ...(defaultJiraIssue
              ? {
                  default: defaultJiraIssue,
                }
              : null),
            validate: function (jira: string) {
              // TODO: Validation doesn't show error feedback
              // TODO: Improve regex to support multiple Jira tickets
              if (jiraOptional && !jira) {
                return true;
              }
              if (!jira) {
                return 'At least one Jira issue is required.';
              }
              const isValid = jira
                .split(/,?\s+/)
                .every(jira =>
                  /^(?<!([a-zA-Z0-9]{1,10})-?)[a-zA-Z0-9]+-\d+$/.test(jira)
                );
              return isValid || 'Invalid Jira issue.';
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
            message: 'This will bump the major version, are you sure?',
            default: false,
            when: function (answers) {
              return answers.isBreaking;
            },
          },
          {
            type: 'maxlength-input',
            maxLength: maxHeaderWidth,
            message:
              'Write a short, imperative tense description of the change:\n',
            name: 'subject',
            filter: (subject: string, answers: PromptAnswers) => {
              const leftPadLength =
                getTitle({...answers, subject: ''}, mergedOptions).length + 1;
              return padStart(subject, leftPadLength + subject.length + 1, ' ');
            },
            transformer: (subject, answers) => {
              return (
                chalk.blue(getTitle({...answers, subject: ''}, mergedOptions)) +
                subject
              );
            },
          },
          {
            type: 'input',
            name: 'body',
            when: !skipDescription,
            message:
              'Provide a longer description of the change: (press enter to skip)\n',
            default: defaultBody,
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
        .then(async (rawAnswers: PromptAnswers) => {
          const answers = mapValues(rawAnswers, answer =>
            typeof answer === 'string' ? answer.trim() : answer
          ) as PromptAnswers;
          const commitMessage = commitGenerator(answers, mergedOptions);

          console.log();
          console.log(chalk.underline('Commit preview:'));
          console.log(
            boxen(chalk.green(commitMessage), {padding: 1, margin: 1})
          );

          const {doCommit} = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'doCommit',
              message: 'Commit?',
            },
          ]);

          if (doCommit) {
            commit(commitMessage);
          }
        })
        .catch(e => {
          // TODO: Understand if this can throw an error and what we should do with it
          console.log(e);
        });
    },
  };
}

export default engine;
