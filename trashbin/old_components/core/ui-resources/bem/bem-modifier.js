/**
 * Represents a BEM (Block Element Modifier) modifier.
 */
export default class BEMModifier {
  /**
   * @param {string} name - Modifier name.
   * @param {string} alias - Alias used to access the modifier.
   * @param {string} parentPath - Parent block/element path.
   */
  constructor(name, alias, parentPath) {
    this.name_ = name;
    this.alias_ = alias;
    this.path_ = `${parentPath}--${this.name_}`;
    this.selector_ = `.${this.path_}`;
  }
}
