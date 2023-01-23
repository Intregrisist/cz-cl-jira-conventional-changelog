import {JIRA_LOCATIONS} from './constants';
import {ListChoices} from './utils/createOptionalListQuestion';

export type JiraLocation = typeof JIRA_LOCATIONS[keyof typeof JIRA_LOCATIONS];

export type FooterQuestion = {
  message: string;
  token: string;
  required?: boolean;
};

export type FooterQuestions = FooterQuestion[];

export type EngineOptions = {
  // Additional footer questions
  additionalFooter?: FooterQuestions;

  // other
  maxHeaderWidth: number;
  maxBodyWidth: number;

  // type
  defaultType?: string;
  types: ListChoices;
  // jira
  defaultJiraIssue?: string; // TODO: Remove since this is always changing
  jiraOptional?: boolean;
  jiraPrepend?: string;
  jiraAppend?: string;
  jiraLocation?: JiraLocation;
  // scope
  customScope?: boolean;
  defaultScope?: string;
  scopes?: ListChoices;
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

  /**
   * Configuration
   **/

  /**
   * List Choices
   **/

  /**
   * Defaults
   **/
};

export type Answers = {
  body?: string;
  breakingBody?: string;
  customScope?: string;
  description: string;
  isBreaking?: boolean;
  isIssueAffected?: boolean;
  issues?: string;
  issuesBody?: string;
  jiraIssues?: string;
  scope?: string;
  type: string;
};
