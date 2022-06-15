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
import { Logger } from "./logger";
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
})(Logger);
export { CustomLogger };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2N1c3RvbWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBTWxDO0lBQWtDLGdDQUFNO0lBQXhDOztJQXNCQSxDQUFDO0lBZFEsMEJBQUcsR0FBVixVQUNFLElBQVksRUFDWixDQUFXLEVBQ1gsS0FBMkI7UUFBM0Isc0JBQUEsRUFBQSxZQUEyQjtRQUczQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDNUIsSUFBSSxLQUFLLEVBQUU7WUFDVCxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3RCO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMxQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUF0QkQsQ0FBa0MsTUFBTSxHQXNCdkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXJcIjtcbmltcG9ydCB7IFJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcblxuLyoqXG4gKiBMb2dnZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIEN1c3RvbUxvZ2dlciBleHRlbmRzIExvZ2dlciB7XG4gIC8qKlxuICAgKiBvdXRwdXQvbG9nIGdpdmVuIGRhdGFcbiAgICogQHBhcmFtIHBvc3QgcmVxdWVzdCBzdHJpbmcgdXNlZFxuICAgKiBAcGFyYW0gciBSZXNwb25zZSBvYmplY3RcbiAgICogQHBhcmFtIGVycm9yIGVycm9yIG1lc3NhZ2Ugb3IgbnVsbFxuICAgKiBAcmV0dXJuIGN1cnJlbnQgTG9nZ2VyIGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBsb2coXG4gICAgcG9zdDogc3RyaW5nLFxuICAgIHI6IFJlc3BvbnNlLFxuICAgIGVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbFxuICApOiBDdXN0b21Mb2dnZXIge1xuICAgIC8vIGFwcGx5IGhlcmUgd2hhdGV2ZXIgeW91IG5lZWQgZS5nLlxuICAgIGNvbnNvbGUubG9nKHBvc3QpO1xuICAgIGNvbnNvbGUuZGlyKHIuZ2V0Q29tbWFuZCgpKTtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhyLmdldFBsYWluKCkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iXX0=
