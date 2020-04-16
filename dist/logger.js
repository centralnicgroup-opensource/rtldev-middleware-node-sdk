"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger = (function () {
    function Logger() {
    }
    Logger.prototype.log = function (post, r, error) {
        if (error === void 0) { error = null; }
        console.dir(r.getCommand());
        console.log(post);
        if (error) {
            console.error("HTTP communication failed: " + error.message);
        }
        console.log(r.getPlain());
        return this;
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map