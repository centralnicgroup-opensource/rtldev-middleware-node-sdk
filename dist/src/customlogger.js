"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError(
          "Class extends value " + String(b) + " is not a constructor or null"
        );
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLogger = void 0;
var logger_1 = require("./logger");
var CustomLogger = (function (_super) {
  __extends(CustomLogger, _super);
  function CustomLogger() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  CustomLogger.prototype.log = function (post, r, error) {
    if (error === void 0) {
      error = null;
    }
    console.log(post);
    console.dir(r.getCommand());
    if (error) {
      console.error(error);
    }
    console.log(r.getPlain());
    return this;
  };
  return CustomLogger;
})(logger_1.Logger);
exports.CustomLogger = CustomLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2N1c3RvbWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBa0M7QUFNbEM7SUFBa0MsZ0NBQU07SUFBeEM7O0lBc0JBLENBQUM7SUFkUSwwQkFBRyxHQUFWLFVBQ0UsSUFBWSxFQUNaLENBQVcsRUFDWCxLQUEyQjtRQUEzQixzQkFBQSxFQUFBLFlBQTJCO1FBRzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM1QixJQUFJLEtBQUssRUFBRTtZQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEI7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQXRCRCxDQUFrQyxlQUFNLEdBc0J2QztBQXRCWSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2dlclwiO1xuaW1wb3J0IHsgUmVzcG9uc2UgfSBmcm9tIFwiLi9yZXNwb25zZVwiO1xuXG4vKipcbiAqIExvZ2dlciBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgQ3VzdG9tTG9nZ2VyIGV4dGVuZHMgTG9nZ2VyIHtcbiAgLyoqXG4gICAqIG91dHB1dC9sb2cgZ2l2ZW4gZGF0YVxuICAgKiBAcGFyYW0gcG9zdCByZXF1ZXN0IHN0cmluZyB1c2VkXG4gICAqIEBwYXJhbSByIFJlc3BvbnNlIG9iamVjdFxuICAgKiBAcGFyYW0gZXJyb3IgZXJyb3IgbWVzc2FnZSBvciBudWxsXG4gICAqIEByZXR1cm4gY3VycmVudCBMb2dnZXIgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIGxvZyhcbiAgICBwb3N0OiBzdHJpbmcsXG4gICAgcjogUmVzcG9uc2UsXG4gICAgZXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsXG4gICk6IEN1c3RvbUxvZ2dlciB7XG4gICAgLy8gYXBwbHkgaGVyZSB3aGF0ZXZlciB5b3UgbmVlZCBlLmcuXG4gICAgY29uc29sZS5sb2cocG9zdCk7XG4gICAgY29uc29sZS5kaXIoci5nZXRDb21tYW5kKCkpO1xuICAgIGlmIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHIuZ2V0UGxhaW4oKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiJdfQ==
