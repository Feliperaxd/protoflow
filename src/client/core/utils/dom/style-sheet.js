/**
 * Gets the numeric value of a computed custom CSS variable.
 * Throws an error if the value cannot be parsed as a number.
 *
 * @param {string} propertyName - The name of the CSS variable (e.g., '--min-value').
 * @returns {number} - The numeric value of the computed CSS variable.
 * @throws {Error} - If the value is not a valid number.
 */
export const getCssPropertyNumber = propertyName => {
  const helper = document.createElement('div');
  helper.style.height = `var(${propertyName})`;
  helper.style.position = 'absolute';
  helper.style.visibility = 'hidden';
  document.body.appendChild(helper);

  const computedValue = getComputedStyle(helper).height;
  const value = parseFloat(computedValue);

  helper.remove();

  if (Number.isNaN(value)) {
    throw new Error(`Invalid CSS value for ${propertyName}`);
  }

  return value;
};

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
