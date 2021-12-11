import { Index } from './merkle_proof';
import { Field } from '../snarky';
import { Tree, MerkleProofFactory, } from './merkle_proof';
import { Poseidon } from '../snarky';
import { Circuit, Bool } from '../snarky';
export class Keyed {
    static InMemory(eltTyp, keyTyp, key, depth) {
        const keyTable = new Map();
        const P = MerkleProofFactory(depth);
        const I = Index[depth];
        const t = new Tree(depth, (x) => Poseidon.hash(eltTyp.toFields(x)), []);
        let nextIdx = 0;
        let indexes = new Map();
        let dummy = (() => {
            const n = eltTyp.sizeInFields();
            const xs = [];
            for (var i = 0; i < n; ++i) {
                xs.push(Field.zero);
            }
            return eltTyp.ofFields(xs);
        })();
        const getValue = (k) => {
            const h = Poseidon.hash(keyTyp.toFields(k));
            const r = indexes.get(h.toString());
            const empty = { value: dummy, empty: true };
            if (r === undefined) {
                return empty;
            }
            else {
                const res = t.get(r).value;
                return res === null ? empty : { value: res, empty: false };
            }
        };
        const getProof = (i) => {
            console.log('getproof');
            const p = t.getMerklePath(i.value.map((b) => b.toBoolean()));
            console.log('getproof');
            return new P(p);
        };
        const commitment = () => t.root();
        const getIndex = (k) => {
            const h = Poseidon.hash(keyTyp.toFields(k)).toString();
            const r = indexes.get(h);
            if (r === undefined) {
                return null;
            }
            else {
                return new I(r.map((b) => new Bool(b)));
            }
        };
        const nextIndex = () => {
            const n = nextIdx;
            nextIdx += 1;
            return I.fromInt(n);
        };
        const setValue = (k, v) => {
            console.log('setvalu');
            const h = Poseidon.hash(keyTyp.toFields(k)).toString();
            const idx_ = indexes.get(h);
            let idx = idx_ === undefined ? nextIndex().value.map((b) => b.toBoolean()) : idx_;
            indexes.set(h, idx);
            console.log('setvalu');
            t.setValue(idx, v, Poseidon.hash(eltTyp.toFields(v)));
        };
        return {
            depth,
            nextIndex,
            getIndex,
            getProof,
            getValue,
            setValue,
            commitment,
        };
    }
}
export function IPFS(eltTyp, ipfsRoot) {
    throw 'ipfs';
}
export function InMemory(eltTyp, depth) {
    const P = MerkleProofFactory(depth);
    const I = Index[depth];
    const t = new Tree(depth, (x) => Poseidon.hash(eltTyp.toFields(x)), []);
    let nextIdx = 0;
    let indexes = new Map();
    const getValue = (i) => t.get(i.value.map((b) => b.toBoolean())).value;
    const getProof = (i) => {
        console.log('mgetproof');
        const p = t.getMerklePath(i.value.map((b) => b.toBoolean()));
        console.log('mgetproof');
        return new P(p);
    };
    const set = (i, x) => {
        Circuit.asProver(() => {
            console.log('mset');
            const idx = i.value.map((b) => b.toBoolean());
            const h = Poseidon.hash(eltTyp.toFields(x));
            console.log('mset');
            indexes.set(h.toString(), idx);
            t.setValue(idx, x, h);
        });
    };
    const commitment = () => t.root();
    const getIndex = (x) => {
        const h = Poseidon.hash(eltTyp.toFields(x));
        const r = indexes.get(h.toString());
        if (r === undefined) {
            return null;
        }
        else {
            return new I(r.map((b) => new Bool(b)));
        }
        /*
        const y = asFieldElementsToConstant<A>(eltTyp, x);
        y.toFields() */
    };
    const nextIndex = () => {
        const n = nextIdx;
        nextIdx += 1;
        return I.fromInt(n);
    };
    return { getValue, getIndex, getProof, nextIndex, set, commitment, depth };
}
export function OnDisk(eltTyp, path) {
    throw 'ondisk';
}
