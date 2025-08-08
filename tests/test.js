class BEM {
  #registry;

  constructor() {
    this.#registry = {};
  }

  addBlock(alias, block, overwrite = false) {
    if (!(alias in this.#registry) || overwrite) {
      this.#registry[alias] = {
        name: block,
        elements: [],
      };
    }
  }

  addElement(alias, name, block, overwrite = false) {
    this.registry[this.block] = {};

    this[name] = new Proxy(() => baseString, {
      get(target, prop) {
        if (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf') {
          return () => baseString;
        }
        return `${baseString}--${prop}`;
      },
      apply() {
        return baseString;
      }
    });

    return this;
  }
}

/*
  blockTag {
    name: block-name,
    elements: [
      elementTagA {
        name: element-a,
        modifiers: [
          is-active,
          is-inative
        ]
      },
      elementTagB {
        name: element-b,
      modifiers: [
          is-active,
          is-inative
        ]
      }
    ]
  }
*/


const a = new BEM('block');
a.addElement('el', 'element');

console.log(a.el);             // "block__element"
console.log(a.el());           // "block__element"
console.log(a.el.modifier);    // "block__element--modifier"
console.log(String(a.el));     // "block__element"
console.log(a.el + '');        // "block__element"
