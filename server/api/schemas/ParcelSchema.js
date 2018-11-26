/* eslint-disable import/prefer-default-export */

export const createSchema = {
  weight: Number,
  weightmetric: String,
  from: String,
  to: String,
};

export const paramSchema = {
  parcelID: String, // URL address are strings
};

export const changeDestSchema = {
  to: String,
};

export const changeStatusSchema = {
  status: String,
};

export const changeLocationSchema = {
  currentLocation: String, // geo-address
};
