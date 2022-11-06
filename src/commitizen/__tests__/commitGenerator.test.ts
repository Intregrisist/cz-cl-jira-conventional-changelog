import {describe, expect, test} from '@jest/globals';

import commitGenerator from '../commitGenerator';
import {EngineOptions, JiraLocation} from '../engine';

const testTypes = {
  test: {
    description: 'A test type',
    title: 'Test',
  },
};

const baseOptions: EngineOptions = {
  types: testTypes,
};

describe('commitGenerator()', () => {
  describe('title without Jira issue', () => {
    test('with type and subject', () => {
      expect(
        commitGenerator(
          {
            subject: 'subject',
            type: 'type',
          },
          baseOptions
        )
      ).toBe('type: subject');
    });
    test('with type, subject, and breaking change', () => {
      expect(
        commitGenerator(
          {
            isBreaking: true,
            subject: 'subject',
            type: 'type',
          },
          baseOptions
        )
      ).toBe('type!: subject');
    });
    test('with type, scope, and subject', () => {
      expect(
        commitGenerator(
          {
            scope: 'scope',
            subject: 'subject',
            type: 'type',
          },
          baseOptions
        )
      ).toBe('type(scope): subject');
    });
    test('with type, custom scope, and subject', () => {
      expect(
        commitGenerator(
          {
            scope: 'custom',
            customScope: 'customScope',
            subject: 'subject',
            type: 'type',
          },
          baseOptions
        )
      ).toBe('type(customScope): subject');
    });
    test('with type, custom scope, and subject', () => {
      expect(
        commitGenerator(
          {
            scope: 'custom',
            customScope: 'customScope',
            subject: 'subject',
            type: 'type',
          },
          baseOptions
        )
      ).toBe('type(customScope): subject');
    });
  });
  describe('title with Jira issue', () => {
    test.each<[JiraLocation | undefined, string]>([
      [undefined, 'type: TEST-123 subject'],
      ['pre-type', 'TEST-123 type: subject'],
      ['pre-description', 'type: TEST-123 subject'],
      ['post-description', 'type: subject TEST-123'],
      ['post-body', 'type: subject'],
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
