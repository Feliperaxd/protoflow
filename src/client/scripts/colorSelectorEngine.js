import { getTextContent } from './utils.js';

class ColorSelector {
  constructor(mainElementID) {
    this.mainElement = document.getElementById(mainElementID);
    if (!this.mainElement) {
      throw new Error(`Slider element with id "${mainElementID}" not found`);
    }

    this.selectedColor = null;
    this.allColors = [];
    this.isSliding = false;

    this.requiredElements = [
      { selector: '.carousel', name: 'carousel' },
      { selector: '.track', name: 'carousel track' },
      { selector: '.left-arrow', name: 'left arrow' },
      { selector: '.right-arrow', name: 'right arrow' },
    ];

    this.#checkRequiredElements();
    this.#initElements();
    this.#bindEvents();
  }

  // === Public Methods ===

  async addColor(id, name, hexCode) {
    const temp = document.createElement('div');
    temp.innerHTML = (await getTextContent('../templates/color-circle.html')).trim();

    const wrapper = temp.firstElementChild;
    const colorCircle = wrapper.querySelector('.color-circle');

    colorCircle.style.setProperty('--color', hexCode);

    this.carouselTrack.appendChild(wrapper);
    this.allColors.push({
      id,
      name,
      hexCode,
      element: colorCircle,
    });

    this.#selectColorByIndex(
      this.#getDefaultColorIndex(),
    );
  }

  slideLeft() {
    if (this.isSliding) return;

    if (this.#selectLeftColor()) {
      const stepOffset = this.#getStepOffset();
      const currentOffset = this.#getCurrentOffset();
      this.carouselTrack.style.transform = `translateX(${currentOffset + stepOffset}px)`;
      this.isSliding = true;
    }
  }

  slideRight() {
    if (this.isSliding) return;

    if (this.#selectRightColor()) {
      const stepOffset = this.#getStepOffset();
      const currentOffset = this.#getCurrentOffset();
      this.carouselTrack.style.transform = `translateX(${currentOffset - stepOffset}px)`;
      this.isSliding = true;
    }
  }

  // === Private Methods ===

  #getStepOffset() {
    return this.carousel.getBoundingClientRect().width / 3;
  }

  #getCurrentOffset() {
    return (
      this.carouselTrack.getBoundingClientRect().left
      - this.carousel.getBoundingClientRect().left
    );
  }

  #selectLeftColor() {
    const newIndex = Math.max(0, this.selectedColor - 1);
    if (newIndex === this.selectedColor) {
      return false;
    }
    this.#selectColorByIndex(newIndex);
    this.selectedColor = newIndex;
    return true;
  }

  #selectRightColor() {
    const newIndex = Math.min(
      this.allColors.length - 1,
      this.selectedColor + 1,
    );
    if (newIndex === this.selectedColor) {
      return false;
    }
    this.#selectColorByIndex(newIndex);
    this.selectedColor = newIndex;
    return true;
  }

  #getDefaultColorIndex() {
    if (this.allColors.length < 3) {
      return 0;
    }
    return 1;
  }

  #selectColorByIndex(index) {
    this.#checkColorIndex(index);
    this.#deselectColor();

    this.selectedColor = index;
    const { element } = this.allColors[index];
    element.classList.add('selected-color');
  }

  #deselectColor() {
    if (this.selectedColor !== null && this.allColors[this.selectedColor]) {
      const { element } = this.allColors[this.selectedColor];
      element.classList.remove('selected-color');
    }
  }

  #checkColorIndex(index) {
    if (index < 0 || index >= this.allColors.length || !this.allColors[index]) {
      throw new Error(`Color don't found! color index:${index}`);
    }
  }

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
    this.carouselTrack = this.mainElement.querySelector('.track');
    this.leftArrow = this.mainElement.querySelector('.left-arrow');
    this.rightArrow = this.mainElement.querySelector('.right-arrow');
    this.carouselTrack.innerHTML = '';
  }

  #bindEvents() {
    this.leftArrow.addEventListener('click', () => this.slideLeft());
    this.rightArrow.addEventListener('click', () => this.slideRight());
    this.carouselTrack.addEventListener('transitionend', () => {
      this.isSliding = false;
    });
  }
}

const clr = new ColorSelector('model-color-selector');
clr.addColor('cor1', 'Laranja Solar', '#FF6F00');
clr.addColor('cor2', 'Verde Menta', '#3EB489');
clr.addColor('cor3', 'Azul Céu', '#00BFFF');
clr.addColor('cor4', 'Amarelo Pastel', '#FFF176');
clr.addColor('cor5', 'Roxo Cósmico', '#7E57C2');
