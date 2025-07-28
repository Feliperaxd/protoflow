/**
 * Comprehensive DOM element registry with validation capabilities.
 * Tracks, verifies, and provides access to DOM elements and their CSS definitions.
 *
 * @example
 * const dom = new DomRegistry([
 *   { selector: '.header', name: 'Page Header', check: true },
 *   { selector: '#main', name: 'Main Content', check: false }
 * ], document.body);
 *
 * dom.validateAll(); // Checks all registered elements
 * const header = dom.get('Page Header'); // Retrieves element by name
 */
export default class DomRegistry {
  /**
   * Creates a new DOM registry instance
   *
   * @param {Array<ElementConfig>} elements - Elements to register
   * @param {HTMLElement|Document} [root=document] - Root element for queries
   */
  constructor(elements, root = document) {
    if (!Array.isArray(elements)) {
      throw new TypeError('Elements must be provided as an array');
    }

    this.elements = elements.map(config => ({
      check: true, // Default to checking all elements
      ...config,
    }));
    this.root = root;
  }

  /**
   * @typedef {Object} ElementConfig
   * @property {string} selector - CSS selector for the element
   * @property {string} [name] - Human-readable identifier
   * @property {boolean} [check] - Whether to include in validation
   */

  /**
   * Retrieves one or multiple DOM elements by identifier.
   *
   * @param {string} identifier - Name or selector of the element
   * @returns {HTMLElement|HTMLElement[]|null} The matched element(s) or null
   */
  getElements(identifier) {
    const config = this.elements.find(
      item => item.name === identifier || item.selector === identifier,
    );

    if (!config) return null;

    const matched = this.root.querySelectorAll(config.selector);

    if (matched.length === 0) return null;
    return Array.from(matched);
  }

  /**
   * Retrieves the selector for a registered element by its name.
   *
   * @param {string} name - The registered name of the element (e.g., "Page Header").
   * @param {boolean} [withPrefix=true] - Whether to include the prefix
   *  (e.g., ".", "#") in the returned selector.
   * @returns {string|null} The selector (with or without prefix) if found, otherwise null.
   */
  getSelector(name, withPrefix = true) {
    const element = this.elements.find(item => item.name === name);
    if (!element) return null;

    return withPrefix
      ? element.selector
      : element.selector.replace(/^[^a-zA-Z0-9_-]+/, '');
  }

  /**
   * Checks if an element exists in the DOM
   *
   * @param {string} identifier - Name or selector to check
   * @returns {boolean} True if element exists
   */
  hasElement(identifier) {
    return this.get(identifier) !== null;
  }

  /**
   * Validates all registered elements (with check:true)
   *
   * @returns {boolean} True if all elements exist
   * @throws {Error} Detailed missing elements list
   */
  checkElements() {
    const missing = this.elements
      .filter(item => item.check)
      .map(({ selector, name = selector }) => ({
        name,
        selector,
        element: this.root.querySelector(selector),
      }))
      .filter(item => !item.element);

    if (missing.length > 0) {
      throw new Error(`Missing elements: ${
        missing.map(item => `${item.name} (${item.selector})`).join(', ')
      }`);
    }
    return true;
  }

  /**
   * Validates all CSS class definitions
   *
   * @returns {boolean} True if all classes exist
   * @throws {Error} List of missing CSS classes
   */
  checkStyles() {
    const missingClasses = this.elements
      .filter(item => item.check && item.selector.startsWith('.'))
      .map(item => item.selector)
      .filter(selector => !DomRegistry.hasClass(selector));

    if (missingClasses.length > 0) {
      throw new Error(`Undefined CSS classes: ${missingClasses.join(', ')}`);
    }
    return true;
  }

  /**
   * Performs complete DOM and CSS validation
   *
   * @returns {boolean} True if all validations pass
   * @throws {Error} Combined validation errors
   */
  checkAll() {
    const errors = [];
    [this.checkElements, this.checkStyles].forEach(validator => {
      try {
        validator.call(this);
      } catch (e) {
        errors.push(e.message);
      }
    });

    if (errors.length) throw new Error(errors.join('\n'));
    return true;
  }

  /**
   * Checks if CSS class exists in any stylesheet
   *
   * @static
   * @param {string} className - Class to check (with or without . prefix)
   * @returns {boolean} True if class is defined
   */
  static hasClass(className) {
    const normalized = className.startsWith('.') ? className : `.${className}`;
    return Array.from(document.styleSheets).some(sheet => {
      try {
        return Array.from(sheet.cssRules || [])
          .some(rule => rule.selectorText?.includes(normalized));
      } catch {
        return false;
      }
    });
  }

  /**
   * Removes leading non-alphanumeric characters from the beginning of a string.
   * Only letters, numbers, hyphens (-), and underscores (_) are preserved at the start.
   *
   * Useful for cleaning selector-like strings (e.g., ".btn" → "btn", "#main" → "main").
   *
   * @static
   * @param {string} value - The input string to clean (e.g., ".btn", "#main", "[data-test]")
   * @returns {string} The string without leading special characters
   */
  static removePrefix(value) {
    return value.replace(/^[^a-zA-Z0-9_-]+/, '');
  }
}
