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
    this.dataMap = this.#getDataMap();
  }

  #getDataMap() {
    this.dataMap = {
      ...AdaptativeSize.#getShorthandProperties(),
      ...AdaptativeSize.#getLonghandProperties(),
    };

    Object.keys(this.dataMap).forEach(selector => {
      const mappings = this.#getTargetsAndTriggers(selector);
      this.dataMap[selector].elementMappings = mappings;
    });
  }

  #getTargetsAndTriggers(targetSelector) {
    const data = this.dataMap[targetSelector];
    const elements = document.querySelectorAll(targetSelector);

    const elementPairs = Array.from(elements).map(element => ({
      targetElement: element,
      triggerElement: element.closest(
        data.cssProperties[
          `--${ADAPTATIVE_SIZE_ROOT}-${ADAPTATIVE_SIZE_KEYS[0]}`
        ],
      ),
    }));

    return elementPairs;
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

    props.forEach(({ selector, value }) => {
      if (!grouped[selector]) {
        grouped[selector] = {
          cssProperties: {},
        };
      }

      const parsedProperties = AdaptativeSize.#parseShorthandProperty(value);

      Object.keys(parsedProperties).forEach(prop => {
        const val = parsedProperties[prop];
        grouped[selector]
          .cssProperties[prop] = typeof val === 'string'
            ? val.replace(/^['"]+|['"]+$/g, '')
            : val;
      });
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
          grouped[selector] = {
            cssProperties: {},
          };
        }
        grouped[selector]
          .cssProperties[property] = typeof value === 'string'
            ? value.replace(/^['"]+|['"]+$/g, '')
            : value;
      });
    });

    return grouped;
  }
}

const adaptativeSize = new AdaptativeSize();
adaptativeSize.something();
console.log(adaptativeSize.dataMap);
