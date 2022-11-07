import compact from 'lodash/compact';
import wrap from 'word-wrap';
import {EngineOptions, PromptAnswers} from './engine';
import {DefaultWrapOptions} from './constants';

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
 * Fetches formatted Jira issue
 * @param {PromptAnswers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getJiraIssue = (
  answers: PromptAnswers,
  options: EngineOptions
): string => {
  const {jira} = answers;
  const {jiraPrepend = '', jiraAppend = ''} = options;
  return jira ? `${jiraPrepend}${jira}${jiraAppend}` : '';
};

/**
 * Returns formatted type with optional scope, adds breaking flag as well.
 * @param {PromptAnswers} answers
 * @returns {string}
 */
const getTypeWithScope = (answers: PromptAnswers): string => {
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
 * @param {PromptAnswers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getTitle = (answers: PromptAnswers, options: EngineOptions): string => {
  const {subject} = answers;
  const {jiraLocation} = options;
  const jiraIssue = getJiraIssue(answers, options);
  const typeWithScope = getTypeWithScope(answers);

  if (!jiraIssue) {
    return `${typeWithScope}: ${subject}`;
  } else if (jiraLocation === 'pre-type') {
    return `${jiraIssue} ${typeWithScope}: ${subject}`;
  } else if (jiraLocation === 'pre-description') {
    return `${typeWithScope}: ${jiraIssue} ${subject}`;
  } else if (jiraLocation === 'post-description') {
    return `${typeWithScope}: ${subject} ${jiraIssue}`;
  } else if (jiraLocation === 'post-body') {
    return `${typeWithScope}: ${subject}`;
  } else {
    return `${typeWithScope}: ${jiraIssue} ${subject}`;
  }
};

/**
 * Generates the commit message body
 * @param {PromptAnswers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getBody = (answers: PromptAnswers, options: EngineOptions): string => {
  const {body = ''} = answers;
  const {jiraLocation} = options;
  const jiraIssue = getJiraIssue(answers, options);
  let result = body;
  if (jiraIssue && jiraLocation === 'post-body') {
    result += result ? `\n\n${jiraIssue}` : jiraIssue;
  }
  return wrap(result, getWrapOptions(options));
};

/**
 * Generates the breaking description of the commit message body
 * @param {PromptAnswers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getBreaking = (
  answers: PromptAnswers,
  options: EngineOptions
): string => {
  const {breaking: rawBreaking} = answers;
  const breaking = rawBreaking?.replace(/^BREAKING CHANGE: /, '');
  if (!breaking) {
    return '';
  }
  return wrap(`BREAKING CHANGE: ${breaking}`, getWrapOptions(options));
};

/**
 * Generates the issues of the commit message body
 * @param {PromptAnswers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getIssues = (answers: PromptAnswers, options: EngineOptions): string => {
  const {issues = ''} = answers;
  return wrap(issues, getWrapOptions(options));
};

/**
 * Generates a complete Conventional Commit message
 * @param {PromptAnswers} answers
 * @param {EngineOptions} options
 * @returns {any}
 */
const commitGenerator = (answers: PromptAnswers, options: EngineOptions) => {
  const title = getTitle(answers, options);
  const body = getBody(answers, options);
  const breaking = getBreaking(answers, options);
  const issues = getIssues(answers, options);
  return compact([title, body, breaking, issues]).join('\n\n');
};

export default commitGenerator;
