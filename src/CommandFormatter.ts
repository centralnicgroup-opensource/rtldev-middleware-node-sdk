/**
 * CNIC
 * Copyright © Team Internet Group PLC
 */

import type { ApiCommand, Scalar, StringHash } from "./types.js";

/**
 * One priority-map entry: a literal key or a PHP-delimited `/pattern/flags`
 * regex, its precompiled `RegExp` (null for a literal), and the priority it
 * resolves to. Precompiling here — once, when the memoised map is built —
 * is the "memoise it" half of porting the ~65-pattern map: findPriority()
 * never recompiles a pattern per lookup, matching how PHP's `preg_match`
 * benefits from its own internal pattern cache but going one step further
 * since JS has no such implicit cache for `new RegExp`.
 */
type PriorityEntry = {
  readonly pattern: string;
  readonly regex: RegExp | null;
  readonly priority: number;
};

/**
 * Static priority-seed shape: the base property patterns plus the contact
 * type and field patterns from which getPropertiesPriority() builds the
 * full map.
 */
type ContactFieldsPriority = {
  readonly properties: { [pattern: string]: number };
  readonly contact: {
    readonly types: { [pattern: string]: number };
    readonly fields: { [pattern: string]: number };
  };
};

/**
 * CommandFormatter
 */
export class CommandFormatter {
  /**
   * Static priority seed: the base property patterns plus the contact type
   * and field patterns from which getPropertiesPriority() builds the full
   * map. The data never changes at runtime, so it lives as a class constant
   * rather than a rebuilt-per-call literal.
   */
  private static readonly CONTACT_FIELDS_PRIORITY: ContactFieldsPriority = {
    properties: {
      COMMAND: 1,
      "/^(DOMAIN|DNSZONE|NAMESERVER|ZONE|SUBUSER)[0-9]*$/i": 2,
      "/^(PERIOD|ACTION|AUTH|TARGET|X-FEE-COMMAND|RENEWALMODE|LIMIT|WIDE)$/i": 3,
      "/^(NS_LIST|TRANSFERLOCK|DNSSEC0|X-FEE-AMOUNT|LOG|TYPE|OBJECT|INACTIVE|OBJECTID|OBJECTCLASS|ORDER|ORDERBY|CURRENCYFROM|CURRENCYTO)$/i": 4,
    },
    contact: {
      types: {
        "OWNERCONTACT|REGISTRANT": 5,
        "ADMINCONTACT|TECHNICAL": 6,
        "TECHCONTACT|BILLING": 7,
        "BILLINGCONTACT|ADMIN": 8,
      },
      fields: {
        FIRSTNAME: 1,
        MIDDLENAME: 2,
        LASTNAME: 3,
        ORGANIZATION: 4,
        STREET: 5,
        ZIP: 6,
        CITY: 7,
        STATE: 8,
        COUNTRY: 9,
        "PHONE|PHONENUMBER": 10,
        EMAIL: 11,
        CONTACT: 12,
        LEGALFORM: 13,
        IDENTIFICACION: 14,
        "TIPO-IDENTIFICACION": 15,
      },
    },
  };

  /**
   * Memoized priority map produced by getPropertiesPriority(). The map is
   * derived from purely static data (see CONTACT_FIELDS_PRIORITY) and never
   * depends on the command being sorted, so it is built once per process
   * and reused across every getSortedCommand() call (each request flatten
   * and each response getCommand()).
   */
  private static priorityCache: PriorityEntry[] | null = null;

  /**
   * Get the sorted command object based on priority.
   */
  public static getSortedCommand(command: StringHash): StringHash {
    const priority = CommandFormatter.getPropertiesPriority();

    // Decorate-sort-undecorate: resolve each key's priority exactly once
    // (O(n) findPriority calls) into a cache, then have the comparator read
    // the cached ints instead of re-scanning ~65 regex patterns on every
    // one of the ~2*n*log(n) comparisons.
    const keyPriority = new Map<string, number>();
    for (const key of Object.keys(command)) {
      keyPriority.set(key, CommandFormatter.findPriority(key, priority));
    }
    const values = new Map(Object.entries(command));

    const sortedKeys = Object.keys(command).sort((a, b) => {
      const priorityA = keyPriority.get(a) ?? Number.MAX_SAFE_INTEGER;
      const priorityB = keyPriority.get(b) ?? Number.MAX_SAFE_INTEGER;
      return priorityA === priorityB
        ? a < b
          ? -1
          : a > b
            ? 1
            : 0
        : priorityA - priorityB;
    });

    const sorted: StringHash = {};
    for (const key of sortedKeys) {
      sorted[key] = values.get(key) ?? "";
    }
    return sorted;
  }

  /**
   * Flatten API command's nested arrays for easier handling.
   */
  public static flattenCommand(
    cmd: ApiCommand,
    upperCaseKeys = true,
  ): StringHash {
    const newcmd: StringHash = {};
    for (const [key, val] of Object.entries(cmd)) {
      if (val === null) {
        continue;
      }
      const newKey = upperCaseKeys ? key.toUpperCase() : key;
      if (!Array.isArray(val)) {
        newcmd[newKey] = CommandFormatter.stripNewlines(
          CommandFormatter.toWireString(val),
        );
        continue;
      }
      val.forEach((v, idx) => {
        newcmd[`${newKey}${idx}`] = CommandFormatter.stripNewlines(
          CommandFormatter.toWireString(v),
        );
      });
    }

    // Sort the command array based on priority
    return CommandFormatter.getSortedCommand(newcmd);
  }

  /**
   * Format the command object into a plain text string.
   */
  public static formatCommand(command: StringHash): string {
    let tmp = "";
    for (const [key, val] of Object.entries(command)) {
      tmp += `${key} = ${val}\n`;
    }
    return tmp;
  }

  /**
   * PHP's `(string)` cast: `true` becomes `"1"`, `false` becomes `""` —
   * distinct from JS's `String(bool)`, which would give `"true"`/`"false"`.
   */
  private static toWireString(val: Scalar): string {
    if (typeof val === "boolean") {
      return val ? "1" : "";
    }
    return String(val);
  }

  private static stripNewlines(val: string): string {
    return val.replace(/\r|\n/g, "");
  }

  /**
   * Generate the priority list with properties dynamically including
   * contact fields and their priority.
   */
  private static getPropertiesPriority(): PriorityEntry[] {
    if (CommandFormatter.priorityCache !== null) {
      return CommandFormatter.priorityCache;
    }

    const { properties, contact } = CommandFormatter.CONTACT_FIELDS_PRIORITY;
    const entries: PriorityEntry[] = Object.entries(properties).map(
      ([pattern, priority]) => CommandFormatter.buildEntry(pattern, priority),
    );

    for (const [typePattern, typePriority] of Object.entries(contact.types)) {
      for (const [fieldPattern, fieldPriority] of Object.entries(
        contact.fields,
      )) {
        entries.push(
          CommandFormatter.buildEntry(
            `/^(${typePattern})[_0-9]*(${fieldPattern}[0-9]*)$/i`,
            typePriority * 100 + fieldPriority,
          ),
        );
      }
    }

    CommandFormatter.priorityCache = entries;
    return entries;
  }

  private static buildEntry(pattern: string, priority: number): PriorityEntry {
    return {
      pattern,
      regex: CommandFormatter.compilePattern(pattern),
      priority,
    };
  }

  /**
   * Compile a PHP-delimited `/pattern/flags` string into a `RegExp`, or
   * `null` when the entry is a plain literal key (matched by exact
   * equality instead — see findPriority()).
   */
  private static compilePattern(pattern: string): RegExp | null {
    if (!pattern.startsWith("/")) {
      return null;
    }
    const lastSlash = pattern.lastIndexOf("/");
    const body = pattern.slice(1, lastSlash);
    const flags = pattern.slice(lastSlash + 1);
    return new RegExp(body, flags);
  }

  /**
   * Find the priority of a given key.
   */
  private static findPriority(key: string, priority: PriorityEntry[]): number {
    for (const entry of priority) {
      if (entry.pattern === "") {
        continue;
      }
      const matches =
        entry.regex !== null ? entry.regex.test(key) : entry.pattern === key;
      if (matches) {
        return entry.priority;
      }
    }
    return Number.MAX_SAFE_INTEGER;
  }
}
