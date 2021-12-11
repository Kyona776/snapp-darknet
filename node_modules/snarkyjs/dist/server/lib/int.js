import { __decorate, __metadata } from "tslib";
import { Circuit, Field } from '../snarky';
import { CircuitValue, prop } from './circuit_value';
function argToField(name, x) {
    if (typeof x === 'number') {
        if (!Number.isInteger(x)) {
            throw new Error(`${name} expected integer argument. Got ${x}`);
        }
        return new Field(x);
    }
    else {
        return x.value;
    }
}
export class UInt64 extends CircuitValue {
    constructor(value) {
        super();
        this.value = value;
    }
    static get zero() {
        return new UInt64(Field.zero);
    }
    toString() {
        return this.value.toString();
    }
    static check(x) {
        let actual = x.value.rangeCheckHelper(64);
        actual.assertEquals(x.value);
    }
    static MAXINT() {
        return new UInt64(Field.fromJSON(((1n << 64n) - 1n).toString()));
    }
    static fromNumber(x) {
        return new UInt64(argToField('UInt64.fromNumber', x));
    }
    divMod(y) {
        let x = this.value;
        let y_ = argToField('UInt64.div', y);
        if (this.value.isConstant() && y_.isConstant()) {
            let xn = BigInt(x.toString());
            let yn = BigInt(y_.toString());
            let q = xn / yn;
            let r = xn - q * yn;
            return [
                new UInt64(new Field(q.toString())),
                new UInt64(new Field(r.toString())),
            ];
        }
        y_ = y_.seal();
        let q = Circuit.witness(Field, () => new Field((BigInt(x.toString()) / BigInt(y_.toString())).toString()));
        q.rangeCheckHelper(UInt64.NUM_BITS).assertEquals(q);
        // TODO: Could be a bit more efficient
        let r = x.sub(q.mul(y_)).seal();
        r.rangeCheckHelper(UInt64.NUM_BITS).assertEquals(r);
        let r_ = new UInt64(r);
        let q_ = new UInt64(q);
        r_.assertLt(new UInt64(y_));
        return [q_, r_];
    }
    /** Integer division.
     *
     * `x.div(y)` returns the floor of `x / y`, that is, the greatest
     * `z` such that `x * y <= x`.
     *
     */
    div(y) {
        return this.divMod(y)[0];
    }
    /** Integer remainder.
     *
     * `x.mod(y)` returns the value `z` such that `0 <= z < y` and
     * `x - z` is divisble by `y`.
     */
    mod(y) {
        return this.divMod(y)[1];
    }
    /** Multiplication with overflow checking.
     */
    mul(y) {
        let z = this.value.mul(argToField('UInt64.mul', y));
        z.rangeCheckHelper(UInt64.NUM_BITS).assertEquals(z);
        return new UInt64(z);
    }
    /** Addition with overflow checking.
     */
    add(y) {
        let z = this.value.add(argToField('UInt64.add', y));
        z.rangeCheckHelper(UInt64.NUM_BITS).assertEquals(z);
        return new UInt64(z);
    }
    /** Subtraction with underflow checking.
     */
    sub(y) {
        let z = this.value.sub(argToField('UInt64.sub', y));
        z.rangeCheckHelper(UInt64.NUM_BITS).assertEquals(z);
        return new UInt64(z);
    }
    lte(y) {
        let xMinusY = this.value.sub(argToField('UInt64.lte', y)).seal();
        let xMinusYFits = xMinusY.rangeCheckHelper(UInt64.NUM_BITS).equals(xMinusY);
        let yMinusXFits = xMinusY
            .rangeCheckHelper(UInt64.NUM_BITS)
            .equals(xMinusY.neg());
        xMinusYFits.or(yMinusXFits).assertEquals(true);
        // x <= y if y - x fits in 64 bits
        return yMinusXFits;
    }
    assertLte(y) {
        let yMinusX = argToField('UInt64.lt', y).sub(this.value).seal();
        yMinusX.rangeCheckHelper(UInt64.NUM_BITS).assertEquals(yMinusX);
    }
    lt(y) {
        return this.lte(y).and(this.value.equals(y.value).not());
    }
    assertLt(y) {
        this.lt(y).assertEquals(true);
    }
    gt(y) {
        return y.lt(this);
    }
    assertGt(y) {
        y.assertLt(this);
    }
}
UInt64.NUM_BITS = 64;
__decorate([
    prop,
    __metadata("design:type", Field)
], UInt64.prototype, "value", void 0);
export class UInt32 extends CircuitValue {
    constructor(value) {
        super();
        this.value = value;
    }
    static get zero() {
        return new UInt32(Field.zero);
    }
    toString() {
        return this.value.toString();
    }
    static check(x) {
        let actual = x.value.rangeCheckHelper(32);
        actual.assertEquals(x.value);
    }
    static fromNumber(x) {
        return new UInt32(argToField('UInt32.fromNumber', x));
    }
    static MAXINT() {
        return new UInt32(Field.fromJSON(((1n << 32n) - 1n).toString()));
    }
    divMod(y) {
        let x = this.value;
        let y_ = argToField('UInt32.div', y);
        if (this.value.isConstant() && y_.isConstant()) {
            let xn = BigInt(x.toString());
            let yn = BigInt(y_.toString());
            let q = xn / yn;
            let r = xn - q * yn;
            return [
                new UInt32(new Field(q.toString())),
                new UInt32(new Field(r.toString())),
            ];
        }
        y_ = y_.seal();
        let q = Circuit.witness(Field, () => new Field((BigInt(x.toString()) / BigInt(y_.toString())).toString()));
        q.rangeCheckHelper(UInt32.NUM_BITS).assertEquals(q);
        // TODO: Could be a bit more efficient
        let r = x.sub(q.mul(y_)).seal();
        r.rangeCheckHelper(UInt32.NUM_BITS).assertEquals(r);
        let r_ = new UInt32(r);
        let q_ = new UInt32(q);
        r_.assertLt(new UInt32(y_));
        return [q_, r_];
    }
    div(y) {
        const dm = this.divMod(y);
        return dm[0];
    }
    mod(y) {
        return this.divMod(y)[1];
    }
    mul(y) {
        let z = this.value.mul(argToField('UInt32.mul', y));
        z.rangeCheckHelper(UInt32.NUM_BITS).assertEquals(z);
        return new UInt32(z);
    }
    add(y) {
        let z = this.value.add(argToField('UInt32.add', y));
        z.rangeCheckHelper(UInt32.NUM_BITS).assertEquals(z);
        return new UInt32(z);
    }
    sub(y) {
        let z = this.value.sub(argToField('UInt32.sub', y));
        z.rangeCheckHelper(UInt32.NUM_BITS).assertEquals(z);
        return new UInt32(z);
    }
    lte(y) {
        let xMinusY = this.value.sub(argToField('UInt32.lte', y)).seal();
        let xMinusYFits = xMinusY.rangeCheckHelper(UInt32.NUM_BITS).equals(xMinusY);
        let yMinusXFits = xMinusY
            .rangeCheckHelper(UInt32.NUM_BITS)
            .equals(xMinusY.neg());
        xMinusYFits.or(yMinusXFits).assertEquals(true);
        // x <= y if y - x fits in 32 bits
        return yMinusXFits;
    }
    assertLte(y) {
        let yMinusX = argToField('UInt32.lt', y).sub(this.value).seal();
        yMinusX.rangeCheckHelper(UInt32.NUM_BITS).assertEquals(yMinusX);
    }
    lt(y) {
        return this.lte(y).and(this.value.equals(y.value).not());
    }
    assertLt(y) {
        this.lt(y).assertEquals(true);
    }
    gt(y) {
        return y.lt(this);
    }
    assertGt(y) {
        y.assertLt(this);
    }
}
UInt32.NUM_BITS = 32;
__decorate([
    prop,
    __metadata("design:type", Field)
], UInt32.prototype, "value", void 0);
class Sgn extends CircuitValue {
    constructor(value) {
        super();
        this.value = value;
    }
    static check(x) {
        let x_ = x.value.seal();
        x_.mul(x_).assertEquals(Field.one);
    }
    static get Pos() {
        return new Sgn(Field.one);
    }
    static get Neg() {
        return new Sgn(Field.one.neg());
    }
}
__decorate([
    prop,
    __metadata("design:type", Field)
], Sgn.prototype, "value", void 0);
export class Int64 {
    /*
    @prop magnitude: UInt64 | null;
    @prop isPos: Sgn | null;
    */
    constructor(x) {
        this.value = x;
    }
    static check() {
        throw 'todo: int64 check';
    }
    toString() {
        const s = this.value.toString();
        const n = BigInt(s);
        if (n < 1n << 64n) {
            return s;
        }
        else {
            return '-' + this.value.neg().toString();
        }
    }
    static get zero() {
        return new Int64(Field.zero);
    }
    static fromUnsigned(x) {
        return new Int64(x.value);
    }
    static shift() {
        return Field.fromJSON((1n << 64n).toString());
    }
    uint64Value() {
        const n = BigInt(this.value.toString());
        if (n < 1n << 64n) {
            return this.value;
        }
        else {
            const x = this.value.add(Int64.shift());
            return x;
        }
    }
    static sizeInFields() {
        return 1;
    }
    neg() {
        return new Int64(this.value.neg());
    }
    add(y) {
        return new Int64(this.value.add(y.value));
    }
    sub(y) {
        return new Int64(this.value.sub(y.value));
    }
    repr() {
        throw 'repr';
    }
    static toFields(x) {
        return [x.value];
    }
    static ofFields(xs) {
        return new Int64(xs[0]);
    }
    toFields() {
        return Int64.toFields(this);
    }
    sizeInFields() {
        return Int64.sizeInFields();
    }
}
__decorate([
    prop,
    __metadata("design:type", Field)
], Int64.prototype, "value", void 0);
