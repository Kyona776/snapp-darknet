import { Proof } from '../snarky';
export declare function proofSystem(target: any): any;
export declare function branch(target: any, propertyName: string, _descriptor?: PropertyDescriptor): any;
export declare class ProofWithInput<A> {
    publicInput: A;
    proof: Proof | null;
    assertVerifies(): void;
    constructor(publicInput: A);
}
