/**
 * Formats a numeric value to a specified precision (number of decimal places).
 * @param {number} value - The numeric value to be formatted.
 * @param {number} [numberOfDecimalPlaces=2] - Number of decimal places (default: 2).
 * @returns {string} Formatted value as string with specified precision.
 * @throws {TypeError} If input is not valid number.
 */
export const formatValuePrecision = (value, numberOfDecimalPlaces = 2) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new TypeError('Value must be valid number');
  }
  if (typeof numberOfDecimalPlaces !== 'number' || numberOfDecimalPlaces < 0) {
    throw new TypeError('Decimal places must be non-negative number');
  }
  return value.toFixed(numberOfDecimalPlaces);
};

/**
 * Retrieves the numeric value of a custom CSS property from a given element.
 * Throws an error if the value is not a valid number.
 *
 * @param {HTMLElement} element - The DOM element to read the property from.
 * @param {string} propertyName - The name of the CSS property (e.g., '--min-value').
 * @returns {number} - The numeric value of the CSS property.
 * @throws {Error} - If the value is not a valid number.
 */
export const getCssPropertyValue = (element, propertyName) => {
  const value = parseFloat(getComputedStyle(element).getPropertyValue(propertyName));
  if (Number.isNaN(value)) {
    throw new Error(`Invalid CSS value for ${propertyName}`);
  }
  return value;
};

/**
 * Extracts (x, y) positions from mouse or touch events.
 *
 * @param {MouseEvent | TouchEvent} event - The input event.
 * @returns {{ x: number, y: number }[]} List of coordinate positions.
 */
export function getEventPositions(event) {
  if (event.touches && event.touches.length > 0) {
    return Array.from(event.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
    }));
  }

  if (event.changedTouches && event.changedTouches.length > 0) {
    return Array.from(event.changedTouches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
    }));
  }

  return [{
    x: event.clientX,
    y: event.clientY,
  }];
}

/**
 * Fetches the text content from a given URL.
 *
 * @param {string} url - The URL to fetch the text content from.
 * @returns {Promise<string>} A promise that resolves to the fetched text content.
 */
export async function getTextContent(url) {
  return fetch(url).then(res => res.text());
}

/**
 * Prevents the default behavior and stops the propagation of a browser event.
 *
 * @param {Event} event - The event to be handled.
 */
export const preventDefaults = event => {
  event.preventDefault();
  event.stopPropagation();
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

/**
 * Loads an HTML template and returns it as a DOM element.
 *
 * @param {string} path - The path to the HTML template file.
 * @param {string} [containerTag] - Tag to use as the container for parsing.
 *
 * @returns {Promise<Element>} A promise that resolves to the first DOM
 *  element parsed from the template.
 */
export async function loadTemplateAsElement(path, containerTag) {
  const html = await getTextContent(path);
  const temp = document.createElement(containerTag);
  temp.innerHTML = html.trim();
  return temp.firstElementChild;
}
