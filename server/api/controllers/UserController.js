/* eslint-disable no-use-before-define */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../db';
import { SECRET, EXPIRY } from '../../config/jwt';
import UserModel from '../models/UserModel';
import * as UserSchema from '../schemas/UserSchema';
import {
  createError,
  sendSuccess,
  finalizeError,
  validateSchema,
} from '../../lib/validations';
import { formatSQLResult } from '../../db/util';

const HASH_COST = 10;

/**
 * Create a User from a set of details
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function createUser(req, res) {
  validateSchema(UserSchema.createSchema, req.body)
    .then(fetchUser)
    .then(checkIfExists)
    .then(hashPassword)
    .then(createNewUser)
    .then(fetchNewUser)
    .then(formatResult)
    .then(finalize)
    .catch(finalizeError(res));

  function fetchUser(body) {
    req.body = body;
    // check if user exists already
    const query = UserModel.fetch({
      where: { email: body.email },
      or: { username: body.username },
    });
    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (rows.length) {
      throw createError(403, 'user exists');
    }
  }

  function hashPassword() {
    const password = bcrypt.hashSync(req.body.password, HASH_COST);
    return password;
  }

  function createNewUser(password) {
    return db.query(UserModel.create({ ...req.body, password }));
  }

  function fetchNewUser() {
    // fetch the user data
    const query = UserModel.fetch({
      where: { username: req.body.username },
    });
    return db.query(query);
  }

  function formatResult({ rows }) {
    return formatSQLResult(rows[0], true);
  }

  function finalize(user) {
    const token = jwt.sign({ id: user.refId }, SECRET, {
      expiresIn: EXPIRY,
    });
    sendSuccess(res, 201, [{
      token,
      user,
    }]);
  }
}

/**
 * Sign a User in to his/her account
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function loginUser(req, res) {
  validateSchema(UserSchema.loginSchema, req.body)
    .then(fetchUser)
    .then(checkIfExists)
    .then(formatResult)
    .then(verifyPassword)
    .then(finalize)
    .catch(finalizeError(res));

  function fetchUser(body) {
    const query = UserModel.fetch({
      where: {
        username: body.username,
      },
    });
    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(403, 'user not found');
    }
  }

  function formatResult({ rows }) {
    return formatSQLResult(rows[0], true);
  }

  function verifyPassword(user) {
    // ensure passwords match
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw createError(403, 'password not correct');
    }
  }

  function finalize(user) {
    const token = jwt.sign({ id: user.refId }, SECRET, {
      expiresIn: EXPIRY,
    });
    sendSuccess(res, 200, [{
      token,
      user,
    }]);
  }
}
