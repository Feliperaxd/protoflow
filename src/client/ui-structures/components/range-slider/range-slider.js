import {
  DomRegistry,
  preventDefaults,
  getEventPositions,
  getComputedCssNumber,
} from '../../../core/index.js';

/**
 * RangeSlider class to create a customizable slider input component.
 */
export default class RangeSlider {
  /** @type {() => void} */
  #onResize;

  /**
   * Creates a RangeSlider instance.
   *
   * @param {string} mainElementID - The ID of the slider element.
   * @param {function|null} [onChangeCallback=null] - Optional callback function to be
   *   called when the slider value changes.
   * @throws {Error} Throws if the slider element is not found or if onChangeCallback
   *   is not a function or null.
   */
  constructor(mainElementID, onChangeCallback = null) {
    this.mainElement = document.getElementById(mainElementID);
    this.onChangeCallback = onChangeCallback;

    if (!this.mainElement) {
      throw new Error(`Slider element with id "${mainElementID}" not found`);
    }

    if (typeof this.onChangeCallback !== 'function'
        && this.onChangeCallback !== null) {
      throw new Error('Expected "onChangeCallback" to be a function');
    }

    this.dom = new DomRegistry(
      [
        {
          selector: '.range-slider__title',
          name: 'title',
          check: true,
        },
        {
          selector: '.range-slider__track',
          name: 'track',
          check: true,
        },
        {
          selector: '.range-slider__thumb',
          name: 'thumb',
          check: true,
        },
        {
          selector: '.range-slider__filled',
          name: 'filled',
          check: true,
        },
        {
          selector: '.range-slider__value',
          name: 'value',
          check: true,
        },
      ],
      this.mainElement,
    );

    this.style = getComputedStyle(this.mainElement);
    this.dom.checkAll();
    this.#initElements();
    this.#initProperties();

    this.#onResize = this.#handleResize.bind(this);
    this.#bindEvents();

    this.changeValue(this.defaultValue);
  }

  // === Public Methods ===

  /**
   * Change the slider's value and update the UI.
   * @param {number} value - The new value to set.
   */
  changeValue(value) {
    this.value = this.#clamp(value).toFixed(
      this.numberOfDecimalPlaces,
    );
    this.#updateUi();

    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
  }

  /**
   * Get the current slider value formatted with decimals.
   * @returns {string} The formatted value.
   */
  getValue() {
    return this.#clamp(this.value).toFixed(
      this.numberOfDecimalPlaces,
    );
  }

  /**
   * Clean up event listeners.
   */
  destroy() {
    window.removeEventListener('resize', this.#onResize);
  }

  // === Private Methods ===

  /**
   * Initializes references to DOM elements.
   * @private
   */
  #initElements() {
    this.title = this.dom.getElement('title');
    this.track = this.dom.getElement('track');
    this.thumb = this.dom.getElement('thumb');
    this.filled = this.dom.getElement('filled');
    this.valueLabel = this.dom.getElement('value');
  }

  /**
   * Initializes slider properties from CSS variables.
   * @private
   */
  #initProperties() {
    this.symbol = this.style.getPropertyValue('--symbol').trim() || '';
    this.minValue = getComputedCssNumber(this.mainElement, '--min-value');
    this.maxValue = getComputedCssNumber(this.mainElement, '--max-value');
    this.stepValue = getComputedCssNumber(this.mainElement, '--step-value');
    this.defaultValue = getComputedCssNumber(this.mainElement, '--default-value');
    this.numberOfDecimalPlaces = Number(
      this.style.getPropertyValue('--number-of-decimal-places'),
    ) || 2;

    this.value = 0;
    this.isDragging = false;
    this.effectiveTrackWidth = this.track.offsetWidth - this.thumb.offsetWidth;
  }

  /**
   * Binds event listeners for user interaction.
   * @private
   */
  #bindEvents() {
    this.thumb.addEventListener('mousedown', e => this.#handleDragStart(e));
    this.thumb.addEventListener('touchstart', e => this.#handleDragStart(e));
    this.track.addEventListener('click', e => this.#handleTrackClick(e));

    window.addEventListener('resize', this.#onResize);
  }

  /**
   * Handles window resize event to update slider dimensions.
   * @private
   */
  #handleResize() {
    this.effectiveTrackWidth = this.track.offsetWidth - this.thumb.offsetWidth;
    this.#updateUi();
  }

  /**
   * Handles the start of dragging the thumb.
   * @param {MouseEvent|TouchEvent} event - The drag start event.
   * @private
   */
  #handleDragStart(event) {
    preventDefaults(event);
    this.isDragging = true;
    this.#applyThumbActiveStyle();

    const handleDragMove = e => this.#handleDragMove(e);
    const handleDragEnd = () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);

      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
      this.#handleDragEnd();
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    window.addEventListener('touchmove', handleDragMove);
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);
  }

  /**
   * Handles clicks on the track to update the slider value.
   * @param {MouseEvent} event - The click event.
   * @private
   */
  #handleTrackClick(event) {
    const [{ x }] = getEventPositions(event);
    this.#updateValueFromPosition(x);
  }

  /**
   * Handles movement while dragging the thumb.
   * @param {MouseEvent|TouchEvent} event - The drag move event.
   * @private
   */
  #handleDragMove(event) {
    if (!this.isDragging) return;
    const [{ x }] = getEventPositions(event);
    this.#updateValueFromPosition(x);
  }

  /**
   * Handles the end of dragging the thumb.
   * @private
   */
  #handleDragEnd() {
    this.isDragging = false;
    this.#removeThumbActiveStyle();
  }

  /**
   * Applies active styles to the thumb and cursor.
   * @private
   */
  #applyThumbActiveStyle() {
    this.thumb.classList.toggle('active');
    document.body.style.cursor = 'grabbing';
    this.track.style.cursor = 'grabbing';
  }

  /**
   * Removes active styles from the thumb and cursor.
   * @private
   */
  #removeThumbActiveStyle() {
    this.thumb.classList.toggle('active');
    document.body.style.cursor = 'default';
    this.track.style.cursor = 'pointer';
  }

  /**
   * Updates the slider value based on cursor's X position.
   * @param {number} cursorPositionX - The X position of the cursor.
   * @private
   */
  #updateValueFromPosition(cursorPositionX) {
    const rect = this.track.getBoundingClientRect();
    const offsetX = Math.max(
      0,
      Math.min(
        cursorPositionX - rect.left,
        this.effectiveTrackWidth,
      ),
    );
    const ratio = offsetX / this.effectiveTrackWidth;
    const rawValue = this.minValue + ratio * (this.maxValue - this.minValue);

    this.changeValue(rawValue);
  }

  /**
   * Updates the UI to reflect the current slider value.
   * @private
   */
  #updateUi() {
    const ratio = this.#getFilledRatio(this.value);
    const pixelLeft = ratio * this.effectiveTrackWidth;

    this.filled.style.width = `${ratio * 100}%`;
    this.valueLabel.textContent = `${this.value}${this.symbol}`;
    this.thumb.style.left = `${pixelLeft}px`;
  }

  /**
   * Calculates the filled ratio of the track based on the slider value.
   * @param {number} value - The current slider value.
   * @returns {number} A number between 0 and 1 representing the fill ratio.
   * @private
   */
  #getFilledRatio(value) {
    return (value - this.minValue) / (this.maxValue - this.minValue);
  }

  /**
   * Clamps the value between min and max and aligns it to the step value.
   * @param {number} value - The value to clamp.
   * @returns {number} The clamped and stepped value.
   * @private
   */
  #clamp(value) {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return this.minValue;
    }

    const clamped = Math.min(Math.max(numericValue, this.minValue), this.maxValue);
    const steps = Math.round((clamped - this.minValue) / this.stepValue);
    return this.minValue + steps * this.stepValue;
  }
}
