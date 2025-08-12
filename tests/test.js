/* eslint-disable max-classes-per-file */

class Modifier {
  constructor(name, alias, parentPath) {
    this.name = name;
    this.alias = alias;
    this.path = `${parentPath}--${name}`;
    this.selector = `.${this.path}`;
  }
}

class Element {
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

class Block {
  constructor(name, alias) {
    this.name = name;
    this.alias = alias;
    this.path = name;
    this.selector = `.${this.path}`;
    this.elements = new Map();
    this.modifiers = new Map();

    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (target.elements.has(prop)) return target.elements.get(prop);
        if (target.modifiers.has(prop)) return target.modifiers.get(prop);
        return undefined;
      },
    });
  }

  addElement(name, alias) {
    const element = new Element(name, alias, this.path);
    this.elements.set(alias, element);
    return element;
  }

  addModifier(name, alias) {
    const modifier = new Modifier(name, alias, this.path);
    this.modifiers.set(alias, modifier);
    return this;
  }
}

class BEM {
  constructor() {
    this.registry = new Map();

    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (target.registry.has(prop)) return target.registry.get(prop);
        return undefined;
      },
    });
  }

  createBlock(name, alias) {
    const block = new Block(name, alias);
    this.registry.set(alias, block);
    return block;
  }
  /*
  async load(filePath) {
    const data = await fetchJson(filePath);
    return data;
  }
  */

  static splitPath(path) {
    const [blockPart, modifier] = path.split('--');
    const [block, element] = blockPart.split('__');

    return {
      block: block || null,
      element: element || null,
      modifier: modifier || null,
    };
  }

  static getPath(block, element = null, modifier = null) {
    let path = block;

    if (element) {
      path += `__${element}`;
    }
    if (modifier) {
      path += `--${modifier}`;
    }
    return path;
  }
}

const a = new BEM();
a.createBlock('header', 'header');
a.header.addElement('elementName', 'elementAlias');
a.header.elementAlias.addModifier('modifierName', 'modifierAlias');

console.log();
