import { Circuit, Field, Poseidon } from '../snarky';
// TODO: Implement AsFieldElements
export class MerkleStack {
    constructor(eltTyp, f) {
        this.values = { computed: false, f };
        this.eltTyp = eltTyp;
        // TODO
        this.commitment = Field.zero;
    }
    static pushCommitment(x, comm) {
        return Poseidon.hash([comm].concat(x.toFields()));
    }
    getValues() {
        if (this.values.computed === true) {
            return this.values.value;
        }
        else {
            let v = this.values.f();
            this.values = { computed: true, value: v };
            return v;
        }
    }
    pop() {
        this.commitment.isZero().assertEquals(false);
        let tail = Circuit.witness(Field, () => {
            let xs = this.getValues();
            let [_, tl] = xs[xs.length - 1];
            return tl;
        });
        let value = Circuit.witness(this.eltTyp, () => {
            let xs = this.getValues();
            let last = xs.pop();
            if (last === undefined) {
                throw new Error('pop from empty list');
            }
            return last[0];
        });
        this.commitment.assertEquals(MerkleStack.pushCommitment(value, tail));
        this.commitment = tail;
        return value;
    }
}
