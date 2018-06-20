"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var src_1 = require("../src");
describe("old typeData spec", function () {
    it('typedSignatureHash', function () {
        var typedData = [
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
        var hash = src_1.typedDataHashOld(typedData);
        chai_1.expect(hash).to.equal('0xf7ad23226db5c1c00ca0ca1468fd49c8f8bbc1489bc1c382de5adc557a69c229');
    });
    it("signTypedData and recoverTypedSignature old", function () {
        var address = '0x29c76e6ad8f28bb1004902578fb108c507be341b';
        var privKeyHex = '4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0';
        var privKey = Buffer.from(privKeyHex, 'hex');
        var typedData = [
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
        var msgParams = { data: typedData };
        var signature = src_1.signTypedDataOld(typedData, privKey);
        var recovered = src_1.recoverTypedDataOld(typedData, signature);
        chai_1.expect(recovered).to.equal(address);
    });
});
var testTypedData = {
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
describe("typeData spec", function () {
    it('typedSignatureHash', function () {
        var hash = src_1.typedDataHash(testTypedData);
        chai_1.expect(hash).to.equal('0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2');
    });
    it('signTypedData and recoverTypedSignature', function () {
        var address = '0x29c76e6ad8f28bb1004902578fb108c507be341b';
        var privKeyHex = '4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0';
        var privKey = Buffer.from(privKeyHex, 'hex');
        var signature = src_1.signTypedData(testTypedData, privKey);
        var recovered = src_1.recoverTypedData(testTypedData, signature);
        chai_1.expect(recovered).to.equal(address);
    });
});
