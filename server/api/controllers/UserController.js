/* eslint-disable import/prefer-default-export */

import db from '../../db';
import UserModel from '../models/UserModel';
import log from '../../lib/logger';
import { formatSQLResult } from '../../db/util';

/**
 * Create a User from a set of details
 * @param {object} req - The http request object
 * @param {object} res - The http response object
 */
export function createUser(req, res) {
  db.query(UserModel.create(req.body))
    .then((data) => {
      log.debug(data);
      const formatted = formatSQLResult(data, true);
      // TODO: implement json web tokens
      const token = null;
      res.status(201).json({
        status: 201,
        data: [{
          token,
          user: formatted,
        }],
      });
    })
    .catch((error) => {
      log.error(error);
      res.status(500).json({
        status: 500,
        error: 'server error',
      });
    });
}
