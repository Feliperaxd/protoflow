import { ResponsiveSize } from '../../../../core/index.js';
import RangeSlider from '../scripts/range-slider.js';

const responsiveSize = new ResponsiveSize();

const rangeSlider = new RangeSlider('range-slider-example');
await rangeSlider.init();
