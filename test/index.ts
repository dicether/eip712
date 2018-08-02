import {expect} from "chai";
import {toBuffer} from "ethereumjs-util";


import {
    recoverTypedData,
    recoverTypedDataOld,
    signTypedData,
    signTypedDataOld,
    typedDataHash,
    typedDataHashOld
} from "../src";


describe("old typeData spec", () => {
    it('typedSignatureHash', () => {
        const typedData = [
            {
                type: 'string',
                name: 'message',
                value: 'Hi, Alice!'
            },
            {
                type: 'uint8',
                name: 'value',
                value: 10
            },
        ];

        const hash = typedDataHashOld(typedData);
        const refHash = toBuffer('0xf7ad23226db5c1c00ca0ca1468fd49c8f8bbc1489bc1c382de5adc557a69c229');

        expect(hash).to.deep.equal(refHash);
    });

    it("signTypedData and recoverTypedSignature old", () => {
        const address = '0x29C76e6aD8f28BB1004902578Fb108c507Be341b';
        const privKeyHex = '4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0';

        const privKey = Buffer.from(privKeyHex, 'hex');

        const typedData = [
            {
                type: 'string',
                name: 'message',
                value: 'Hi, Alice!'
            },
            {
                type: 'uint8',
                name: 'value',
                value: 10
            },
        ];

        const signature = signTypedDataOld(typedData, privKey);
        const recovered = recoverTypedDataOld(typedData, signature);

        expect(recovered).to.equal(address);
    })
});

const testTypedData = {
    types: {
        EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' }
        ],
        Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' }
        ],
    },
    primaryType: 'Mail',
    domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    message: {
        from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
    },
};

describe("typeData spec", () => {
    it('typedSignatureHash', () => {
        const hash = typedDataHash(testTypedData);
        const hashRef = toBuffer('0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2');

        expect(hash).to.deep.equal(hashRef);
    });

    it('signTypedData and recoverTypedSignature', () => {
        const address = '0x29C76e6aD8f28BB1004902578Fb108c507Be341b';
        const privKeyHex = '4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0';
        const refSig = '0x6788ed43187435f321349f4a8736c989062431c45e460e04b5e10f46d66efeac0cd8c164c436e40f4a37ea18a196dc0ed67deece2e0a212fc8c70f0cfc086c821c';

        const privKey = Buffer.from(privKeyHex, 'hex');

        const signature = signTypedData(testTypedData, privKey);
        const recovered = recoverTypedData(testTypedData, signature);

        expect(recovered).to.equal(address);
        expect(signature).to.equal(refSig);
    })
});
