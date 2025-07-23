import { getTextContent } from '../network/network.js';

/**
 * Forces a browser reflow on the given element, useful for triggering CSS transitions/animations.
 * This is done by accessing a layout-related property (offsetWidth), which forces the browser
 * to recalculate layout.
 *
 * @param {HTMLElement} element - The DOM element to trigger reflow on.
 * @returns {void}
 *
 * @example
 * // Force reflow before restarting an animation
 * const box = document.getElementById('myBox');
 * box.classList.remove('animate');
 * reflowElement(box); // Forces reflow
 * box.classList.add('animate'); // Animation restarts
 */
export function reflowElement(element) {
  // eslint-disable-next-line no-unused-expressions
  element.offsetWidth;
}

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
