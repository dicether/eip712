// EIP 712 encoding
// Most taken from https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.js

import * as ethSigUtil from "eth-sig-util";
import * as abi from "ethereumjs-abi";
import * as ethUtil from "ethereumjs-util";

export type TypeEntry = {name: string; type: string};
export type Type = TypeEntry[];
export type Types = {[id: string]: Type};

export type Domain = {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string | Buffer;
};

export type SubData = {[id: string]: SubData} | string | Buffer | number | number[] | undefined;

export type Data = {[id: string]: SubData};

export type TypedData = {
    types: Types;
    primaryType: string;
    domain: Domain;
    message: Data;
};

const PRIMITIVE_TYPES = [
    /^bytes[0-9]|[0-2][0-9]|3[0-2]$/,
    /^(?:uint)8|16|32|64|128|256$/,
    /^(?:int)8|16|32|64|128|256$/,
    /^address$/,
    /^bool$/,
    /^bytes$/,
    /^string$/,
];

function isPrimitiveType(type: string) {
    return PRIMITIVE_TYPES.some((regex) => regex.test(type));
}

// Recursively finds all the dependencies of a type
function dependencies(primaryType: string, types: Types, found: string[] = []) {
    if (found.includes(primaryType)) {
        return found;
    }
    if (types[primaryType] === undefined) {
        if (!isPrimitiveType(primaryType)) {
            throw Error(`${primaryType} is not a primitive type!`);
        }
        return found;
    }
    found.push(primaryType);
    for (const field of types[primaryType]) {
        for (const dep of dependencies(field.type, types, found)) {
            if (!found.includes(dep)) {
                found.push(dep);
            }
        }
    }
    return found;
}

function encodeType(primaryType: string, types: Types) {
    // Get dependencies primary first, then alphabetical
    let deps = dependencies(primaryType, types);
    deps = deps.filter((t) => t !== primaryType);
    deps = [primaryType].concat(deps.sort());

    // Format as a string with fields
    let result = "";
    for (const depType of deps) {
        result += `${depType}(${types[depType].map(({name, type}) => `${type} ${name}`).join(",")})`;
    }

    return result;
}

function typeHash(primaryType: string, types: Types) {
    return ethUtil.sha3(encodeType(primaryType, types));
}

function encodeData(primaryType: string, types: Types, data: Data) {
    const encTypes = [];
    const encValues = [];

    // Add typehash
    encTypes.push("bytes32");
    encValues.push(typeHash(primaryType, types));

    // Add field contents
    for (const field of types[primaryType]) {
        const value = data[field.name];
        if (value === undefined) {
            throw Error(`Invalid typed data! Data for ${field.name} not found!`);
        }

        if (field.type === "string" || field.type === "bytes") {
            encTypes.push("bytes32");
            const valueHash = ethUtil.sha3(value as string | Buffer);
            encValues.push(valueHash);
        } else if (types[field.type] !== undefined) {
            encTypes.push("bytes32");
            const valueHash = ethUtil.sha3(encodeData(field.type, types, value as Data));
            encValues.push(valueHash);
        } else if (field.type.lastIndexOf("]") === field.type.length - 1) {
            throw new Error("Arrays currently not implemented!");
        } else {
            if (!isPrimitiveType(field.type)) {
                throw Error(`Invalid primitive type ${field.type}`);
            }

            encTypes.push(field.type);
            encValues.push(value);
        }
    }

    return abi.rawEncode(encTypes, encValues);
}

function structHash(primaryType: string, types: Types, data: Data): Buffer {
    return ethUtil.sha3(encodeData(primaryType, types, data)) as Buffer;
}

export function hashTypedData(typedData: TypedData): Buffer {
    return ethUtil.sha3(
        Buffer.concat([
            Buffer.from("1901", "hex"),
            structHash("EIP712Domain", typedData.types, typedData.domain),
            structHash(typedData.primaryType, typedData.types, typedData.message),
        ])
    ) as Buffer;
}

export function signTypedData(typedData: TypedData, privateKey: Buffer): string {
    const hash = hashTypedData(typedData);
    const sig = ethUtil.ecsign(hash, privateKey);
    return ethSigUtil.concatSig(sig.v, sig.r, sig.s);
}

export function recoverTypedData(typedData: TypedData, signature: string): string {
    const hash = hashTypedData(typedData);
    const sigParams = ethUtil.fromRpcSig(signature);
    const pubKey = ethUtil.ecrecover(hash, sigParams.v, sigParams.r, sigParams.s);
    const address = ethUtil.pubToAddress(pubKey);
    return ethUtil.toChecksumAddress(ethUtil.bufferToHex(address));
}
