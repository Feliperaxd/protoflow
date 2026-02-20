/* eslint-disable max-classes-per-file */

class BEMUtils {
  static createProxy(obj, storage) {
    const handler = {
      get(target, prop, receiver) {
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        }

        if (storage && storage.has(prop)) {
          return storage.get(prop);
        }

        return undefined;
      },

      set(target, prop, value, receiver) {
        if (Reflect.has(target, prop)) {
          return Reflect.set(target, prop, value, receiver);
        }

        return false;
      },
    };

    return new Proxy(obj, handler);
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
}

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
    return BEMUtils.createProxy(this, this.modifiers);
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
    return BEMUtils.createProxy(this, new Map([...this.elements, ...this.modifiers]));
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
    return BEMUtils.createProxy(this, this.registry);
  }

  createBlock(name, alias) {
    const block = new Block(name, alias);
    this.registry.set(alias, block);
    return block;
  }

  async load(jsonData) {
    if (jsonData.blocks && Array.isArray(jsonData.blocks)) {
      jsonData.blocks.forEach(blockData => {
        const block = this.createBlock(blockData.name, blockData.alias);

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
const data = await fetchJson('./teste.json');
a.load(data);
console.log(a.elements);
