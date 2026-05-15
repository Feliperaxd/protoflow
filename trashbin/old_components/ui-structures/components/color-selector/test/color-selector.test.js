import ColorSelector from '../scripts/color-selector.js';

const callBack = () => {
  console.log('The color changed');
};

const colorSelector = new ColorSelector('color-selector-example', callBack);
await colorSelector.init();

colorSelector.addColor('color1', 'crimson', '#dc143c');
colorSelector.addColor('color2', 'turquoise', '#40e0d0');
colorSelector.addColor('color3', 'olive', '#808000');
colorSelector.addColor('color4', 'orchid', '#da70d6');
colorSelector.addColor('color5', 'slateblue', '#6a5acd');

console.log(colorSelector.getColor());
