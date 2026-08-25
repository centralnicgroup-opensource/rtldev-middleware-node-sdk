/**
 * Destination for formatted debug output.
 *
 * The counterpart of `LoggerInterface.format()`: the logger decides what the
 * debug record looks like, a sink decides where it goes. Implement this to
 * route SDK debug output into a file, a host application's own log, etc.,
 * without reimplementing a brand's format — see `AbstractClient.setLogSink()`.
 */
export interface LogSinkInterface {
  /**
   * Write one formatted debug record.
   *
   * @param message Formatted debug record as returned by `LoggerInterface.format()`
   */
  write(message: string): void;
}
