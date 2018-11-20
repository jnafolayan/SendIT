/* eslint-disable import/prefer-default-export */

/**
 * Creates a copy of a string, but capitalized.
 * @param {string} - The string to work with.
 * @returns {string} - The capitalized string
 */
export function capitalize(string) {
  return string.replace(/^\D/i, match => match.toUpperCase());
}
