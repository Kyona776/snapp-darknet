import 'reflect-metadata';
import { Circuit } from '../snarky';
export function asFieldElementsToConstant(typ, t) {
    const xs = typ.toFields(t);
    return typ.ofFields(xs);
}
// TODO: Synthesize the constructor if possible (bkase)
//
export class CircuitValue {
    static sizeInFields() {
        const fields = this.prototype._fields;
        return fields.reduce((acc, [_, typ]) => acc + typ.sizeInFields(), 0);
    }
    static toFields(v) {
        const res = [];
        const fields = this.prototype._fields;
        if (fields === undefined || fields === null) {
            return res;
        }
        for (let i = 0, n = fields.length; i < n; ++i) {
            const [key, propType] = fields[i];
            const subElts = propType.toFields(v[key]);
            subElts.forEach((x) => res.push(x));
        }
        return res;
    }
    toFields() {
        return this.constructor.toFields(this);
    }
    toJSON() {
        return this.constructor.toJSON(this);
    }
    equals(x) {
        return Circuit.equal(this, x);
    }
    assertEquals(x) {
        Circuit.assertEqual(this, x);
    }
    static ofFields(xs) {
        const fields = this.prototype._fields;
        let offset = 0;
        const props = [];
        for (let i = 0; i < fields.length; ++i) {
            const propType = fields[i][1];
            const propSize = propType.sizeInFields();
            const propVal = propType.ofFields(xs.slice(offset, offset + propSize));
            props.push(propVal);
            offset += propSize;
        }
        return new this(...props);
    }
    static toConstant(t) {
        const xs = this.toFields(t);
        return this.ofFields(xs.map((x) => x.toConstant()));
    }
    static toJSON(v) {
        const res = {};
        if (this.prototype._fields !== undefined) {
            const fields = this.prototype._fields;
            fields.forEach(([key, propType]) => {
                res[key] = propType.toJSON(v[key]);
            });
        }
        return res;
    }
    static fromJSON(value) {
        const props = [];
        const fields = this.prototype._fields;
        switch (typeof value) {
            case 'object':
                if (value === null || Array.isArray(value)) {
                    return null;
                }
                break;
            default:
                return null;
        }
        if (fields !== undefined) {
            for (let i = 0; i < fields.length; ++i) {
                const [key, propType] = fields[i];
                if (value[key] === undefined) {
                    return null;
                }
                else {
                    props.push(propType.fromJSON(value[key]));
                }
            }
        }
        return new this(...props);
    }
}
CircuitValue.check = function (v) {
    const fields = this.prototype._fields;
    if (fields === undefined || fields === null) {
        return;
    }
    for (let i = 0; i < fields.length; ++i) {
        const [key, propType] = fields[i];
        const value = v[key];
        if (propType.check != undefined) {
            propType.check(value);
        }
    }
};
export function prop(target, key) {
    const fieldType = Reflect.getMetadata('design:type', target, key);
    if (target._fields === undefined || target._fields === null) {
        target._fields = [];
    }
    if (fieldType === undefined) {
    }
    else if (fieldType.toFields && fieldType.ofFields) {
        target._fields.push([key, fieldType]);
    }
    else {
        console.log(`warning: property ${key} missing field element conversion methods`);
    }
}
export function arrayProp(eltTyp, length) {
    return function (target, key) {
        // const fieldType = Reflect.getMetadata('design:type', target, key);
        if (target._fields === undefined || target._fields === null) {
            target._fields = [];
        }
        target._fields.push([key, Circuit.array(eltTyp, length)]);
    };
}
export function matrixProp(eltTyp, nRows, nColumns) {
    return function (target, key) {
        // const fieldType = Reflect.getMetadata('design:type', target, key);
        target._fields ?? (target._fields = []);
        target._fields.push([
            key,
            Circuit.array(Circuit.array(eltTyp, nColumns), nRows),
        ]);
    };
}
export function public_(target, _key, index) {
    // const fieldType = Reflect.getMetadata('design:paramtypes', target, key);
    if (target._public === undefined) {
        target._public = [];
    }
    target._public.push(index);
}
function typOfArray(typs) {
    return {
        sizeInFields: () => {
            return typs.reduce((acc, typ) => acc + typ.sizeInFields(), 0);
        },
        toFields: (t) => {
            if (t.length !== typs.length) {
                throw new Error(`typOfArray: Expected ${typs.length}, got ${t.length}`);
            }
            let res = [];
            for (let i = 0; i < t.length; ++i) {
                res.push(...typs[i].toFields(t[i]));
            }
            return res;
        },
        ofFields: (xs) => {
            let offset = 0;
            let res = [];
            typs.forEach((typ) => {
                const n = typ.sizeInFields();
                res.push(typ.ofFields(xs.slice(offset, offset + n)));
                offset += n;
            });
            return res;
        },
    };
}
export function circuitMain(target, propertyName, _descriptor) {
    const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyName);
    const numArgs = paramTypes.length;
    const publicIndexSet = new Set(target._public);
    const witnessIndexSet = new Set();
    for (let i = 0; i < numArgs; ++i) {
        if (!publicIndexSet.has(i)) {
            witnessIndexSet.add(i);
        }
    }
    target.snarkyMain = (w, pub) => {
        let args = [];
        for (let i = 0; i < numArgs; ++i) {
            args.push((publicIndexSet.has(i) ? pub : w).shift());
        }
        return target[propertyName].apply(target, args);
    };
    target.snarkyWitnessTyp = typOfArray(Array.from(witnessIndexSet).map((i) => paramTypes[i]));
    target.snarkyPublicTyp = typOfArray(Array.from(publicIndexSet).map((i) => paramTypes[i]));
}
