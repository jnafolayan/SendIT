/* eslint-disable import/prefer-default-export */
import _ from 'lodash';
import { capitalize } from '../lib/util';

/**
 * Formats the raw result from an SQL query to a consumable form for
 * the client.
 * @param {row} - A single row in the document.
 * @param {boolean} [toCamelCase=false] - Should the fields be in camel case?
 * @returns {object} - The formatted document.
 */
export function formatSQLResult(row, toCamelCase, replacements = {}) {
  const object = {};
  _.each(row, (value, field) => {
    let key = field;
    if (toCamelCase) {
      key = field.replace(/^(\w+)_(\w+)/i, (match, pre, post) => pre + capitalize(post));
    }
    if (key in replacements) {
      key = replacements[key];
    }
    object[key] = value;
  });
  return object;
}
