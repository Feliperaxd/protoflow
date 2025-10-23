/**
 * getCSSProperties - Retrieves CSS custom properties from all stylesheets
 * filtered by a custom function, along with their selectors.
 *
 * @param {(name: string) => boolean} filterFn - Function to filter property names.
 * @returns {Array<{ property: string, value: string, selector: string }>}
 */
export default function getCSSProperties(filterFn) {
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
