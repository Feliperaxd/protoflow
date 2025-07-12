import { preventDefaults, setExclusiveStyleClass } from './utils.js';

class DropArea {
    constructor(dropAreaId, fileInputId) {
        this.dropAreaElement = document.getElementById(dropAreaId);
        this.fileInputElement = document.getElementById(fileInputId);
    }

    bindEvents() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropAreaElement.addEventListener(eventName, preventDefaults);
        });

        this.dropAreaElement.addEventListener('dragover', () => this.applyHoverStyle());
        this.dropAreaElement.addEventListener('dragleave', () => this.applyDefaultStyle());
        this.dropAreaElement.addEventListener('click', () => {
            this.fileInputElement.click();
        });
        this.dropAreaElement.addEventListener('drop', e => {
            this.changeFile();
        });
        this.fileInputElement.addEventListener('change', e => {
            this.changeFile();
        });
    }

    changeFile() {
        this.applyLoadingStyle();
        setTimeout(() => {
            this.applyFilledStyle();
        }, 2000);
    }

    applyDefaultStyle() {
        setExclusiveStyleClass(this.dropAreaElement, 'drop-area-default');
    }

    applyHoverStyle() {
        setExclusiveStyleClass(this.dropAreaElement, 'drop-area-hover');
    }

    applyLoadingStyle() {
        setExclusiveStyleClass(this.dropAreaElement, 'drop-area-loading');
    }

    applyFilledStyle() {
        setExclusiveStyleClass(this.dropAreaElement, 'drop-area-filled');
    }
}

export default DropArea;
