import BEMModifier from './bem-modifier.js';

/**
 * Represents a BEM (Block Element Modifier) element.
 * Handles its name, alias, CSS selector, and associated modifiers.
 *
 * Provides Proxy access so that registered modifiers can be accessed directly
 * as properties via their alias.
 */
export default class BEMElement {
  /**
   * @param {string} name - The element's name (BEM `element` part).
   * @param {string} alias - Alias used to access this element instance.
   * @param {string} parentPath - Parent block path (e.g., "block" or "block--modifier").
   */
  constructor(name, alias, parentPath) {
    this.name_ = name;
    this.alias_ = alias;
    this.path_ = `${parentPath}__${this.name_}`;
    this.selector_ = `.${this.path_}`;
    this.modifiers_ = new Map();

    // Proxy to allow direct access to modifiers via alias
    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (target.modifiers_.has(prop)) return target.modifiers_.get(prop);
        return undefined;
      },
    });
  }

  /**
   * Adds a modifier to this element.
   * @param {string} name - Modifier name.
   * @param {string} alias - Alias used to access the modifier.
   * @returns {BEMElement} The current element instance (for chaining).
   */
  addModifier(name, alias) {
    const modifier = new BEMModifier(name, alias, this.path_);
    this.modifiers_.set(alias, modifier);
    return this;
  }
}
