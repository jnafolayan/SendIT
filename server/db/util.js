/* eslint-disable import/prefer-default-export */
import { toUpperCase } from '../lib/util';

export function formatSQLResult({ rows, fields }, toCamelCase) {
  const object = {};
  const rowCount = rows.length;
  let key; let
    value;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < rowCount; i++) {
    key = fields[i].name;
    value = rows[i];
    if (toCamelCase) {
      key = key.replace(/^(\w+)_(\w+)/i, (match, pre, post) => pre + toUpperCase(post));
    }
    object[key] = value;
  }
  return object;
}
