"use strict";

const status = require('../status');

exports.error = (req, res, next) => {
  return res.status(404).send({message: status.ROUTE_INVALID.message, status: status.ROUTE_INVALID.code});
};
