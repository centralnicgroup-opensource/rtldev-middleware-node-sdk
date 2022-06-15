export declare const fixedURLEnc: (str: string) => string;
export declare class SocketConfig {
  private entity;
  private login;
  private otp;
  private pw;
  private remoteaddr;
  private session;
  private user;
  constructor();
  getPOSTData(): string;
  getSession(): string;
  getSystemEntity(): string;
  setLogin(value: string): SocketConfig;
  setOTP(value: string): SocketConfig;
  setPassword(value: string): SocketConfig;
  setRemoteAddress(value: string): SocketConfig;
  setSession(value: string): SocketConfig;
  setSystemEntity(value: string): SocketConfig;
  setUser(value: string): SocketConfig;
}
//# sourceMappingURL=socketconfig.d.ts.map
