import { CircuitValue } from './circuit_value';
import { Field, Bool, VerificationKey } from '../snarky';
import { PrivateKey, PublicKey } from './signature';
import { UInt64, UInt32, Int64 } from './int';
export declare type Amount = UInt64;
export declare const Amount: typeof UInt64;
export declare type Balance = UInt64;
export declare const Balance: typeof UInt64;
export declare type Fee = UInt64;
export declare const Fee: typeof UInt64;
export declare type GlobalSlot = UInt32;
export declare const GlobalSlot: typeof UInt32;
export declare type SignedAmount = Int64;
export declare const SignedAmount: typeof Int64;
/**
 * Timing info inside an account.
 */
export declare class Timing {
    initialMinimumBalance: Balance;
    cliffTime: GlobalSlot;
    cliffAmount: Amount;
    vestingPeriod: GlobalSlot;
    vestingIncrement: Amount;
    constructor(initialMinimumBalance: Balance, cliffTime: GlobalSlot, cliffAmount: Amount, vestingPeriod: GlobalSlot, vestingIncrement: Amount);
}
/**
 * Either set a value or keep it the same.
 */
export declare class SetOrKeep<T> {
    set: Bool;
    value: T;
    setValue(x: T): void;
    constructor(set: Bool, value: T);
}
/**
 * Group a value with a hash.
 *
 * @typeParam T the value
 * @typeParam H the hash
 */
export declare type WithHash<T, H> = {
    value: T;
    hash: H;
};
/**
 * One specific permission value.
 *
 * A [[ Perm ]] tells one specific permission for our snapp how it should behave
 * when presented with requested modifications.
 *
 * Use static factory methods on this class to use a specific behavior. See
 * documentation on those methods to learn more.
 */
export declare class Perm {
    constant: Bool;
    signatureNecessary: Bool;
    signatureSufficient: Bool;
    constructor(constant: Bool, signatureNecessary: Bool, signatureSufficient: Bool);
    /**
     * Modification is impossible.
     */
    static impossible(): Perm;
    /**
     * Modification is permitted completely
     * TODO: Is this correct?
     */
    static none(): Perm;
    /**
     * Modification is permitted by proofs within the Snapp only
     */
    static proof(): Perm;
    /**
     * Modification is permitted by signatures using the private key of this
     * account only.
     *
     * TODO: Is this accurate?
     */
    static signature(): Perm;
    /**
     * Modification is permitted by [[ Perm.proof ]] or [[ Perm.signature ]]
     */
    static proofOrSignature(): Perm;
    /**
     * Modification is permitted by only [[ Perm.proof ]] and [[ Perm.signature ]]
     */
    static proofAndSignature(): Perm;
}
/**
 * Permissions specify how specific aspects of the Snapp account are allowed to
 * be modified. Most fields are denominated by a [[ Perm ]].
 */
export declare class Permissions {
    /**
     * True means that this account can stake directly. False means this account
     * cannot.
     *
     * TODO: Is this correct?
     */
    stake: Bool;
    /**
     * The [[ Perm ]] corresponding to the 8 state fields associated with an
     * account.
     */
    editState: Perm;
    /**
     * The [[ Perm ]] corresponding to the ability to send transactions from this
     * account.
     *
     * TODO: Is this correct?
     */
    send: Perm;
    /**
     * The [[ Perm ]] corresponding to the ability to receive transactions to this
     * account.
     *
     * TODO: Is this correct?
     */
    receive: Perm;
    /**
     * The [[ Perm ]] corresponding to the ability to set the delegate field of
     * the account.
     */
    setDelegate: Perm;
    /**
     * The [[ Perm ]] corresponding to the ability to set the permissions field of
     * the account.
     */
    setPermissions: Perm;
    /**
     * The [[ Perm ]] corresponding to the ability to set the verification key
     * associated with the circuit tied to this account. Effectively
     * "upgradability" of the smart contract.
     */
    setVerificationKey: Perm;
    /**
     * The [[ Perm ]] corresponding to the ability to set the snapp uri typically
     * pointing to the source code of the smart contract. Usually this should be
     * changed whenever the [[ Permissions.setVerificationKey ]] is changed.
     * Effectively "upgradability" of the smart contract.
     */
    setSnappUri: Perm;
    /**
     * The [[ Perm ]] corresponding to the ability to change the sequence state
     * associated with the account.
     *
     * TODO: Define sequence state here as well.
     */
    editRollupState: Perm;
    /**
     * The [[ Perm ]] corresponding to the ability to set the token symbol for
     * this account.
     */
    setTokenSymbol: Perm;
    /**
     * Default permissions are:
     *   [[ Permissions.stake ]]=true
     *   [[ Permissions.editState ]]=[[ Perm.proof ]]
     *   [[ Permissions.send ]]=[[ Perm.signature ]]
     *   [[ Permissions.receive ]]=[[ Perm.proof ]]
     *   [[ Permissions.setDelegate ]]=[[ Perm.signature ]]
     *   [[ Permissions.setPermissions ]]=[[ Perm.signature ]]
     *   [[ Permissions.setVerificationKey ]]=[[ Perm.signature ]]
     *   [[ Permissions.setSnappUri ]]=[[ Perm.signature ]]
     *   [[ Permissions.editRollupState ]]=[[ Perm.proof ]]
     *   [[ Permissions.setTokenSymbol ]]=[[ Perm.signature ]]
     */
    static default(): Permissions;
    constructor(stake: Bool, editState: Perm, send: Perm, receive: Perm, setDelegate: Perm, setPermissions: Perm, setVerificationKey: Perm, setSnappUri: Perm, editRollupState: Perm, setTokenSymbol: Perm);
}
export declare class String_ extends CircuitValue {
}
export declare class TokenSymbol extends CircuitValue {
}
export declare class Update {
    appState: Array<SetOrKeep<Field>>;
    delegate: SetOrKeep<PublicKey>;
    verificationKey: SetOrKeep<WithHash<VerificationKey, Field>>;
    permissions: SetOrKeep<Permissions>;
    snappUri: SetOrKeep<String_>;
    tokenSymbol: SetOrKeep<TokenSymbol>;
    timing: SetOrKeep<Timing>;
    constructor(appState: Array<SetOrKeep<Field>>, delegate: SetOrKeep<PublicKey>, verificationKey: SetOrKeep<WithHash<VerificationKey, Field>>, permissions: SetOrKeep<Permissions>, snappUri: SetOrKeep<String_>, tokenSymbol: SetOrKeep<TokenSymbol>, timing: SetOrKeep<Timing>);
}
declare type TokenId = UInt64;
export declare const getDefaultTokenId: () => UInt64;
export declare class Events {
    hash: Field;
    events: Array<Array<Field>>;
    constructor(hash: Field, events: Array<Array<Field>>);
}
export declare class MerkleList<T> {
    constructor();
}
/**
 * The body of describing how some [[ Party ]] should change.
 *
 * TODO: We need to rename this still.
 */
export declare class Body {
    /**
     * The address for this body.
     */
    publicKey: PublicKey;
    /**
     * Specify [[ Update ]]s to tweakable pieces of the account record backing
     * this address in the ledger.
     */
    update: Update;
    /**
     * The TokenId for this account.
     */
    tokenId: TokenId;
    /**
     * By what [[ SignedAmount ]] should the balance of this account change. All
     * deltas must balance by the end of smart contract execution.
     *
     * TODO: Is this correct?
     */
    delta: SignedAmount;
    /**
     * Recent events that have been emitted from this account.
     *
     * TODO: Add a reference to general explanation of events.
     */
    events: Events;
    sequenceEvents: Field;
    callData: MerkleList<Array<Field>>;
    depth: Field;
    /**
     * A body that Don't change part of the underlying account record.
     */
    static keepAll(publicKey: PublicKey): Body;
    constructor(publicKey: PublicKey, update: Update, tokenId: TokenId, delta: SignedAmount, events: Events, sequenceEvents: Field, callData: MerkleList<Array<Field>>, depth: Field);
}
/**
 * Either check a value or ignore it.
 *
 * Used within [[ AccountPredicate ]]s and [[ ProtocolStatePredicate ]]s.
 */
export declare class OrIgnore<A> {
    check: Bool;
    value: A;
    constructor(check: Bool, value: A);
}
/**
 * Gettable and settable state that you can be checked for equality.
 */
export declare abstract class State<A> {
    abstract get(): Promise<A>;
    abstract set(x: A): void;
    abstract assertEquals(x: A): void;
    static init<A>(x: A): State<A>;
    constructor();
}
/**
 * An interval representing all the values between `lower` and `upper` inclusive
 * of both the `lower` and `upper` values.
 *
 * @typeParam A something with an ordering where one can quantify a lower and
 *            upper bound.
 */
export declare class ClosedInterval<A> {
    lower_: A | undefined;
    upper_: A | undefined;
    constructor(lower: A | undefined, upper: A | undefined);
    /**
     * Change this interval to have new lower and upper bounds.
     *
     * @param lower The lower part
     * @param upper The upper part
     */
    assertBetween(lower: A, upper: A): void;
    set lower(x: A);
    get lower(): A;
    set upper(x: A);
    get upper(): A;
}
export declare class EpochLedgerPredicate {
    hash_: OrIgnore<Field>;
    totalCurrency: ClosedInterval<UInt64>;
    constructor(hash_: OrIgnore<Field>, totalCurrency_: ClosedInterval<UInt64>);
}
export declare class EpochDataPredicate {
    ledger: EpochLedgerPredicate;
    seed_: OrIgnore<Field>;
    startCheckpoint_: OrIgnore<Field>;
    lockCheckpoint_: OrIgnore<Field>;
    epochLength: ClosedInterval<UInt32>;
    constructor(ledger: EpochLedgerPredicate, seed_: OrIgnore<Field>, startCheckpoint_: OrIgnore<Field>, lockCheckpoint_: OrIgnore<Field>, epochLength: ClosedInterval<UInt32>);
    get seed(): Field;
    get startCheckpoint(): Field;
    get lockCheckpoint(): Field;
}
export declare class ProtocolStatePredicate {
    snarkedLedgerHash_: OrIgnore<Field>;
    snarkedNextAvailableToken: ClosedInterval<UInt64>;
    timestamp: ClosedInterval<UInt64>;
    blockchainLength: ClosedInterval<UInt32>;
    minWindowDensity: ClosedInterval<UInt32>;
    lastVrfOutput_: OrIgnore<Field>;
    totalCurrency: ClosedInterval<UInt64>;
    globalSlotSinceHardFork: ClosedInterval<UInt32>;
    globalSlotSinceGenesis: ClosedInterval<UInt32>;
    stakingEpochData: EpochDataPredicate;
    nextEpochData: EpochDataPredicate;
    static ignoreAll(): ProtocolStatePredicate;
    constructor(snarkedLedgerHash_: OrIgnore<Field>, snarkedNextAvailableToken: ClosedInterval<UInt64>, timestamp: ClosedInterval<UInt64>, blockchainLength: ClosedInterval<UInt32>, minWindowDensity: ClosedInterval<UInt32>, lastVrfOutput_: OrIgnore<Field>, totalCurrency: ClosedInterval<UInt64>, globalSlotSinceHardFork: ClosedInterval<UInt32>, globalSlotSinceGenesis: ClosedInterval<UInt32>, stakingEpochData: EpochDataPredicate, nextEpochData: EpochDataPredicate);
    get snarkedLedgerHash(): Field;
    get lastVrfOutput(): Field;
}
export declare class AccountPredicate {
    balance: ClosedInterval<UInt64>;
    nonce: ClosedInterval<UInt32>;
    receiptChainHash: OrIgnore<Field>;
    publicKey: OrIgnore<PublicKey>;
    delegate: OrIgnore<PublicKey>;
    state: Array<OrIgnore<Field>>;
    sequenceState: OrIgnore<Field>;
    provedState: OrIgnore<Bool>;
    static ignoreAll(): AccountPredicate;
    constructor(balance: ClosedInterval<UInt64>, nonce: ClosedInterval<UInt32>, receiptChainHash: OrIgnore<Field>, publicKey: OrIgnore<PublicKey>, delegate: OrIgnore<PublicKey>, state: Array<OrIgnore<Field>>, sequenceState: OrIgnore<Field>, provedState: OrIgnore<Bool>);
}
export declare class PartyBalance {
    private body;
    constructor(body: Body);
    addInPlace(x: Int64 | UInt32 | UInt64): void;
    subInPlace(x: Int64 | UInt32 | UInt64): void;
}
export declare class Party<P> {
    body: Body;
    predicate: P;
    constructor(body: Body, predicate: P);
    get balance(): PartyBalance;
    get update(): Update;
    get publicKey(): PublicKey;
    static createUnsigned(publicKey: PublicKey): Party<void>;
    static createSigned(signer: PrivateKey): Promise<Party<UInt32>>;
}
export {};
