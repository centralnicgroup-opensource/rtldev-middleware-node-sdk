/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

/**
 * Role-credentials capability.
 *
 * A single CNR-class capability segregated off the shared client contract:
 * composing a role login ("<account>:<role>") from an account id, a role id
 * and the role user's own password. This is NOT part of the universal client
 * contract because it depends on a role separator that only the CNR platform
 * defines (`":"`); flat platforms such as IBS/Moniker have no separator, so
 * inheriting the behaviour there would silently forge a garbage
 * `<uid><role>` login rather than reject it. Consumers holding the shared
 * client type narrow via `instanceof` checks (or a capability check) before
 * calling it. Mirrors the ExtendedResponseInterface precedent on the
 * Response side.
 */
export interface RoleCredentialsInterface {
  /**
   * Set Role Credentials to be used for API communication
   * @param accountId empty string resets it
   * @param roleId empty string logs in as the account itself, without a role
   * @param password the role user's own password; empty string resets it
   */
  setRoleCredentials(
    accountId?: string,
    roleId?: string,
    password?: string,
  ): this;
}
