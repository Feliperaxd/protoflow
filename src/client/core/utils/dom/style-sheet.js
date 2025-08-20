import { reflowElement } from './elements.js';

/**
 * Gets the numeric value of a CSS custom property from an element.
 * Supports unitless numbers, unit-based values (e.g., "100px"),
 * and expressions like "calc(...)". Always returns a unitless number.
 *
 * @param {HTMLElement} element - The element to read the CSS variable from.
 * @param {string} propertyName - The CSS variable name (e.g., "--menu-item-height").
 * @returns {number} - The computed numeric value (typically in pixels).
 * @throws {Error} - If the property is missing or cannot be resolved to a number.
 */
export function getCssPropertyNumber(element, propertyName) {
  if (!(element instanceof Element)) {
    throw new Error('Element is required and must be a DOM Element.');
  }

  const rawValue = getComputedStyle(element).getPropertyValue(propertyName).trim();

  if (!rawValue) {
    throw new Error(
      `CSS custom property "${propertyName}" is not set or resolves to an empty value.`
    );
  }

  // Fast path: pure number (no units)
  if (/^-?\d*\.?\d+$/.test(rawValue)) {
    const value = parseFloat(rawValue);
    if (Number.isNaN(value)) {
      throw new Error(`Invalid CSS number for ${propertyName}: "${rawValue}"`);
    }
    return value;
  }

  // Resolve via a real CSS property (width) in the actual layout context
  const helper = document.createElement('div');
  const { style } = helper;
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.boxSizing = 'content-box';
  style.margin = '0';
  style.padding = '0';
  style.border = '0';
  style.width = rawValue;

  element.appendChild(helper);
  const { width } = getComputedStyle(helper);
  element.removeChild(helper);
  const numeric = parseFloat(width);

  if (Number.isNaN(numeric)) {
    throw new Error(
      `Invalid CSS value for ${propertyName}: "${rawValue}" (resolved width: "${width}")`,
    );
  }

  return numeric;
}

/**
 * Clears all existing classes and applies a new one to a given DOM element.
 *
 * @param {HTMLElement} element - The target DOM element.
 * @param {string} classToAdd - The class name to be applied.
 */
export const setExclusiveStyleClass = (element, classToAdd) => {
  // eslint-disable-next-line no-param-reassign
  element.className = '';
  element.classList.add(classToAdd);
};

/**
 * Replaces one CSS class with another on a given DOM element.
 *
 * @param {HTMLElement} element - The target DOM element.
 * @param {string} classToRemove - The class name to be removed.
 * @param {string} classToAdd - The class name to be added.
 */
export const switchStyleClass = (element, classToRemove, classToAdd, reflow = false) => {
  element.classList.remove(classToRemove);
  if (reflow) reflowElement(element);
  element.classList.add(classToAdd);
};

/**
 * Replaces CSS classes on multiple DOM elements, optionally with a sequential delay.
 *
 * @param {Array<{
 *   element: HTMLElement,
 *   remove: string,
 *   add: string,
 *   reflow?: boolean
 * }>} replacements
 *  - Each object contains:
 *      element: The DOM element
 *      remove: Class to remove
 *      add: Class to add
 *      reflow: Whether to force reflow (default: false)
 * @param {number} [delay=0] - Optional delay in ms between each class switch.
 */
export function switchStyleClasses(itemStyleTransitions, delay = 0) {
  let time = 0;

  itemStyleTransitions.forEach(({
    element,
    remove,
    add,
    reflow = false,
    callback = null,
  }) => {
    const executeTransition = () => {
      switchStyleClass(element, remove, add, reflow);
      if (callback && typeof callback === 'function') {
        callback(element, { remove, add, reflow });
      }
    };

    if (delay > 0) {
      setTimeout(executeTransition, time);
      time += delay;
    } else {
      executeTransition();
    }
  });
}
