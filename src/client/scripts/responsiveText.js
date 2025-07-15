/**
 * ResponsiveText - Class for creating responsive text elements that scale based on parent width
 * @class
 */
export default class ResponsiveText {
  /**
   * Creates a ResponsiveText instance
   * @param {string} attribute - HTML attribute to identify responsive elements (e.g., 'data-responsive-text')
   * @param {string} cssVar - CSS variable containing the scale value (e.g., '--text-scale')
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.unit='px'] - Font size unit (px, rem, em)
   * @param {number} [options.minSize=null] - Minimum font size
   * @param {number} [options.maxSize=null] - Maximum font size
   * @param {number} [options.debounceDelay=100] - Resize event debounce delay in ms
   * @param {Object} [options.breakpoints=null] - Breakpoints for different scales
   * @param {boolean} [options.observeDOM=false] - Whether to observe DOM changes
   */
  constructor(attribute, cssVar, options = {}) {
    this.attribute = attribute;
    this.cssVar = cssVar;

    this.options = {
      unit: 'px',
      minSize: null,
      maxSize: null,
      debounceDelay: 100,
      breakpoints: null,
      observeDOM: false,
      ...options,
    };

    this.elements = [];
    this.debounceTimer = null;
    this.observer = null;

    this.handleResize = this.handleResize.bind(this);
    this.updateElements = this.updateElements.bind(this);
  }

  /**
   * Initializes the ResponsiveText instance
   * @returns {ResponsiveText} The instance for method chaining
   */
  init() {
    this.updateElements();
    window.addEventListener('resize', this.handleResize);

    if (this.options.observeDOM) {
      this.observeDOMChanges();
    }

    return this;
  }

  /**
   * Cleans up event listeners and observers
   * @returns {void}
   */
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.stopObserving();
    this.elements = [];
  }

  /**
   * Updates the list of responsive elements and resizes them
   * @returns {void}
   */
  updateElements() {
    this.elements = this.getResponsiveTextElements();
    this.resizeAllTextElements();
  }

  /**
   * Gets all elements with the responsive attribute
   * @returns {NodeList} List of responsive elements
   */
  getResponsiveTextElements() {
    return document.querySelectorAll(`${this.attribute}, [${this.attribute}="true"]`);
  }

  /**
   * Handles window resize events with debouncing
   * @returns {void}
   */
  handleResize() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.resizeAllTextElements();
    }, this.options.debounceDelay);
  }

  /**
   * Resizes all registered responsive elements
   * @returns {void}
   */
  resizeAllTextElements() {
    this.elements.forEach((element) => {
      this.resizeTextElement(element);
    });
  }

  /**
   * Calculates the current scale considering breakpoints
   * @param {HTMLElement} element - The element to calculate scale for
   * @returns {number} The calculated scale value
   */
  getCurrentScale(element) {
    let scale = parseFloat(getComputedStyle(element).getPropertyValue(this.cssVar));

    if (this.options.breakpoints) {
      const windowWidth = window.innerWidth;
      const sortedBreakpoints = Object.keys(this.options.breakpoints)
        .map(Number)
        .sort((a, b) => b - a);

      for (const breakpoint of sortedBreakpoints) {
        if (windowWidth <= breakpoint) {
          scale = this.options.breakpoints[breakpoint];
          break;
        }
      }
    }

    return scale;
  }

  /**
   * Resizes a single element based on parent width and scale
   * @param {HTMLElement} element - The element to resize
   * @returns {void}
   */
  resizeTextElement(element) {
    const scale = this.getCurrentScale(element);

    if (!Number.isNaN(scale) && scale > 0) {
      const baseWidth = element.parentElement.offsetWidth;
      let fontSize = baseWidth / scale;

      if (this.options.minSize !== null) {
        fontSize = Math.max(fontSize, this.options.minSize);
      }
      if (this.options.maxSize !== null) {
        fontSize = Math.min(fontSize, this.options.maxSize);
      }

      element.style.fontSize = `${fontSize}${this.options.unit}`;
    }
  }

  /**
   * Sets up MutationObserver to watch for DOM changes
   * @returns {void}
   */
  observeDOMChanges() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
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
   * Stops observing DOM changes
   * @returns {void}
   */
  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}