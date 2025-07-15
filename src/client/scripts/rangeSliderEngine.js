import {
  formatValuePrecision,
  getCssPropertyValue,
  preventDefaults,
} from './utils.js';

export default class RangeSlider {
  constructor(sliderId) {
    this.slider = document.getElementById(sliderId);
    if (!this.slider) {
      throw new Error(`Slider element with id "${sliderId}" not found`);
    }

    this.style = getComputedStyle(this.slider);
    this.#initElements();
    this.#initProperties();
    this.#bindEvents();
    this.changeValue(this.defaultValue);
  }

  // === Private methods ===
  #initElements() {
    this.title = this.slider.querySelector('.title');
    this.track = this.slider.querySelector('.track');
    this.filled = this.slider.querySelector('.filled');
    this.thumb = this.slider.querySelector('.thumb');
    this.valueLabel = this.slider.querySelector('.value-label');

    if (!this.track || !this.thumb) {
      throw new Error('Required slider elements not found');
    }
  }

  #initProperties() {
    this.symbol = this.style.getPropertyValue('--symbol').trim() || '';
    this.minValue = getCssPropertyValue(this.slider, '--min-value');
    this.maxValue = getCssPropertyValue(this.slider, '--max-value');
    this.stepValue = getCssPropertyValue(this.slider, '--step-value');
    this.defaultValue = getCssPropertyValue(this.slider, '--default-value');
    this.numberOfDecimalPlaces = Number(
      this.style.getPropertyValue('--number-of-decimal-places'),
    ) || 2;

    this.value = 0;
    this.isDragging = false;
    this.effectiveTrackWidth = this.track.offsetWidth - this.thumb.offsetWidth;
  }

  #bindEvents() {
    this.thumb.addEventListener('mousedown', event => this.#handleThumbMouseDown(event));
    this.track.addEventListener('click', event => this.#handleTrackClick(event));

    window.addEventListener('resize', () => {
      this.effectiveTrackWidth = this.track.offsetWidth - this.thumb.offsetWidth;
      this.#updateUi();
    });
  }

  // === Private Event Callbacks ===

  /**
   * Handles mouse down event on the thumb.
   *
   * @param {MouseEvent} event - The mouse down event.
   * @returns {void}
   */
  #handleThumbMouseDown(event) {
    preventDefaults(event);
    this.isDragging = true;
    this.#applyThumbActiveStyle();

    const handleDrag = e => this.#handleDrag(e);
    const handleStopDrag = () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleStopDrag);
      this.#handleStopDrag();
    };

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleStopDrag);
  }

  /**
   * Handles click event on the track.
   *
   * @param {MouseEvent} event - The click event.
   * @returns {void}
   */
  #handleTrackClick(event) {
    this.#updateValueFromPosition(event.clientX);
  }

  /**
   * Handles mouse move event during dragging.
   *
   * @param {MouseEvent} event - The mouse move event.
   * @returns {void}
   */
  #handleDrag(event) {
    if (!this.isDragging) return;
    this.#updateValueFromPosition(event.clientX);
  }

  /**
   * Handles mouse up event to stop dragging.
   *
   * @returns {void}
   */
  #handleStopDrag() {
    this.isDragging = false;
    this.#removeThumbActiveStyle();
  }

  // === Other private methods ===

  /**
   * Applies the active style to the thumb and sets the cursor to grabbing.
   *
   * Toggles the 'active' class on the thumb element and changes the track
   * and document body cursor to 'grabbing'.
   *
   * @returns {void}
   * @private
   */
  #applyThumbActiveStyle() {
    this.thumb.classList.toggle('active');
    document.body.style.cursor = 'grabbing';
    this.track.style.cursor = 'grabbing';
  }

  /**
   * Removes the active style from the thumb and resets the cursor.
   *
   * Toggles the 'active' class on the thumb element and resets the
   * track and document body cursor to 'default'.
   *
   * @returns {void}
   * @private
   */
  #removeThumbActiveStyle() {
    this.thumb.classList.toggle('active');
    document.body.style.cursor = 'default';
    this.track.style.cursor = 'pointer';
  }

  /**
   * Updates the slider value based on the cursor's X position.
   *
   * @param {number} cursorPositionX - The X position of the cursor relative to the page.
   * @returns {void}
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
   * Updates the UI elements of the slider based on the current value.
   *
   * Sets the filled bar width, value label, and thumb position.
   *
   * @returns {void}
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
   * Calculates the ratio (between 0 and 1) of the filled track based on the value.
   *
   * @param {number} value - The current slider value.
   * @returns {number} The filled ratio from 0 to 1.
   * @private
   */
  #getFilledRatio(value) {
    return (value - this.minValue) / (this.maxValue - this.minValue);
  }

  /**
   * Clamps a given value to the allowed range and rounds it to the nearest step.
   *
   * @param {number|string} value - The value to clamp.
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

  // === Public methods ===

  /**
   * Changes the slider value and updates the UI.
   *
   * @param {number} value - The new value to set.
   * @returns {void}
   */
  changeValue(value) {
    this.value = formatValuePrecision(
      this.#clamp(value),
      this.numberOfDecimalPlaces,
    );
    this.#updateUi();
  }

  /**
   * Gets the current slider value formatted with decimal places.
   *
   * @returns {string} - The formatted slider value.
   */
  getValue() {
    return formatValuePrecision(
      this.#clamp(this.value),
      this.numberOfDecimalPlaces,
    );
  }
}
