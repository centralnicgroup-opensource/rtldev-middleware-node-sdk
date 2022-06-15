import { Logger } from "./logger";
import { Response } from "./response";
export declare const ISPAPI_CONNECTION_URL_PROXY =
  "http://127.0.0.1/api/call.cgi";
export declare const ISPAPI_CONNECTION_URL_LIVE =
  "https://api.ispapi.net/api/call.cgi";
export declare const ISPAPI_CONNECTION_URL_OTE =
  "https://api-ote.ispapi.net/api/call.cgi";
export declare class APIClient {
  static readonly socketTimeout: number;
  private ua;
  private socketURL;
  private socketConfig;
  private debugMode;
  private curlopts;
  private logger;
  constructor();
  setCustomLogger(customLogger: Logger): APIClient;
  setDefaultLogger(): APIClient;
  enableDebugMode(): APIClient;
  disableDebugMode(): APIClient;
  getSession(): string | null;
  getURL(): string;
  setUserAgent(str: string, rv: string, modules?: any): APIClient;
  getUserAgent(): string;
  setProxy(proxy: string): APIClient;
  getProxy(): string | null;
  setReferer(referer: string): APIClient;
  getReferer(): string | null;
  getVersion(): string;
  saveSession(session: any): APIClient;
  reuseSession(session: any): APIClient;
  setURL(value: string): APIClient;
  setOTP(value: string): APIClient;
  setSession(value: string): APIClient;
  setRemoteIPAddress(value: string): APIClient;
  setCredentials(uid: string, pw: string): APIClient;
  setRoleCredentials(uid: string, role: string, pw: string): APIClient;
  login(otp?: string): Promise<Response>;
  loginExtended(params: any, otp?: string): Promise<Response>;
  logout(): Promise<Response>;
  request(cmd: any): Promise<Response>;
  requestNextResponsePage(rr: Response): Promise<Response | null>;
  requestAllResponsePages(cmd: any): Promise<Response[]>;
  setUserView(uid: string): APIClient;
  resetUserView(): APIClient;
  useHighPerformanceConnectionSetup(): APIClient;
  useDefaultConnectionSetup(): APIClient;
  useOTESystem(): APIClient;
  useLIVESystem(): APIClient;
  getPOSTData(cmd: any, secured?: boolean): string;
  private flattenCommand;
  private autoIDNConvert;
}
//# sourceMappingURL=apiclient.d.ts.map
