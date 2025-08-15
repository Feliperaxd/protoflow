import BEMElement from './bem-element.js';
import BEMModifier from './bem-modifier.js';

/**
 * Represents a BEM (Block Element Modifier) block.
 * Manages its elements and modifiers, and provides Proxy access to them by alias.
 */
export default class BEMBlock {
  /**
   * @param {string} name - Block name.
   * @param {string} alias - Alias used to access the block.
   */
  constructor(name, alias) {
    this.name_ = name;
    this.alias_ = alias;
    this.path_ = name;
    this.selector_ = `.${this.path_}`;
    this.elements_ = new Map();
    this.modifiers_ = new Map();

    // Proxy to allow direct access to elements and modifiers via alias
    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (target.elements_.has(prop)) return target.elements_.get(prop);
        if (target.modifiers_.has(prop)) return target.modifiers_.get(prop);
        return undefined;
      },
    });
  }

  /**
   * Adds an element to the block.
   * @param {string} name - Element name.
   * @param {string} alias - Alias used to access the element.
   * @returns {BEMElement} The created element instance.
   */
  addElement(name, alias) {
    const element = new BEMElement(name, alias, this.path_);
    this.elements_.set(alias, element);
    return element;
  }

  /**
   * Adds a modifier to the block.
   * @param {string} name - Modifier name.
   * @param {string} alias - Alias used to access the modifier.
   * @returns {BEMBlock} The current block instance (for chaining).
   */
  addModifier(name, alias) {
    const modifier = new BEMModifier(name, alias, this.path);
    this.modifiers_.set(alias, modifier);
    return this;
  }
}
