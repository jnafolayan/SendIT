/* eslint-disable import/prefer-default-export */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../db';
import { SECRET, EXPIRY } from '../../config/jwt';
import UserModel from '../models/UserModel';
import { createError, createSuccess } from '../../lib/validations';
import { formatSQLResult } from '../../db/util';

const HASH_COST = 10;

/**
 * Create a User from a set of details
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function createUser(req, res) {
  // check if user exists already
  const fetchExisting = UserModel.fetch({
    where: { email: req.body.email },
    or: { username: req.body.username },
  });
  db.query(fetchExisting)
    .then((doc) => {
      if (doc.rows.length) {
        createError(res, 403, 'user exists');
      } else {
        const password = bcrypt.hashSync(req.body.password, HASH_COST);
        db.query(UserModel.create({ ...req.body, password }))
          .then(() => {
            // fetch the user data
            const getUser = UserModel.fetch({
              where: { username: req.body.username },
            });
            return db.query(getUser)
              .then(({ rows }) => {
                const user = formatSQLResult(rows[0], true);
                const token = jwt.sign({ id: user.refId }, SECRET, {
                  expiresIn: EXPIRY,
                });
                createSuccess(res, 201, [{
                  token,
                  user,
                }]);
              });
          })
          .catch(() => createError(res, 500, 'server error'));
      }
    })
    .catch(() => createError(res, 500, 'server error'));
}

/**
 * Sign a User in to his/her account
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function loginUser(req, res) {
  const hash = bcrypt.hashSync(req.body.password, HASH_COST);
  const fetchExisting = UserModel.fetch({
    where: { 
      email: req.body.username, 
      password: hash 
    }
  });
  db.query(fetchExisting)
    .then(({ rows }) => {
      if (!rows.length) {
        createError(res, 403, 'user not found');
      } else {
        const user = formatSQLResult(rows[0], true);
        const token = jwt.sign({ id: user.refId }, SECRET, {
          expiresIn: EXPIRY,
        });
        createSuccess(res, 200, [{
          token,
          user,
        }]);
      }
    })
    .catch(() => createError(res, 500, 'server error'));
}
