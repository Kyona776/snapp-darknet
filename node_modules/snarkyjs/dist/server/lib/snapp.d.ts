import { Field, AsFieldElements } from '../snarky';
import { CircuitValue } from './circuit_value';
import { AccountPredicate, ProtocolStatePredicate, Body, Party, PartyBalance } from './party';
import { PublicKey } from './signature';
import { UInt32 } from './int';
/**
 * A decorator to use within a snapp to indicate what will be stored on-chain.
 * For example, if you want to store a field element `some_state` in a snapp,
 * you can use the following in the declaration of your snapp:
 *
 * ```
 * @state(Field) some_state: Field;
 * ```
 *
 */
export declare function state<A>(ty: AsFieldElements<A>): (target: any, key: string, _descriptor?: PropertyDescriptor | undefined) => any;
/**
 * A decorator to use in a snapp to mark a method as callable by anyone.
 * You can use inside your snapp class as:
 *
 * ```
 * @method async my_method(some_arg: Field) {
 *  // your code here
 * }
 * ```
 */
export declare function method(target: any, propertyName: string, _descriptor?: PropertyDescriptor): any;
export declare function init(target: any, propertyName: string, _descriptor?: PropertyDescriptor): any;
declare type ExecutionState = {
    transactionId: number;
    partyIndex: number;
    party: Party<AccountPredicate>;
    protocolStatePredicate: ProtocolStatePredicate;
};
/**
 * The main snapp class. To write a snapp, extend this class as such:
 *
 * ```
 * class YourSmartContract extends SmartContract {
 *   // your smart contract code here
 * }
 * ```
 *
 */
export declare abstract class SmartContract {
    address: PublicKey;
    _executionState: ExecutionState | undefined;
    constructor(address: PublicKey);
    executionState(): ExecutionState;
    get protocolState(): ProtocolStatePredicate;
    get self(): Party<AccountPredicate>;
    get balance(): PartyBalance;
    get nonce(): Promise<UInt32>;
    static fromAddress(address: PublicKey): SmartContract;
    party(i: number): Body;
    transactionHash(): Field;
    emitEvent<T extends CircuitValue>(x: T): void;
}
export {};
