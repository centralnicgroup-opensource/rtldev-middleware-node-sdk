// CNIC — Copyright © Team Internet Group PLC
//
// The PHPStan-level-9 analogue: typescript-eslint's `strictTypeChecked`
// carries `no-unsafe-assignment`/`-member-access`/`-call`/`-return`/
// `-argument`, the rules that make "zero `any` in src/" enforceable rather
// than aspirational. Type-aware linting needs `parserOptions.projectService`
// to resolve types against the real tsconfig graph.
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".pnpm-store/**",
      "coverage/**",
      "docs/**",
      "rtldev-middleware-php-sdk/**",
      "*.config.js",
    ],
  },
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      // This rule rewrites `{ [k: string]: T }` to `Record<string, T>`. The
      // SDK exports a class literally named `Record` (PHP parity with
      // CNIC\Record), which shadows the built-in utility type inside every
      // module that imports it — so the rule's preferred form is the one
      // shape this codebase cannot use. Architecture decision beats lint
      // default; see docs/agents/architecture.md.
      "@typescript-eslint/consistent-indexed-object-style": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        // `projectService: true` resolves each file through the *default*
        // tsconfig.json, which deliberately excludes tests/ and examples/ —
        // so every spec came back as "not found by the project service".
        // tsconfig.test.json is the one that spans src/ + tests/; examples/
        // is checked by tsconfig.examples.json.
        project: ["./tsconfig.test.json", "./tsconfig.examples.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // A class with only static members is the deliberate pattern for a
      // PHP-parity static-utility class (CommandFormatter, CommandRedactor,
      // SensitiveFields, IDNCommandRewriter, ClientFactory) — PHP itself
      // uses `abstract class X { public static function ... }` for the same
      // role. Not a mistake to "fix" into free functions.
      "@typescript-eslint/no-extraneous-class": "off",
      // Bracket access on Hash/StringHash command objects (`cmd["COMMAND"]`,
      // `hash["PENDING"]`) is the parity-preserving style for PHP's
      // associative-array access (`$cmd["COMMAND"]`) — these are dynamic
      // wire-format keys, not fixed object properties, and dot notation
      // would misrepresent that. See docs/agents/architecture.md.
      "@typescript-eslint/dot-notation": "off",
      // Deliberately mixed by design, not left to drift: every `*Interface.ts`
      // file (ColumnInterface, ResponseInterface, TransportInterface, ...) is
      // a real `interface` — the name says so, and PHP's own interfaces are
      // what they port from — while src/types.ts's Hash/StringHash/ApiCommand
      // are `type` aliases (PHPDoc array shapes have no runtime/file cost in
      // PHP; TS needs one declaration and a plain object-shape alias is it).
      // Forcing one style project-wide fights that split rather than
      // expressing it, so this stylistic rule is off rather than picking a
      // side.
      "@typescript-eslint/consistent-type-definitions": "off",
      // A `_`-prefixed parameter is exempt — the convention used where a
      // brand-hook signature must stay uniform across CNR/IBS but a specific
      // brand doesn't need the argument (e.g. CNR.ResponseParser.parse()'s
      // `_cmd`; IBS's sibling implementation does use it). Everything else,
      // including every other unused parameter and every unused local
      // variable, is still flagged — this is a naming escape hatch, not a
      // blanket exemption for unused arguments.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      // Interpolating a number (an index, a count, a code) is always safe;
      // this codebase does it constantly in error messages and command keys.
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      // This rule wants a literal-returning `get` accessor rewritten as a
      // `readonly` field — exactly the shape the field-initialisation-order
      // trap forbids (see docs/agents/architecture.md#three-traps):
      // AbstractResponse.paginationKeys/sensitiveFields and
      // AbstractSocketConfig.oteUrl/liveUrl must stay accessors because a
      // subclass overriding them as fields would read `undefined` from the
      // base constructor. Off, rather than risk the "fix" reintroducing the
      // exact hazard the port had to design around.
      "@typescript-eslint/class-literal-property-style": "off",
    },
  },
  {
    // Guard specs and cassette fixtures reach past the type system on
    // purpose — reflection-style prototype checks, deliberately malformed
    // input to seam tests, and doubles that must accept `unknown` shapes
    // freely. Relax only the two rules that would otherwise fight the
    // pattern itself; everything else in tests/ stays under strictTypeChecked.
    files: ["tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      // chai's assertion style is property-based (`expect(x).to.be.true`),
      // which this rule reads as a statement with no effect. Idiomatic here.
      "@typescript-eslint/no-unused-expressions": "off",
      // TransportInterface's post()/close() are async by contract even when
      // a specific test double (SpyTransport, an inline fake) has nothing to
      // await — the interface, not the implementation, decides sync/async.
      "@typescript-eslint/require-await": "off",
      // A no-op `async close() {}` on a stub that never opened a connection
      // is the correct body, not an oversight.
      "@typescript-eslint/no-empty-function": "off",
      // The seam-spec idiom is comparing a method reference for *identity*
      // (`Logger.prototype.log === AbstractLogger.prototype.log`) to prove
      // no brand overrides it — never calling it unbound, so the real
      // `this`-loses-its-binding hazard this rule guards against doesn't
      // apply to this pattern.
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    files: ["examples/**/*.ts"],
    rules: {
      // Examples intentionally read like plain scripts, not library code.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
