import {
  scrollTo,
  fetchJson,
  BEMManager,
  ResponsiveText,
  switchStyleClass,
  switchStyleClasses,
  getCssPropertyNumber,
  loadTemplateAsElement,
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
    this.allValues = [];
    this.selectedValue = null;

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
    const menuItemTemplateUrl = new URL('./templates/menuItem.html', import.meta.url).href;
    const bemDataUrl = new URL('./bem-data.json', import.meta.url).href;

    this.bem = new BEMManager();
    this.bem.load(await fetchJson(bemDataUrl));
    this.menuItemTemplate = await loadTemplateAsElement(menuItemTemplateUrl, 'li');

    this.responsiveText.init();
    this.#initElements();
    this.#refreshMenuItems();
    this.#bindEvents();
    this.relativeArrowPosition = this.#getRelativeArrowPosition();

    this.#updateUi();
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
    this.menuItems = null;
    this.menuItemsValue = null;

    this.firstItems = null;
    this.firstItemsValues = null;
    this.overflowItems = null;
    this.overflowItemsValues = null;

    this.firstItemsReversed = null;
    this.firstItemsValuesReversed = null;
    this.overflowItemsReversed = null;
    this.overflowItemsValuesReversed = null;

    this.menu.innerHTML = '';
  }

  addValue(id, name, value) {
    const menuItem = this.menuItemTemplate.cloneNode(true);
    const menuItemValue = menuItem.firstElementChild;

    menuItemValue.textContent = name;
    this.menu.appendChild(menuItem);
    this.allValues.push({
      id,
      name,
      value,
      element: menuItem,
    });
    this.#updateUi();
  }

  #refreshMenuItems() {
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
    this.allItems = this.firstItems.concat(this.overflowItems);

    this.firstItemsReversed = [...this.firstItems].reverse();
    this.firstItemsValuesReversed = [...this.firstItemsValues].reverse();
    this.overflowItemsReversed = [...this.overflowItems].reverse();
    this.overflowItemsValuesReversed = [...this.overflowItemsValues].reverse();
  }

  #bindEvents() {
    this.arrow.addEventListener('click', () => this.#openMenu());
    this.value.addEventListener('click', () => { console.log('clickvalue'); });
    window.addEventListener('click', e => { //Talvez usar onclick
      if (!this.mainElement.contains(e.target)) {
        this.#closeMenu();
      }
    });
    this.mainElement.addEventListener('animationend', () => {
      this.runningAnimation = false;
    });

    this.allItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        console.log('adlkslkdsajsad');
        this.#selectValue(index);
        this.#closeMenu(() => this.#showSelectedValue());
      });
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

  #selectValue(valueIndex) {
    this.selectedValue = this.allValues[valueIndex];
  }

  #showSelectedValue() {
    this.value.textContent = this.selectedValue?.name ?? 'N/A :(';
    switchStyleClass(
      this.value,
      this.bem.selector.value.open.path_,
      this.bem.selector.value.default.path_,
    );
  }

  #hideSelectedValue() {
    switchStyleClass(
      this.value,
      this.bem.selector.value.default.path_,
      this.bem.selector.value.open.path_,
    );
  }

  #getValue() {
    return this.selectedValue;
  }

  #updateUi() {
    if (this.allValues.length <= 1) {
      this.#selectValue(0);
      this.#showSelectedValue();
    }
    this.#refreshMenuItems();
    this.allItems.forEach((item, index) => {
      item.onclick = () => {
        this.#selectValue(index);
        this.#closeMenu(() => this.#showSelectedValue());
      };
    });
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

  #openMenu(callback) {
    if (this.runningAnimation || this.menuIsOpen) return;

    this.runningAnimation = true;
    this.#setArrowProperties();
    this.#hideSelectedValue();

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
        element: this.accentBar,
        remove: this.bem.selector.accentBar.default.path_,
        add: this.bem.selector.accentBar.open.path_,
      },
    ]);

    this.#showFirstItems(() => {
      if (this.overflowItems.length > 0) {
        this.#showOverflowItems(() => {
          this.menuIsOpen = true;
          if (callback) callback();
        });
      } else {
        this.menuIsOpen = true;
        if (callback) callback();
      }
    });
  }

  #closeMenu(callback) {
    if (this.runningAnimation || !this.menuIsOpen) return;

    this.runningAnimation = true;
    this.#setArrowProperties();

    const close = () => {
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
          element: this.accentBar,
          remove: this.bem.selector.accentBar.open.path_,
          add: this.bem.selector.accentBar.default.path_,
        },
      ]);

      if (this.overflowItems.length > 0) { // create isEmpty
        this.#hideOverflowItems(() => {
          this.#hideFirstItems(() => {
            this.menuIsOpen = false;
            this.#showSelectedValue();
            if (callback) callback();
          });
        });
      } else {
        this.#hideFirstItems(() => {
          this.menuIsOpen = false;
          this.#showSelectedValue();
          if (callback) callback();
        });
      }
    };

    scrollTo(this.menu, { y: 0 }, close);
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
    const itemReplacements = this.firstItemsReversed
      .map(element => ({
        element,
        remove: this.bem.selector.item.open.path_,
        add: this.bem.selector.item.default.path_,
      }));
    switchStyleClasses(itemReplacements, this.itemAppendDelay);

    const itemValueReplacements = this.firstItemsValuesReversed
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
    const itemReplacements = this.overflowItemsReversed
      .map(element => ({
        element,
        remove: this.bem.selector.item.open.path_,
        add: this.bem.selector.item.default.path_,
      }));
    switchStyleClasses(itemReplacements);

    const itemValueReplacements = this.overflowItemsValuesReversed
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
await dropdown.init();
dropdown.addValue(1, 'PETG', 'Teste');
dropdown.addValue(1, 'PLA', 'Teste');
dropdown.addValue(1, 'ABS', 'Teste');
dropdown.addValue(1, 'ABS', 'Teste');
dropdown.addValue(1, 'ABS', 'Teste');
dropdown.addValue(1, 'ABS', 'Teste');
dropdown.addValue(1, 'ABS', 'Teste');


// TODO Melhorias sugeridas:
//
// 1. Criar método genérico de toggle para mostrar/esconder itens.
// 2. Usar event delegation em vez de adicionar onclick em cada item.
// 3. Chamar onChangeCallback dentro do #selectValue.
// 4. Separar responsabilidades de métodos grandes (ex: #updateUi).
// 5. Tornar getValue() público.
// 6. Evitar recalcular DOM toda hora (usar cache de itens).
// 7. Melhorar consistência nos nomes de variáveis e métodos.

#toggleItems(items, itemsValues, open, delay, callback) {
    const replacements = items.map(el => ({
        element: el,
        remove: this.bem.selector.item[open ? 'default' : 'open'].path_,
        add: this.bem.selector.item[open ? 'open' : 'default'].path_,
    }));
    switchStyleClasses(replacements, delay);

    const valueReplacements = itemsValues.map((el, index) => ({
        element: el,
        remove: this.bem.selector.itemValue[open ? 'default' : 'open'].path_,
        add: this.bem.selector.itemValue[open ? 'open' : 'default'].path_,
        callback: (
            index === itemsValues.length - 1 && typeof callback === 'function'
        ) ? callback : undefined,
    }));
    switchStyleClasses(valueReplacements, this.itemValueAppendDelay);
}
