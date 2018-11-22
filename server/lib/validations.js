import _ from 'lodash';

/**
 * Sends an error response to the client.
 * @param {Response} res - The http response object
 * @param {number} status - The status code for the error.
 * @param {string} error - The error message.
 */
export function sendError(res, status, error) {
  res.status(status).json({
    status,
    error,
  });
}

/**
 * Sends an error response to the client.
 * @param {Response} res - The http response object
 * @param {number} status - The status code for the response.
 * @param {array} data - The data to send.
 */
export function sendSuccess(res, status, data) {
  res.status(status).json({
    status,
    data,
  });
}

/**
 * Creates a custom error
 * @param {Response} res - The http response object
 * @param {number} status - The status code for the error.
 * @param {string} error - The error message.
 */
export function createError(status, error) {
  const customError = new Error();
  customError.message = error;
  customError.status = status;
  customError.custom = true;
  return customError;
}

/**
 * Handle the errors that occur in a chain of promise handling.
 * @param {res} error - The error.
 * @param {Error} error - The error.
 */
export function finalizeError(res) {
  return (error) => {
    if (error.custom) {
      sendError(res, error.status, error.message);
    } else {
      sendError(res, 500, 'server error');
    }
  };
}

/**
 * Request schemas are basically objects that help enforce the structure
 * of requests made to the server. They consist of key-value pairs that
 * describe the field and the expected type of value.
 *
 * @param {object} schema - the schema for the request
 * @param {object} reqBody - the passed request body
 * @returns {object} a filtered #body to match the schema
 */

export function validateSchema(reqSchema, reqBody) {
  function checkValidity(body, schema, errors) {
    _.entries(schema)
      .forEach(([key, typeClass]) => {
        if (!(key in body)) {
          errors.push(`${key} not found`);
        } else if (typeof typeClass(body[key]) !== typeof body[key]) {
          errors.push(`${key} not of type ${typeClass.name}`);
        }
      });

    return errors.length === 0;
  }

  return new Promise((resolve, reject) => {
    const errors = [];
    if (checkValidity(reqBody, reqSchema, errors)) {
      const filtered = _.pick(reqBody, _.keys(reqSchema));
      resolve(filtered);
    } else {
      reject(createError(400, errors.shift()));
    }
  });
}
