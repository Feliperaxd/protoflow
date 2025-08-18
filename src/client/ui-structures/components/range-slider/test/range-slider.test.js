import RangeSlider from '../scripts/range-slider.js';

const rangeSlider = new RangeSlider('range-slider-example');
await rangeSlider.init();
console.log(rangeSlider.getValue());
