import _ from 'lodash';

/**
 * Handles queries to the Parcel resource.
 * @class
 */
export default class ParcelModel {
  /**
   * Inserts a new Parcel into the database
   * @static
   * @param {object} props - properties of the Parcel
   * @param {string} props.placedBy - the id of the Parcel sending it
   * @param {string} props.weight - the weight of the Parcel
   * @param {string} props.weightmetric - the unit of measurement of the weight
   * @param {string} props.from - the place to pickup the Parcel
   * @param {string} props.to - the destination of the Parcel
   * @return {object} - The query object
   */
  static create(props) {
    const {
      id,
      placedBy,
      weight,
      weightmetric,
      from,
      to,
    } = props;

    const sentOn = new Date().toISOString();
    const deliveredOn = null;
    const status = 'placed';
    const currentLocation = from;

    return {
      text: `
        INSERT INTO parcels (
          id,
          placed_by,
          weight,
          weightmetric,
          sent_on,
          delivered_on,
          status,
          from_loc,
          to_loc,
          current_loc
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `,
      values: [
        placedBy,
        weight,
        weightmetric,
        sentOn,
        deliveredOn,
        status,
        from,
        to,
        currentLocation,
      ],
    };
  }

  /**
   * Fetches all Parcel in the database that match the filter.
   * @static
   * @param {object} filter - properties of the Parcel
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

    let query = 'SELECT * FROM parcels';

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
   * Fetches a Parcel in the database with the specified id
   *
   * @static
   * @param {object} id - the id of the Parcel
   * @return {object} - The query object
   */
  static fetchByID(id) {
    return ParcelModel.fetch({
      where: { id },
    });
  }
}
