import { Field, FullAccountPredicate_ as FullAccountPredicate } from '../snarky';
import { UInt32, UInt64 } from './int';
import { PrivateKey, PublicKey } from './signature';
import { Body, ProtocolStatePredicate } from './party';
export interface TransactionId {
    wait(): Promise<void>;
}
export interface Transaction {
    send(): TransactionId;
}
interface SnappAccount {
    appState: Array<Field>;
}
interface Account {
    balance: UInt64;
    nonce: UInt32;
    snapp: SnappAccount;
}
export declare let nextTransactionId: {
    value: number;
};
declare type PartyPredicate = UInt32 | FullAccountPredicate | void;
export declare let currentTransaction: {
    sender: PrivateKey;
    parties: Array<{
        body: Body;
        predicate: PartyPredicate;
    }>;
    nextPartyIndex: number;
    protocolState: ProtocolStatePredicate;
} | undefined;
interface Mina {
    transaction(sender: PrivateKey, f: () => void | Promise<void>): Transaction;
    currentSlot(): UInt32;
    getAccount(publicKey: PublicKey): Promise<Account>;
}
interface MockMina extends Mina {
    addAccount(publicKey: PublicKey, balance: number): void;
    /**
     * An array of 10 test accounts that have been pre-filled with
     * 30000000000 units of currency.
     */
    testAccounts: Array<{
        publicKey: PublicKey;
        privateKey: PrivateKey;
    }>;
}
/**
 * A mock Mina blockchain running locally and useful for testing.
 */
export declare const LocalBlockchain: () => MockMina;
/**
 * Set the currently used Mina instance.
 */
export declare function setActiveInstance(m: Mina): void;
/**
 * Construct a smart contract transaction. Within the callback passed to this function,
 * you can call into the methods of smart contracts.
 *
 * ```typescript
 * transaction(async () => {
 *   await mySmartContract.update();
 *   await someOtherContract.someOtherMethod();
 * })
 * ```
 *
 * @return A transaction that can subsequently be submitted to the chain.
 */
export declare function transaction(sender: PrivateKey, f: () => void | Promise<void>): Transaction;
/**
 * @return The current slot number, according to the active Mina instance.
 */
export declare function currentSlot(): UInt32;
/**
 * @return The account data associated to the given public key.
 */
export declare function getAccount(pubkey: PublicKey): Promise<Account>;
/**
 * @return The balance associated to the given public key.
 */
export declare function getBalance(pubkey: PublicKey): Promise<UInt64>;
export {};
