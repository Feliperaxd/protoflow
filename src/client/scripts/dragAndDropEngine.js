import { preventDefaults, setExclusiveStyleClass } from './utils.js';

/**
 * Class representing a drag-and-drop file upload area.
 * Handles file input interactions and visual feedback for different states.
 */
class DropArea {
  /**
   * Create a DropArea instance.
   * @param {string} dropAreaId - The ID of the drop area element.
   * @param {string} fileInputId - The ID of the file input element.
   * @throws {Error} If elements with the specified IDs are not found.
   */
  constructor(dropAreaId, fileInputId) {
    this.dropAreaElement = document.getElementById(dropAreaId);
    this.fileInputElement = document.getElementById(fileInputId);

    if (!this.dropAreaElement || !this.fileInputElement) {
      throw new Error('Drop area or file input element not found');
    }

    this.#bindEvents();
  }

  /**
   * Public method to handle file change events.
   * Applies loading style and then transitions to filled style.
   * @returns {void}
   */
  changeFile() {
    this.#applyLoadingStyle();
    setTimeout(() => {
      this.#applyFilledStyle();
    }, 2000);
  }

  // === Private methods ===

  /**
   * Binds all necessary event listeners to the drop area and file input.
   * @private
   * @returns {void}
   */
  #bindEvents() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropAreaElement.addEventListener(eventName, preventDefaults);
    });

    this.dropAreaElement.addEventListener('dragover', () => this.#applyHoverStyle());
    this.dropAreaElement.addEventListener('dragleave', () => this.#applyDefaultStyle());
    this.dropAreaElement.addEventListener('click', () => {
      this.fileInputElement.click();
    });
    this.dropAreaElement.addEventListener('drop', () => {
      this.changeFile();
    });
    this.fileInputElement.addEventListener('change', () => {
      this.changeFile();
    });
  }

  /**
   * Applies the default style to the drop area.
   * @private
   * @returns {void}
   */
  #applyDefaultStyle() {
    setExclusiveStyleClass(this.dropAreaElement, 'drop-area-default');
  }

  /**
   * Applies the hover style to the drop area when files are dragged over.
   * @private
   * @returns {void}
   */
  #applyHoverStyle() {
    setExclusiveStyleClass(this.dropAreaElement, 'drop-area-hover');
  }

  /**
   * Applies the loading style to the drop area during file processing.
   * @private
   * @returns {void}
   */
  #applyLoadingStyle() {
    setExclusiveStyleClass(this.dropAreaElement, 'drop-area-loading');
  }

  /**
   * Applies the filled style to the drop area after successful file upload.
   * @private
   * @returns {void}
   */
  #applyFilledStyle() {
    setExclusiveStyleClass(this.dropAreaElement, 'drop-area-filled');
  }
}

export default DropArea;
