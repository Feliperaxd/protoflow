import BEMElement from './bem-element.js';
import BEMModifier from './bem-modifier.js';

export default class BEMBlock {
  constructor(name, alias) {
    this.name_ = name;
    this.alias_ = alias;
    this.path_ = name;
    this.selector_ = `.${this.path_}`;
    this.elements_ = new Map();
    this.modifiers_ = new Map();

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

  addElement(name, alias) {
    const element = new BEMElement(name, alias, this.path_);
    this.elements_.set(alias, element);
    return element;
  }

  addModifier(name, alias) {
    const modifier = new BEMModifier(name, alias, this.path);
    this.modifiers_.set(alias, modifier);
    return this;
  }
}
