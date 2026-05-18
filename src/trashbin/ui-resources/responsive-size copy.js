/**
 * ResponsiveSize - Dynamically resizes elements based on a reference element's dimension.
 */
export default class ResponsiveSize {
  /** @type {() => void} */
  #onResize;

  /**
   * @param {string} [defaultUnit='px'] - Default unit for resized property (px, rem, etc.)
   * @param {string} [defaultProperty='font-size'] - Default CSS property to resize
   * @param {string} [defaultBaseDimension='width'] - Default base dimension ('width' or 'height')
   * @param {number} [debounceDelay=100] - Debounce delay in ms for resize events
   * @param {boolean} [observeDOM=false] - Whether to observe DOM mutations
   */
  constructor(
    defaultUnit = 'px',
    defaultProperty = 'font-size',
    defaultBaseDimension = 'width',
    debounceDelay = 100,
    observeDOM = false,
  ) {
    this.defaultUnit = defaultUnit;
    this.defaultProperty = defaultProperty;
    this.defaultBaseDimension = defaultBaseDimension;
    this.debounceDelay = debounceDelay;
    this.observeDOM = observeDOM;

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

    if (this.observeDOM) this.#observeDOM();
    return this;
  }

  /**
   * Cleans up listeners and observers.
   */
  destroy() {
    window.removeEventListener('resize', this.#onResize);
    this.#stopObserving();
    this.elements = [];
  }

  /**
   * Updates all elements with responsive-size-ref attributes.
   */
  updateElements() {
    this.elements = [...document.querySelectorAll('[responsive-size-ref]')];
    return this.#resizeAll();
  }

  // === Private Methods ===

  #handleResize() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.#resizeAll(), this.debounceDelay);
  }

  #resizeAll() {
    return this.elements
      .map(el => this.#resizeOne(el))
      .filter(success => success)
      .length;
  }

  #resizeOne(element) {
    const refId = element.getAttribute('responsive-size-ref');
    const baseElement = document.getElementById(refId);
    if (!baseElement) return false;

    const styles = getComputedStyle(element);

    const property =
      styles.getPropertyValue('--responsive-size-property')?.trim() ||
      this.defaultProperty;
    const unit =
      styles.getPropertyValue('--responsive-size-unit')?.trim() ||
      this.defaultUnit;
    const baseDimension =
      styles.getPropertyValue('--responsive-size-base-dimension')?.trim() ||
      this.defaultBaseDimension;
    TEM Q TERMINAR ISSO -----------------
    const baseSize =
      baseDimension === 'height'
        ? baseElement.offsetHeight
        : baseElement.offsetWidth;

    const ratio =
      parseFloat(styles.getPropertyValue('--responsive-size-ratio')) || 10;

    if (!baseSize || ratio <= 0) return false;

    const value = baseSize / ratio;
    element.style[property] = `${value}${unit}`;
    return true;
  }

  #observeDOM() {
    this.observer = new MutationObserver(() => this.updateElements());
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  #stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
