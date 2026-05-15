import Block from './bem-block.js';

/**
 * Manages BEM (Block-Element-Modifier) structures.
 * Handles registration, retrieval, and construction of BEM paths,
 * and allows loading BEM configurations from JSON data.
 *
 * @example
 * const bem = new BEMManager();
 * bem.addBlock('button', 'btn');
 * bem.btn.addElement('button-thumb', 'thumb');
 * bem.btn.thumb.addModifier('hover', 'hover');
 *
 * const thumbPath = bem.btn.thumb.path_; // "button__thumb"
 * const btnSelector = bem.btn.thumb.hover.selector_; // ".button__thumb--hover"
 * const path = BEMManager.getPath('button', 'icon', 'large'); // "button__icon--large"
 */
export default class BEMManager {
  /**
   * Creates a new BEMManager instance.
   * Uses a Proxy to allow direct property access for registered blocks by alias.
   */
  constructor() {
    /**
     * Registry of blocks, keyed by alias.
     * @type {Map<string, Block>}
     */
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

  /**
   * Adds a new block to the registry.
   *
   * @param {string} name - Block name.
   * @param {string} alias - Alias to access the block.
   * @returns {Block} The created block instance.
   */
  addBlock(name, alias) {
    const block = new Block(name, alias);
    this.registry.set(alias, block);
    return block;
  }

  /**
   * Splits a BEM path into its parts.
   *
   * @static
   * @param {string} path - The BEM path (e.g., "block__element--modifier").
   * @returns {{ block: string|null, element: string|null, modifier: string|null }}
   * An object with the block, element, and modifier parts.
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

  /**
   * Builds a BEM path string from its parts.
   *
   * @static
   * @param {string} block - Block name.
   * @param {string|null} [element=null] - Element name.
   * @param {string|null} [modifier=null] - Modifier name.
   * @returns {string} The constructed BEM path.
   */
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

  /**
   * Loads a BEM structure from a JSON configuration.
   *
   * @async
   * @param {Object} jsonData - JSON containing blocks, elements, and modifiers.
   * @returns {BEMManager} The current BEMManager instance for chaining.
   */
  load(jsonData) {
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
