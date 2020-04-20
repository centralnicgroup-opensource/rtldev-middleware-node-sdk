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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBO0lBQUE7SUFpQkEsQ0FBQztJQVRVLG9CQUFHLEdBQVYsVUFBVyxJQUFZLEVBQUUsQ0FBVyxFQUFFLEtBQTBCO1FBQTFCLHNCQUFBLEVBQUEsWUFBMEI7UUFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLElBQUksS0FBSyxFQUFFO1lBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBOEIsS0FBSyxDQUFDLE9BQVMsQ0FBQyxDQUFDO1NBQ2hFO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMxQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0wsYUFBQztBQUFELENBQUMsQUFqQkQsSUFpQkM7QUFqQlksd0JBQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZXNwb25zZSB9IGZyb20gXCIuL3Jlc3BvbnNlXCI7XG5cbi8qKlxuICogTG9nZ2VyIGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2dnZXIge1xuICAgIC8qKlxuICAgICAqIG91dHB1dC9sb2cgZ2l2ZW4gZGF0YVxuICAgICAqIEBwYXJhbSBwb3N0IHJlcXVlc3Qgc3RyaW5nIHVzZWRcbiAgICAgKiBAcGFyYW0gciBSZXNwb25zZSBvYmplY3RcbiAgICAgKiBAcGFyYW0gZXJyb3IgZXJyb3IgbWVzc2FnZSBvciBudWxsXG4gICAgICogQHJldHVybiBjdXJyZW50IExvZ2dlciBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIGxvZyhwb3N0OiBzdHJpbmcsIHI6IFJlc3BvbnNlLCBlcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbCk6IExvZ2dlciB7XG4gICAgICAgIGNvbnNvbGUuZGlyKHIuZ2V0Q29tbWFuZCgpKTtcbiAgICAgICAgY29uc29sZS5sb2cocG9zdCk7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSFRUUCBjb21tdW5pY2F0aW9uIGZhaWxlZDogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKHIuZ2V0UGxhaW4oKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiJdfQ==