/* eslint-disable no-use-before-define */

import _ from 'lodash';
import dotenv from 'dotenv';
import db from '../../db';
import UniqueID from '../../services/UniqueID';
import Mailing from '../../services/Mailing';
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

dotenv.config();

const hostEmail = process.env.EMAIL_HOST;
const hostPassword = process.env.EMAIL_PASSWORD;

const mailingService = new Mailing(hostEmail, hostPassword);


/**
 * Create a Parcel from a set of details
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function createParcel(req, res) {
  validateSchema(ParcelSchema.createSchema, req.body)
    .then(grabUser)
    .then(checkIfExists)
    .then(generateID)
    .then(createNewParcel)
    .then(finalize)
    .catch(finalizeError(res));

  function grabUser(body) {
    req.body = body;
    // check if user exists already
    const query = UserModel.fetchByID(req.user.id);
    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'user not found');
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
  grabUser()
    .then(checkIfExists)
    .then(checkIfAdmin)
    .then(grabAll)
    .then(formatResult)
    .then(finalize)
    .catch(finalizeError(res));

  function grabUser() {
    // check if user exists already
    const query = UserModel.fetchByID(req.user.id);
    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'user not found');
    }
    return rows[0];
  }

  function checkIfAdmin(userDoc) {
    if (!userDoc.is_admin) {
      throw createError(401, 'not allowed');
    }
    return userDoc;
  }

  function grabAll() {
    const query = ParcelModel.fetch({
      orderBy: req.query.orderBy || null,
      offset: req.query.offset || null,
      limit: req.query.limit || null,
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

/**
 * Fetches a single Parcel
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function fetchParcel(req, res) {
  validateSchema(ParcelSchema.paramSchema, req.params)
    .then(grabUser)
    .then(checkIfUserExists)
    .then(grabParcel)
    .then(checkIfParcelExists)
    .then(formatResult)
    .then(finalize)
    .catch(finalizeError(res));

  function grabUser() {
    // check if user exists already
    const query = UserModel.fetchByID(req.user.id);
    return db.query(query);
  }

  function checkIfUserExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'user not found');
    }
    return rows;
  }

  function grabParcel() {
    const query = ParcelModel.fetch({
      where: { id: +req.params.parcelID },
      orderBy: req.query.orderBy || null,
      offset: req.query.offset || null,
      limit: req.query.limit || null,
    });
    return db.query(query);
  }

  function checkIfParcelExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'parcel not found');
    }
    return rows;
  }

  function formatResult([parcelDoc]) {
    return formatSQLResult(parcelDoc, true, ParcelModel.SQLReplacement);
  }

  function finalize(parcel) {
    sendSuccess(res, 200, [parcel]);
  }
}

/**
 * Cancels a single Parcel
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function cancelParcel(req, res) {
  validateSchema(ParcelSchema.paramSchema, req.params)
    .then(grabParcel)
    .then(checkIfExists)
    .then(cancelParcelOrder)
    .then(finalize)
    .catch(finalizeError(res));

  function grabParcel() {
    const query = ParcelModel.fetch({
      where: {
        id: +req.params.parcelID,
        placed_by: +req.user.id,
      },
    });

    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'parcel not found');
    }
    return rows;
  }

  function cancelParcelOrder() {
    const query = ParcelModel.delete({
      where: {
        id: +req.params.parcelID,
        placed_by: +req.user.id,
      },
    });

    return db.query(query);
  }

  function finalize() {
    sendSuccess(res, 200, [{
      id: +req.params.parcelID,
      message: 'order canceled',
    }]);
  }
}

/**
 * Changes the destination of a single Parcel
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function changeDestination(req, res) {
  validateSchema(ParcelSchema.paramSchema, req.params)
    .then(() => validateSchema(ParcelSchema.changeDestSchema, req.body))
    .then(grabParcel)
    .then(checkIfExists)
    .then(abortIfDelivered)
    .then(abortIfSame)
    .then(changeDest)
    .then(finalize)
    .catch(finalizeError(res));

  function grabParcel() {
    const query = ParcelModel.fetch({
      where: {
        id: +req.params.parcelID,
        placed_by: +req.user.id,
      },
    });

    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'parcel not found');
    }
    return rows[0];
  }

  function abortIfDelivered(parcelDoc) {
    if (parcelDoc.status === 'delivered') {
      throw createError(400, 'parcel is delivered');
    }
    return parcelDoc;
  }

  function abortIfSame(parcelDoc) {
    if (parcelDoc.from_loc === req.body.to) {
      throw createError(400, 'from cannot be to');
    }
    return parcelDoc;
  }

  function changeDest() {
    const query = ParcelModel.update({
      set: {
        to_loc: req.body.to,
      },
      where: {
        id: +req.params.parcelID,
        placed_by: +req.user.id,
      },
    });
    return db.query(query);
  }

  function finalize() {
    sendSuccess(res, 200, [{
      id: +req.params.parcelID,
      to: req.body.to,
      message: 'parcel destination updated',
    }]);
  }
}

/**
 * Changes the status of a single Parcel
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function changeStatus(req, res) {
  let user;

  validateSchema(ParcelSchema.paramSchema, req.params)
    .then(() => validateSchema(ParcelSchema.changeStatusSchema, req.body))
    .then(grabUser)
    .then(checkIfUserExists)
    .then(abortIfNotAdmin)
    .then(grabParcel)
    .then(checkIfExists)
    .then(changeStat)
    .then(sendMail)
    .then(finalize)
    .catch(finalizeError(res));

  function grabUser() {
    // check if user exists already
    const query = UserModel.fetchByID(req.user.id);
    return db.query(query);
  }

  function checkIfUserExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'user not found');
    }
    return rows[0];
  }

  function abortIfNotAdmin(userDoc) {
    if (!userDoc.is_admin) {
      // unauthorized
      throw createError(401, 'not allowed');
    }

    user = userDoc;
    return user;
  }

  function grabParcel() {
    const query = ParcelModel.fetch({
      where: {
        id: +req.params.parcelID,
      },
    });

    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'parcel not found');
    }
    return rows[0];
  }

  function changeStat() {
    const query = ParcelModel.update({
      set: {
        status: req.body.status,
      },
      where: {
        id: +req.params.parcelID,
      },
    });
    return db.query(query);
  }

  function sendMail() {
    const { parcelID: id } = req.params;

    const statusMap = {
      transiting: 'been picked up and is on its way to its destination',
      delivered: 'been delivered',
    };

    let address = process.env.NODE_ENV === 'development'
      ? `http://localhost:${process.env.PORT || 3000}` : process.env.ONLINE_HOST;

    address += `/parcels?id=${id}`;

    const options = {
      from: process.env.SENDIT_EMAIL || '',
      to: user.email,
      subject: `SendIT - [${id}] Parcel order update`,
      html: `
        <h3 style='text-align:center;color:#000;'>${id} - Parcel order update</h3>
        <h4>Dear ${user.firstname}</h4>
        <p>Your parcel with order id ${id} has ${statusMap[req.body.status]}. To view more details about the parcel, click the link below.</p>
        <br><a href=${address}>View order details</a>
      `,
    };

    // send in the background
    mailingService.sendMail(options)
      .catch(() => {
      });
  }

  function finalize() {
    sendSuccess(res, 200, [{
      id: +req.params.parcelID,
      status: req.body.status,
      message: 'parcel status updated',
    }]);
  }
}

/**
 * Changes the current location of a single Parcel
 *
 * @param {Request} req - The http request object
 * @param {Response} res - The http response object
 */
export function changeCurrentLocation(req, res) {
  let user;
  validateSchema(ParcelSchema.paramSchema, req.params)
    .then(() => validateSchema(ParcelSchema.changeLocationSchema, req.body))
    .then(grabUser)
    .then(checkIfUserExists)
    .then(abortIfNotAdmin)
    .then(grabParcel)
    .then(checkIfExists)
    .then(changeLoc)
    .then(sendMail)
    .then(finalize)
    .catch(finalizeError(res));

  function grabUser() {
    // check if user exists already
    const query = UserModel.fetchByID(req.user.id);
    return db.query(query);
  }

  function checkIfUserExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'user not found');
    }
    return rows[0];
  }

  function abortIfNotAdmin(userDoc) {
    if (!userDoc.is_admin) {
      // unauthorized
      throw createError(401, 'not allowed');
    }
    user = userDoc;
    return userDoc;
  }

  function grabParcel() {
    const query = ParcelModel.fetch({
      where: {
        id: +req.params.parcelID,
      },
    });

    return db.query(query);
  }

  function checkIfExists({ rows }) {
    if (!rows.length) {
      throw createError(404, 'parcel not found');
    }
    return rows[0];
  }

  function changeLoc() {
    const query = ParcelModel.update({
      set: {
        current_loc: req.body.currentLocation,
      },
      where: {
        id: +req.params.parcelID,
      },
    });
    return db.query(query);
  }

  function sendMail() {
    const { parcelID: id } = req.params;

    let address = process.env.NODE_ENV === 'development'
      ? `http://localhost:${process.env.PORT || 3000}` : process.env.ONLINE_HOST;

    address += `/parcels?id=${id}`;

    const options = {
      to: user.email,
      subject: `SendIT - [${id}] Parcel order update`,
      html: `
        <h3 style='text-align:center;color:#000;'>${id} - Parcel order update</h3>
        <h4>Dear ${user.firstname}</h4><br>
        <p>Your parcel with order id ${id} is on its way. It is currently in ${req.body.currentLocation}. To view more details about the parcel, click the link below.</p>
        <br><a href=${address}>View order details</a>
      `,
    };

    // send in the background
    mailingService.sendMail(options)
      .catch(() => {});
  }

  function finalize() {
    sendSuccess(res, 200, [{
      id: +req.params.parcelID,
      currentLocation: req.body.currentLocation,
      message: 'parcel current location updated',
    }]);
  }
}
