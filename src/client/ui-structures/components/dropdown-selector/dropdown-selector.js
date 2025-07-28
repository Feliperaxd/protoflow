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
          selector: '.dropdown-selector__arrow--no-scale',
          name: 'arrow--no-scale',
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
        {
          selector: '.dropdown-selector__item--default',
          name: 'menu-item',
          check: true,
        },
        {
          selector: '.dropdown-selector__item--open',
          name: 'menu-item--open',
          check: true,
        },
        {
          selector: '.dropdown-selector__item-value--default',
          name: 'menu-item-value',
          check: true,
        },
        {
          selector: '.dropdown-selector__item-value--open',
          name: 'menu-item-value--open',
          check: true,
        },
      ],
    );
  }

  async init() {
    this.#initElements();
    this.#bindEvents();
    this.responsiveText.init();
    this.relativeArrowPosition = this.#getRelativeArrowPosition();
  }

  #toggleMenu() {
    if (this.menuIsOpen && !this.runningAnimation) {
      this.#closeMenu();
    } else if (!this.runningAnimation) {
      this.#openMenu();
    }
  }

  #closeMenu() {
    if (!this.menuIsOpen && this.runningAnimation) return;

    this.runningAnimation = true;

    setExclusiveStyleClass(
      this.title,
      this.dom.getSelector('title', false),
    );
    switchStyleClass(
      this.arrow,
      this.dom.getSelector('arrow--open', false),
      this.dom.getSelector('arrow', false),
    );
    setExclusiveStyleClass(
      this.accentBar,
      this.dom.getSelector('accent-bar', false),
    );
    setExclusiveStyleClass(
      this.value,
      this.dom.getSelector('value', false),
    );
    switchStyleClass(
      this.menu,
      this.dom.getSelector('menu--open', false),
      this.dom.getSelector('menu', false),
    );
    this.menuIsOpen = false;
  }

  #openMenu() {
    if (this.runningAnimation) return;

    this.runningAnimation = true;

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
    switchStyleClass(
      this.menu,
      this.dom.getSelector('menu', false),
      this.dom.getSelector('menu--open', false),
    );

    let time = 100;
    const addTime = 100;

    this.menuItemsValue.forEach(item => {
      time += addTime;

      setTimeout(() => {
        switchStyleClass(
          item,
          this.dom.getSelector('menu-item-value', false),
          this.dom.getSelector('menu-item-value--open', false),
        );
      }, time);
    });

    this.menuItems.forEach(item => {
      switchStyleClass(
        item,
        this.dom.getSelector('menu-item', false),
        this.dom.getSelector('menu-item--open', false),
      );
    });

    this.responsiveText.updateElements();
    this.menuIsOpen = true;
  }

  #bindEvents() {
    this.arrow.addEventListener('click', () => this.#toggleMenu());
    this.value.addEventListener('click', () => this.#openMenu());
    window.addEventListener('click', e => {
      if (!this.mainElement.contains(e.target)) {
        this.#closeMenu();
      }
    });
    this.mainElement.addEventListener('animationend', () => {
      this.runningAnimation = false;
    });
  }

  #initElements() {
    [this.title] = this.dom.getElements('title');
    [this.accentBar] = this.dom.getElements('accent-bar');
    [this.value] = this.dom.getElements('value');
    [this.arrow] = this.dom.getElements('arrow');
    [this.menu] = this.dom.getElements('menu');
    this.menuItems = this.dom.getElements('menu-item');
    this.menuItemsValue = this.dom.getElements('menu-item-value');
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
}

const dropdown = new DropdownSelector('selector-example');
dropdown.init();
