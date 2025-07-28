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

    this.dom = new DomRegistry(
      [
        {
          selector: '.dropdown-selector__value--default',
          name: 'value',
          check: true,
        },
        {
          selector: '.dropdown-selector__value--open',
          name: 'value--open',
          check: true,
        },
        {
          selector: '.dropdown-selector__accent-bar--default',
          name: 'accent-bar',
          check: true,
        },
        {
          selector: '.dropdown-selector__accent-bar--open',
          name: 'accent-bar--open',
          check: true,
        },
        {
          selector: '.dropdown-selector__arrow--default',
          name: 'arrow',
          check: true,
        },
        {
          selector: '.dropdown-selector__arrow--open',
          name: 'arrow--open',
          check: true,
        },
        {
          selector: '.dropdown-selector__title--default',
          name: 'title',
          check: true,
        },
        {
          selector: '.dropdown-selector__title--open',
          name: 'title--open',
          check: true,
        },
        {
          selector: '.dropdown-selector__menu--default',
          name: 'menu',
          check: true,
        },
        {
          selector: '.dropdown-selector__menu--open',
          name: 'menu--open',
          check: true,
        },
      ],
    );
  }

  async init() {
    this.#initElements();
    this.#bindEvents();
  }

  #openMenu() {
    this.#setArrowProperties();
    setExclusiveStyleClass(
      this.title,
      this.dom.getSelector('title--open', false),
    );
    switchStyleClass(
      this.arrow,
      this.dom.getSelector('arrow', false),
      this.dom.getSelector('arrow--open', false),
    );
    setExclusiveStyleClass(
      this.accentBar,
      this.dom.getSelector('accent-bar--open', false),
    );
    setExclusiveStyleClass(
      this.value,
      this.dom.getSelector('value--open', false),
    );
    setExclusiveStyleClass(
      this.menu,
      this.dom.getSelector('menu--open', false),
    );
  }

  #bindEvents() {
    this.arrow.addEventListener('click', () => this.#openMenu());
    this.value.addEventListener('click', () => this.#openMenu());
  }

  #initElements() {
    this.title = this.dom.getElement('title');
    this.accentBar = this.dom.getElement('accent-bar');
    this.value = this.dom.getElement('value');
    this.arrow = this.dom.getElement('arrow');
    this.menu = this.dom.getElement('menu');
  }

  #setArrowProperties() {
    this.arrow.style.setProperty(
      '--arrow-top-default',
      `${this.#getRelativeArrowPosition().top}px`,
    );
    this.arrow.style.setProperty(
      '--arrow-top-open',
      `${this.#getRelativeMenuHeight()}px`,
    );
  }

  #getRelativeArrowPosition() {
    const arrowRect = this.arrow.getBoundingClientRect();
    const parentRect = this.arrow.parentElement.getBoundingClientRect();
    const top = arrowRect.top - parentRect.top;
    const left = arrowRect.left - parentRect.left;

    return { top, left };
  }
  #getRelativeMenuHeight() {
    return 70;
  }
}

const responsiveText = new ResponsiveText(
  'responsive-text',
  '--responsive-text-ratio',
  'px',
  10,
  true,
  'height',
);
responsiveText.init();
const dropdown = new DropdownSelector('selector-example');
dropdown.init();
