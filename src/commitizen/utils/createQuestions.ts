// eslint-disable-next-line node/no-extraneous-import
import {QuestionCollection} from 'inquirer';
import padStart from 'lodash/padStart';
import map from 'lodash/map';
import chalk from 'chalk';

import {getTitle} from './createCommitMessage';
import {EngineOptions} from '../engine';
import {SCOPE_CUSTOM_OPTION, SCOPE_SKIP_OPTION} from '../constants';
import createOptionalListQuestion from './createOptionalListQuestion';
import getJiraIssueFromBranchName from './getJiraIssueFromBranchName';

export type Answers = {
  type: string;
  jiraIssues?: string;
  scope?: string;
  customScope?: string;
  body?: string;
  isBreaking?: boolean;
  breakingBody?: string;
  isIssueAffected?: boolean;
  issuesBody?: string;
  issues?: string;
  description: string;
};

const createQuestions = (
  options: EngineOptions
): QuestionCollection<Answers> => {
  return [
    createOptionalListQuestion<Answers>({
      name: 'type',
      message: "Select the type of change that you're committing:",
      listChoices: options.types,
      default: options.defaultType,
    }),
    createOptionalListQuestion<Answers>({
      name: 'scope',
      listChoices: options.scopes,
      listAdditionalChoices: [SCOPE_CUSTOM_OPTION, SCOPE_SKIP_OPTION],
      default: options.defaultScope,
      message: hasList =>
        [
          'What is the scope of this change',
          hasList
            ? ':'
            : ' (e.g. component or file name): (press enter to skip)',
        ].join(''),
      filter: value => value.trim().toLowerCase(),
    }),
    {
      name: 'customScope',
      type: 'input',
      when: ({scope}) => scope === SCOPE_CUSTOM_OPTION.value,
      message:
        'Enter a scope for this change (e.g. component or file name): (press enter to skip)',
    },
    {
      // TODO: Add limit to make sure not too many Jira issues are being added
      name: 'jiraIssues',
      type: 'input',
      message: [
        'Enter comma separated JIRA issue(s)',
        options.jiraOptional ? ' (optional):' : ':',
      ].join(''),
      default: getJiraIssueFromBranchName(),
      validate: (jiraIssues: string) => {
        if (options.jiraOptional && !jiraIssues) {
          return true;
        }
        if (!jiraIssues) {
          return 'At least one Jira issue is required.';
        }
        const invalidJiraIssues = jiraIssues.split(/[,\s]+/).filter(jira => {
          return !/^(?<!([a-zA-Z0-9]{1,10})-?)[a-zA-Z0-9]+-\d+$/.test(jira);
        });
        return (
          !invalidJiraIssues.length ||
          `Invalid Jira issue(s): ${invalidJiraIssues.join(', ')}`
        );
      },
      filter: (jiraIssues: string) =>
        jiraIssues
          .split(/[,\s]+/)
          .map(jiraIssue => {
            const {jiraPrepend = '', jiraAppend = ''} = options;
            const issueFormatted = jiraIssue.toUpperCase();
            return `${jiraPrepend}${issueFormatted}${jiraAppend}`;
          })
          .join(', '),
    },
    {
      type: 'confirm',
      name: 'isBreaking',
      message: 'Are there any breaking changes?',
      default: false,
    },
    {
      type: 'maxlength-input',
      name: 'subject',
      maxLength: options.maxHeaderWidth,
      message: 'Write a short, imperative tense description of the change:\n',
      filter: (subject: string, answers) => {
        const leftPadLength =
          getTitle({...answers, description: ''}, options).length + 1;
        return padStart(subject, leftPadLength + subject.length + 1, ' ');
      },
      transformer: (subject, answers) =>
        chalk.blue(getTitle({...answers, description: ''}, options)) + subject,
    },
    {
      type: 'input',
      name: 'body',
      message: [
        'Provide a longer description of the change:',
        options.defaultBody ? '' : ' (press enter to skip)',
        '\n',
      ].join(''),
      default: options.defaultBody,
    },
    {
      type: 'input',
      name: 'breakingBody',
      message: 'Describe the breaking changes:\n',
      when: answers => answers.isBreaking,
      validate: (breakingBody: string) =>
        !!breakingBody || 'A description for the breaking changes is required.',
    },
    {
      type: 'confirm',
      name: 'isIssueAffected',
      message: 'Does this change affect any open issues?',
      default: !!options.defaultIssues,
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
      message: 'Add issue references (e.g. "fix #123", "re #123"):\n',
      when: answers => answers.isIssueAffected,
      default: !!options.defaultIssues,
    },
    ...map(options.additionalFooter, question => ({
      type: 'input',
      name: `footer-${question.token}`,
      message: [
        `${question.message}:`,
        !question.required ? '' : ' (press enter to skip)',
      ].join(''),
      validate: (input: string) => {
        if (question.required && !input.length) {
          return 'This field is required.';
        }
        return true;
      },
    })),
  ];
};

export default createQuestions;
