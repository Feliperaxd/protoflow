import { setExclusiveStyleClass, loadTemplateAsElement } from './utils.js';

class ColorSelector {
  constructor(mainElementID) {
    this.mainElement = document.getElementById(mainElementID);
    if (!this.mainElement) {
      throw new Error(`Slider element with id "${mainElementID}" not found`);
    }

    this.allColors = [];
    this.isSliding = false;
    this.selectedColorIndex = null;

    this.requiredElements = [
      { selector: '.carousel', name: 'carousel' },
      { selector: '.track', name: 'carousel track' },
      { selector: '.left-arrow', name: 'left arrow' },
      { selector: '.right-arrow', name: 'right arrow' },
    ];
  }

  // === Public Methods ===

  async init() {
    this.colorCircleTemplate = await loadTemplateAsElement(
      '../templates/color-circle.html',
      'div',
    );
    this.#checkRequiredElements();
    this.#initElements();
    this.#bindEvents();
  }

  addColor(id, name, hexCode) {
    const colorCircleTemplateClone = this.colorCircleTemplate.cloneNode(true);
    const colorCircleElement = colorCircleTemplateClone.firstElementChild;
    colorCircleElement.style.setProperty('--color', hexCode);

    this.carouselTrack.appendChild(colorCircleTemplateClone);
    this.allColors.push({
      id,
      name,
      hexCode,
      element: colorCircleElement,
    });

    this.#selectColorByIndex(
      this.#getDefaultColorIndex(),
    );
    this.#setColorsClasses();
  }

  slideLeft() {
    if (this.isSliding) return;

    if (this.#selectLeftColor()) {
      this.#setColorsClasses();
      this.#updateTrackPosition();
      this.isSliding = true;
    }
  }

  slideRight() {
    if (this.isSliding) return;

    if (this.#selectRightColor()) {
      this.#setColorsClasses();
      this.#updateTrackPosition();
      this.isSliding = true;
    }
  }

  // === Private Methods ===

  #getStepOffset() {
    if (!this.carousel) return 0;

    const style = window.getComputedStyle(this.carousel);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const usableWidth = this.carousel.clientWidth - paddingLeft - paddingRight;

    return usableWidth / 3;
  }

  #updateTrackPosition() {
    const offset = this.#getStepOffset();
    this.carouselTrack.style.transform = `translateX(${-(this.selectedColorIndex - 1) * offset}px)`;
  }

  #setColorClassForIndexes(indexes, styleClass) {
    indexes.forEach(index => {
      if (index >= 0 && index < this.allColors.length) {
        const colorElement = this.allColors[index]?.element;

        if (colorElement) {
          setExclusiveStyleClass(colorElement, styleClass);
        }
      }
    });
  }

  #setColorsClasses() {
    const {
      leftColorIndex,
      rightColorIndex,
    } = this.#getVisibleColorsIndexes();

    this.#setColorClassForIndexes(
      [this.selectedColorIndex],
      'color-circle-selected',
    );

    this.#setColorClassForIndexes(
      [leftColorIndex, rightColorIndex],
      'color-circle-default',
    );

    this.#setColorClassForIndexes(
      this.#getHideColorsIndexes(),
      'color-circle-hidden',
    );
  }

  #selectLeftColor() {
    const newIndex = this.#getVisibleColorsIndexes().leftColorIndex;
    if (newIndex === null) {
      return false;
    }
    this.#selectColorByIndex(newIndex);
    this.selectedColorIndex = newIndex;
    return true;
  }

  #selectRightColor() {
    const newIndex = this.#getVisibleColorsIndexes().rightColorIndex;
    if (newIndex === null) {
      return false;
    }
    this.#selectColorByIndex(newIndex);
    this.selectedColorIndex = newIndex;
    return true;
  }

  #selectColorByIndex(index) {
    this.#checkColorIndex(index);
    this.#deselectColor();

    this.selectedColorIndex = index;
    const { element } = this.allColors[index];
    element.classList.add('selected-color');
  }

  #deselectColor() {
    if (this.selectedColorIndex !== null && this.allColors[this.selectedColorIndex]) {
      const { element } = this.allColors[this.selectedColorIndex];
      element.classList.remove('selected-color');
    }
  }

  #getVisibleColorsIndexes() {
    let leftColorIndex = null;
    let rightColorIndex = null;

    if (this.selectedColorIndex > 0) {
      leftColorIndex = this.selectedColorIndex - 1;
    }
    if (this.selectedColorIndex < this.allColors.length - 1) {
      rightColorIndex = this.selectedColorIndex + 1;
    }
    return {
      leftColorIndex,
      selectedColorIndex: this.selectedColorIndex,
      rightColorIndex,
    };
  }

  #getHideColorsIndexes() {
    return this.allColors
      .map((_, i) => i)
      .filter(i => i !== this.selectedColorIndex
        && i !== this.selectedColorIndex - 1
        && i !== this.selectedColorIndex + 1);
  }

  #getDefaultColorIndex() {
    if (this.allColors.length < 3) {
      return 0;
    }
    return 1;
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
await clr.init();
clr.addColor('cor1', 'Laranja Solar', '#FF6F00');
clr.addColor('cor2', 'Vermelho Fogo', '#D32F2F');
clr.addColor('cor3', 'Azul Céu', '#2196F3');
clr.addColor('cor4', 'Verde Limão', '#CDDC39');
clr.addColor('cor5', 'Roxo Névoa', '#9C27B0');
clr.addColor('cor6', 'Amarelo Ouro', '#FFEB3B');
clr.addColor('cor7', 'Rosa Bebê', '#F8BBD0');
clr.addColor('cor8', 'Cinza Urbano', '#9E9E9E');
clr.addColor('cor9', 'Azul Petróleo', '#004D40');
clr.addColor('cor10', 'Verde Esmeralda', '#2E7D32');
clr.addColor('cor11', 'Marrom Terra', '#795548');
clr.addColor('cor12', 'Branco Neve', '#FFFFFF');
clr.addColor('cor13', 'Preto Sombra', '#000000');
clr.addColor('cor14', 'Coral Suave', '#FF8A65');
clr.addColor('cor15', 'Turquesa Mar', '#00BCD4');
clr.addColor('cor16', 'Lavanda', '#E1BEE7');
clr.addColor('cor17', 'Azul Noite', '#1A237E');
clr.addColor('cor18', 'Verde Menta', '#A5D6A7');
clr.addColor('cor19', 'Dourado Antigo', '#FFD700');
clr.addColor('cor20', 'Cobre', '#B87333');
clr.addColor('cor21', 'Bege Areia', '#F5F5DC');
clr.addColor('cor22', 'Salmão Claro', '#FFA07A');
clr.addColor('cor23', 'Magenta Neon', '#FF00FF');
clr.addColor('cor24', 'Azul Bebê', '#B3E5FC');
clr.addColor('cor25', 'Verde Floresta', '#388E3C');
clr.addColor('cor26', 'Rosa Forte', '#E91E63');
clr.addColor('cor27', 'Cinza Chumbo', '#455A64');
clr.addColor('cor28', 'Laranja Pastel', '#FFCC80');
clr.addColor('cor29', 'Violeta Profundo', '#673AB7');
clr.addColor('cor30', 'Marfim', '#FFFFF0');

