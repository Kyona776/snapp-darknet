import { Bool } from '../snarky';
export declare class Optional<T> {
    isSome: Bool;
    value: T;
    constructor(isSome: Bool, value: T);
}
