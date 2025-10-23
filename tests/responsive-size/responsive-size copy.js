import getCSSProperties from './utils.js';

const ADAPTATIVE_SIZE_ROOT = 'adaptative-size';
const ADAPTATIVE_SIZE_KEYS = [
  'trigger',
  'anchor',
  'target',
  'unit',
  'ratio',
];

class AdaptativeSize {
  constructor(debounceDelay = 100, observeDOM = false) {
    this.debounceDelay = debounceDelay;
    this.observeDOM = observeDOM;
    this.ruleMap = {
      ...AdaptativeSize.#getShorthandProperties(),
      ...AdaptativeSize.#getLonghandProperties(),
    };
  }

  static #parseShorthandProperty(propertyValue) {
    const result = {};
    const parts = propertyValue.split(/\s+/);

    ADAPTATIVE_SIZE_KEYS.forEach((key, i) => {
      if (parts[i] !== undefined) {
        result[`--${ADAPTATIVE_SIZE_ROOT}-${key}`] = parts[i];
      }
    });

    return result;
  }

  static #getShorthandProperties() {
    const grouped = {};

    const props = getCSSProperties(
      key => key === `--${ADAPTATIVE_SIZE_ROOT}`,
    );

    props.forEach(({ selector, _, value }) => {
      if (!grouped[selector]) {
        grouped[selector] = {};
      }
      grouped[selector] = AdaptativeSize.#parseShorthandProperty(value) COLOCAR REPLACE PRA TIRAR ASPAS LEMBRANDO QUE É DICT;
    });

    return grouped;
  }

  static #getLonghandProperties() {
    const grouped = {};

    ADAPTATIVE_SIZE_KEYS.forEach(prop => {
      const props = getCSSProperties(
        key => key === `--${ADAPTATIVE_SIZE_ROOT}-${prop}`,
      );

      props.forEach(({ selector, property, value }) => {
        if (!grouped[selector]) {
          grouped[selector] = {};
        }
        grouped[selector][property] = typeof value === 'string'
          ? value.replace(/^['"]+|['"]+$/g, '')
          : value;
      });
    });

    return grouped;
  }
}

const adaptativeSize = new AdaptativeSize();
console.log(adaptativeSize.ruleMap);
