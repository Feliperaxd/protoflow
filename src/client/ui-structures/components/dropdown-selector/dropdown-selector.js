import {
  ResponsiveText,
  DomRegistry,
  setExclusiveStyleClass,
  switchStyleClass,
} from '../../../core/index.js';

export default class DropdownSelector {
  constructor(mainElementID, onChangeCallback = null) {
    this.mainElement = document.getElementById(mainElementID);
    this.onChangeCallback = onChangeCallback;

    if (!this.mainElement) {
      throw new Error(`Dropdown selector element with id "${mainElementID}" not found`);
    }

    if (typeof this.onChangeCallback !== 'function'
        && this.onChangeCallback !== null) {
      throw new Error('Expected "onChangeCallback" to be a function');
    }

    this.menuIsOpen = false;
    this.runningAnimation = false;
    this.relativeArrowPosition = null;

    this.responsiveText = new ResponsiveText(
      'responsive-text',
      '--responsive-text-ratio',
      'px',
      10,
      true,
      'height',
    );
  }

  async init() {
    this.responsiveText.init();
    /*
    this.#initElements();
    this.#bindEvents();
    this.relativeArrowPosition = this.#getRelativeArrowPosition();
    */
  }

  #initElements() {
    [this.label] = this.dom.getElements('label');
    [this.accentBar] = this.dom.getElements('accent-bar');
    [this.value] = this.dom.getElements('value');
    [this.arrow] = this.dom.getElements('arrow');
    [this.menu] = this.dom.getElements('menu');
    this.menuItems = this.dom.getElements('menu-item');
    this.menuItemsValue = this.dom.getElements('menu-item-value');
  }

  #getDomRegistry() {
    return new DomRegistry(
      [
        {
          selector: '.dropdown-selector__value--default',
          name: 'value',
          check: false,
        },
      ],
    );
  }
}

const dropdown = new DropdownSelector('selector-example');
dropdown.init();
