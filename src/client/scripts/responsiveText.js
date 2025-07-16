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

  #handleResize() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.#resizeAll();
    }, this.debounceDelay);
  }

  #getResponsiveElements() {
    return document.querySelectorAll(`${this.attribute}, [${this.attribute}]`);
  }

  #resizeAll() {
    this.elements.forEach(el => this.#resizeOne(el));
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

  #resizeOne(element) {
    const ratio = this.#getSizeRatio(element);
    const base = this.#getBaseDimension(element);

    if (!Number.isNaN(ratio) && ratio > 0) {
      const fontSize = base / ratio;

      // eslint-disable-next-line no-param-reassign
      element.style.fontSize = `${fontSize}${this.unit}`;
    }
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
