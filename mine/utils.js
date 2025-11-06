/**
 * Fetches the text content from a given URL.
 *
 * @param {string} url - The URL to fetch the text content from.
 * @returns {Promise<string>} A promise that resolves to the fetched text content.
 */
export async function getTextContent(url) {
  return fetch(url).then(res => res.text());
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
