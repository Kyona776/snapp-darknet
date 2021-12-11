import { __decorate, __metadata } from "tslib";
import { Poseidon, Group, Field, Bool, Scalar } from '../snarky';
import { prop, CircuitValue } from './circuit_value';
/**
 * A signing key. You can generate one via [[random]].
 */
export class PrivateKey extends CircuitValue {
    constructor(s) {
        super();
        this.s = s;
    }
    /**
     * You can use this method to generate a private key. You can then obtain
     * the associated public key via [[toPublicKey]]. And generate signatures
     * via [[Signature.create]].
     *
     * @returns a new [[PrivateKey]].
     */
    static random() {
        return new PrivateKey(Scalar.random());
    }
    /**
     * Deserializes a list of bits into a [[PrivateKey]].
     *
     * @param bs a list of [[Bool]]s.
     * @returns a [[PrivateKey]].
     */
    static ofBits(bs) {
        return new PrivateKey(Scalar.ofBits(bs));
    }
    /**
     * Derives the associated public key.
     *
     * @returns a [[PublicKey]].
     */
    toPublicKey() {
        return new PublicKey(Group.generator.scale(this.s));
    }
}
__decorate([
    prop,
    __metadata("design:type", Scalar)
], PrivateKey.prototype, "s", void 0);
export class PublicKey extends CircuitValue {
    constructor(g) {
        super();
        this.g = g;
    }
    static fromPrivateKey(p) {
        return p.toPublicKey();
    }
}
__decorate([
    prop,
    __metadata("design:type", Group)
], PublicKey.prototype, "g", void 0);
export class Signature extends CircuitValue {
    constructor(r, s) {
        super();
        this.r = r;
        this.s = s;
    }
    static create(privKey, msg) {
        const { g: publicKey } = PublicKey.fromPrivateKey(privKey);
        const d = privKey.s;
        const kPrime = Scalar.random();
        let { x: r, y: ry } = Group.generator.scale(kPrime);
        const k = ry.toBits()[0].toBoolean() ? kPrime.neg() : kPrime;
        const e = Scalar.ofBits(Poseidon.hash(msg.concat([publicKey.x, publicKey.y, r])).toBits());
        const s = e.mul(d).add(k);
        return new Signature(r, s);
    }
    verify(publicKey, msg) {
        const pubKey = publicKey.g;
        let e = Scalar.ofBits(Poseidon.hash(msg.concat([pubKey.x, pubKey.y, this.r])).toBits());
        let r = pubKey.scale(e).neg().add(Group.generator.scale(this.s));
        return Bool.and(r.x.equals(this.r), r.y.toBits()[0].equals(false));
    }
}
__decorate([
    prop,
    __metadata("design:type", Field)
], Signature.prototype, "r", void 0);
__decorate([
    prop,
    __metadata("design:type", Scalar)
], Signature.prototype, "s", void 0);
