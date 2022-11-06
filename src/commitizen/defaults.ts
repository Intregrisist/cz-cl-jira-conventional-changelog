import types from './types';
import {EngineOptions} from './engine';

const defaults: EngineOptions = {
  types,
  jiraMode: true,
  skipScope: true,
  skipDescription: false,
  skipBreaking: false,
  customScope: false,
  // maxHeaderWidth: 72,
  // minHeaderWidth: 2,
  // maxLineWidth: 100,
  jiraPrefix: 'JIRA',
  jiraOptional: false,
  // jiraLocation: 'pre-description',
  // jiraPrepend: '',
  // jiraAppend: '',
  exclamationMark: false,
} as const;

export default defaults;
