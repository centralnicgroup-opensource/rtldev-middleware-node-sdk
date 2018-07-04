/*
 * ispapi-apiconnector
 * Copyright(c) 2015 Kai Schwarz, 1API GmbH
 * MIT Licensed
 */

/* jslint node:true */
/* jshint node:true */

'use strict';

/**
 * @alias @hexonet/ispapi-apiconnector
 * @desc Used to interact with the 1API Backend API
 * @property {@hexonet/ispapi-apiconnector.Request} Request
 * @property {@hexonet/ispapi-apiconnector.Client} Client
 * @property {@hexonet/ispapi-apiconnector.Response} Response
 */
var ispapi = {
  Request: require('./request.js'),
  Client: require('./client.js'),
  Response: require('./response.js')
};

module.exports = ispapi;
