/* eslint-disable no-use-before-define, import/prefer-default-export */

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
