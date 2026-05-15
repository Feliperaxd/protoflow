/**
 * Extracts (x, y) positions from mouse or touch events.
 *
 * @param {MouseEvent | TouchEvent} event - The input event.
 * @returns {{ x: number, y: number }[]} List of coordinate positions.
 */
export function getEventPositions(event) {
  if (event.touches && event.touches.length > 0) {
    return Array.from(event.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
    }));
  }

  if (event.changedTouches && event.changedTouches.length > 0) {
    return Array.from(event.changedTouches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
    }));
  }

  return [{
    x: event.clientX,
    y: event.clientY,
  }];
}

/**
 * Prevents the default behavior and stops the propagation of a browser event.
 *
 * @param {Event} event - The event to be handled.
 */
export const preventDefaults = event => {
  event.preventDefault();
  event.stopPropagation();
};
