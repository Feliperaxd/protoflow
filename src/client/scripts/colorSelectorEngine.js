import RequiredElements from './requiredElements.js';
import {
  reflowElement,
  setExclusiveStyleClass,
  loadTemplateAsElement,
} from './utils.js';

/**
 * ColorSelector class to create a carousel of selectable colors.
 */
export default class ColorSelector {
  /**
   * Creates an instance of ColorSelector.
   *
   * @param {string} mainElementID - The ID of the main container element.
   * @param {function|null} [onChangeCallback=null] - Optional callback
   *  called when the selected color changes.
   *
   * @throws {Error} Throws if the main element is not found or if the
   *  callback is not a function or null.
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

    this.allColors = [];
    this.isSliding = false;
    this.selectedColorIndex = null;

    this.requiredElements = new RequiredElements(
      [
        { selector: '.color-selector__carousel', name: 'carousel' },
        { selector: '.color-selector__train', name: 'train' },
        { selector: '.color-selector__left-arrow', name: 'left arrow' },
        { selector: '.color-selector__right-arrow', name: 'right arrow' },
      ],
      this.mainElement,
    );
  }

  // === Public Methods ===

  /**
   * Adds a new color to the selector and selects the default color if it matches.
   *
   * @param {string} id - The unique identifier for the color.
   * @param {string} name - The name of the color.
   * @param {string} hexCode - The hex code of the color.
   */
  addColor(id, name, hexCode) {
    const colorCircleTemplateClone = this.colorCircleTemplate.cloneNode(true);
    const colorCircleElement = colorCircleTemplateClone.firstElementChild;
    colorCircleElement.style.setProperty('--color', hexCode);

    this.train.appendChild(colorCircleTemplateClone);
    this.allColors.push({
      id,
      name,
      hexCode,
      element: colorCircleElement,
    });

    this.#selectColorByIndex(
      this.#getDefaultColorIndex(),
    );
    this.#setColorsClasses();
  }

  /**
   * Gets the currently selected color
   * @returns {Object} The selected color object
   */
  getColor() {
    return this.allColors[this.selectedColorIndex];
  }

  /**
   * Initializes the color selector component.
   * Must be awaited to ensure that color templates are loaded properly.
   *
   * @async
   */
  async init() {
    this.colorCircleTemplate = await loadTemplateAsElement(
      '../templates/color-circle.html',
      'div',
    );
    this.#initElements();
    this.#bindEvents();
    this.requiredElements.checkAll();
  }

  /**
   * Slides the carousel to the left and selects the corresponding color.
   */
  slideLeft() {
    if (this.isSliding) return;

    if (this.#selectRightColor()) {
      this.#setColorsClasses();
      this.#updateTrainPosition();
      this.isSliding = true;

      if (this.onChangeCallback) {
        this.onChangeCallback();
      }
    } else {
      this.#runBounceBackAnimation(1);
    }
  }

  /**
   * Slides the carousel to the right and selects the corresponding color.
   */
  slideRight() {
    if (this.isSliding) return;

    if (this.#selectLeftColor()) {
      this.#setColorsClasses();
      this.#updateTrainPosition();
      this.isSliding = true;

      if (this.onChangeCallback) {
        this.onChangeCallback();
      }
    } else {
      this.#runBounceBackAnimation(-1);
    }
  }

  // === Private Methods ===

  /**
   * Binds event listeners to carousel controls.
   *
   * - Left arrow: slides carousel to the left.
   * - Right arrow: slides carousel to the right.
   * - Transition end: resets sliding state after animation completes.
   *
   * This method is called during initialization to enable user interaction.
   *
   * @private
   */
  #bindEvents() {
    this.leftArrow.addEventListener('click', () => this.slideRight());
    this.rightArrow.addEventListener('click', () => this.slideLeft());
    this.train.addEventListener('transitionend', () => {
      this.isSliding = false;
    });
    this.train.addEventListener('animationend', () => {
      this.isSliding = false;
    });
  }

  /**
   * Validates thats the given color index is within bounds and exists.
   *
   * @private
   * @param {number} index - The index of the color to check.
   *
   * @throws {Error} If the index is out of bounds or the color does not exist.
   */
  #checkColorIndex(index) {
    if (index < 0 || index >= this.allColors.length || !this.allColors[index]) {
      throw new Error(`Color don't found! color index: ${index}`);
    }
  }

  /**
   * Returns the default index to be used when selecting a color.
   * If there are fewer than 3 colors, it defaults to the first color (index 0).
   * Otherwise, it returns index 1.
   *
   * @private
   * @returns {number} The index of the default color.
   */
  #getDefaultColorIndex() {
    if (this.allColors.length < 3) {
      return 0;
    }
    return 1;
  }

  /**
   * Returns a list of indexes representing the colors that should be hidden.
   * It excludes the selected color and its immediate neighbors (previous and next).
   *
   * @private
   * @returns {number[]} Array of color indexes to hide.
   */
  #getHideColorsIndexes() {
    return this.allColors
      .map((_, i) => i)
      .filter(i => i !== this.selectedColorIndex
        && i !== this.selectedColorIndex - 1
        && i !== this.selectedColorIndex + 1);
  }

  /**
   * Calculates the horizontal step offset used for sliding the carousel.
   * The step is based on one-third of the carousel's usable width,
   * excluding horizontal padding.
   *
   * @private
   * @returns {number} The calculated offset in pixels.
   */
  #getStepOffset() {
    if (!this.carousel) return 0;

    const style = window.getComputedStyle(this.carousel);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const usableWidth = this.carousel.clientWidth - paddingLeft - paddingRight;

    return usableWidth / 3;
  }

  /**
   * Calculates the position of the train element based on the selected color index.
   * The position is determined by multiplying the negative of (selected color index - 1)
   * with the step offset obtained from #getStepOffset().
   *
   * @private
   * @returns {number} The calculated position for the train element (in pixels or relevant units)
   *  as a negative value to position it correctly relative to the track.
   */
  #getRelativeTrainPosition() {
    const offset = this.#getStepOffset();
    return -(this.selectedColorIndex - 1) * offset;
  }

  /**
   * Returns the indexes of the currently visible colors in the carousel,
   * including the selected color and its immediate neighbors (left and right).
   *
   * @private
   * @returns {Object} An object containing:
   *   - {number|null} leftColorIndex - Index of the color to the left (or null if none).
   *   - {number} selectedColorIndex - Index of the currently selected color.
   *   - {number|null} rightColorIndex - Index of the color to the right (or null if none).
   */
  #getVisibleColorsIndexes() {
    let leftColorIndex = null;
    let rightColorIndex = null;

    if (this.selectedColorIndex > 0) {
      leftColorIndex = this.selectedColorIndex - 1;
    }
    if (this.selectedColorIndex < this.allColors.length - 1) {
      rightColorIndex = this.selectedColorIndex + 1;
    }
    return {
      leftColorIndex,
      selectedColorIndex: this.selectedColorIndex,
      rightColorIndex,
    };
  }

  /**
   * Initializes references to required DOM elements within the main container.
   * Clears the inner HTML of the carousel train element to prepare for new content.
   *
   * @private
   */
  #initElements() {
    this.carousel = this.mainElement.querySelector('.color-selector__carousel');
    this.train = this.mainElement.querySelector('.color-selector__train');
    this.leftArrow = this.mainElement.querySelector('.color-selector__left-arrow');
    this.rightArrow = this.mainElement.querySelector('.color-selector__right-arrow');
    this.train.innerHTML = '';
  }

  /**
   * Selects the color at the given index after validating it.
   *
   * @private
   * @param {number} index - The index of the color to select.
   *
   * @throws {Error} If the index is invalid.
   */
  #selectColorByIndex(index) {
    this.#checkColorIndex(index);
    this.selectedColorIndex = index;
  }

  /**
   * Selects the color to the left of the currently selected color, if any,
   * updating the selected color index.
   *
   * @private
   * @returns {boolean} True if the color was successfully selected, false otherwise.
   */
  #selectLeftColor() {
    const newIndex = this.#getVisibleColorsIndexes().leftColorIndex;
    if (newIndex === null) {
      return false;
    }
    this.#selectColorByIndex(newIndex);
    this.selectedColorIndex = newIndex;
    return true;
  }

  /**
   * Selects the color to the rigth of the currently selected color, if any,
   * updating the selected color index.
   *
   * @private
   * @returns {boolean} True if the color was successfully selected, false otherwise.
   */
  #selectRightColor() {
    const newIndex = this.#getVisibleColorsIndexes().rightColorIndex;
    if (newIndex === null) {
      return false;
    }
    this.#selectColorByIndex(newIndex);
    this.selectedColorIndex = newIndex;
    return true;
  }

  /**
   * Applies a specific CSS class exclusively to color elements at the given indexes.
   * It ensures only the targeted elements have the specified style class.
   *
   * @private
   * @param {number[]} indexes - Array of color indexes to apply the style to.
   * @param {string} styleClass - The CSS class to apply exclusively.
   */
  #setColorClassForIndexes(indexes, styleClass) {
    indexes.forEach(index => {
      if (index >= 0 && index < this.allColors.length) {
        const colorElement = this.allColors[index]?.element;

        if (colorElement) {
          setExclusiveStyleClass(colorElement, styleClass);
        }
      }
    });
  }

  /**
   * Updates the CSS classes for all color circles based on the current selected color.
   * It assigns the "selected" class to the active color, "default" to its neighbors,
   * and "hidden" to all others.
   *
   * @private
   */
  #setColorsClasses() {
    const {
      leftColorIndex,
      rightColorIndex,
    } = this.#getVisibleColorsIndexes();

    this.#setColorClassForIndexes(
      [this.selectedColorIndex],
      'color-circle--selected',
    );

    this.#setColorClassForIndexes(
      [leftColorIndex, rightColorIndex],
      'color-circle--default',
    );

    this.#setColorClassForIndexes(
      this.#getHideColorsIndexes(),
      'color-circle--hidden',
    );
  }

  /**
   * Updates the position of the carousel train to slide the selected color into view.
   *
   * @private
   */
  #updateTrainPosition() {
    const trainPositionX = this.#getRelativeTrainPosition();
    this.train.style.transform = `translateX(${trainPositionX}px)`;
  }

  #runBounceBackAnimation(direction) {
    if (direction !== -1 && direction !== 1) {
      throw new Error(`Invalid direction: only -1 or 1 are allowed. Received: ${direction}`);
    }

    if (this.isSliding) return;
    this.isSliding = true;

    this.train.style.setProperty(
      '--stepOffset',
      `${this.#getStepOffset()}px`,
    );
    this.train.style.setProperty(
      '--trainPosition',
      `${this.#getRelativeTrainPosition()}px`,
    );
    this.train.style.setProperty(
      '--bounceBackDirection',
      `${direction}`,
    );

    this.train.classList.remove('color-selector__train--bounce-back-animation');
    this.allColors[this.selectedColorIndex].element.classList.remove('color-selector__color-circle--bounce-back-animation');
    adicionar aqui
    reflowElement(this.train);
    this.train.classList.add('color-selector__train--bounce-back-animation');
    this.allColors[this.selectedColorIndex].element.classList.add('color-selector__color-circle--bounce-back-animation');
  }
}

const clr = new ColorSelector('model-color-selector');
await clr.init();
clr.addColor('0', 'rosa', '#FF69B4');
clr.addColor('1', 'vermelho', '#FF0000');
clr.addColor('2', 'verde-limão', '#32CD32');
