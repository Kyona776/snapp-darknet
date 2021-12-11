import 'reflect-metadata';
import { Field, Bool, JSONValue } from '../snarky';
declare type Constructor<T> = {
    new (...args: any[]): T;
};
export declare type Tuple<A, _N extends number> = Array<A>;
export declare function asFieldElementsToConstant<T>(typ: AsFieldElements<T>, t: T): T;
export declare abstract class CircuitValue {
    static sizeInFields(): number;
    static toFields<T>(this: Constructor<T>, v: T): Field[];
    toFields(): Field[];
    toJSON(): JSONValue;
    equals(this: this, x: typeof this): Bool;
    assertEquals(this: this, x: typeof this): void;
    static ofFields<T>(this: Constructor<T>, xs: Field[]): T;
    static toConstant<T>(this: Constructor<T>, t: T): T;
    static toJSON<T>(this: Constructor<T>, v: T): JSONValue;
    static fromJSON<T>(this: Constructor<T>, value: JSONValue): T | null;
}
export declare function prop(this: any, target: any, key: string): void;
export declare function arrayProp<T>(eltTyp: AsFieldElements<T>, length: number): (target: any, key: string) => void;
export declare function matrixProp<T>(eltTyp: AsFieldElements<T>, nRows: number, nColumns: number): (target: any, key: string) => void;
export declare function public_(target: any, _key: string | symbol, index: number): void;
declare type AsFieldElements<A> = {
    sizeInFields: () => number;
    toFields: (x: A) => Array<any>;
    ofFields: (x: Array<any>) => A;
};
export declare function circuitMain(target: any, propertyName: string, _descriptor?: PropertyDescriptor): any;
export {};
