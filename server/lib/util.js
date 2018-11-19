/* eslint-disable import/prefer-default-export */

export function toUpperCase(string) {
  return string.replace(/^\D/i, match => match.toUpperCase());
}
