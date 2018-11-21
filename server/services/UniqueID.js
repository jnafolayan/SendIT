import db from '../db';

export default class UniqueID {
  /**
   * Generates an 8-digit unique id
   *
   * @static
   * @param {string} table - The table to verify the id against.
   * @returns {number}
   */
  static generate(table) {
    return new Promise((resolve, reject) => {
      function gen() {
        let id = '';
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 8; i++) {
          // eslint-disable-next-line no-bitwise
          id += Math.random() * 10 | 0;
        }
        db.query(`SELECT * FROM ${table} WHERE id = ${id};`)
          .then(({ rows }) => {
            if (rows.length) {
              gen();
            } else {
              resolve(id);
            }
          })
          .catch(() => {
            reject(new Error('server error'));
          });
      }

      gen();
    });
  }
}
