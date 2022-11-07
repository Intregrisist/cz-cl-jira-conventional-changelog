import {describe, expect, test} from '@jest/globals';

import commitGenerator from '../commitGenerator';
import {EngineOptions, JiraLocation, PromptAnswers} from '../engine';
import {Types} from '../types';

const testTypes: Types = {
  test: {
    description: 'A test type',
    title: 'Test',
  },
};

const baseOptions: EngineOptions = {
  maxBodyWidth: 15,
  maxHeaderWidth: 10,
  types: testTypes,
};

describe('commitGenerator()', () => {
  describe('title without Jira issue', () => {
    test.each<[string, PromptAnswers, string]>([
      ['subject, type', {subject: 'subject', type: 'type'}, 'type: subject'],
      [
        'isBreaking, subject, type',
        {isBreaking: true, subject: 'subject', type: 'type'},
        'type!: subject',
      ],
      [
        'scope, subject, type',
        {scope: 'scope', subject: 'subject', type: 'type'},
        'type(scope): subject',
      ],
      [
        'customScope, scope, subject, type',
        {
          customScope: 'customScope',
          scope: 'scope',
          subject: 'subject',
          type: 'type',
        },
        'type(customScope): subject',
      ],
    ])('with: %s', (name, answers, expected) => {
      expect(commitGenerator(answers, baseOptions)).toBe(expected);
    });
  });

  describe('title with Jira issue', () => {
    test.each<[JiraLocation | undefined, string]>([
      [undefined, 'type: TEST-123 subject'],
      ['pre-type', 'TEST-123 type: subject'],
      ['pre-description', 'type: TEST-123 subject'],
      ['post-description', 'type: subject TEST-123'],
      ['post-body', 'type: subject\n\nTEST-123'],
    ])('location %s', (jiraLocation, expected) => {
      expect(
        commitGenerator(
          {
            jira: 'TEST-123',
            subject: 'subject',
            type: 'type',
          },
          {...baseOptions, jiraLocation}
        )
      ).toBe(expected);
    });
  });
});
