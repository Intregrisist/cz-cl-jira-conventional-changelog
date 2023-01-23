import compact from 'lodash/compact';
import wrap from 'word-wrap';

import type {Answers, EngineOptions} from '../types';
import {
  DEFAULT_WRAP_OPTIONS,
  JIRA_LOCATIONS,
  SCOPE_ACTION_VALUES,
} from '../constants';

/**
 * Returns options top be used with 'word-wrap' library
 * @param {EngineOptions} options
 * @returns {wrap.IOptions}
 */
const getWrapOptions = (options: EngineOptions): wrap.IOptions => {
  const {maxBodyWidth} = options;
  return {
    ...DEFAULT_WRAP_OPTIONS,
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
  const {customScope, scope: selectedScope, type} = answers;
  const scope = customScope || selectedScope;
  const hasScope = scope && !SCOPE_ACTION_VALUES.includes(scope);
  if (hasScope) {
    return `${type}(${scope})`;
  }
  return `${type}`;
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

  if (jiraLocation === JIRA_LOCATIONS.PRE_TYPE) {
    return `${jiraIssues} ${typeWithScope}: ${description}`;
  } else if (jiraLocation === JIRA_LOCATIONS.PRE_DESCRIPTION) {
    return `${typeWithScope}: ${jiraIssues} ${description}`;
  } else if (jiraLocation === JIRA_LOCATIONS.POST_DESCRIPTION) {
    return `${typeWithScope}: ${description} ${jiraIssues}`;
  } else if (jiraLocation === JIRA_LOCATIONS.POST_BODY) {
    return `${typeWithScope}: ${description}`;
  } else if (jiraIssues) {
    return `${typeWithScope}: ${jiraIssues} ${description}`;
  } else {
    return `${typeWithScope}: ${description}`;
  }
};

/**
 * Generates the commit message body
 *
 * @param {Answers} answers
 * @param {EngineOptions} options
 * @returns {string}
 */
const getBody = (answers: Answers, options: EngineOptions): string => {
  const {body = '', issuesBody = ''} = answers;
  return wrap(issuesBody || body, getWrapOptions(options));
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

type FooterEntry = [string, Answers[keyof Answers]];

const getFooterEntry = (
  answers: Answers,
  key: keyof Answers,
  token: string
): FooterEntry => {
  return [token, answers[key]];
};

const getFooters = (answers: Answers, options: EngineOptions): string => {
  const {jiraLocation} = options;
  const isJiraLocationFooter =
    jiraLocation === JIRA_LOCATIONS.POST_BODY || !jiraLocation;
  const jiraIssuesFooter = getFooterEntry(answers, 'jiraIssues', 'Jira-issues');
  const issuesFooter = getFooterEntry(answers, 'issues', 'Refs');
  const additionalFooters = Object.entries(answers).reduce<FooterEntry[]>(
    (acc, [key, value]) => {
      if (key.startsWith('footer-')) {
        const token = key.replace(/^footer-/, '');
        acc.push([token, value]);
      }
      return acc;
    },
    []
  );

  const footers: FooterEntry[] = [
    ...(isJiraLocationFooter ? [jiraIssuesFooter] : []),
    issuesFooter,
    ...additionalFooters,
  ];

  return footers
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
