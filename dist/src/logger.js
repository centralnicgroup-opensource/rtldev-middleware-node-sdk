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
            console.error("HTTP communication failed: " + error);
        }
        console.log(r.getPlain());
        return this;
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBO0lBQUE7SUFpQkEsQ0FBQztJQVRVLG9CQUFHLEdBQVYsVUFBVyxJQUFZLEVBQUUsQ0FBVyxFQUFFLEtBQTJCO1FBQTNCLHNCQUFBLEVBQUEsWUFBMkI7UUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLElBQUksS0FBSyxFQUFFO1lBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBOEIsS0FBTyxDQUFDLENBQUM7U0FDeEQ7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FBQyxBQWpCRCxJQWlCQztBQWpCWSx3QkFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcblxuLyoqXG4gKiBMb2dnZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIExvZ2dlciB7XG4gICAgLyoqXG4gICAgICogb3V0cHV0L2xvZyBnaXZlbiBkYXRhXG4gICAgICogQHBhcmFtIHBvc3QgcmVxdWVzdCBzdHJpbmcgdXNlZFxuICAgICAqIEBwYXJhbSByIFJlc3BvbnNlIG9iamVjdFxuICAgICAqIEBwYXJhbSBlcnJvciBlcnJvciBtZXNzYWdlIG9yIG51bGxcbiAgICAgKiBAcmV0dXJuIGN1cnJlbnQgTG9nZ2VyIGluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgbG9nKHBvc3Q6IHN0cmluZywgcjogUmVzcG9uc2UsIGVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IExvZ2dlciB7XG4gICAgICAgIGNvbnNvbGUuZGlyKHIuZ2V0Q29tbWFuZCgpKTtcbiAgICAgICAgY29uc29sZS5sb2cocG9zdCk7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSFRUUCBjb21tdW5pY2F0aW9uIGZhaWxlZDogJHtlcnJvcn1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhyLmdldFBsYWluKCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iXX0=