import { CircuitValue } from './circuit_value';
import { Bool, Field, AsFieldElements } from '../snarky';
import { Optional } from './optional';
import { DataStore, KeyedDataStore } from './data_store';
export declare class AccumulatorMembershipProof {
    merkleProof: MerkleProof;
    index: Index;
    constructor(merkleProof: MerkleProof, index: Index);
    verify<T extends CircuitValue>(commitment: Field, x: T): Bool;
}
export declare function MerkleAccumulatorFactory<A extends CircuitValue>(depth: number): {
    new (root: Field): {
        root: Field;
        _store: DataStore<A, MerkleProof> | null;
        toFields(): Field[];
        store: DataStore<A, {
            path: Field[];
            verify(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): Bool;
            assertVerifies(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): void;
        }>;
        commitment(): Field;
        check(x: A, p: AccumulatorMembershipProof): Bool;
        getMembershipProof(x: A): AccumulatorMembershipProof | null;
        add(x: A): AccumulatorMembershipProof;
    };
    fromStore(s: DataStore<A, MerkleProof>): {
        root: Field;
        _store: DataStore<A, MerkleProof> | null;
        toFields(): Field[];
        store: DataStore<A, {
            path: Field[];
            verify(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): Bool;
            assertVerifies(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): void;
        }>;
        commitment(): Field;
        check(x: A, p: AccumulatorMembershipProof): Bool;
        getMembershipProof(x: A): AccumulatorMembershipProof | null;
        add(x: A): AccumulatorMembershipProof;
    };
    sizeInFields(): number;
    toFields(x: {
        root: Field;
        _store: DataStore<A, MerkleProof> | null;
        toFields(): Field[];
        store: DataStore<A, {
            path: Field[];
            verify(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): Bool;
            assertVerifies(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): void;
        }>;
        commitment(): Field;
        check(x: A, p: AccumulatorMembershipProof): Bool;
        getMembershipProof(x: A): AccumulatorMembershipProof | null;
        add(x: A): AccumulatorMembershipProof;
    }): Field[];
    ofFields(xs: Field[]): {
        root: Field;
        _store: DataStore<A, MerkleProof> | null;
        toFields(): Field[];
        store: DataStore<A, {
            path: Field[];
            verify(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): Bool;
            assertVerifies(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): void;
        }>;
        commitment(): Field;
        check(x: A, p: AccumulatorMembershipProof): Bool;
        getMembershipProof(x: A): AccumulatorMembershipProof | null;
        add(x: A): AccumulatorMembershipProof;
    };
};
export declare abstract class IndexedAccumulator<A> extends CircuitValue {
    commitment: Field;
    constructor(commitment: Field);
    abstract set(index: Index, a: A): void;
    abstract get(index: Index): A;
}
export declare function KeyedAccumulatorFactory<K extends CircuitValue, V extends CircuitValue>(depth: number): {
    new (root: Field): {
        root: Field;
        _store: KeyedDataStore<K, V, MerkleProof> | null;
        key: (v: V) => K;
        cachedPaths: Map<IndexId, Array<Field>>;
        cachedValues: Map<IndexId, {
            value: V;
            hash: Field;
        }>;
        toFields(): Field[];
        store: KeyedDataStore<K, V, {
            path: Field[];
            verify(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): Bool;
            assertVerifies(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): void;
        }>;
        commitment(): Field;
        set(proof: AccumulatorMembershipProof, value: V): void;
        get(key: K): [Optional<V>, AccumulatorMembershipProof];
    };
    create(key: (v: V) => K, store: KeyedDataStore<K, V, MerkleProof>): {
        root: Field;
        _store: KeyedDataStore<K, V, MerkleProof> | null;
        key: (v: V) => K;
        cachedPaths: Map<IndexId, Array<Field>>;
        cachedValues: Map<IndexId, {
            value: V;
            hash: Field;
        }>;
        toFields(): Field[];
        store: KeyedDataStore<K, V, {
            path: Field[];
            verify(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): Bool;
            assertVerifies(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): void;
        }>;
        commitment(): Field;
        set(proof: AccumulatorMembershipProof, value: V): void;
        get(key: K): [Optional<V>, AccumulatorMembershipProof];
    };
    sizeInFields(): number;
    toFields(x: {
        root: Field;
        _store: KeyedDataStore<K, V, MerkleProof> | null;
        key: (v: V) => K;
        cachedPaths: Map<IndexId, Array<Field>>;
        cachedValues: Map<IndexId, {
            value: V;
            hash: Field;
        }>;
        toFields(): Field[];
        store: KeyedDataStore<K, V, {
            path: Field[];
            verify(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): Bool;
            assertVerifies(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): void;
        }>;
        commitment(): Field;
        set(proof: AccumulatorMembershipProof, value: V): void;
        get(key: K): [Optional<V>, AccumulatorMembershipProof];
    }): Field[];
    ofFields(xs: Field[]): {
        root: Field;
        _store: KeyedDataStore<K, V, MerkleProof> | null;
        key: (v: V) => K;
        cachedPaths: Map<IndexId, Array<Field>>;
        cachedValues: Map<IndexId, {
            value: V;
            hash: Field;
        }>;
        toFields(): Field[];
        store: KeyedDataStore<K, V, {
            path: Field[];
            verify(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): Bool;
            assertVerifies(root: Field, index: {
                toFields(): Field[];
                id: number;
                value: Bool[];
            }, leaf: Field): void;
        }>;
        commitment(): Field;
        set(proof: AccumulatorMembershipProof, value: V): void;
        get(key: K): [Optional<V>, AccumulatorMembershipProof];
    };
};
export declare class IndexBase {
    id: IndexId;
    value: Array<Bool>;
    constructor(value: Array<Bool>);
}
export declare function MerkleProofFactory(depth: number): {
    new (path: Array<Field>): {
        path: Field[];
        verify(root: Field, index: {
            toFields(): Field[];
            id: number;
            value: Bool[];
        }, leaf: Field): Bool;
        assertVerifies(root: Field, index: {
            toFields(): Field[];
            id: number;
            value: Bool[];
        }, leaf: Field): void;
    };
    sizeInFields(): number;
    toFields(x: {
        path: Field[];
        verify(root: Field, index: {
            toFields(): Field[];
            id: number;
            value: Bool[];
        }, leaf: Field): Bool;
        assertVerifies(root: Field, index: {
            toFields(): Field[];
            id: number;
            value: Bool[];
        }, leaf: Field): void;
    }): Array<Field>;
    ofFields(xs: Array<Field>): {
        path: Field[];
        verify(root: Field, index: {
            toFields(): Field[];
            id: number;
            value: Bool[];
        }, leaf: Field): Bool;
        assertVerifies(root: Field, index: {
            toFields(): Field[];
            id: number;
            value: Bool[];
        }, leaf: Field): void;
    };
};
export declare function IndexFactory(depth: number): {
    new (value: Array<Bool>): {
        toFields(): Field[];
        id: number;
        value: Bool[];
    };
    sizeInFields(): number;
    fromInt(n: number): {
        toFields(): Field[];
        id: number;
        value: Bool[];
    };
    ofFields(xs: Field[]): {
        toFields(): Field[];
        id: number;
        value: Bool[];
    };
    toFields(i: {
        toFields(): Field[];
        id: number;
        value: Bool[];
    }): Field[];
    check(i: {
        toFields(): Field[];
        id: number;
        value: Bool[];
    }): void;
};
export declare const MerkleProof: {
    new (path: Array<Field>): {
        path: Array<Field>;
        verify(root: Field, index: Index, leaf: Field): Bool;
        assertVerifies(root: Field, index: Index, leaf: Field): void;
    };
    sizeInFields(): number;
    toFields(x: {
        path: Array<Field>;
        verify(root: Field, index: Index, leaf: Field): Bool;
        assertVerifies(root: Field, index: Index, leaf: Field): void;
    }): Array<Field>;
    ofFields(xs: Array<Field>): {
        path: Array<Field>;
        verify(root: Field, index: Index, leaf: Field): Bool;
        assertVerifies(root: Field, index: Index, leaf: Field): void;
    };
}[];
export declare const Index: {
    new (value: Array<Bool>): {
        toFields(): Field[];
        id: IndexId;
        value: Array<Bool>;
    };
    sizeInFields(): number;
    fromInt(n: number): {
        toFields(): Field[];
        id: IndexId;
        value: Array<Bool>;
    };
    ofFields(xs: Field[]): {
        toFields(): Field[];
        id: IndexId;
        value: Array<Bool>;
    };
    toFields(i: {
        toFields(): Field[];
        id: IndexId;
        value: Array<Bool>;
    }): Field[];
    check(i: {
        toFields(): Field[];
        id: IndexId;
        value: Array<Bool>;
    }): void;
}[];
export declare type MerkleProof = InstanceType<typeof MerkleProof[0]>;
export declare type Index = InstanceType<typeof Index[0]>;
declare type IndexId = number;
declare type BinTree<A> = {
    kind: 'empty';
    hash: Field;
    depth: number;
} | {
    kind: 'leaf';
    hash: Field;
    value: A;
} | {
    kind: 'node';
    hash: Field;
    left: BinTree<A>;
    right: BinTree<A>;
};
export declare class Tree<A> {
    value: BinTree<A>;
    constructor(depth: number, hashElement: (a: A) => Field, values: Array<A>);
    root(): Field;
    setValue(index: Array<boolean>, x: A, eltHash: Field): void;
    get(index: Array<boolean>): {
        value: A | null;
        hash: Field;
    };
    getValue(index: Array<boolean>): A | null;
    getElementHash(index: Array<boolean>): Field;
    getMerklePath(index: Array<boolean>): Array<Field>;
}
export interface MerkleTree<A> {
    setValue: (index: Array<boolean>, x: A, eltHash: Field) => void;
    getValue: (index: Array<boolean>) => A | null;
    getElementHash: (index: Array<boolean>) => Field;
    getMerklePath: (index: Array<boolean>) => Array<Field>;
    root: () => Field;
}
export declare class Collection<A> {
    eltTyp: AsFieldElements<A>;
    values: {
        computed: true;
        value: MerkleTree<A>;
    } | {
        computed: false;
        f: () => MerkleTree<A>;
    };
    cachedPaths: Map<IndexId, Array<Field>>;
    cachedValues: Map<IndexId, {
        value: A;
        hash: Field;
    }>;
    root: Field | null;
    getRoot(): Field;
    constructor(eltTyp: AsFieldElements<A>, f: () => Tree<A>, root?: Field);
    private getValues;
    set(i: Index, x: A): void;
    get(i: Index): A;
}
export {};
