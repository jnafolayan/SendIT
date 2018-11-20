/**
 * Sends an error response to the client.
 * @param {Response} res - The http response object
 * @param {number} status - The status code for the error.
 * @param {string} error - The error message.
 */
export function createError(res, status, error) {
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
export function createSuccess(res, status, data) {
  res.status(status).json({
    status,
    data,
  });
}
