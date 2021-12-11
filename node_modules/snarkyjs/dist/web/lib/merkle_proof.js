import { __decorate, __metadata } from "tslib";
import { CircuitValue, prop } from './circuit_value';
import { Bool, Field, Circuit, Poseidon, } from '../snarky';
import { Optional } from './optional';
let indexId = 0;
export class AccumulatorMembershipProof {
    constructor(merkleProof, index) {
        this.merkleProof = merkleProof;
        this.index = index;
    }
    verify(commitment, x) {
        let leaf = Poseidon.hash(x.toFields());
        return this.merkleProof.verify(commitment, this.index, leaf);
    }
}
export function MerkleAccumulatorFactory(depth) {
    const I = Index[depth];
    const P = MerkleProof[depth];
    return class MerkleAccumulator {
        constructor(root) {
            this.root = root;
            this._store = null;
        }
        static fromStore(s) {
            const a = new MerkleAccumulator(s.commitment());
            a.store = s;
            return a;
        }
        static sizeInFields() {
            return 1;
        }
        static toFields(x) {
            return [x.root];
        }
        static ofFields(xs) {
            return new MerkleAccumulator(xs[0]);
        }
        toFields() {
            return MerkleAccumulator.toFields(this);
        }
        get store() {
            if (this._store === null) {
                throw new Error('MerkleAccumulator.store not set');
            }
            else {
                return this._store;
            }
        }
        set store(s) {
            if (s.depth !== depth) {
                throw new Error(`Store had depth ${s.depth} but contract expects ${depth}`);
            }
            this._store = s;
        }
        commitment() {
            return this.root;
        }
        check(x, p) {
            return p.verify(this.commitment(), x);
        }
        // Happens outside the circuit
        getMembershipProof(x) {
            const idx = this.store.getIndex(x);
            if (idx === null) {
                return null;
            }
            else {
                return new AccumulatorMembershipProof(this.store.getProof(idx), idx);
            }
        }
        add(x) {
            let idx = Circuit.witness(I, () => this.store.nextIndex());
            let path = Circuit.witness(P, () => this.store.getProof(idx));
            // Checks that this is a path to an empty leaf
            impliedRoot(idx.value, path.path, emptyHash(0)).assertEquals(this.root);
            const newLeaf = Poseidon.hash(x.toFields());
            this.root = impliedRoot(idx.value, path.path, newLeaf);
            if (Circuit.inProver()) {
                Circuit.asProver(() => {
                    this.store.set(idx, x);
                });
            }
            else {
                this.store.set(idx, x);
            }
            return new AccumulatorMembershipProof(path, idx);
        }
    };
}
export class IndexedAccumulator extends CircuitValue {
    constructor(commitment) {
        super();
        this.commitment = commitment;
    }
}
__decorate([
    prop,
    __metadata("design:type", Field)
], IndexedAccumulator.prototype, "commitment", void 0);
export function KeyedAccumulatorFactory(depth) {
    const I = Index[depth];
    const P = MerkleProof[depth];
    return class KeyedAccumulator {
        constructor(root) {
            this.root = root;
            this._store = null;
            this.cachedPaths = new Map();
            this.cachedValues = new Map();
            this.key = (_) => {
                throw new Error('uninitialized');
            };
        }
        static create(key, store) {
            const a = new KeyedAccumulator(store.commitment());
            a._store = store;
            return a;
        }
        static sizeInFields() {
            return 1;
        }
        static toFields(x) {
            return [x.root];
        }
        static ofFields(xs) {
            return new KeyedAccumulator(xs[0]);
        }
        toFields() {
            return KeyedAccumulator.toFields(this);
        }
        get store() {
            if (this._store === null) {
                throw new Error('MerkleAccumulator.store not set');
            }
            else {
                return this._store;
            }
        }
        set store(s) {
            if (s.depth !== depth) {
                throw new Error(`Store had depth ${s.depth} but contract expects ${depth}`);
            }
            this._store = s;
        }
        commitment() {
            return this.root;
        }
        // TODO: Make this work
        set(proof, value) {
            this.store.setValue(this.key(value), value);
        }
        // TODO: Rework this to work INSIDE the circuit
        get(key) {
            let idx_ = this.store.getIndex(key);
            let isSome = new Bool(idx_ !== null);
            let idx = idx_ === null ? this.store.nextIndex() : idx_;
            let { value, empty } = this.store.getValue(key);
            // TODO: empty should equal not isSome
            const o = new Optional(isSome, value);
            const p = this.store.getProof(idx);
            return [o, new AccumulatorMembershipProof(p, idx)];
        }
    };
}
export class IndexBase {
    constructor(value) {
        this.value = value;
        this.id = indexId++;
    }
}
class MerkleProofBase {
    constructor(path) {
        this.path = path;
    }
    verify(root, index, leaf) {
        return root.equals(impliedRoot(index.value, this.path, leaf));
    }
    assertVerifies(root, index, leaf) {
        checkMerklePath(root, index.value, this.path, leaf);
    }
}
export function MerkleProofFactory(depth) {
    return class MerkleProof extends MerkleProofBase {
        constructor(path) {
            super(path);
        }
        static sizeInFields() {
            return depth;
        }
        static toFields(x) {
            return x.path;
        }
        static ofFields(xs) {
            if (xs.length !== depth) {
                throw new Error(`MerkleTree: ofFields expected array of length ${depth}, got ${xs.length}`);
            }
            return new MerkleProof(xs);
        }
    };
}
export function IndexFactory(depth) {
    return class Index extends IndexBase {
        constructor(value) {
            super(value);
        }
        static sizeInFields() {
            return depth;
        }
        static fromInt(n) {
            if (n >= 1 << depth) {
                throw new Error('Index is too large');
            }
            let res = [];
            for (let i = 0; i < depth; ++i) {
                res.push(new Bool(((n >> i) & 1) === 1));
            }
            return new Index(res);
        }
        static ofFields(xs) {
            return new Index(xs.map((x) => Bool.Unsafe.ofField(x)));
        }
        toFields() {
            return Index.toFields(this);
        }
        static toFields(i) {
            return i.value.map((b) => b.toField());
        }
        static check(i) {
            i.value.forEach((b) => b.toField().assertBoolean());
        }
    };
}
function range(n) {
    let res = [];
    for (let i = 0; i < n; ++i) {
        res.push(i);
    }
    return res;
}
export const MerkleProof = range(128).map(MerkleProofFactory);
export const Index = range(128).map(IndexFactory);
// TODO: Put better value
const emptyHashes = [];
function emptyHash(depth) {
    if (emptyHashes.length === 0)
        emptyHashes.push(new Field(1234561789));
    if (depth >= emptyHashes.length) {
        for (let i = emptyHashes.length; i < depth + 1; ++i) {
            const h = emptyHashes[i - 1];
            emptyHashes.push(Poseidon.hash([h, h]));
        }
    }
    return emptyHashes[depth];
}
function treeOfArray(depth, hashElement, xs) {
    if (xs.length === 0) {
        return emptyTree(depth);
    }
    if (xs.length > 1 << depth) {
        throw new Error(`Length of elements (${xs.length}) is greater than 2^depth = ${1 << depth}`);
    }
    let trees = xs.map((x) => ({
        kind: 'leaf',
        hash: hashElement(x),
        value: x,
    }));
    for (let treesDepth = 0; treesDepth < depth; ++treesDepth) {
        const newTrees = [];
        for (let j = 0; j < trees.length >> 1; ++j) {
            const left = trees[2 * j];
            const right = trees[2 * j + 1] || emptyTree(treesDepth);
            newTrees.push({
                kind: 'node',
                hash: Poseidon.hash([left.hash, right.hash]),
                left,
                right,
            });
        }
        trees = newTrees;
    }
    console.assert(trees.length === 1);
    return trees[0];
}
function impliedRoot(index, path, leaf) {
    let impliedRoot = leaf;
    for (let i = 0; i < index.length; ++i) {
        let [left, right] = Circuit.if(index[i], [path[i], impliedRoot], [impliedRoot, path[i]]);
        impliedRoot = Poseidon.hash([left, right]);
    }
    return impliedRoot;
}
function checkMerklePath(root, index, path, leaf) {
    root.assertEquals(impliedRoot(index, path, leaf));
}
function emptyTree(depth) {
    return { kind: 'empty', depth, hash: emptyHash(depth) };
}
export class Tree {
    constructor(depth, hashElement, values) {
        this.value = treeOfArray(depth, hashElement, values);
    }
    root() {
        return this.value.hash;
    }
    setValue(index, x, eltHash) {
        let stack = [];
        let tree = this.value;
        for (let i = index.length - 1; i >= 0; --i) {
            stack.push(tree);
            switch (tree.kind) {
                case 'leaf':
                    throw new Error('Tree/index depth mismatch');
                case 'empty':
                    tree.kind = 'node';
                    tree.left = emptyTree(tree.depth - 1);
                    tree.right = emptyTree(tree.depth - 1);
                    delete tree.depth;
                    tree = index[i] ? tree.right : tree.left;
                    break;
                case 'node':
                    tree = index[i] ? tree.right : tree.left;
                    break;
                default:
                    throw 'unreachable';
            }
        }
        switch (tree.kind) {
            case 'empty':
                tree.kind = 'leaf';
                tree.value = x;
                delete tree.depth;
                tree.hash = eltHash;
                break;
            case 'leaf':
                tree.hash = eltHash;
                tree.value = x;
                break;
            default:
                break;
        }
        for (let i = stack.length - 1; i >= 0; --i) {
            tree = stack[i];
            if (tree.kind !== 'node') {
                throw 'unreachable';
            }
            tree.hash = Poseidon.hash([tree.left.hash, tree.right.hash]);
        }
    }
    get(index) {
        let tree = this.value;
        let i = index.length - 1;
        for (let i = index.length - 1; i >= 0; --i) {
            switch (tree.kind) {
                case 'empty':
                    return { value: null, hash: tree.hash };
                case 'leaf':
                    return tree;
                case 'node':
                    tree = index[i] ? tree.right : tree.left;
                    break;
                default:
                    break;
            }
        }
        throw new Error('Malformed merkle tree');
    }
    getValue(index) {
        return this.get(index).value;
    }
    getElementHash(index) {
        return this.get(index).hash;
    }
    getMerklePath(index) {
        let res = [];
        let tree = this.value;
        let keepGoing = true;
        let i = index.length - 1;
        for (let i = index.length - 1; i >= 0; --i) {
            switch (tree.kind) {
                case 'empty':
                    res.push(emptyHash(i));
                    break;
                case 'node':
                    res.push(index[i] ? tree.left.hash : tree.right.hash);
                    tree = index[i] ? tree.right : tree.left;
                    break;
                case 'leaf':
                    throw new Error('Index/tree length mismatch.');
                default:
                    throw 'unreachable';
            }
        }
        res.reverse();
        return res;
    }
}
function constantIndex(xs) {
    console.log('constantindex');
    return xs.map((b) => b.toBoolean());
}
export class Collection {
    constructor(eltTyp, f, root) {
        this.eltTyp = eltTyp;
        this.cachedPaths = new Map();
        this.cachedValues = new Map();
        this.values = { computed: false, f };
        this.root = null;
    }
    getRoot() {
        if (this.root === null) {
            this.root = this.getValues().root();
        }
        return this.root;
    }
    getValues() {
        if (this.values.computed) {
            return this.values.value;
        }
        else {
            let value = this.values.f();
            this.values = { computed: true, value };
            return value;
        }
    }
    set(i, x) {
        let cachedPath = this.cachedPaths.get(i.id);
        let path;
        if (cachedPath !== undefined) {
            path = cachedPath;
        }
        else {
            let depth = i.value.length;
            let typ = Circuit.array(Field, depth);
            let oldEltHash = Circuit.witness(Field, () => this.getValues().getElementHash(constantIndex(i.value)));
            path = Circuit.witness(typ, () => {
                return this.getValues().getMerklePath(constantIndex(i.value));
            });
            checkMerklePath(this.getRoot(), i.value, path, oldEltHash);
        }
        let eltHash = Poseidon.hash(this.eltTyp.toFields(x));
        // Must clear the caches as we don't know if other indices happened to be equal to this one.
        this.cachedPaths.clear();
        this.cachedValues.clear();
        this.cachedPaths.set(i.id, path);
        this.cachedValues.set(i.id, { value: x, hash: eltHash });
        let newRoot = impliedRoot(i.value, path, eltHash);
        Circuit.asProver(() => {
            this.getValues().setValue(constantIndex(i.value), x, eltHash.toConstant());
        });
        this.root = newRoot;
    }
    get(i) {
        let cached = this.cachedValues.get(i.id);
        if (cached !== undefined) {
            return cached.value;
        }
        let depth = i.value.length;
        let typ = Circuit.array(Field, depth);
        let merkleProof = Circuit.witness(typ, () => {
            return this.getValues().getMerklePath(constantIndex(i.value));
        });
        let res = Circuit.witness(this.eltTyp, () => {
            let res = this.getValues().getValue(constantIndex(i.value));
            if (res === null) {
                throw new Error('Index not present in collection');
            }
            return res;
        });
        let eltHash = Poseidon.hash(this.eltTyp.toFields(res));
        this.cachedValues.set(i.id, { value: res, hash: eltHash });
        this.cachedPaths.set(i.id, merkleProof);
        checkMerklePath(this.getRoot(), i.value, merkleProof, eltHash);
        return res;
    }
}
