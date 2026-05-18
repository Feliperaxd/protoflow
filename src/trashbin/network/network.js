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
 * Fetches and parses JSON content from a given URL.
 *
 * @param {string} url - The URL to fetch JSON from.
 * @returns {Promise<any>} A promise that resolves to the parsed JSON.
 * @throws {Error} If the response is not OK or JSON parsing fails.
 */
export async function fetchJson(url) {
  return fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status} while fetching ${url}`);
      }
      return res.json();
    });
}
