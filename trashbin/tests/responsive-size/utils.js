/**
 * getCSSProperties - Retrieves CSS custom properties from all stylesheets
 * filtered by a custom function, along with their selectors.
 *
 * @param {(name: string) => boolean} filterFn - Function to filter property names.
 * @returns {Array<{ property: string, value: string, selector: string }>}
 */
export function getCSSProperties(filterFn) {
  return Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules || [])
          .filter(rule => rule.style && rule.selectorText)
          .flatMap(rule => Array.from(rule.style)
            .filter(filterFn)
            .map(propName => ({
              selector: rule.selectorText,
              property: propName,
              value: rule.style.getPropertyValue(propName).trim(),
            })));
      } catch {
        return [];
      }
    })
    .flat();
}

/**
 * Gets the numeric value of a CSS custom property from an element.
 * Supports unitless numbers, unit-based values (e.g., "100px"),
 * and expressions like "calc(...)". Always returns a unitless number.
 *
 * @param {HTMLElement} element - The element to read the CSS variable from.
 * @param {string} propertyName - The CSS variable name (e.g., "--menu-item-height").
 * @returns {number} - The computed numeric value (typically in pixels).
 * @throws {Error} - If the property is missing or cannot be resolved to a number.
 */
export function getCssPropertyNumber(element, propertyName) {
  if (!(element instanceof Element)) {
    throw new Error('Element is required and must be a DOM Element.');
  }

  const rawValue = getComputedStyle(element).getPropertyValue(propertyName).trim();

  if (!rawValue) {
    throw new Error(
      `CSS custom property "${propertyName}" is not set or resolves to an empty value.`
    );
  }

  // Fast path: pure number (no units)
  if (/^-?\d*\.?\d+$/.test(rawValue)) {
    const value = parseFloat(rawValue);
    if (Number.isNaN(value)) {
      throw new Error(`Invalid CSS number for ${propertyName}: "${rawValue}"`);
    }
    return value;
  }

  // Resolve via a real CSS property (width) in the actual layout context
  const helper = document.createElement('div');
  const { style } = helper;
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.boxSizing = 'content-box';
  style.margin = '0';
  style.padding = '0';
  style.border = '0';
  style.width = rawValue;

  element.appendChild(helper);
  const { width } = getComputedStyle(helper);
  element.removeChild(helper);
  const numeric = parseFloat(width);

  if (Number.isNaN(numeric)) {
    throw new Error(
      `Invalid CSS value for ${propertyName}: "${rawValue}" (resolved width: "${width}")`,
    );
  }

  return numeric;
}
