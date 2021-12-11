import { AsFieldElements, Field } from '../snarky';
import { CircuitValue } from './circuit_value';
export declare class MerkleStack<A extends CircuitValue> {
    commitment: Field;
    eltTyp: AsFieldElements<A>;
    values: {
        computed: true;
        value: Array<[A, Field]>;
    } | {
        computed: false;
        f: () => Array<[A, Field]>;
    };
    static pushCommitment<B extends CircuitValue>(x: B, comm: Field): Field;
    constructor(eltTyp: AsFieldElements<A>, f: () => Array<[A, Field]>);
    getValues(): Array<[A, Field]>;
    pop(): A;
}
