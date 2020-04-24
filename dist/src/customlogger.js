"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var CustomLogger = (function (_super) {
    __extends(CustomLogger, _super);
    function CustomLogger() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomLogger.prototype.log = function (post, r, error) {
        if (error === void 0) { error = null; }
        console.log(post);
        console.dir(r.getCommand());
        if (error) {
            console.error(error);
        }
        console.log(r.getPlain());
        return this;
    };
    return CustomLogger;
}(logger_1.Logger));
exports.CustomLogger = CustomLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2N1c3RvbWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBa0M7QUFNbEM7SUFBa0MsZ0NBQU07SUFBeEM7O0lBa0JBLENBQUM7SUFWVSwwQkFBRyxHQUFWLFVBQVcsSUFBWSxFQUFFLENBQVcsRUFBRSxLQUEyQjtRQUEzQixzQkFBQSxFQUFBLFlBQTJCO1FBRTdELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM1QixJQUFJLEtBQUssRUFBRTtZQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDTCxtQkFBQztBQUFELENBQUMsQUFsQkQsQ0FBa0MsZUFBTSxHQWtCdkM7QUFsQlksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXJcIjtcbmltcG9ydCB7IFJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcblxuLyoqXG4gKiBMb2dnZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIEN1c3RvbUxvZ2dlciBleHRlbmRzIExvZ2dlciB7XG4gICAgLyoqXG4gICAgICogb3V0cHV0L2xvZyBnaXZlbiBkYXRhXG4gICAgICogQHBhcmFtIHBvc3QgcmVxdWVzdCBzdHJpbmcgdXNlZFxuICAgICAqIEBwYXJhbSByIFJlc3BvbnNlIG9iamVjdFxuICAgICAqIEBwYXJhbSBlcnJvciBlcnJvciBtZXNzYWdlIG9yIG51bGxcbiAgICAgKiBAcmV0dXJuIGN1cnJlbnQgTG9nZ2VyIGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgbG9nKHBvc3Q6IHN0cmluZywgcjogUmVzcG9uc2UsIGVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IEN1c3RvbUxvZ2dlciB7XG4gICAgICAgIC8vIGFwcGx5IGhlcmUgd2hhdGV2ZXIgeW91IG5lZWQgZS5nLlxuICAgICAgICBjb25zb2xlLmxvZyhwb3N0KTtcbiAgICAgICAgY29uc29sZS5kaXIoci5nZXRDb21tYW5kKCkpO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKHIuZ2V0UGxhaW4oKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiJdfQ==