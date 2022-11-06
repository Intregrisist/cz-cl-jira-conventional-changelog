import {EngineOptions, PromptAnswers} from './engine';

/**
 * Fetches formatted Jira issue
 *
 * @param {PromptAnswers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getJiraIssue = (answers: PromptAnswers, options: EngineOptions) => {
  const {jira} = answers;
  const {jiraPrepend = '', jiraAppend = ''} = options;
  return jira ? `${jiraPrepend}${jira}${jiraAppend}` : '';
};

/**
 * Returns formatted type with optional scope, adds breaking flag as well.
 *
 * @param {PromptAnswers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getTypeWithScope = (answers: PromptAnswers, options: EngineOptions) => {
  const {customScope, isBreaking, scope: selectedScope, type} = answers;
  const scope = customScope || selectedScope;
  const breakFlag = isBreaking ? '!' : '';
  if (scope) {
    return `${type}(${scope})${breakFlag}`;
  }
  return `${type}${breakFlag}`;
};

/**
 * Generates commit message title
 *
 * @param {PromptAnswers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getTitle = (answers: PromptAnswers, options: EngineOptions) => {
  const jiraIssue = getJiraIssue(answers, options);
  const {subject} = answers;
  const {jiraLocation} = options;
  const typeWithScope = getTypeWithScope(answers, options);

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

const commitGenerator = (answers: PromptAnswers, options: EngineOptions) => {
  const title = getTitle(answers, options);
  return `${title}`;
};

export default commitGenerator;
