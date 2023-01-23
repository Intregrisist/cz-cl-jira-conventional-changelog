import {describe, expect, test} from '@jest/globals';

import createCommitMessage from '../utils/createCommitMessage';
import {Answers} from '../utils/createQuestions';
import {EngineOptions, JiraLocation} from '../types';
import {ListChoices} from '../utils/createOptionalListQuestion';

const testTypes: ListChoices = [
  {
    description: 'A test type',
    title: 'Test',
    value: 'test',
  },
];

const baseOptions: EngineOptions = {
  maxBodyWidth: 15,
  maxHeaderWidth: 10,
  types: testTypes,
};

describe('createCommitMessage()', () => {
  describe('title', () => {
    describe('without Jira issue', () => {
      test.each<[string, Answers, string]>([
        [
          'subject, type',
          {description: 'subject', type: 'type'},
          'type: subject',
        ],
        [
          'isBreaking, subject, type',
          {isBreaking: true, description: 'subject', type: 'type'},
          'type!: subject',
        ],
        [
          'scope, subject, type',
          {scope: 'scope', description: 'subject', type: 'type'},
          'type(scope): subject',
        ],
        [
          'customScope, scope, subject, type',
          {
            customScope: 'customScope',
            scope: 'scope',
            description: 'subject',
            type: 'type',
          },
          'type(customScope): subject',
        ],
      ])('with: %s', (name, answers, expected) => {
        expect(createCommitMessage(answers, baseOptions)).toBe(expected);
      });
    });

    describe('with Jira issue', () => {
      test.each<[JiraLocation | undefined, string]>([
        [undefined, 'type: TEST-123 subject'],
        ['pre-type', 'TEST-123 type: subject'],
        ['pre-description', 'type: TEST-123 subject'],
        ['post-description', 'type: subject TEST-123'],
        ['post-body', 'type: subject\n\nTEST-123'],
      ])('location %s', (jiraLocation, expected) => {
        expect(
          createCommitMessage(
            {
              jiraIssues: 'TEST-123',
              description: 'subject',
              type: 'type',
            },
            {...baseOptions, jiraLocation}
          )
        ).toBe(expected);
      });
    });
  });
});
