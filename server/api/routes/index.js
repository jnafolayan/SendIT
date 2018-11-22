import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import express from 'express';

import * as UserController from '../controllers/UserController';
import * as ParcelController from '../controllers/ParcelController';

import verifyToken from '../../middlewares/verifyToken';

export default () => {
  const router = express.Router();

  // Setup protection and cross origin middlewares
  router.use(cors());
  router.use(helmet());
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: false }));

  router.route('/auth/signup')
    .post(UserController.createUser);

  router.route('/auth/login')
    .post(UserController.loginUser);

  router.route('/users/:userID/parcels')
    .get(verifyToken, UserController.fetchParcels);

  router.route('/parcels')
    .get(verifyToken, ParcelController.fetchParcels)
    .post(verifyToken, ParcelController.createParcel);

  router.route('/parcels/:parcelID')
    .get(verifyToken, ParcelController.fetchParcel);

  return router;
};
