import {
  fetchJson,
  BEMManager,
  ResponsiveText,
  switchStyleClasses,
  getCssPropertyNumber,
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
    const bemDataUrl = new URL('./bem-data.json', import.meta.url).href;
    this.bem = new BEMManager();
    this.bem.load(await fetchJson(bemDataUrl));

    this.responsiveText.init();
    this.#initElements();
    this.#bindEvents();
    this.relativeArrowPosition = this.#getRelativeArrowPosition();
  }

  #initElements() {
    this.label = this.mainElement.querySelector(
      this.bem.selector.label.default.selector_,
    );
    this.accentBar = this.mainElement.querySelector(
      this.bem.selector.accentBar.default.selector_,
    );
    this.value = this.mainElement.querySelector(
      this.bem.selector.value.default.selector_,
    );
    this.arrow = this.mainElement.querySelector(
      this.bem.selector.arrow.default.selector_,
    );
    this.menu = this.mainElement.querySelector(
      this.bem.selector.menu.default.selector_,
    );
    this.menuItems = this.mainElement.querySelectorAll(
      this.bem.selector.item.default.selector_,
    );
    this.menuItemsValue = this.mainElement.querySelectorAll(
      this.bem.selector.itemValue.default.selector_,
    );
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
    switchStyleClasses([
      {
        element: this.label,
        remove: this.bem.selector.label.default.selector_,
        add: this.bem.selector.label.open.selector_,
        reflow: true,
      },
      {
        element: this.arrow,
        remove: this.bem.selector.arrow.default.selector_,
        add: this.bem.selector.arrow.open.selector_,
      },
      {
        element: this.value,
        remove: this.bem.selector.value.default.selector_,
        add: this.bem.selector.value.open.selector_,
      },
      {
        element: this.accentBar,
        remove: this.bem.selector.accentBar.default.selector_,
        add: this.bem.selector.accentBar.open.selector_,
      },
    ]);
    this.#showMenuItems();

    this.responsiveText.updateElements();
    this.menuIsOpen = true;
  }

  #closeMenu() {
    if (this.runningAnimation) return;

    this.#setArrowProperties();
    switchStyleClasses([
      {
        element: this.label,
        remove: this.bem.selector.label.default.selector_,
        add: this.bem.selector.label.open.selector_,
        reflow: true,
      },
      {
        element: this.arrow,
        remove: this.bem.selector.arrow.default.selector_,
        add: this.bem.selector.arrow.open.selector_,
      },
      {
        element: this.value,
        remove: this.bem.selector.value.default.selector_,
        add: this.bem.selector.value.open.selector_,
      },
      {
        element: this.accentBar,
        remove: this.bem.selector.accentBar.default.selector_,
        add: this.bem.selector.accentBar.open.selector_,
      },
    ]);
    this.#hideMenuItems();

    this.responsiveText.updateElements();
    this.menuIsOpen = false;
  }

  #hideMenuItems() {
    const items = [...this.menuItems].reverse();
    const itemsValue = [...this.menuItemsValue].reverse();

    const itemReplacements = Array.from(items).map(element => ({
      element,
      remove: this.bem.selector.item.open.selector_,
      add: this.bem.selector.item.default.selector_,
    }));
    switchStyleClasses(itemReplacements, 100);

    const itemValueReplacements = Array.from(itemsValue).map(element => ({
      element,
      remove: this.bem.selector.itemValue.open.selector_,
      add: this.bem.selector.itemValue.default.selector_,
    }));
    switchStyleClasses(itemValueReplacements, 70);
  }

  #showMenuItems() {
    const itemHeight = getCssPropertyNumber(this.mainElement, '--menu-item-height');

    const itemReplacements = Array.from(this.menuItems).map(element => ({
      element,
      remove: this.bem.selector.item.default.selector_,
      add: this.bem.selector.item.open.selector_,
    }));
    switchStyleClasses(itemReplacements, 50);

    const itemValueReplacements = Array.from(this.menuItemsValue).map(element => ({
      element,
      remove: this.bem.selector.itemValue.default.selector_,
      add: this.bem.selector.itemValue.open.selector_,
      callback: _ => {
        this.responsiveText.updateElement(element, itemHeight);
      },
    }));
    switchStyleClasses(itemValueReplacements, 120);
  }
}

const dropdown = new DropdownSelector('selector-example');
dropdown.init();
