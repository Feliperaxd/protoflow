import { ResponsiveText } from '../../../../core/index.js';
import RangeSlider from '../range-slider.js';

const rangeSlider = new RangeSlider('range-slider-example');
const responsiveText = new ResponsiveText(
  'responsive-text',
  '--responsive-text-ratio',
  'px',
  10,
);
responsiveText.init();
rangeSlider.getValue();
