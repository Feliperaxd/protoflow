import { getTextContent } from './utils.js';

class ColorSelector {
  constructor(mainElementID) {
    this.mainElement = document.getElementById(mainElementID);
    if (!this.mainElement) {
      throw new Error(`Slider element with id "${mainElementID}" not found`);
    }

    this.selectedColor = {
      id: null,
      name: null,
      hexCode: null,
    };
    this.requiredElements = [
      { selector: '.carousel', name: 'carousel' },
      { selector: '.left-arrow', name: 'left-arrow' },
      { selector: '.right-arrow', name: 'right-arrow' },
    ];

    this.#checkRequiredElements();
    this.#initElements();
    this.#bindEvents();
  }

  // === Public Methods ===

  async addColor(id, name, hexCode) {
    const temp = document.createElement('div');
    temp.innerHTML = (await getTextContent('../templates/color-circle.html')).trim();

    const colorElement = temp.firstElementChild;
    colorElement.style.setProperty('--color', hexCode);

    this.carousel.appendChild(colorElement);
  }

  slideLeft() {
    console.log(this.mainElement);
    console.log('laksdlkjdsljkdslkjds');
  }

  // === Private Methods ===

  #checkRequiredElements() {
    const missingElements = this.requiredElements
      .map(({ selector, name }) => ({
        name,
        element: this.mainElement.querySelector(selector),
      }))
      .filter(item => !item.element);

    if (missingElements.length > 0) {
      throw new Error(`Required color selector elements not found: ${
        missingElements.map(item => item.name).join(', ')
      }`);
    }
  }

  #initElements() {
    this.carousel = this.mainElement.querySelector('.carousel');
    this.leftArrow = this.mainElement.querySelector('.left-arrow');
    this.rightArrow = this.mainElement.querySelector('.right-arrow');
    this.carousel.innerHTML = '';
  }

  #bindEvents() {
    this.leftArrow.addEventListener('click', () => this.slideLeft());
  }
}

const clr = new ColorSelector('model-color-selector');
clr.addColor('teste', 'ROsa', '#821773');
