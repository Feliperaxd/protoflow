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
   * Finds and resizes all responsive elements.
   * @returns {void}
   */
  updateElements() {
    this.elements = this.#getResponsiveElements();
    this.#resizeAll();
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
   * Resizes all responsive elements.
   * @private
   * @method #resizeAll
   */
  #resizeAll() {
    this.elements.forEach(el => this.#resizeOne(el));
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
   */
  #resizeOne(element) {
    const ratio = this.#getSizeRatio(element);
    const base = this.#getBaseDimension(element);

    if (!Number.isNaN(ratio) && ratio > 0) {
      const fontSize = base / ratio;

      // eslint-disable-next-line no-param-reassign
      element.style.fontSize = `${fontSize}${this.unit}`;
    }
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
