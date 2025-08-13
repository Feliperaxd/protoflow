export default class Element {
  constructor(name, alias, parentPath) {
    this.name = name;
    this.alias = alias;
    this.path = `${parentPath}__${name}`;
    this.selector = `.${this.path}`;
    this.modifiers = new Map();

    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (target.modifiers.has(prop)) return target.modifiers.get(prop);
        return undefined;
      },
    });
  }

  addModifier(name, alias) {
    const modifier = new Modifier(name, alias, this.path);
    this.modifiers.set(alias, modifier);
    return this;
  }
}
