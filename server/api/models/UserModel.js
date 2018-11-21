import _ from 'lodash';

/**
 * Handles queries to the User resource.
 * @class
 */
export default class UserModel {
  /**
   * Inserts a new User into the database
   * @static
   * @param {object} props - properties of the User
   * @param {string} props.firstname - the furst name of the User
   * @param {string} props.lastname - the last name of the User
   * @param {string} props.othernames - other names the User has
   * @param {string} props.email - the email of the User
   * @param {string} props.username - the username of the User
   * @param {string} props.password - the password of the User
   * @return {object} - The query object
   */
  static create(props) {
    const {
      firstname,
      lastname,
      othernames,
      email,
      username,
      password,
    } = props;

    const registered = new Date().toISOString();
    const isAdmin = false;

    return {
      text: `
        INSERT INTO users (
          firstname,
          lastname,
          othernames,
          email,
          username,
          password,
          registered,
          is_admin
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `,
      values: [firstname, lastname, othernames, email, username, password, registered, isAdmin],
    };
  }

  /**
   * Fetches all Users in the database that match the filter.
   * @static
   * @param {object} filter - properties of the User
   * @param {object} filter.where - fields to look into
   * @param {object} filter.or - fields to look into
   * @param {string} filter.orderBy - what to sort with
   * @return {object} - The query object
   */
  static fetch(filter) {
    const {
      where,
      or,
      orderBy,
    } = filter;

    let query = `SELECT * FROM users`;

    if (where) {
      const clauses = _.entries(where)
        .map((entry) => {
          let val = entry[1];
          if (!Number.isFinite(parseInt(val, 10))) {
            val = `'${val}'`;
          }
          return `${entry[0]} = ${val}`;
        })
        .join(' AND ');
      query += ` WHERE (${clauses})`;
    }

    if (or) {
      const clauses = _.entries(or)
        .map((entry) => {
          let val = entry[1];
          if (!Number.isFinite(parseInt(val, 10))) {
            val = `'${val}'`;
          }
          return `${entry[0]} = ${val}`;
        })
        .join(' AND ');
      query += ` OR (${clauses})`;
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    const offset = filter.offset || 0;
    const limit = filter.limit || 1000;
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    return {
      text: `${query};`,
    };
  }

  /**
   * Fetches a Users in the database with the specified refid
   * @static
   * @param {object} id - the refid of the User
   * @return {object} - The query object
   */
  static fetchByRefID(refid) {
    return UserModel.fetch({
      where: { ref_id: refid },
    });
  }
}
