import { CircuitValue } from './circuit_value';
import { Group, Field, Bool } from '../snarky';
import { PublicKey } from './signature';
import { UInt64, UInt32, Int64 } from './int';
import * as Mina from './mina';
export const Amount = UInt64;
export const Balance = UInt64;
export const Fee = UInt64;
export const GlobalSlot = UInt32;
export const SignedAmount = Int64;
const SnappStateLength = 8;
/**
 * Timing info inside an account.
 */
export class Timing {
    constructor(initialMinimumBalance, cliffTime, cliffAmount, vestingPeriod, vestingIncrement) {
        this.initialMinimumBalance = initialMinimumBalance;
        this.cliffTime = cliffTime;
        this.cliffAmount = cliffAmount;
        this.vestingPeriod = vestingPeriod;
        this.vestingIncrement = vestingIncrement;
    }
}
/**
 * Either set a value or keep it the same.
 */
export class SetOrKeep {
    constructor(set, value) {
        this.set = set;
        this.value = value;
    }
    setValue(x) {
        this.set = new Bool(true);
        this.value = x;
    }
}
/**
 * One specific permission value.
 *
 * A [[ Perm ]] tells one specific permission for our snapp how it should behave
 * when presented with requested modifications.
 *
 * Use static factory methods on this class to use a specific behavior. See
 * documentation on those methods to learn more.
 */
export class Perm {
    constructor(constant, signatureNecessary, signatureSufficient) {
        this.constant = constant;
        this.signatureNecessary = signatureNecessary;
        this.signatureSufficient = signatureSufficient;
    }
    /**
     * Modification is impossible.
     */
    static impossible() {
        return new Perm(new Bool(true), new Bool(true), new Bool(false));
    }
    /**
     * Modification is permitted completely
     * TODO: Is this correct?
     */
    static none() {
        return new Perm(new Bool(true), new Bool(false), new Bool(true));
    }
    /**
     * Modification is permitted by proofs within the Snapp only
     */
    static proof() {
        return new Perm(new Bool(false), new Bool(false), new Bool(false));
    }
    /**
     * Modification is permitted by signatures using the private key of this
     * account only.
     *
     * TODO: Is this accurate?
     */
    static signature() {
        return new Perm(new Bool(false), new Bool(true), new Bool(true));
    }
    /**
     * Modification is permitted by [[ Perm.proof ]] or [[ Perm.signature ]]
     */
    static proofOrSignature() {
        return new Perm(new Bool(false), new Bool(false), new Bool(true));
    }
    /**
     * Modification is permitted by only [[ Perm.proof ]] and [[ Perm.signature ]]
     */
    static proofAndSignature() {
        return new Perm(new Bool(false), new Bool(true), new Bool(false));
    }
}
/**
 * Permissions specify how specific aspects of the Snapp account are allowed to
 * be modified. Most fields are denominated by a [[ Perm ]].
 */
export class Permissions {
    constructor(stake, editState, send, receive, setDelegate, setPermissions, setVerificationKey, setSnappUri, editRollupState, setTokenSymbol) {
        this.stake = stake;
        this.editState = editState;
        this.send = send;
        this.receive = receive;
        this.setDelegate = setDelegate;
        this.setPermissions = setPermissions;
        this.setVerificationKey = setVerificationKey;
        this.setSnappUri = setSnappUri;
        this.editRollupState = editRollupState;
        this.setTokenSymbol = setTokenSymbol;
    }
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
    static default() {
        return new Permissions(new Bool(true), Perm.proof(), Perm.signature(), Perm.proof(), Perm.signature(), Perm.signature(), Perm.signature(), Perm.signature(), Perm.proof(), Perm.signature());
    }
}
/* TODO: How should we handle "String"s, should we bridge them from OCaml? */
export class String_ extends CircuitValue {
}
export class TokenSymbol extends CircuitValue {
}
export class Update {
    constructor(appState, delegate, verificationKey, permissions, snappUri, tokenSymbol, timing) {
        this.appState = appState;
        this.delegate = delegate;
        this.verificationKey = verificationKey;
        this.permissions = permissions;
        this.snappUri = snappUri;
        this.tokenSymbol = tokenSymbol;
        this.timing = timing;
    }
}
export const getDefaultTokenId = () => new UInt64(Field.one);
// TODO
export class Events {
    // TODO
    constructor(hash, events) {
        this.hash = hash;
        this.events = events;
    }
}
// TODO
export class MerkleList {
    constructor() { }
}
/**
 * The body of describing how some [[ Party ]] should change.
 *
 * TODO: We need to rename this still.
 */
export class Body {
    constructor(publicKey, update, tokenId, delta, events, sequenceEvents, callData, depth) {
        this.publicKey = publicKey;
        this.update = update;
        this.tokenId = tokenId;
        this.delta = delta;
        this.events = events;
        this.sequenceEvents = sequenceEvents;
        this.callData = callData;
        this.depth = depth;
    }
    /**
     * A body that Don't change part of the underlying account record.
     */
    static keepAll(publicKey) {
        function keep(dummy) {
            return new SetOrKeep(new Bool(false), dummy);
        }
        const appState = [];
        for (let i = 0; i < SnappStateLength; ++i) {
            appState.push(keep(Field.zero));
        }
        const update = new Update(appState, keep(new PublicKey(Group.generator)), keep({ hash: Field.zero, value: undefined }), keep(Permissions.default()), keep(undefined), keep(undefined), keep(undefined));
        return new Body(publicKey, update, getDefaultTokenId(), Int64.zero, new Events(Field.zero, []), Field.zero, new MerkleList(), Field.zero);
    }
}
/**
 * Either check a value or ignore it.
 *
 * Used within [[ AccountPredicate ]]s and [[ ProtocolStatePredicate ]]s.
 */
export class OrIgnore {
    constructor(check, value) {
        this.check = check;
        this.value = value;
    }
}
/**
 * Gettable and settable state that you can be checked for equality.
 */
export class State {
    static init(x) {
        class Init extends State {
            constructor() {
                super();
                this.value = x;
            }
            get() {
                throw 'init:unimplemented';
            }
            set(_) {
                throw 'init:unimplmented';
            }
            assertEquals(_) {
                throw 'init:unimplemented';
            }
        }
        return new Init();
    }
    constructor() { }
}
/**
 * An interval representing all the values between `lower` and `upper` inclusive
 * of both the `lower` and `upper` values.
 *
 * @typeParam A something with an ordering where one can quantify a lower and
 *            upper bound.
 */
export class ClosedInterval {
    constructor(lower, upper) {
        this.lower_ = lower;
        this.upper_ = upper;
    }
    /**
     * Change this interval to have new lower and upper bounds.
     *
     * @param lower The lower part
     * @param upper The upper part
     */
    assertBetween(lower, upper) {
        this.lower = lower;
        this.upper = upper;
    }
    set lower(x) {
        this.lower_ = x;
    }
    get lower() {
        if (this.lower_ === undefined) {
            throw new Error('Cannot get lower before it was set.');
        }
        else {
            return this.lower_;
        }
    }
    set upper(x) {
        this.upper_ = x;
    }
    get upper() {
        if (this.upper_ === undefined) {
            throw new Error('Cannot get upper before it was set.');
        }
        else {
            return this.upper_;
        }
    }
}
export class EpochLedgerPredicate {
    constructor(hash_, totalCurrency_) {
        this.hash_ = hash_;
        this.totalCurrency = totalCurrency_;
    }
}
export class EpochDataPredicate {
    constructor(ledger, seed_, startCheckpoint_, lockCheckpoint_, epochLength) {
        this.ledger = ledger;
        this.seed_ = seed_;
        this.startCheckpoint_ = startCheckpoint_;
        this.lockCheckpoint_ = lockCheckpoint_;
        this.epochLength = epochLength;
    }
    // TODO: Should return promise
    get seed() {
        if (this.seed_.value === null) {
            throw new Error('Cannot get seed before it was set.');
        }
        else {
            return this.seed_.value;
        }
    }
    get startCheckpoint() {
        if (this.startCheckpoint_.value === null) {
            throw new Error('Cannot get startCheckpoint before it was set.');
        }
        else {
            return this.startCheckpoint_.value;
        }
    }
    get lockCheckpoint() {
        if (this.lockCheckpoint_.value === null) {
            throw new Error('Cannot get lockCheckpoint before it was set.');
        }
        else {
            return this.lockCheckpoint_.value;
        }
    }
}
export class ProtocolStatePredicate {
    constructor(snarkedLedgerHash_, snarkedNextAvailableToken, timestamp, blockchainLength, minWindowDensity, lastVrfOutput_, totalCurrency, globalSlotSinceHardFork, globalSlotSinceGenesis, stakingEpochData, nextEpochData) {
        this.snarkedLedgerHash_ = snarkedLedgerHash_;
        this.snarkedNextAvailableToken = snarkedNextAvailableToken;
        this.timestamp = timestamp;
        this.blockchainLength = blockchainLength;
        this.minWindowDensity = minWindowDensity;
        this.lastVrfOutput_ = lastVrfOutput_;
        this.totalCurrency = totalCurrency;
        this.globalSlotSinceHardFork = globalSlotSinceHardFork;
        this.globalSlotSinceGenesis = globalSlotSinceGenesis;
        this.stakingEpochData = stakingEpochData;
        this.nextEpochData = nextEpochData;
    }
    static ignoreAll() {
        const ledger = new EpochLedgerPredicate(ignore(Field.zero), uint64());
        const epochData = new EpochDataPredicate(ledger, ignore(Field.zero), ignore(Field.zero), ignore(Field.zero), uint32());
        return new ProtocolStatePredicate(ignore(Field.zero), uint64(), uint64(), uint32(), uint32(), ignore(Field.zero), uint64(), uint32(), uint32(), epochData, epochData);
    }
    get snarkedLedgerHash() {
        this.snarkedLedgerHash_.check = new Bool(true);
        if (this.snarkedLedgerHash_.value === null) {
            throw new Error('Cannot get snarkedLedgerHash before it was set.');
        }
        else {
            return this.snarkedLedgerHash_.value;
        }
    }
    get lastVrfOutput() {
        this.lastVrfOutput_.check = new Bool(true);
        if (this.lastVrfOutput_.value === null) {
            throw new Error('Cannot get lastVrfOutput before it was set.');
        }
        else {
            return this.lastVrfOutput_.value;
        }
    }
}
/**
 * Ignores a `dummy`
 *
 * @param dummy The value to ignore
 * @returns Always an ignored value regardless of the input.
 */
function ignore(dummy) {
    return new OrIgnore(new Bool(false), dummy);
}
/*
function check<A>(dummy: A): OrIgnore<A> {
  return new OrIgnore(new Optional(new Bool(true), dummy));
} */
/**
 * Ranges between all uint32 values
 */
const uint32 = () => new ClosedInterval(UInt32.fromNumber(0), UInt32.MAXINT());
/**
 * Ranges between all uint64 values
 */
const uint64 = () => new ClosedInterval(UInt64.fromNumber(0), UInt64.MAXINT());
export class AccountPredicate {
    constructor(balance, nonce, receiptChainHash, publicKey, delegate, state, sequenceState, provedState) {
        this.balance = balance;
        this.nonce = nonce;
        this.receiptChainHash = receiptChainHash;
        this.publicKey = publicKey;
        this.delegate = delegate;
        this.state = state;
        this.sequenceState = sequenceState;
        this.provedState = provedState;
    }
    static ignoreAll() {
        let appState = [];
        for (let i = 0; i < SnappStateLength; ++i) {
            appState.push(ignore(Field.zero));
        }
        return new AccountPredicate(uint64(), uint32(), ignore(Field.zero), ignore(new PublicKey(Group.generator)), ignore(new PublicKey(Group.generator)), appState, ignore(Field.zero), ignore(new Bool(false)));
    }
}
export class PartyBalance {
    constructor(body) {
        this.body = body;
    }
    addInPlace(x) {
        this.body.delta = this.body.delta.add(x);
    }
    subInPlace(x) {
        this.body.delta = this.body.delta.sub(x);
    }
}
export class Party {
    constructor(body, predicate) {
        this.body = body;
        this.predicate = predicate;
    }
    get balance() {
        return new PartyBalance(this.body);
    }
    get update() {
        return this.body.update;
    }
    get publicKey() {
        return this.body.publicKey;
    }
    static createUnsigned(publicKey) {
        // TODO: This should be a witness block that uses the setVariable
        // API to set the value of a variable after it's allocated
        const pk = publicKey;
        const body = Body.keepAll(pk);
        if (Mina.currentTransaction === undefined) {
            throw new Error('Party.createUnsigned: Cannot run outside of a transaction');
        }
        const party = new Party(body, undefined);
        Mina.currentTransaction.nextPartyIndex++;
        Mina.currentTransaction.parties.push(party);
        return party;
    }
    static createSigned(signer) {
        // TODO: This should be a witness block that uses the setVariable
        // API to set the value of a variable after it's allocated
        const pk = signer.toPublicKey();
        const body = Body.keepAll(pk);
        return Mina.getAccount(pk).then((a) => {
            if (Mina.currentTransaction === undefined) {
                throw new Error('Party.createSigned: Cannot run outside of a transaction');
            }
            if (a == null) {
                throw new Error('Party.createSigned: Account not found');
            }
            const party = new Party(body, a.nonce);
            Mina.currentTransaction.nextPartyIndex++;
            Mina.currentTransaction.parties.push(party);
            return party;
        });
    }
}
