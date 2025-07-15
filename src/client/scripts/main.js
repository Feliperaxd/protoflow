import RangeSlider from './rangeSliderEngine.js';
import ResponsiveText from './responsiveText.js';

const infillSlider = new RangeSlider('infill');
const responsiveText = new ResponsiveText('responsive-text', '--font-scale');
responsiveText.resizeAllTextElements(responsiveText.getResponsiveTextElements());
window.addEventListener('resize', () => {
  responsiveText.resizeAllTextElements(responsiveText.getResponsiveTextElements());
});
