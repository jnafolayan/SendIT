/* eslint-disable no-use-before-define */

import _ from 'lodash';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../db';
import UniqueID from '../../services/UniqueID';
import { SECRET, EXPIRY } from '../../config/jwt';
import ParcelModel from '../models/ParcelModel';
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
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function createUser(req, res) {
  validateSchema(UserSchema.createSchema, req.body)
    .then(fetchUser)
    .then(checkIfExists)
    .then(generateID)
    .then(hashPassword)
    .then(createNewUser)
    .then(fetchNewUser)
    .then(checkIfNewUserExists) // can this ever happen?
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
      throw createError(403, 'user already exists');
    }
    return rows;
  }

  function generateID() {
    return UniqueID.generate('users');
  }

  function hashPassword(id) {
    const password = bcrypt.hashSync(req.body.password, HASH_COST);
    return [id, password];
  }

  function createNewUser([id, password]) {
    return db.query(UserModel.create({ ...req.body, id, password }));
  }

  function fetchNewUser() {
    // fetch the user data
    const query = UserModel.fetch({
      where: { username: req.body.username },
    });
    return db.query(query);
  }

  function checkIfNewUserExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'user not found');
    }
    return rows;
  }

  function formatResult([userDoc]) {
    return formatSQLResult(userDoc, true);
  }

  function finalize(user) {
    const token = jwt.sign({ id: user.id }, SECRET, {
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
 *
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
      throw createError(404, 'user not found');
    }
    return rows;
  }

  function formatResult([userDoc]) {
    return formatSQLResult(userDoc, true);
  }

  function verifyPassword(user) {
    // ensure passwords match
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw createError(403, 'password not correct');
    }
    return user;
  }

  function finalize(user) {
    const token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: EXPIRY,
    });
    sendSuccess(res, 200, [{
      token,
      user,
    }]);
  }
}

/**
 * Fetches all Parcels that belong to a User
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function fetchParcels(req, res) {
  validateSchema(UserSchema.fetchParcelsSchema, req.params)
    .then(fetchUser)
    .then(checkIfExists)
    .then(fetchSentParcels)
    .then(formatResult)
    .then(finalize)
    .catch(finalizeError(res));

  function fetchUser(params) {
    // ensure that the owner of the parcels is the only one allowed
    // to view them
    if (+params.userID !== req.user.id) {
      throw createError(403, 'user not valid');
    }

    const query = UserModel.fetch({
      where: { id: +params.userID },
    });

    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'user not found');
    }
    return rows;
  }

  function fetchSentParcels() {
    const query = ParcelModel.fetch({
      where: { placed_by: +req.params.userID },
    });

    return db.query(query);
  }

  function formatResult({ rows }) {
    return _(rows)
      .map(row => formatSQLResult(row, true, ParcelModel.SQLReplacement));
  }

  function finalize(rows) {
    sendSuccess(res, 200, rows);
  }
}
