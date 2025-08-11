/* eslint-disable max-classes-per-file */

class Block {
  constructor(name, alias) {
    this.name = name;
    this.alias = alias;
    this.elements = {};
  }

  add(elementName, elementAlias) {
    this.elements[elementAlias] = elementName;
    return this;
  }
}

class BEM {
  constructor() {
    this.registry = {};

    const handler = {
      get: (_this, block) => {
        if (block in _this) return _this[block];
        if (block in _this.registry) {
          return _this.registry[block];
        }
        return undefined;
      },
    };

    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, handler);
  }

  add(name, alias) {
    const block = new Block(name, alias);
    this.registry[alias] = block;
    return block;
  }
}

const a = new BEM();
a.add('blockName', 'blockTesteAlias');
console.log(a.blockTesteAlias);
a.blockTesteAlias.add('elementName', 'elementAlias');
console.log(a.blockTesteAlias.elements);
