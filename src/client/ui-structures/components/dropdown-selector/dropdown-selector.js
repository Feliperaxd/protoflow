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

    this.dom = this.#getDomRegistry();
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
    this.#initElements();
    this.#bindEvents();
    this.relativeArrowPosition = this.#getRelativeArrowPosition();
  }

  #initElements() {
    [this.label] = this.dom.getElements('label');
    [this.accentBar] = this.dom.getElements('accent-bar');
    [this.value] = this.dom.getElements('value');
    [this.arrow] = this.dom.getElements('arrow');
    [this.menu] = this.dom.getElements('menu');
    /*
    this.menuItems = this.dom.getElements('menu-item');
    this.menuItemsValue = this.dom.getElements('menu-item-value');
    */
  }

  #bindEvents() {
    this.arrow.addEventListener('click', () => this.#openMenu());
    this.value.addEventListener('click', () => { console.log('clickvalue'); });
    window.addEventListener('click', e => {
      if (!this.mainElement.contains(e.target)) {
        this.#closeMenu();
      }
    });
    this.mainElement.addEventListener('animationend', () => {
      this.runningAnimation = false;
    });
  }

  #setArrowProperties() {
    this.arrow.style.setProperty(
      '--arrow-top-default',
      `${this.relativeArrowPosition.top}px`,
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
    return 200;
  }

  #openMenu() {
    if (this.runningAnimation) return;

    this.runningAnimation = true;
    this.#setArrowProperties();

    switchStyleClass(
      this.label,
      this.dom.getSelector('label', false),
      this.dom.getSelector('label-open', false),
    );
    switchStyleClass(
      this.arrow,
      this.dom.getSelector('arrow', false),
      this.dom.getSelector('arrow-open', false),
    );
    switchStyleClass(
      this.accentBar,
      this.dom.getSelector('accent-bar', false),
      this.dom.getSelector('accent-bar-open', false),
    );
    switchStyleClass(
      this.value,
      this.dom.getSelector('value', false),
      this.dom.getSelector('value-open', false),
    );
    switchStyleClass(
      this.menu,
      this.dom.getSelector('menu', false),
      this.dom.getSelector('menu-open', false),
    );

    this.responsiveText.updateElements();
    this.menuIsOpen = true;
  }

  #closeMenu() {
    if (this.runningAnimation) return;

    this.#setArrowProperties();

    switchStyleClass(
      this.label,
      this.dom.getSelector('label-open', false),
      this.dom.getSelector('label', false),
    );
    switchStyleClass(
      this.arrow,
      this.dom.getSelector('arrow-open', false),
      this.dom.getSelector('arrow', false),
    );
    switchStyleClass(
      this.accentBar,
      this.dom.getSelector('accent-bar-open', false),
      this.dom.getSelector('accent-bar', false),
    );
    switchStyleClass(
      this.value,
      this.dom.getSelector('value-open', false),
      this.dom.getSelector('value', false),
    );
    switchStyleClass(
      this.menu,
      this.dom.getSelector('menu-open', false),
      this.dom.getSelector('menu', false),
    );

    this.responsiveText.updateElements();
    this.menuIsOpen = false;
  }

  #getDomRegistry() {
    return new DomRegistry(
      [
        /* -- Value -- */
        {
          selector: '.dropdown-selector__value--open',
          name: 'value-open',
          check: false,
        },
        {
          selector: '.dropdown-selector__value--default',
          name: 'value',
          check: false,
        },

        /* -- Arrow -- */
        {
          selector: '.dropdown-selector__arrow--open',
          name: 'arrow-open',
          check: false,
        },
        {
          selector: '.dropdown-selector__arrow--default',
          name: 'arrow',
          check: false,
        },

        /* -- Label -- */
        {
          selector: '.dropdown-selector__label--open',
          name: 'label-open',
          check: false,
        },
        {
          selector: '.dropdown-selector__label--default',
          name: 'label',
          check: false,
        },

        /* -- Accent bar -- */
        {
          selector: '.dropdown-selector__accent-bar--open',
          name: 'accent-bar-open',
          check: false,
        },
        {
          selector: '.dropdown-selector__accent-bar--default',
          name: 'accent-bar',
          check: false,
        },

        /* -- Menu -- */
        {
          selector: '.dropdown-selector__menu--open',
          name: 'menu-open',
          check: false,
        },
        {
          selector: '.dropdown-selector__menu--default',
          name: 'menu',
          check: false,
        },
      ],
    );
  }
}

const dropdown = new DropdownSelector('selector-example');
dropdown.init();
