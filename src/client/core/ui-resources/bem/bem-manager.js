import Block from './bem-block.js';

export default class BEMManager {
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
