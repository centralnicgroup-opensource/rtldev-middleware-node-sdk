/**
 * Typings for dirty-chai 
 * @note Requires @types/chai to be installed
 * @author Nick Wronski <https://github.com/nwronski>
 */

/* tslint:disable:interface-name callable-types */
declare namespace Chai {
    export interface LanguageChains {
        always: Assertion;
    }

    export interface Assertion {
        /**
         * This is required because you cannot redeclare the type of previously-declared property on
         * an interface.
         * @see {@link https://stackoverflow.com/a/41286276}
         */
        (message?: string): Assertion;
    }
}

declare module 'dirty-chai' {
    function dirtyChai(chai: any, utils: any): void;
    namespace dirtyChai { }
    export = dirtyChai;
}