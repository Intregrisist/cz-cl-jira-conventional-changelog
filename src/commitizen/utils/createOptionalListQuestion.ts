// eslint-disable-next-line node/no-extraneous-import
import {Answers, DistinctQuestion} from 'inquirer';
import find from 'lodash/find';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import padEnd from 'lodash/padEnd';

export type ListChoice = {
  /**
   * A description of the choice
   */
  description: string;
  /**
   * An optional title shown to the user instead of the value
   */
  title?: string;
  /**
   * The value of the choice
   */
  value: string;
};

export type ListChoices = ListChoice[];

export type OptionalListQuestion<T extends Answers = Answers> = Omit<
  DistinctQuestion<T>,
  'choices' | 'message' | 'type'
> & {
  /**
   * Additional list options that will get appended to listChoices if it's not empty
   */
  listAdditionalChoices?: ListChoices;
  /**
   * List of options to generate choices of the prompt
   */
  listChoices?: ListChoices;
  /**
   * The message to show the user
   */
  message: ((hasList: boolean) => string) | string;
};

const createChoices = (choiceOptions: ListChoices = []) => {
  const length = reduce(
    choiceOptions,
    (result, {title, value}) => {
      const length = (title || value).length;
      return length > result ? length : result;
    },
    5
  );
  return map(choiceOptions, ({description, title, value}) => ({
    name: `${padEnd(title || value, length + 1)}: ${description}`,
    value,
  }));
};

const createOptionalListQuestion = <T extends Answers = Answers>(
  question: OptionalListQuestion<T>
): DistinctQuestion<T> => {
  const {listAdditionalChoices, listChoices, message, name} = question;
  const choices = createChoices(listChoices);
  const hasList = !!choices.length;
  const listDefault = find(choices, ['value', question.default])?.value;
  return {
    ...question,
    type: hasList ? 'list' : 'input',
    default: hasList ? listDefault : question.default,
    message: typeof message === 'function' ? message(hasList) : message,
    choices: hasList
      ? choices.concat(createChoices(listAdditionalChoices))
      : undefined,
  };
};

export default createOptionalListQuestion;
