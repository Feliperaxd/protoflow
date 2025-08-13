export default class Modifier {
  constructor(name, alias, parentPath) {
    this.name = name;
    this.alias = alias;
    this.path = `${parentPath}--${name}`;
    this.selector = `.${this.path}`;
  }
}
