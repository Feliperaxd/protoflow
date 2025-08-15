import {
  fetchJson,
  BEMManager,
  reflowElement,
  switchStyleClass,
  loadTemplateAsElement,
  setExclusiveStyleClass,
} from '../../../../core/index.js';

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
      throw new Error(`Color selector element with id "${mainElementID}" not found`);
    }

    if (typeof this.onChangeCallback !== 'function'
        && this.onChangeCallback !== null) {
      throw new Error('Expected "onChangeCallback" to be a function');
    }

    this.allColors = [];
    this.isSliding = false;
    this.selectedColorIndex = null;
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
    this.#updateUi();
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
    const colorCirceUrl = new URL('../templates/color-circle.html', import.meta.url).href;
    const bemDataUrl = new URL('./bem-data.json', import.meta.url).href;

    this.colorCircleTemplate = await loadTemplateAsElement(
      colorCirceUrl,
      'div',
    );

    this.bem = new BEMManager();
    this.bem.load(await fetchJson(bemDataUrl));

    this.#initElements();
    this.#bindEvents();
  }

  /**
   * Handles the sliding logic for both directions.
   *
   * @private
   * @param {'left'|'right'} direction - The direction to slide ('left' or 'right')
   * @throws {Error} If direction is not 'left' or 'right'
   */
  slide(direction) {
    if (this.isSliding) return;

    let success = false;

    switch (direction) {
    case 'left': {
      success = this.#selectRightColor();
      break;
    }
    case 'right': {
      success = this.#selectLeftColor();
      break;
    }
    default: {
      throw new Error(`Invalid direction: "${direction}". Use 'left' or 'right'.`);
    }
    }

    if (success) {
      this.#setColorsClasses();
      this.#updateTrainPosition();
      this.isSliding = true;

      if (typeof this.onChangeCallback === 'function') {
        this.onChangeCallback();
      }
    } else {
      this.#runTrainShakeAnimation();
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
    this.leftArrow.addEventListener('click', () => this.slide('right'));
    this.rightArrow.addEventListener('click', () => this.slide('left'));
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
      throw new Error(`Color not found! color index: ${index}`);
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
    return this.allColors.length > 2 ? 1 : 0;
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
   * Calculates the train position to show the selected color.
   * For 2 colors: aligns left (0) or right (-offset)
   * For 3+ colors: centers the selected color
   *
   * @private
   * @returns {number} Position in pixels (negative value)
   */
  #getRelativeTrainPosition() {
    const offset = this.#getStepOffset();

    if (this.allColors.length === 2) {
      return -this.selectedColorIndex * offset;
    }

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
   * Hides both navigation arrows by switching their CSS classes.
   * Removes the '--default' class and adds the '--hidden' class to both arrows.
   *
   * @private
   */
  #hideArrows() {
    switchStyleClass(
      this.leftArrow,
      this.bem.colorSelector.leftArrow.default.path_,
      this.bem.colorSelector.leftArrow.hidden.path_,
    );
    switchStyleClass(
      this.rightArrow,
      this.bem.colorSelector.rightArrow.default.path_,
      this.bem.colorSelector.rightArrow.hidden.path_,
    );
  }

  /**
   * Initializes references to required DOM elements within the main container.
   * Clears the inner HTML of the carousel train element to prepare for new content.
   *
   * @private
   */
  #initElements() {
    this.carousel = this.mainElement.querySelector(
      this.bem.colorSelector.carousel.selector_,
    );
    this.train = this.mainElement.querySelector(
      this.bem.colorSelector.train.default.selector_,
    );
    this.leftArrow = this.mainElement.querySelector(
      this.bem.colorSelector.leftArrow.default.selector_,
    );
    this.rightArrow = this.mainElement.querySelector(
      this.bem.colorSelector.rightArrow.default.selector_,
    );
    this.train.innerHTML = '';
  }

  /**
   * Triggers a shake animation on the train element when navigation isn't possible.
   *
   * Ensures the train is in the correct position before animating.
   * Prevents multiple animations from overlapping.
   *
   * @private
   */
  #runTrainShakeAnimation() {
    if (this.isSliding) return;
    this.isSliding = true;

    this.#updateTrainPosition();

    this.train.classList.remove(
      this.bem.colorSelector.train.shake.path_,
    );
    reflowElement(this.train);
    this.train.classList.add(
      this.bem.colorSelector.train.shake.path_,
    );
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
      this.bem.colorSelector.colorCircle.selected.path_,
    );

    this.#setColorClassForIndexes(
      [leftColorIndex, rightColorIndex],
      this.bem.colorSelector.colorCircle.default.path_,
    );

    this.#setColorClassForIndexes(
      this.#getHideColorsIndexes(),
      this.bem.colorSelector.colorCircle.hidden.path_,
    );
  }

  /**
   * Makes both navigation arrows visible by switching their CSS classes.
   * Removes the '--hidden' class and adds the '--default' class to both arrows.
   *
   * @private
   */
  #showArrows() {
    switchStyleClass(
      this.leftArrow,
      this.bem.colorSelector.leftArrow.hidden.path_,
      this.bem.colorSelector.leftArrow.default.path_,
    );
    switchStyleClass(
      this.rightArrow,
      this.bem.colorSelector.rightArrow.hidden.path_,
      this.bem.colorSelector.rightArrow.default.path_,
    );
  }

  /**
   * Updates the CSS custom property '--trainPosition' to move the carousel train,
   * effectively sliding the selected color into the viewport.
   *
   * @private
   */
  #updateTrainPosition() {
    this.train.style.setProperty(
      '--trainPosition',
      `${this.#getRelativeTrainPosition()}px`,
    );
  }

  /**
   * Updates the UI state of the color selector:
   * - Selects the default color
   * - Applies the correct CSS classes to all colors
   * - Shows/hides navigation arrows based on color count
   *
   * @private
   */
  #updateUi() {
    this.#selectColorByIndex(
      this.#getDefaultColorIndex(),
    );
    this.#setColorsClasses();

    if (this.allColors.length < 2) {
      this.#hideArrows();
    } else {
      this.#showArrows();
    }
  }
}
