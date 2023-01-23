import compact from 'lodash/compact';
import get from 'lodash/get';
import wrap from 'word-wrap';

import {EngineOptions} from '../engine';
import {DefaultWrapOptions} from '../constants';
import {Answers} from './createQuestions';

/**
 * Returns options top be used with 'word-wrap' library
 * @param {EngineOptions} options
 * @returns {wrap.IOptions}
 */
const getWrapOptions = (options: EngineOptions): wrap.IOptions => {
  const {maxBodyWidth} = options;
  return {
    ...DefaultWrapOptions,
    ...(maxBodyWidth
      ? {
          width: maxBodyWidth,
        }
      : null),
  };
};

/**
 * Returns formatted type with optional scope, adds breaking flag as well.
 * @param {Answers} answers
 * @returns {string}
 */
const getTypeWithScope = (answers: Answers): string => {
  const {customScope, isBreaking, scope: selectedScope, type} = answers;
  const scope = customScope || selectedScope;
  const breakFlag = isBreaking ? '!' : '';
  if (scope) {
    return `${type}(${scope})${breakFlag}`;
  }
  return `${type}${breakFlag}`;
};

/**
 * Generates the commit message title
 * @param {Answers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
export const getTitle = (answers: Answers, options: EngineOptions): string => {
  const {jiraIssues = '', description = ''} = answers;
  const {jiraLocation} = options;
  const typeWithScope = getTypeWithScope(answers);

  if (jiraLocation === 'pre-type') {
    return `${jiraIssues} ${typeWithScope}: ${description}`;
  } else if (jiraLocation === 'pre-description') {
    return `${typeWithScope}: ${jiraIssues} ${description}`;
  } else if (jiraLocation === 'post-description') {
    return `${typeWithScope}: ${description} ${jiraIssues}`;
  } else if (jiraLocation === 'post-body') {
    return `${typeWithScope}: ${description}`;
  } else if (jiraIssues) {
    return `${typeWithScope}: ${jiraIssues} ${description}`;
  } else {
    return `${typeWithScope}: ${description}`;
  }
};

/**
 * Generates the commit message body
 * @param {Answers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getBody = (answers: Answers, options: EngineOptions): string => {
  const {body = ''} = answers;
  return wrap(body, getWrapOptions(options));
};

/**
 * Generates the breaking description of the commit message body
 * @param {Answers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getBreakingBody = (answers: Answers, options: EngineOptions): string => {
  const {breakingBody: rawBreakingBody} = answers;
  const breakingBody = rawBreakingBody?.replace(/^BREAKING CHANGE: /, '');
  if (!breakingBody) {
    return '';
  }
  return wrap(`BREAKING CHANGE: ${breakingBody}`, getWrapOptions(options));
};

const getFooter = (
  answers: Answers,
  key: keyof Answers,
  token: string
): [string, Answers[keyof Answers]] => {
  return [token, answers[key]];
};

const getFooters = (answers: Answers, options: EngineOptions): string => {
  const jiraIssuesFooter = getFooter(answers, 'jiraIssues', 'Jira-issues');
  const issuesFooter = getFooter(answers, 'issues', 'Refs');
  const objEntries = Object.entries(answers);
  const additionalFooters = Object.entries(answers).reduce<typeof objEntries>(
    (acc, [key, value]) => {
      if (key.startsWith('footer-')) {
        const token = key.replace(/^footer-/, '');
        acc.push([token, value]);
      }
      return acc;
    },
    []
  );

  return [jiraIssuesFooter, issuesFooter, ...additionalFooters]
    .reduce<string[]>((acc, [token, value]) => {
      if (value) {
        const tokenEntry = `${token}: ${value}`;
        acc.push(wrap(tokenEntry, getWrapOptions(options)));
      }
      return acc;
    }, [])
    .join('\n');
};

/**
 * Generates a complete Conventional Commit message
 * @param {Answers} answers
 * @param {EngineOptions} options
 * @returns {any}
 */
const createCommitMessage = (answers: Answers, options: EngineOptions) => {
  const title = getTitle(answers, options);
  const body = getBody(answers, options);
  const breakingBody = getBreakingBody(answers, options);
  const footers = getFooters(answers, options);
  return compact([title, body, breakingBody, footers]).join('\n\n');
};

export default createCommitMessage;
