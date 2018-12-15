import * as ethSigUtil from "eth-sig-util";
import * as ethUtil from "ethereumjs-util";

export type TypedData = { type: string, name: string, value: any }[]

export function hashTypedData(typedData: TypedData) {
    return ethUtil.toBuffer(ethSigUtil.typedSignatureHash(typedData));
}

export function signTypedData(typedData: TypedData, privateKey: Buffer) {
    return ethSigUtil.signTypedData(privateKey, {data: typedData});
}

export function recoverTypedData(typedData: TypedData, signature: string) {
    return ethUtil.toChecksumAddress(ethSigUtil.recoverTypedSignature({data: typedData, sig: signature}));
}
