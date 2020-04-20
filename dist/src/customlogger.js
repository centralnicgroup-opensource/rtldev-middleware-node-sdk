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
            console.error(error.message);
        }
        console.log(r.getPlain());
        return this;
    };
    return CustomLogger;
}(logger_1.Logger));
exports.CustomLogger = CustomLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2N1c3RvbWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBa0M7QUFNbEM7SUFBa0MsZ0NBQU07SUFBeEM7O0lBa0JBLENBQUM7SUFWVSwwQkFBRyxHQUFWLFVBQVcsSUFBWSxFQUFFLENBQVcsRUFBRSxLQUEwQjtRQUExQixzQkFBQSxFQUFBLFlBQTBCO1FBRTVELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM1QixJQUFJLEtBQUssRUFBRTtZQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2hDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMxQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQUFDLEFBbEJELENBQWtDLGVBQU0sR0FrQnZDO0FBbEJZLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2VyXCI7XG5pbXBvcnQgeyBSZXNwb25zZSB9IGZyb20gXCIuL3Jlc3BvbnNlXCI7XG5cbi8qKlxuICogTG9nZ2VyIGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXN0b21Mb2dnZXIgZXh0ZW5kcyBMb2dnZXIge1xuICAgIC8qKlxuICAgICAqIG91dHB1dC9sb2cgZ2l2ZW4gZGF0YVxuICAgICAqIEBwYXJhbSBwb3N0IHJlcXVlc3Qgc3RyaW5nIHVzZWRcbiAgICAgKiBAcGFyYW0gciBSZXNwb25zZSBvYmplY3RcbiAgICAgKiBAcGFyYW0gZXJyb3IgZXJyb3IgbWVzc2FnZSBvciBudWxsXG4gICAgICogQHJldHVybiBjdXJyZW50IExvZ2dlciBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIGxvZyhwb3N0OiBzdHJpbmcsIHI6IFJlc3BvbnNlLCBlcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbCk6IEN1c3RvbUxvZ2dlciB7XG4gICAgICAgIC8vIGFwcGx5IGhlcmUgd2hhdGV2ZXIgeW91IG5lZWQgZS5nLlxuICAgICAgICBjb25zb2xlLmxvZyhwb3N0KTtcbiAgICAgICAgY29uc29sZS5kaXIoci5nZXRDb21tYW5kKCkpO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coci5nZXRQbGFpbigpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuIl19