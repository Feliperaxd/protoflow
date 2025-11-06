import AdaptativeElement from './SyncProperty.js';
/*
const ADAPTATIVE_SIZE_ROOT = 'adaptative-size';
const ADAPTATIVE_SIZE_KEYS = [
  'trigger',
  'anchor',
  'target',
  'unit',
  'ratio',
];

class AdaptativeSize {
  constructor(debounceDelay = 100) {
    this.debounceDelay = debounceDelay;
    this.dataMap = {};

    this.resizeObserver = [];
    this.mutationObserver = [];

    this.resizeObserverConditions = [];
    this.mutationObserverConditions = [];

    this.#updateProperties();
    this.#updateTargetsAndTriggers();
  }

  #updateProperties() {
    this.dataMap = {
      ...AdaptativeSize.#getShorthandProperties(),
      ...AdaptativeSize.#getLonghandProperties(),
    };
  }

  #updateTargetsAndTriggers() {
    if (!this.dataMap) return;

    Object.keys(this.dataMap).forEach(targetSelector => {
      const elements = document.querySelectorAll(targetSelector);

      const triggerSelector = this.dataMap[targetSelector].cssProperties[
        `--${ADAPTATIVE_SIZE_ROOT}-${ADAPTATIVE_SIZE_KEYS[0]}`
      ];

      const elementPairs = Array.from(elements).map(element => ({
        targetElement: element,
        triggerElement: element.closest(triggerSelector),
      }));

      this.dataMap[targetSelector].elementMappings = elementPairs;
    });
  }

  #updateObservers() {
    Object.keys(this.dataMap).forEach(targetSelector => {
      const data = this.dataMap[targetSelector];
      const anchor = data.cssProperties[
        `--${ADAPTATIVE_SIZE_ROOT}-${ADAPTATIVE_SIZE_KEYS[1]}`
      ]

      data.observers = Array.from(

        data.elementMappings.map(pair => {
            if (anchor === 'width' || anchor === 'height') {

            } else {

            }
          });
      )
    });
  }

  static #getObserver(targetElement, triggerElement, anchor) {
    if (anchor === 'width' || anchor === 'height') {
      return new ResizeObserver()
    }
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
        grouped[selector] = { cssProperties: {} };
      }

      const parsedProperties = AdaptativeSize.#parseShorthandProperty(value);

      Object.keys(parsedProperties).forEach(prop => {
        const val = parsedProperties[prop];

        grouped[selector].cssProperties[prop] =
          typeof val === 'string'
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
          grouped[selector] = { cssProperties: {} };
        }

        grouped[selector].cssProperties[property] =
          typeof value === 'string'
            ? value.replace(/^['"]+|['"]+$/g, '')
            : value;
      });
    });

    return grouped;
  }
}

const adaptativeSize = new AdaptativeSize();
console.log(adaptativeSize.dataMap);

const elemento = document.getElementById('testes');
const observer = new MutationObserver(() => {
  console.log('✅ ALGO MUDOU!'); // Isso deve aparecer sempre
});

observer.observe(elemento, {
  attributes: true,
  attributeFilter: ['style'],
});

const el = new AdaptativeElement(
  { selector: '.teste', property: 'border-radius' },
  { selector: '.teste', property: 'width' },
  'px',
  0.04,
);

const resizeObserver = new ResizeObserver(entries => {
  entries.forEach(entry => {
    el.linkedElements.forEach(element => {
      if (entry.target === element.trigger) {
        el.resizeTarget(element.target, element.trigger);
      }
    });
  });
});

resizeObserver.observe(el.linkedElements[0].trigger);
*/

import { getCSSProperties } from './utils.js';

class SyncSizeController {
  static SYNC_SIZE_KEY = '--sync-size';

  static parseParameters([
    targetSel, triggerSel,
    triggerProp, targetProp,
    unit, ratio,
  ]) {
    return {
      target: { selector: targetSel, property: targetProp },
      trigger: { selector: triggerSel, property: triggerProp },
      unit,
      ratio,
    };
  }

  static fetchProperties() {
    const rawProperties = getCSSProperties(
      key => key === SyncSizeController.PROPERTY_KEY,
    );

    const cleaned = rawProperties.map(({ selector, value }) => {
      const values = value
        .split(/\s+/)
        .map(v => v.replace(/['"]/g, ''))
        .filter(v => v.length);

      return [selector, ...values];
    });

    return cleaned;
  }

  constructor(debounceDelay = 100) {
    this.debounceDelay = debounceDelay;
    this.syncedProperties = [];

    this.resizeObserver = null;
    this.mutationObserver = null;
  }

  init() {
    this.#generateElements(
      SyncSizeController.fetchProperties(),
    );
    this.#generateObeservers();
    this.adaptativeElements.forEach(ae => {
      ae.linkedElements.forEach(le => {
        this.resizeObserver.observe(le.trigger);
      });
    });
  }

  #generateElements(allProperties) {
    allProperties.forEach(properties => {
      const parsed = SyncSizeController.parseProperties(properties);
      const adaptativeEl = new AdaptativeElement(
        parsed.target,
        parsed.trigger,
        parsed.unit,
        parsed.ratio,
      );

      this.adaptativeElements.push(adaptativeEl);
    });
  }

  #generateResizeObserver() {
    const resize = entries => {
      entries.forEach(entry => {
        const triggerEl = entry.target;

        const found = this.syncedProperties.find(
          synced =>
            synced.linkedElements.some(item => item.trigger === triggerEl),
        );

        if (found) {
          found.resizeAll();
        }
      });
    };

    this.resizeObserver = new ResizeObserver(resize);
  }
}

const a = new AdaptativeProperties();
a.init();

console.log(a.adaptativeElements);
