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
  const error = new Error();
  error.message = error;
  error.status = status;
  error.custom = true;
  return error;
}

/**
 * Handle the errors that occur in a chain of promise handling.
 * @param {Error} error - The error.
 */
export function finalizeError(error) {
  if (error.custom) {
    sendError(res, error.status, error.message);
  } else {
    sendError(res, 500, 'server error');
  }
}

/**
 * Request schemas are basically objects that help enforce the structure
 * of requests made to the server. They consist of key-value pairs that
 * describe the field and the expected type of value.
 * 
 * @param {object} schema - the schema for the request
 * @param {object} body - the passed request body
 * @returns {object} a filtered #body to match the schema
 */

export function validateSchema(schema, body) {
  return new Promise((resolve, reject) => {
    const errors = [];
    if (checkValidity(req.body, schema, errors)) {
      const filtered = _.pick(req.body, _.keys(schema));
      resolve(filtered);
    } else {
      reject(createError(400, errors.shift()));
    }
  });
}

function checkValidity(body, schema, errors) {
  for (let key in model) {
    if (!(key in body)) {
      errors.push(`${key} not found`);
    } else if (typeof model[key](body[key]) !== typeof body[key]) {
      errors.push(`${key} not of type ${model[key].name}`);
    }
  }
  return errors.length === 0;
}
