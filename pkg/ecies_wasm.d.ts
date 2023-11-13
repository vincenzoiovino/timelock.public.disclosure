/* tslint:disable */
/* eslint-disable */
/**
* Generate a `(SecretKey, PublicKey)` pair
* @returns {Array<any>}
*/
export function generateKeypair(): Array<any>;
/**
* Encrypt a message by a public key
* @param {Uint8Array} pk
* @param {Uint8Array} msg
* @returns {Uint8Array}
*/
export function encrypt(pk: Uint8Array, msg: Uint8Array): Uint8Array;
/**
* Decrypt a message by a secret key
* @param {Uint8Array} sk
* @param {Uint8Array} msg
* @returns {Uint8Array}
*/
export function decrypt(sk: Uint8Array, msg: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly generateKeypair: () => number;
  readonly encrypt: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly decrypt: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
