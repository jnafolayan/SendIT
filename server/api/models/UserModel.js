/**
 * Handles queries to the User resource.
 * @class
 */
export default class User {
  /**
   * Inserts a new User into the database
   * @static
   * @param {object} props - properties of the parcel
   * @param {string} props.firstname - the furst name of the User
   * @param {string} props.lastname - the last name of the User
   * @param {string} props.othernames - other names the User has
   * @param {string} props.email - the email of the User
   * @param {string} props.username - the username of the User
   * @param {string} props.password - the password of the User
   */
  static create(props) {
    const {
      firstname,
      lastname,
      othernames,
      email,
      username,
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
          registered,
          is_admin
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      values: [firstname, lastname, othernames, email, username, registered, isAdmin],
    };
  }
}
