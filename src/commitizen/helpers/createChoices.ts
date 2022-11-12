import reduce from 'lodash/reduce';
import map from 'lodash/map';
import padEnd from 'lodash/padEnd';

export type Choice = {
  description: string;
  title: string;
};

const createChoices = <T extends Record<string, Choice>>(types: T) => {
  const length = reduce(
    types,
    (result, value, key) => (key.length > result ? key.length : result),
    5
  );
  return map(types, (type, key) => ({
    name: `${padEnd(key, length + 1)}: ${type.description}`,
    value: key,
  }));
};

export default createChoices;
