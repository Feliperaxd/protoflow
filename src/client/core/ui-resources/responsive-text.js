/**
 * ResponsiveText - Dynamically resizes text based on parent element size.
 */
export default class ResponsiveText {
  /** @type {() => void} */
  #onResize;

  /**
   * @param {string} attribute - Attribute or selector to target responsive elements.
   * @param {string} ratioVar - CSS variable that holds the font-size ratio.
   * @param {string} [unit='px'] - Font size unit (e.g., px, rem, em).
   * @param {number} [debounceDelay=100] - Delay in milliseconds for debouncing resize events.
   * @param {boolean} [observeDOM=false] - Whether to observe DOM mutations.
   * @param {string} [baseDimension='width'] - Base dimension used to calculate font size
   *  ('width' or 'height').
   */
  constructor(
    attribute,
    ratioVar,
    unit = 'px',
    debounceDelay = 100,
    observeDOM = false,
    baseDimension = 'width',
  ) {
    if (typeof attribute !== 'string' || !attribute) {
      throw new Error('Attribute must be a non-empty string');
    }

    if (typeof ratioVar !== 'string' || !ratioVar) {
      throw new Error('Ratio CSS variable name must be a non-empty string');
    }

    this.attribute = attribute;
    this.ratioVar = ratioVar;
    this.unit = unit;
    this.debounceDelay = debounceDelay;
    this.observeDOM = observeDOM;
    this.baseDimension = ['width', 'height'].includes(baseDimension)
      ? baseDimension
      : 'width';

    this.elements = [];
    this.debounceTimer = null;
    this.observer = null;

    this.#onResize = this.#handleResize.bind(this);
  }

  // === Public Methods ===

  /**
   * Initializes listeners and resizes elements.
   * @returns {ResponsiveText}
   */
  init() {
    this.updateElements();
    window.addEventListener('resize', this.#onResize);

    if (this.observeDOM) {
      this.#observeDOM();
    }

    return this;
  }

  /**
   * Cleans up listeners and observers.
   * @returns {void}
   */
  destroy() {
    window.removeEventListener('resize', this.#onResize);
    this.#stopObserving();
    this.elements = [];
  }

  /**
   * Resizes a single element with optional base and ratio parameters.
   * @param {HTMLElement} element - Element to resize
   * @param {number} [base] - Optional base dimension to use
   * @param {number} [sizeRatio] - Optional size ratio to use
   * @returns {boolean} True if resizing was successful
   */
  updateElement(element, base, sizeRatio) {
    return this.#resizeOne(element, base, sizeRatio);
  }

  /**
   * Finds and resizes all responsive elements with optional base and ratio parameters.
   * @param {number} [base] - Optional base dimension to apply to all elements
   * @param {number} [sizeRatio] - Optional size ratio to apply to all elements
   * @returns {number} Count of successfully resized elements
   */
  updateElements(base, sizeRatio) {
    this.elements = this.#getResponsiveElements();
    return this.#resizeAll(base, sizeRatio);
  }

  // === Private Methods ===

  /**
   * Handles window resize events with debouncing to optimize performance.
   * @private
   * @method #handleResize
   * @listens window:resize
   */
  #handleResize() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.#resizeAll();
    }, this.debounceDelay);
  }

  /**
   * Gets all DOM elements that should have responsive sizing.
   * @private
   * @method #getResponsiveElements
   * @returns {NodeList} List of responsive elements
   */
  #getResponsiveElements() {
    return document.querySelectorAll(`${this.attribute}, [${this.attribute}]`);
  }

  /**
   * Resizes all responsive elements with optional base and ratio parameters.
   * @private
   * @method #resizeAll
   * @param {number} [base] - Optional base dimension to apply to all elements
   * @param {number} [sizeRatio] - Optional size ratio to apply to all elements
   * @returns {number} Count of successfully resized elements
   */
  #resizeAll(base, sizeRatio) {
    let successCount = 0;

    this.elements.forEach(el => {
      const result = this.#resizeOne(el, base, sizeRatio);
      if (result) successCount += 1;
    });

    return successCount;
  }

  /**
   * Gets the base dimension (width/height) of the parent element.
   * @private
   * @method #getBaseDimension
   * @param {HTMLElement} element - The child element
   * @returns {number} Parent's dimension in pixels
   */
  #getBaseDimension(element) {
    const parent = element.parentElement;
    return this.baseDimension === 'height'
      ? parent.offsetHeight
      : parent.offsetWidth;
  }

  /**
   * Gets the size ratio from the element's CSS variable.
   * @private
   * @method #getSizeRatio
   * @param {HTMLElement} element - The element to check
   * @returns {number} Size ratio value
   */
  #getSizeRatio(element) {
    return parseFloat(getComputedStyle(element).getPropertyValue(this.ratioVar));
  }

  /**
   * Resizes a single element based on its ratio and parent dimension.
   * @private
   * @method #resizeOne
   * @param {HTMLElement} element - Element to resize
   * @param {number} [base] - Optional: base dimension to use (skips auto-detection)
   * @param {number} [sizeRatio] - Optional: size ratio to use (skips auto-detection)
   * @returns {boolean} True if resizing was successful, false otherwise
   */
  #resizeOne(element, base, sizeRatio) {
    const ratio = typeof sizeRatio === 'number' ? sizeRatio : this.#getSizeRatio(element);
    const dimension = typeof base === 'number' ? base : this.#getBaseDimension(element);

    if (Number.isNaN(ratio) || Number.isNaN(dimension) || ratio <= 0 || dimension <= 0) {
      return false;
    }

    const fontSize = dimension / ratio;

    // eslint-disable-next-line no-param-reassign
    element.style.fontSize = `${fontSize}${this.unit}`;
    return true;
  }

  /**
   * Observes DOM changes to detect new responsive elements.
   * @private
   * @method #observeDOM
   * @listens MutationObserver
   */
  #observeDOM() {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          this.updateElements();
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Stops observing DOM changes.
   * @private
   * @method #stopObserving
   */
  #stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
