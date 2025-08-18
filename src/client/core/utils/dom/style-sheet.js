/**
 * Gets the numeric value of a CSS custom property from an element.
 * Works with both unitless numbers (e.g., '--max-value: 100')
 *  and CSS values (e.g., '--height: 100px').
 *
 * @param {HTMLElement} element - The element to read the CSS variable from.
 * @param {string} propertyName - The CSS variable name (e.g., '--max-value').
 * @returns {number} - The parsed number.
 * @throws {Error} - If the value is not a valid number.
 */
export function getCssPropertyNumber(element, propertyName) {
  const rawValue = getComputedStyle(element).getPropertyValue(propertyName).trim();

  // Handle unitless numbers first (common case)
  if (/^-?\d*\.?\d+$/.test(rawValue)) {
    const value = parseFloat(rawValue);
    if (Number.isNaN(value)) {
      throw new Error(`Invalid CSS number for ${propertyName}: "${rawValue}"`);
    }
    return value;
  }

  // Handle CSS values with units
  const helper = document.createElement('div');
  const [style] = helper.style;
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.setProperty(propertyName.startsWith('--') ? propertyName : `--${propertyName}`, rawValue);
  document.body.appendChild(helper);

  const computedValue = getComputedStyle(helper).getPropertyValue(propertyName);
  const parsedValue = parseFloat(computedValue) || parseFloat(rawValue);

  document.body.removeChild(helper);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid CSS value for ${propertyName}: "${rawValue}"`);
  }

  return parsedValue;
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
export const switchStyleClass = (element, classToRemove, classToAdd) => {
  element.classList.remove(classToRemove);
  element.classList.add(classToAdd);
};
