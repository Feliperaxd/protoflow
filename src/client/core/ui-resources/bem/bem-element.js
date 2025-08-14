import BEMModifier from './bem-modifier.js';

export default class BEMElement {
  constructor(name, alias, parentPath) {
    this.name_ = name;
    this.alias_ = alias;
    this.path_ = `${parentPath}__${this.name_}`;
    this.selector_ = `.${this.path_}`;
    this.modifiers_ = new Map();

    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (target.modifiers_.has(prop)) return target.modifiers_.get(prop);
        return undefined;
      },
    });
  }

  addModifier(name, alias) {
    const modifier = new BEMModifier(name, alias, this.path_);
    this.modifiers_.set(alias, modifier);
    return this;
  }
}
