import { Bool, Field } from '../snarky';
import { CircuitValue } from './circuit_value';
export declare class UInt64 extends CircuitValue {
    value: Field;
    static get zero(): UInt64;
    constructor(value: Field);
    toString(): string;
    static check(x: UInt64): void;
    static MAXINT(): UInt64;
    static fromNumber(x: number): UInt64;
    static NUM_BITS: number;
    divMod(y: UInt64 | number): [UInt64, UInt64];
    /** Integer division.
     *
     * `x.div(y)` returns the floor of `x / y`, that is, the greatest
     * `z` such that `x * y <= x`.
     *
     */
    div(y: UInt64 | number): UInt64;
    /** Integer remainder.
     *
     * `x.mod(y)` returns the value `z` such that `0 <= z < y` and
     * `x - z` is divisble by `y`.
     */
    mod(y: UInt64 | number): UInt64;
    /** Multiplication with overflow checking.
     */
    mul(y: UInt64 | number): UInt64;
    /** Addition with overflow checking.
     */
    add(y: UInt64 | number): UInt64;
    /** Subtraction with underflow checking.
     */
    sub(y: UInt64 | number): UInt64;
    lte(y: UInt64): Bool;
    assertLte(y: UInt64): void;
    lt(y: UInt64): Bool;
    assertLt(y: UInt64): void;
    gt(y: UInt64): Bool;
    assertGt(y: UInt64): void;
}
export declare class UInt32 extends CircuitValue {
    value: Field;
    static get zero(): UInt32;
    constructor(value: Field);
    toString(): string;
    static check(x: UInt32): void;
    static fromNumber(x: number): UInt32;
    static NUM_BITS: number;
    static MAXINT(): UInt32;
    divMod(y: UInt32 | number): [UInt32, UInt32];
    div(y: UInt32 | number): UInt32;
    mod(y: UInt32 | number): UInt32;
    mul(y: UInt32 | number): UInt32;
    add(y: UInt32 | number): UInt32;
    sub(y: UInt32 | number): UInt32;
    lte(y: UInt32): Bool;
    assertLte(y: UInt32): void;
    lt(y: UInt32): Bool;
    assertLt(y: UInt32): void;
    gt(y: UInt32): Bool;
    assertGt(y: UInt32): void;
}
declare class Sgn extends CircuitValue {
    value: Field;
    static check(x: Sgn): void;
    constructor(value: Field);
    static get Pos(): Sgn;
    static get Neg(): Sgn;
}
export declare class Int64 {
    value: Field;
    static check(): void;
    constructor(x: Field);
    toString(): string;
    static get zero(): Int64;
    static fromUnsigned(x: UInt64): Int64;
    private static shift;
    uint64Value(): Field;
    static sizeInFields(): number;
    neg(): Int64;
    add(y: Int64 | UInt32 | UInt64): Int64;
    sub(y: Int64 | UInt32 | UInt64): Int64;
    repr(): {
        magnitude: Field;
        isPos: Sgn;
    };
    static toFields(x: Int64): Field[];
    static ofFields(xs: Field[]): Int64;
    toFields(): Field[];
    sizeInFields(): number;
}
export {};
