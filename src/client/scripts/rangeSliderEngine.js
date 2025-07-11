import { preventDefaults } from './domUtils.js';

class RangeSlider {
    constructor(sliderId) {
        this.slider = document.getElementById(sliderId);
        if (!this.slider) {
            throw new Error(`Slider element with id "${sliderId}" not found`);
        }

        this.style = getComputedStyle(this.slider);
        this.initElements();
        this.initProperties();
        this.setupEventHandlers();
        this.updateUi();
        this.bindEvents();
    }

    initElements() {
        this.title = this.slider.querySelector('.title');
        this.track = this.slider.querySelector('.track');
        this.filled = this.slider.querySelector('.filled');
        this.thumb = this.slider.querySelector('.thumb');
        this.valueLabel = this.slider.querySelector('.value-label');

        if (!this.track || !this.thumb) {
            throw new Error('Required slider elements not found');
        }
    }

    initProperties() {
        this.minValue = this.getCssNumberValue('--min-value');
        this.maxValue = this.getCssNumberValue('--max-value');
        this.stepValue = this.getCssNumberValue('--step-value');
        this.defaultValue = this.getCssNumberValue('--default-value');
        this.symbol = this.style.getPropertyValue('--symbol').trim() || '';
        this.value = this.clamp(this.defaultValue);
        this.isDragging = false;
    }

    getCssNumberValue(propertyName) {
        const value = parseFloat(this.style.getPropertyValue(propertyName));
        if (Number.isNaN(value)) {
            throw new Error(`Invalid CSS value for ${propertyName}`);
        }
        return value;
    }

    setupEventHandlers() {
        this.handleDrag = this.handleDrag.bind(this);
        this.handleStopDrag = this.handleStopDrag.bind(this);
        this.handleThumbMouseDown = this.handleThumbMouseDown.bind(this);
        this.handleTrackClick = this.handleTrackClick.bind(this);
    }

    bindEvents() {
        this.thumb.addEventListener('mousedown', this.handleThumbMouseDown);
        this.track.addEventListener('click', this.handleTrackClick);
    }

    handleThumbMouseDown(e) {
        preventDefaults(e);
        this.isDragging = true;
        window.addEventListener('mousemove', this.handleDrag);
        window.addEventListener('mouseup', this.handleStopDrag);
    }

    handleTrackClick(e) {
        this.updateValueFromPosition(e.clientX);
    }

    handleDrag(e) {
        if (!this.isDragging) return;
        this.updateValueFromPosition(e.clientX);
    }

    handleStopDrag() {
        this.isDragging = false;
        window.removeEventListener('mousemove', this.handleDrag);
        window.removeEventListener('mouseup', this.handleStopDrag);
    }

    updateValueFromPosition(cursorPositionX) {
        const rect = this.track.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(cursorPositionX - rect.left, rect.width));
        const percent = offsetX / rect.width;
        const rawValue = this.minValue + percent * (this.maxValue - this.minValue);

        this.value = this.clamp(rawValue);
        this.updateUi();
    }

    updateUi() {
        const percent = this.getFilledPercent(this.value);
        this.filled.style.width = `${percent}%`;
        this.valueLabel.textContent = `${this.value}${this.symbol}`;
        this.thumb.style.left = `${percent}%`;
    }

    getFilledPercent(value) {
        return ((value - this.minValue) / (this.maxValue - this.minValue)) * 100;
    }

    clamp(value) {
        const clamped = Math.min(Math.max(value, this.minValue), this.maxValue);
        const steps = Math.round((clamped - this.minValue) / this.stepValue);
        return this.minValue + steps * this.stepValue;
    }
}

const infillSlider = new RangeSlider('infill');


FAZER ADAPTATIVO PRECISAO