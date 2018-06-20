export type Data = { type: string, name: string, value: any }[];

export function typedSignatureHash(typedData: Data): Buffer;

export function signTypedData(privateKey: Buffer, msgParams: { data: Data }): string;

export type Recover = {data: Data, sig: string};
export function recoverTypedSignature(rec: Recover): string;
