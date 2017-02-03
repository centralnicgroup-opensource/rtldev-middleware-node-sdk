/*
 * ispapi-apiconnector
 * Copyright(c) 2015 Kai Schwarz, 1API GmbH
 * MIT Licensed
 */

/* jslint node:true */
/* jshint node:true */

'use strict';

/**
 * @alias node.ispapi-apiconnector
 * @desc Used to interact with the 1API Backend API
 * @property {node.ispapi-apiconnector.Request} Request
 * @property {node.ispapi-apiconnector.Client} Client
 * @property {node.ispapi-apiconnector.Response} Response
 */
var ispapi = {
  Request: require('./request.js'),
  Client: require('./client.js'),
  Response: require('./response.js')
};

module.exports = ispapi;
