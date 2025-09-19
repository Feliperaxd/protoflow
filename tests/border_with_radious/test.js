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

  addBlock(name, alias) {
    const block = new Block(name, alias);
    this.registry.set(alias, block);
    return block;
  }

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

  async load(jsonData) {
    if (jsonData.blocks && Array.isArray(jsonData.blocks)) {
      jsonData.blocks.forEach(blockData => {
        const block = this.addBlock(blockData.name, blockData.alias);

        if (blockData.modifiers && Array.isArray(blockData.modifiers)) {
          blockData.modifiers.forEach(modifier => {
            block.addModifier(modifier.name, modifier.alias);
          });
        }

        if (blockData.elements && Array.isArray(blockData.elements)) {
          blockData.elements.forEach(elementData => {
            const element = block.addElement(elementData.name, elementData.alias);

            if (elementData.modifiers && Array.isArray(elementData.modifiers)) {
              elementData.modifiers.forEach(modifier => {
                element.addModifier(modifier.name, modifier.alias);
              });
            }
          });
        }
      });
    }

    return this;
  }
}

import { fetchJson } from '../../src/client/core/index.js'

const a = new BEM();
a.addBlock('blockaaa2', 'block2');
a.addBlock('blockaaa1', 'block1');
console.log(a.block1);
