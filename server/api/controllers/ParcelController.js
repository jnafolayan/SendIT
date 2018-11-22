/* eslint-disable no-use-before-define, import/prefer-default-export */

import _ from 'lodash';
import db from '../../db';
import UniqueID from '../../services/UniqueID';
import UserModel from '../models/UserModel';
import ParcelModel from '../models/ParcelModel';
import * as ParcelSchema from '../schemas/ParcelSchema';
import {
  createError,
  sendSuccess,
  finalizeError,
  validateSchema,
} from '../../lib/validations';
import { formatSQLResult } from '../../db/util';

const parcelSQLReplacement = {
  fromLoc: 'from',
  toLoc: 'to',
  currentLoc: 'currentLocation',
};


/**
 * Create a Parcel from a set of details
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function createParcel(req, res) {
  validateSchema(ParcelSchema.createSchema, req.body)
    .then(fetchUser)
    .then(checkIfExists)
    .then(generateID)
    .then(createNewParcel)
    .then(finalize)
    .catch(finalizeError(res));

  function fetchUser(body) {
    req.body = body;
    // check if user exists already
    const query = UserModel.fetchByID(req.user.id);
    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(403, 'forbidden');
    }
    return rows;
  }

  function generateID() {
    return UniqueID.generate('parcels');
  }

  function createNewParcel(id) {
    const query = ParcelModel.create({ ...req.body, id, placedBy: req.user.id });
    return db.query(query).then(() => id);
  }

  function finalize(id) {
    sendSuccess(res, 201, [{
      id,
      message: 'order created',
    }]);
  }
}


/**
 * Fetches all Parcels
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function fetchParcels(req, res) {
  fetchUser()
    .then(checkIfExists)
    .then(fetchAll)
    .then(formatResult)
    .then(finalize)
    .catch(finalizeError(res));

  function fetchUser() {
    // check if user exists already
    const query = UserModel.fetchByID(req.user.id);
    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(403, 'forbidden');
    }
    return rows;
  }

  function fetchAll() {
    const query = ParcelModel.fetch({
      orderBy: req.query.orderBy || null,
      offset: req.query.offset || null,
      limit: req.query.limit || null,
    });
    return db.query(query);
  }

  function formatResult({ rows }) {
    return _(rows)
      .map(row => formatSQLResult(row, true, parcelSQLReplacement));
  }

  function finalize(rows) {
    sendSuccess(res, 200, rows);
  }
}

/**
 * Fetches a single Parcel
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function fetchParcel(req, res) {
  validateSchema(ParcelSchema.fetchSchema, req.params)
    .then(fetchUser)
    .then(checkIfUserExists)
    .then(fetchSingle)
    .then(checkIfParcelExists)
    .then(formatResult)
    .then(finalize)
    .catch(finalizeError(res));

  function fetchUser() {
    // check if user exists already
    const query = UserModel.fetchByID(req.user.id);
    return db.query(query);
  }

  function checkIfUserExists({ rows }) {
    if (!rows.length) {
      throw createError(403, 'forbidden');
    }
    return rows;
  }

  function fetchSingle() {
    const query = ParcelModel.fetch({
      where: { id: req.params.parcelID },
      orderBy: req.query.orderBy || null,
      offset: req.query.offset || null,
      limit: req.query.limit || null,
    });
    return db.query(query);
  }

  function checkIfParcelExists({ rows }) {
    if (!rows.length) {
      throw createError(403, 'parcel not found');
    }
    return rows;
  }

  function formatResult([parcelDoc]) {
    return formatSQLResult(parcelDoc, true, parcelSQLReplacement);
  }

  function finalize(parcel) {
    sendSuccess(res, 200, parcel);
  }
}
