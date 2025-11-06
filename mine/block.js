import { loadTemplateAsElement } from './utils.js';

export default class Block {
  constructor(name, gameViewID) {
    this.name = name;
    this.gameViewID = gameViewID;

    this.gameView = document.getElementById(this.gameViewID);
    this.blockTemplate = null;

    this.textureMainPath = `../textures/blocks/${name}`;
    this.texturePathMap = {
      top: `${this.textureMainPath}/top.svg`,
      bottom: `${this.textureMainPath}/bottom.svg`,
      north: `${this.textureMainPath}/north.svg`,
      south: `${this.textureMainPath}/south.svg`,
      east: `${this.textureMainPath}/east.svg`,
      west: `${this.textureMainPath}/west.svg`,
    };

    this.#loadTexture();
  }

  async spawn(x, y, z) {
    this.#create();
  }

  #loadTexture() {
    Object.entries(this.texturePathMap).forEach(
      ([key, value]) => {
        document.styleSheets[0].insertRule(
          `.block__face--${key} {
              background-image: url("${value}");
              background-size: cover;
              background-position: center;
          }`,
        );
      },
    );
  }

  async #create() {
    const blockStructureURL = new URL('./templates/block.html', import.meta.url).href;
    this.blockTemplate = await loadTemplateAsElement(blockStructureURL, 'div');
    this.gameView.appendChild(this.blockTemplate);
  }
}
