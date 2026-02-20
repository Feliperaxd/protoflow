export default class SyncProperty {
  constructor(target, trigger, unit, ratio) {
    this.target = target; // { selector, property }
    this.trigger = trigger; // { selector, property }
    this.unit = unit;
    this.ratio = ratio;

    this.linkedElements = [];
    this.observerType = ['width', 'height'].includes(this.trigger.property)
      ? 'resize'
      : 'mutation';

    this.updateLinkedElements();
  }

  resize(targetElement, triggerElement) {
    const triggerPropertyValue = parseFloat(
      getComputedStyle(triggerElement)[this.trigger.property],
    );

    /* eslint-disable no-param-reassign */
    targetElement.style[this.target.property] =
      `${triggerPropertyValue * this.ratio}${this.unit}`;
  }

  resizeAll() {
    this.linkedElements.forEach(elements => {
      this.resizeTarget(elements.target, elements.trigger);
    });
  }

  updateLinkedElements() {
    const targetElements = document.querySelectorAll(this.target.selector);
    this.linkedElements = Array.from(targetElements).map(element => ({
      target: element,
      trigger: element.closest(this.trigger.selector),
    }));
  }
}
