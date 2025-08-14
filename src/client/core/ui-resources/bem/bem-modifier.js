export default class BEMModifier {
  constructor(name, alias, parentPath) {
    this.name_ = name;
    this.alias_ = alias;
    this.path_ = `${parentPath}--${this.name_}`;
    this.selector_ = `.${this.path_}`;
  }
}
