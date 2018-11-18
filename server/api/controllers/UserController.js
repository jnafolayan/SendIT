/* eslint-disable import/prefer-default-export */

import db from '../../db';
import User from '../models/User';
import log from '../../lib/logger';
import { formatSQLResult } from '../../db/util';

/**
 * Create a User from a set of details
 * @param {object} req - The http request object
 * @param {object} res - The http response object
 */
export function createUser(req, res) {
  db.query(User.create(req.body))
    .then((data) => {
      const formatted = formatSQLResult(data);
      // TODO: implement json web tokens
      const token = null; 
      res.status(201).json({
        status: 201,
        data: [{
          token,
          user: formatted
        }]
      });
    })
    .catch(() => {
      res.status(500).json({
        status: 500,
        error: 'server error'
      });
    });
}
