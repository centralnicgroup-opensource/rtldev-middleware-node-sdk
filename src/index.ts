import * as libClient from "./client";
import * as libRequest from "./request";
import * as libResponse from "./response";

/**
 * @alias node.ispapi-apiconnector
 * @desc Used to interact with the 1API Backend API
 * @property {node.ispapi-apiconnector.Request} Request
 * @property {node.ispapi-apiconnector.Client} Client
 * @property {node.ispapi-apiconnector.Response} Response
 */
export const ispapi = {
  Client: libClient.Client,
  Request: libRequest.Request,
  Response: libResponse.Response,
};
