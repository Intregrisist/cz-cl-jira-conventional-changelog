// eslint-disable-next-line node/no-extraneous-import
import {QuestionCollection} from 'inquirer';
import padStart from 'lodash/padStart';
import chalk from 'chalk';
import {execSync} from 'child_process';

import {getTitle} from './createCommitMessage';
import {EngineOptions} from '../engine';
import createChoices from '../helpers/createChoices';

export type Answers = {
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

const getJiraIssueFromBranchName = () => {
  const branchName = execSync('git branch --show-current').toString().trim();
  const jiraIssueRegex =
    /(?<jiraIssue>(?<!([a-zA-Z0-9]{1,10})-?)[a-zA-Z0-9]+-\d+)/;
  const matchResult = branchName.match(jiraIssueRegex);
  return matchResult?.groups?.jiraIssue || '';
};

const defaultOption = <T>(value?: T) => {
  const isBoolean = typeof value === 'boolean';
  const shouldDefault = isBoolean || !!value;
  return shouldDefault ? {default: value} : null;
};

const createQuestions = (
  options: EngineOptions
): QuestionCollection<Answers> => {
  const hasScopes = !!options.scopes?.length;
  const scopes = options.customScope
    ? options.scopes?.concat(['custom'])
    : options.scopes;
  const defaultJiraIssue = getJiraIssueFromBranchName();
  const isDefaultTypeValid =
    !!options.defaultType && !!options.types[options.defaultType];

  return [
    {
      type: 'list',
      name: 'type',
      message: "Select the type of change that you're committing:",
      choices: createChoices(options.types),
      default: isDefaultTypeValid ? options.defaultType : undefined,
    },
    {
      type: hasScopes ? 'list' : 'input',
      name: 'scope',
      when: !options.skipScope,
      choices: hasScopes ? scopes : undefined,
      message:
        'What is the scope of this change (e.g. component or file name): ' +
        (hasScopes ? '(select from the list)' : '(press enter to skip)'),
      // TODO: If hasScope then the defaultScope must be part of the scopes.
      default: options.defaultScope,
      filter: value => value.trim().toLowerCase(),
    },
    {
      type: 'input',
      name: 'customScope',
      when: ({scope}) => scope === 'custom',
      message: 'Type custom scope (press enter to skip)',
    },
    {
      type: 'input',
      name: 'jira',
      message: `Enter comma separated JIRA issue(s)${
        options.jiraOptional ? ' (optional)' : ''
      }:`,
      when: options.jiraMode,
      default: defaultJiraIssue || undefined,
      validate: function (jira: string) {
        // TODO: Validation doesn't show error feedback
        // TODO: Improve regex to support multiple Jira tickets
        if (options.jiraOptional && !jira) {
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
      type: 'confirm',
      name: 'isBreaking',
      when: !options.skipBreaking,
      message: 'Are there any breaking changes?',
      default: false,
    },
    {
      type: 'maxlength-input',
      maxLength: options.maxHeaderWidth,
      message: 'Write a short, imperative tense description of the change:\n',
      name: 'subject',
      filter: (subject: string, answers) => {
        const leftPadLength =
          getTitle({...answers, subject: ''}, options).length + 1;
        return padStart(subject, leftPadLength + subject.length + 1, ' ');
      },
      transformer: (subject, answers) => {
        return (
          chalk.blue(getTitle({...answers, subject: ''}, options)) + subject
        );
      },
    },
    {
      type: 'input',
      name: 'body',
      when: !options.skipDescription,
      message:
        'Provide a longer description of the change: (press enter to skip)\n',
      ...defaultOption(options.defaultBody),
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
      default: !!options.defaultIssues,
      when: !options.jiraMode,
    },
    {
      type: 'input',
      name: 'issuesBody',
      default: '-',
      message:
        'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself:\n',
      when: ({isIssueAffected, body, isBreaking}) =>
        isIssueAffected && !body && !isBreaking,
    },
    {
      type: 'input',
      name: 'issues',
      message: 'Add issue references (e.g. "fix #123", "re #123".):\n',
      when: answers => answers.isIssueAffected,
      ...defaultOption(!!options.defaultIssues),
    },
  ];
};

export default createQuestions;
