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
