import wrap from 'word-wrap';
import types from './types';
import {EngineOptions} from './engine';

export const DefaultWrapOptions: wrap.IOptions = {
  trim: true,
  cut: false,
  newline: '\n',
  indent: '',
  width: 100,
} as const;

export const DefaultEngineOptions: EngineOptions = {
  types,
  jiraMode: true,
  skipScope: true,
  skipDescription: false,
  skipBreaking: false,
  customScope: false,
  maxHeaderWidth: 72,
  // minHeaderWidth: 2,
  maxBodyWidth: 100,
  jiraPrefix: 'JIRA',
  jiraOptional: false,
  // jiraLocation: 'pre-description',
  // jiraPrepend: '',
  // jiraAppend: '',
  exclamationMark: false,
};
