import { preventDefaults, setExclusiveStyleClass } from './domUtils.js';

class RangeSlider {
    constructor(sliderId) {

        const slider = document.getElementById(sliderId);
        const style = getComputedStyle(slider);

        this.title = slider.querySelector('.title');
        this.track = slider.querySelector('.track');
        this.filled = slider.querySelector('.filled');
        this.thumb = slider.querySelector('.thumb');
        this.valueLabel = slider.querySelector('.value-label');

        this.minValue = parseFloat(style.getPropertyValue('--min-value'));
        this.maxValue = parseFloat(style.getPropertyValue('--max-value'));
        this.stepValue = parseFloat(style.getPropertyValue('--step-value'));
        this.defaultValue = parseFloat(style.getPropertyValue('--default-value'));
        this.symbol = style.getPropertyValue('--symbol');
        this.value = this.clamp(this.defaultValue);

        this.thumbIsDragging = false;
        this.updateUi();
        this.bindEvents();
    }

    updateUi() {
        this.filled.style.width = `${this.getFilledPercent(this.value)}%`;
        this.valueLabel.textContent = `${this.value}${this.symbol}`;
        this.thumb.style.left = `${this.getFilledPercent(this.value)}%`;
    }

    bindEvents() {
        this.thumb.addEventListener('mousedown', e => {
            preventDefaults(e);
            this.isDragging = true;
            window.addEventListener('mousemove', this.onDrag);
            window.addEventListener('mouseup', this.onStopDrag);
        });

        this.track.addEventListener('click', e => {
            this.updateValueFromPosition(e.clientX);
        });
    }

    onDrag(e) {
        console.log('jdsalkjadskjlsd');
        if (!this.isDragging) return;
        this.updateValueFromPosition(e.clientX);
    }

    onStopDrag() {
        this.isDragging = false;
        window.removeEventListener('mousemove', this.onDrag);
        window.removeEventListener('mouseup', this.onStopDrag);
    }

    updateValueFromPosition(cursorPositionX) {
        const rect = this.track.getBoundingClientRect();
        let offsetX = cursorPositionX - rect.left;

        offsetX = Math.max(0, Math.min(offsetX, rect.width));

        const percent = offsetX / rect.width;
        const rawValue = this.minValue + percent * (this.maxValue - this.minValue);
        this.value = this.clamp(rawValue);

        this.updateUi();
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

const a = new RangeSlider('infill');
