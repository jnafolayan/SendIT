import { toUpperCase } from '../lib/util';

export function formatSQLResult({ rowCount, rows, fields }, toCamelCase) {
  const object = {};
  let i; let key; let
    value;
  for (i = 0; i < rowCount; i++) {
    key = fields[i].name;
    value = rows[i];
    if (toCamelCase) {
      key = key.replace(/^(\w+)_(\w+)/i, (match, pre, post) => pre + toUpperCase(post));
    }
    object[key] = value;
  }
  return object;
}
