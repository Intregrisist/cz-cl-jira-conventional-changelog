// eslint-disable-next-line node/no-extraneous-import
import Inquirer from 'inquirer';
import MaxLengthInputPrompt from 'inquirer-maxlength-input-prompt';
import mapValues from 'lodash/mapValues';
import chalk from 'chalk';
import boxen from 'boxen';

import {DefaultEngineOptions} from './constants';
import createCommitMessage from './utils/createCommitMessage';
import createQuestions from './utils/createQuestions';
import type {Answers, EngineOptions} from './types';

function engine(options: Partial<EngineOptions> = DefaultEngineOptions) {
  const mergedOptions = {
    ...DefaultEngineOptions,
    ...options,
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prompter(inquirer: typeof Inquirer, commit: (message: string) => void) {
      inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);
      inquirer
        .prompt(createQuestions(mergedOptions))
        .then(async rawAnswers => {
          const answers = mapValues(rawAnswers, answer =>
            typeof answer === 'string' ? answer.trim() : answer
          ) as Answers;
          const commitMessage = createCommitMessage(answers, mergedOptions);

          console.log();
          console.log(chalk.underline('Commit preview:'));
          console.log(
            boxen(chalk.green(commitMessage), {padding: 1, margin: 1})
          );

          const {doCommit} = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'doCommit',
              message: 'Commit?',
            },
          ]);

          if (doCommit) {
            commit(commitMessage);
          }
        })
        .catch(e => {
          // TODO: Understand if this can throw an error and what we should do with it
          console.log(e);
        });
    },
  };
}

export default engine;
