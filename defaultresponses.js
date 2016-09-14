/*
 * NOTE
 * we have to provide the templates in API plain text format.
 * Reason: the connector library uses two formats internally: unparsed and parsed one
 */
module.exports = {
  expired: "[RESPONSE]\ncode=530\ndescription=SESSION NOT FOUND\nTRANSLATIONKEY=FAPI.530\nEOF\n",
  empty: "[RESPONSE]\ncode=423\ndescription=Empty API response\nTRANSLATIONKEY=FAPI.424\nEOF\n",
  error: "[RESPONSE]\ncode=421\ndescription=Command failed due to server error. Client should try again\nEOF\n"
};
