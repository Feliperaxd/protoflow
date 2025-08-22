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
    this.maxVisibleItems = getCssPropertyNumber(
      this.mainElement,
      '--menu-max-visible-items',
    );
    this.itemHeight = getCssPropertyNumber(
      this.mainElement,
      '--menu-item-height',
    );
    this.itemAppendDelay = getCssPropertyNumber(
      this.mainElement,
      '--menu-item-append-delay',
    );
    this.itemValueAppendDelay = getCssPropertyNumber(
      this.mainElement,
      '--menu-item-value-append-delay',
    );
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
    this.firstItems = this.#getFirstVisibleItems();
    this.firstItemsValues = this.firstItems.map(item => item.firstElementChild);
    this.overflowItems = this.#getOverflowItems();
    this.overflowItemsValues = this.overflowItems.map(item => item.firstElementChild);
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
    return this.firstItems.length * this.itemHeight;
  }

  #getFirstVisibleItems() {
    return Array.from(this.menuItems).slice(0, this.maxVisibleItems);
  }

  #getOverflowItems() {
    return Array.from(this.menuItems).slice(this.maxVisibleItems);
  }

  #openMenu() {
    if (this.runningAnimation || this.menuIsOpen) return;

    this.runningAnimation = true;
    this.#setArrowProperties();

    switchStyleClasses([
      {
        element: this.label,
        remove: this.bem.selector.label.default.path_,
        add: this.bem.selector.label.open.path_,
        reflow: true,
      },
      {
        element: this.arrow,
        remove: this.bem.selector.arrow.default.path_,
        add: this.bem.selector.arrow.open.path_,
      },
      {
        element: this.value,
        remove: this.bem.selector.value.default.path_,
        add: this.bem.selector.value.open.path_,
      },
      {
        element: this.accentBar,
        remove: this.bem.selector.accentBar.default.path_,
        add: this.bem.selector.accentBar.open.path_,
      },
    ]);

    this.#showFirstItems(
      _ => {
        this.#showOverflowItems(
          __ => {
            this.menuIsOpen = true;
          },
        );
      },
    );
  }

  #closeMenu() {
    if (this.runningAnimation || !this.menuIsOpen) return;

    this.menu.scrollTop = 0;
    this.runningAnimation = true;
    this.#setArrowProperties();

    switchStyleClasses([
      {
        element: this.label,
        remove: this.bem.selector.label.open.path_,
        add: this.bem.selector.label.default.path_,
        reflow: true,
      },
      {
        element: this.arrow,
        remove: this.bem.selector.arrow.open.path_,
        add: this.bem.selector.arrow.default.path_,
      },
      {
        element: this.value,
        remove: this.bem.selector.value.open.path_,
        add: this.bem.selector.value.default.path_,
      },
      {
        element: this.accentBar,
        remove: this.bem.selector.accentBar.open.path_,
        add: this.bem.selector.accentBar.default.path_,
      },
    ]);

    this.#hideOverflowItems(
      _ => {
        this.#hideFirstItems(
          __ => {
            this.menuIsOpen = false;
          },
        );
      },
    );
  }

  #showFirstItems(callback = null) {
    const itemReplacements = this.firstItems.map(element => ({
      element,
      remove: this.bem.selector.item.default.path_,
      add: this.bem.selector.item.open.path_,
    }));
    switchStyleClasses(itemReplacements, this.itemAppendDelay);

    const itemValueReplacements = this.firstItemsValues.map((element, index) => ({
      element,
      remove: this.bem.selector.itemValue.default.path_,
      add: this.bem.selector.itemValue.open.path_,
      callback: (
        index === this.firstItemsValues.length - 1
        && typeof callback === 'function'
      )
        ? () => { callback(); }
        : undefined,
    }));
    switchStyleClasses(itemValueReplacements, this.itemValueAppendDelay);
  }

  #showOverflowItems(callback = null) {
    const itemReplacements = this.overflowItems.map(element => ({
      element,
      remove: this.bem.selector.item.default.path_,
      add: this.bem.selector.item.open.path_,
    }));
    switchStyleClasses(itemReplacements);

    const itemValueReplacements = this.overflowItemsValues.map((element, index) => ({
      element,
      remove: this.bem.selector.itemValue.default.path_,
      add: this.bem.selector.itemValue.open.path_,
      callback: (
        index === this.overflowItems.length - 1
        && typeof callback === 'function'
      )
        ? () => { callback(); }
        : undefined,
    }));
    switchStyleClasses(itemValueReplacements);
  }

  #hideFirstItems(callback = null) {
    const itemReplacements = this.firstItems.reverse()
      .map(element => ({
        element,
        remove: this.bem.selector.item.open.path_,
        add: this.bem.selector.item.default.path_,
      }));
    switchStyleClasses(itemReplacements, this.itemAppendDelay);

    const itemValueReplacements = this.firstItemsValues.reverse()
      .map((element, index) => ({
        element,
        remove: this.bem.selector.itemValue.open.path_,
        add: this.bem.selector.itemValue.default.path_,
        callback: (
          index === this.firstItemsValues.length - 1
          && typeof callback === 'function'
        )
          ? () => { callback(); }
          : undefined,
      }));
    switchStyleClasses(itemValueReplacements, this.itemValueAppendDelay);
  }

  #hideOverflowItems(callback = null) {
    const itemReplacements = this.overflowItems.reverse()
      .map(element => ({
        element,
        remove: this.bem.selector.item.open.path_,
        add: this.bem.selector.item.default.path_,
      }));
    switchStyleClasses(itemReplacements);

    const itemValueReplacements = this.overflowItemsValues.reverse()
      .map((element, index) => ({
        element,
        remove: this.bem.selector.itemValue.open.path_,
        add: this.bem.selector.itemValue.default.path_,
        callback: (
          index === this.overflowItems.length - 1
          && typeof callback === 'function'
        )
          ? () => { callback(); }
          : undefined,
      }));
    switchStyleClasses(itemValueReplacements);
  }
}

const dropdown = new DropdownSelector('selector-example');
dropdown.init();
