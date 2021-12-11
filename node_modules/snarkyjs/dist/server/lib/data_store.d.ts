import { Index } from './merkle_proof';
import { AsFieldElements, Field } from '../snarky';
import { MerkleProof } from './merkle_proof';
export interface DataStore<A, P> {
    depth: number;
    getValue: (index: Index) => A | null;
    getIndex: (x: A) => Index | null;
    getProof: (index: Index) => P;
    nextIndex: () => Index;
    set: (index: Index, a: A) => void;
    commitment: () => Field;
}
export interface KeyedDataStore<K, V, P> {
    depth: number;
    nextIndex: () => Index;
    getIndex: (x: K) => Index | null;
    getProof: (index: Index) => P;
    getValue(k: K): {
        value: V;
        empty: boolean;
    };
    setValue(k: K, v: V): void;
    commitment(): Field;
}
export declare class Keyed {
    static InMemory<K, V>(eltTyp: AsFieldElements<V>, keyTyp: AsFieldElements<K>, key: (v: V) => K, depth: number): KeyedDataStore<K, V, MerkleProof>;
}
export declare function IPFS<A>(eltTyp: AsFieldElements<A>, ipfsRoot: string): DataStore<A, MerkleProof>;
export declare function InMemory<A>(eltTyp: AsFieldElements<A>, depth: number): DataStore<A, MerkleProof>;
export declare function OnDisk<A>(eltTyp: AsFieldElements<A>, path: string): DataStore<A, MerkleProof>;
