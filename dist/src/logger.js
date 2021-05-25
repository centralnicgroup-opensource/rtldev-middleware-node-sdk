"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = (function () {
    function Logger() {
    }
    Logger.prototype.log = function (post, r, error) {
        if (error === void 0) { error = null; }
        console.dir(r.getCommand());
        console.log(post);
        if (error) {
            console.error("HTTP communication failed: " + error);
        }
        console.log(r.getPlain());
        return this;
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQTtJQUFBO0lBaUJBLENBQUM7SUFUUSxvQkFBRyxHQUFWLFVBQVcsSUFBWSxFQUFFLENBQVcsRUFBRSxLQUEyQjtRQUEzQixzQkFBQSxFQUFBLFlBQTJCO1FBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixJQUFJLEtBQUssRUFBRTtZQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0NBQThCLEtBQU8sQ0FBQyxDQUFDO1NBQ3REO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMxQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDSCxhQUFDO0FBQUQsQ0FBQyxBQWpCRCxJQWlCQztBQWpCWSx3QkFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcblxuLyoqXG4gKiBMb2dnZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIExvZ2dlciB7XG4gIC8qKlxuICAgKiBvdXRwdXQvbG9nIGdpdmVuIGRhdGFcbiAgICogQHBhcmFtIHBvc3QgcmVxdWVzdCBzdHJpbmcgdXNlZFxuICAgKiBAcGFyYW0gciBSZXNwb25zZSBvYmplY3RcbiAgICogQHBhcmFtIGVycm9yIGVycm9yIG1lc3NhZ2Ugb3IgbnVsbFxuICAgKiBAcmV0dXJuIGN1cnJlbnQgTG9nZ2VyIGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBsb2cocG9zdDogc3RyaW5nLCByOiBSZXNwb25zZSwgZXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsKTogTG9nZ2VyIHtcbiAgICBjb25zb2xlLmRpcihyLmdldENvbW1hbmQoKSk7XG4gICAgY29uc29sZS5sb2cocG9zdCk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBIVFRQIGNvbW11bmljYXRpb24gZmFpbGVkOiAke2Vycm9yfWApO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhyLmdldFBsYWluKCkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iXX0=