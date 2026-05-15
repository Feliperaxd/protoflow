import {
  fetchJson,
  BEMManager,
  ResponsiveSize,
} from '../../../../core/index.js';

export default class StandardButton {
  constructor(mainElementID, onPressCallback = null, onReleaseCallback = null) {
    this.mainElement = document.getElementById(mainElementID);
    this.onPressCallback = onPressCallback;
    this.onReleaseCallback = onReleaseCallback;
    this.state = this.mainElement.getAttribute('state');

    if (!this.mainElement) {
      throw new Error(`Color selector element with id "${mainElementID}" not found`);
    }

    if ((typeof this.onPressCallback !== 'function' && this.onPressCallback !== null)
        || (typeof this.onReleaseCallback !== 'function' && this.onReleaseCallback !== null)) {
      throw new Error('Callbacks must be functions or null');
    }

    this.responsiveFontSize = new ResponsiveSize(
      'responsive-font-size',
      '--responsive-font-size-ratio',
      'fontSize',
    );

    this.responsiveBorderRadius = new ResponsiveSize(
      'responsive-border-radius',
      '--responsive-border-radius-ratio',
      'borderRadius',
    );
  }

  async init() {
    const bemDataUrl = new URL('./bem-data.json', import.meta.url).href;

    this.bem = new BEMManager();
    this.bem.load(await fetchJson(bemDataUrl));

    this.#bindEvents();
    this.responsiveFontSize.init();
    this.responsiveBorderRadius.init();
  }

  getState() {
    return this.state;
  }

  turnDefault() {
    if (this.getState() === 'default') return;

    this.state = 'default';
    this.#updateUi();
  }

  #bindEvents() {
    this.mainElement.addEventListener('mousedown', () => {
      if (this.onPressCallback) this.onPressCallback();
    });
    this.mainElement.addEventListener('touchstart', () => {
      if (this.onPressCallback) this.onPressCallback();
    });
    this.mainElement.addEventListener('mouseup', () => {
      if (this.onReleaseCallback) this.onReleaseCallback();
    });
    this.mainElement.addEventListener('touchend', () => {
      if (this.onReleaseCallback) this.onReleaseCallback();
    });
  }

  #updateUi() {
    console.log('updateUIUIUII');
  }
}

const btn = new StandardButton('standard-button-example');
btn.init();

console.log(btn.getState());
