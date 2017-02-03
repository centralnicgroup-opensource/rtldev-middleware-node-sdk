/*
 * NOTE
 * we have to provide the templates in API plain text format.
 * Reason: the connector library uses two formats internally: unparsed and parsed one
 */
module.exports = {
  '404': "[RESPONSE]\r\ncode=421\r\ndescription=Page not found\r\nEOF\r\n",
  empty: "[RESPONSE]\r\ncode=423\r\ndescription=Empty API response\r\nTRANSLATIONKEY=FAPI.424\r\nEOF\r\n",
  error: "[RESPONSE]\r\ncode=421\r\ndescription=Command failed due to server error. Client should try again\r\nEOF\r\n",
  expired: "[RESPONSE]\r\ncode=530\r\ndescription=SESSION NOT FOUND\r\nTRANSLATIONKEY=FAPI.530\r\nEOF\r\n"
};