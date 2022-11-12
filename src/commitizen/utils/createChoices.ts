import reduce from 'lodash/reduce';
import map from 'lodash/map';
import padEnd from 'lodash/padEnd';

export type ChoiceOption = {
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

export type ChoiceOptions = ChoiceOption[];

const createChoices = (choiceOptions: ChoiceOptions) => {
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

export default createChoices;
