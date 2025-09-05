import { getTextContent } from '../network/network.js';

/**
 * Forces a browser reflow on the given element, useful for triggering CSS transitions/animations.
 * This is done by accessing a layout-related property (offsetWidth), which forces the browser
 * to recalculate layout.
 *
 * @param {HTMLElement} element - The DOM element to trigger reflow on.
 * @returns {void}
 *
 * @example
 * // Force reflow before restarting an animation
 * const box = document.getElementById('myBox');
 * box.classList.remove('animate');
 * reflowElement(box); // Forces reflow
 * box.classList.add('animate'); // Animation restarts
 */
export function reflowElement(element) {
  // eslint-disable-next-line no-unused-expressions
  element.offsetWidth;
}

/**
 * Loads an HTML template and returns it as a DOM element.
 *
 * @param {string} path - The path to the HTML template file.
 * @param {string} [containerTag] - Tag to use as the container for parsing.
 *
 * @returns {Promise<Element>} A promise that resolves to the first DOM
 *  element parsed from the template.
 */
export async function loadTemplateAsElement(path, containerTag) {
  const html = await getTextContent(path);
  const temp = document.createElement(containerTag);
  temp.innerHTML = html.trim();
  return temp.firstElementChild;
}

/**
 * Smoothly scrolls an element to the specified position with easing.
 *
 * @param {HTMLElement} element - The element to be scrolled.
 * @param {{x?: number, y?: number}} position - The target scroll position.
 *     - `x` (optional): Horizontal scroll position. Defaults to current position.
 *     - `y` (optional): Vertical scroll position. Defaults to current position.
 * @param {Function} [callback] - Optional function to be called once scrolling finishes.
 * @param {number|{x?: number, y?: number}} [minDistances={x:1, y:1}]
 *     - Minimum scroll distance to trigger animation.
 *
 * @example
 * scrollTo(document.querySelector(".content"), { x: 0, y: 500 }, () => {
 *   console.log("Scroll finished!");
 * });
 */
export function scrollTo(
  element,
  position,
  callback,
  duration = 800,
  minDistances = { x: 1, y: 1 },
) {
  const targetElement = element;
  const startX = element.scrollLeft;
  const startY = element.scrollTop;

  const targetX = position.x !== undefined ? position.x : startX;
  const targetY = position.y !== undefined ? position.y : startY;

  const distanceX = targetX - startX;
  const distanceY = targetY - startY;

  const startTime = performance.now();

  if (
    Math.abs(distanceX) < minDistances.x
    && Math.abs(distanceY) < minDistances.y
  ) {
    if (typeof callback === 'function') callback();
    return;
  }

  function animateScroll(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const ease = t => {
      if (t < 0.5) {
        return 4 * t * t * t;
      }
      return 1 - ((-2 * t + 2) ** 3) / 2;
    };

    const easedProgress = ease(progress);

    targetElement.scrollLeft = startX + distanceX * easedProgress;
    targetElement.scrollTop = startY + distanceY * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else {
      // Ensure final position accuracy
      if (position.x !== undefined) targetElement.scrollLeft = targetX;
      if (position.y !== undefined) targetElement.scrollTop = targetY;

      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  requestAnimationFrame(animateScroll);
}
