import {
  formatValuePrecision,
  getCssPropertyValue,
  preventDefaults,
} from './utils.js';

/**
 * RangeSlider class to create a customizable slider input component.
 */
export default class RangeSlider {
  /** @type {() => void} */
  #onResize;

  /**
   * Creates a RangeSlider instance.
   * @param {string} mainElementID - The ID of the slider element.
   * @throws {Error} Throws if the slider element is not found.
   */
  constructor(mainElementID) {
    this.mainElement = document.getElementById(mainElementID);
    if (!this.mainElement) {
      throw new Error(`Slider element with id "${mainElementID}" not found`);
    }

    // Define os elementos obrigatórios aqui no construtor
    this.requiredElements = [
      { selector: '.title', name: 'title' },
      { selector: '.track', name: 'track' },
      { selector: '.thumb', name: 'thumb' },
      { selector: '.filled', name: 'filled' },
      { selector: '.value-label', name: 'value label' },
    ];

    this.style = getComputedStyle(this.mainElement);
    this.#checkRequiredElements();
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
    this.value = formatValuePrecision(
      this.#clamp(value),
      this.numberOfDecimalPlaces,
    );
    this.#updateUi();
  }

  /**
   * Get the current slider value formatted with decimals.
   * @returns {string} The formatted value.
   */
  getValue() {
    return formatValuePrecision(
      this.#clamp(this.value),
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

  #checkRequiredElements() {
    const missingElements = this.requiredElements
      .map(({ selector, name }) => ({
        name,
        element: this.mainElement.querySelector(selector),
      }))
      .filter(item => !item.element);

    if (missingElements.length > 0) {
      throw new Error(`Required slider elements not found: ${
        missingElements.map(item => item.name).join(', ')
      }`);
    }
  }

  #initElements() {
    this.title = this.mainElement.querySelector('.title');
    this.track = this.mainElement.querySelector('.track');
    this.thumb = this.mainElement.querySelector('.thumb');
    this.filled = this.mainElement.querySelector('.filled');
    this.valueLabel = this.mainElement.querySelector('.value-label');
  }

  #initProperties() {
    this.symbol = this.style.getPropertyValue('--symbol').trim() || '';
    this.minValue = getCssPropertyValue(this.mainElement, '--min-value');
    this.maxValue = getCssPropertyValue(this.mainElement, '--max-value');
    this.stepValue = getCssPropertyValue(this.mainElement, '--step-value');
    this.defaultValue = getCssPropertyValue(this.mainElement, '--default-value');
    this.numberOfDecimalPlaces = Number(
      this.style.getPropertyValue('--number-of-decimal-places'),
    ) || 2;

    this.value = 0;
    this.isDragging = false;
    this.effectiveTrackWidth = this.track.offsetWidth - this.thumb.offsetWidth;
  }

  #bindEvents() {
    this.thumb.addEventListener('mousedown', e => this.#handleThumbMouseDown(e));
    this.track.addEventListener('click', e => this.#handleTrackClick(e));
    window.addEventListener('resize', this.#onResize);
  }

  #handleResize() {
    this.effectiveTrackWidth = this.track.offsetWidth - this.thumb.offsetWidth;
    this.#updateUi();
  }

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

  #handleTrackClick(event) {
    this.#updateValueFromPosition(event.clientX);
  }

  #handleDrag(event) {
    if (!this.isDragging) return;
    this.#updateValueFromPosition(event.clientX);
  }

  #handleStopDrag() {
    this.isDragging = false;
    this.#removeThumbActiveStyle();
  }

  #applyThumbActiveStyle() {
    this.thumb.classList.toggle('active');
    document.body.style.cursor = 'grabbing';
    this.track.style.cursor = 'grabbing';
  }

  #removeThumbActiveStyle() {
    this.thumb.classList.toggle('active');
    document.body.style.cursor = 'default';
    this.track.style.cursor = 'pointer';
  }

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

  #updateUi() {
    const ratio = this.#getFilledRatio(this.value);
    const pixelLeft = ratio * this.effectiveTrackWidth;

    this.filled.style.width = `${ratio * 100}%`;
    this.valueLabel.textContent = `${this.value}${this.symbol}`;
    this.thumb.style.left = `${pixelLeft}px`;
  }

  #getFilledRatio(value) {
    return (value - this.minValue) / (this.maxValue - this.minValue);
  }

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
