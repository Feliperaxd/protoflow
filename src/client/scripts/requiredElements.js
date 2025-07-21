/**
 * Utility class for validating required DOM elements exist.
 * Throws detailed errors when elements are missing to help with debugging.
 *
 * @example
 * const validator = new RequiredElements([
 *   { selector: '.header', name: 'Page Header' },
 *   { selector: '#main', name: 'Main Content' }
 * ], document.body);
 * validator.checkAll();
 */
export default class RequiredElements {
  /**
   * Creates a new RequiredElements validator
   * @param {Array<{selector: string, name?: string}>} elements - Array of element descriptors
   * @param {HTMLElement|Document} [rootElement=document] - Root element to search from
   */
  constructor(elements, root = document) {
    if (!Array.isArray(elements)) {
      throw new TypeError('Elements must be an array');
    }

    this.elements = elements;
    this.root = root;
  }

  /**
   * Validates all required elements exist in the DOM
   * @returns {boolean} True if all elements exist
   * @throws {Error} Detailed error if any elements are missing
   */
  checkAll() {
    const missingElements = this.elements
      .map(({ selector, name = selector }) => ({
        name,
        selector,
        element: this.root.querySelector(selector),
      }))
      .filter(item => !item.element);

    if (missingElements.length > 0) {
      throw new Error(`Missing required elements: ${
        missingElements.map(item => (
          `${item.name} (${item.selector})`
        )).join(', ')
      }`);
    }

    return true;
  }
}
