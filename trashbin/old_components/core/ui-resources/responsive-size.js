/**
 * ResponsiveSize - Dynamically resizes a CSS property based on parent element size.
 */
export default class ResponsiveSize {
  /** @type {() => void} */
  #onResize;

  /**
   * @param {string} attribute - Attribute or selector to target responsive elements.
   * @param {string} ratioVar - CSS variable that holds the size ratio.
   * @param {string} property - CSS property to resize
   *  (camelCase, e.g. 'fontSize', 'borderRadius').
   * @param {string} [unit='px'] - Unit for the resized property (e.g., px, rem, em).
   * @param {number} [debounceDelay=100] - Delay in milliseconds for debouncing resize events.
   * @param {boolean} [observeDOM=false] - Whether to observe DOM mutations.
   * @param {string} [baseDimension='width'] - Base dimension used to calculate size
   *  ('width' or 'height').
   */
  constructor(
    anchorElement,
    targetElements,
    ratioVar,
    property,
    unit = 'px',
    debounceDelay = 100,
    observeDOM = false,
    baseDimension = 'width',
  ) {
    if (typeof ratioVar !== 'string' || !ratioVar) {
      throw new Error('Ratio CSS variable name must be a non-empty string');
    }

    this.anchorElement = anchorElement;
    this.targetElements = targetElements;
    this.ratioVar = ratioVar;
    this.property = property;
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
   * @returns {ResponsiveSize}
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

  #handleResize() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.#resizeAll();
    }, this.debounceDelay);
  }

  #getResponsiveElements() {
    return document.querySelectorAll(`${this.attribute}, [${this.attribute}]`);
  }

  #resizeAll(base, sizeRatio) {
    let successCount = 0;

    this.elements.forEach(el => {
      const result = this.#resizeOne(el, base, sizeRatio);
      if (result) successCount += 1;
    });

    return successCount;
  }

  #getBaseDimension(element) {
    const parent = element.parentElement;
    return this.baseDimension === 'height'
      ? parent.offsetHeight
      : parent.offsetWidth;
  }

  #getSizeRatio(element) {
    return parseFloat(getComputedStyle(element).getPropertyValue(this.ratioVar));
  }

  #resizeOne(element, base, sizeRatio) {
    const ratio = typeof sizeRatio === 'number' ? sizeRatio : this.#getSizeRatio(element);
    const dimension = typeof base === 'number' ? base : this.#getBaseDimension(element);

    if (Number.isNaN(ratio) || Number.isNaN(dimension) || ratio <= 0 || dimension <= 0) {
      return false;
    }

    const value = dimension / ratio;

    // eslint-disable-next-line no-param-reassign
    element.style[this.property] = `${value}${this.unit}`;
    return true;
  }

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

  #stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
