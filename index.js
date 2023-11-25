import { CallData, ec, hash } from 'starknet'
import * as mStarknet from '@scure/starknet'
import * as bip32 from '@scure/bip32'
import * as bip39 from '@scure/bip39'
import fs from 'fs'

const contractAXclassHash = '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003'
const mnemonicList = fs.readFileSync('seeds.txt', 'utf8').replace(/\r\n/g, '\n').split('\n')
const path = "m/44'/9004'/0'/0/0"

// Create a CSV file
const csvFile = 'wallets.csv'
fs.writeFileSync(csvFile, 'Address,Pkey,Seed\n', 'utf-8')

for (const mnemonic of mnemonicList) {
  const masterSeed = bip39.mnemonicToSeedSync(mnemonic)
  const hdKey1 = bip32.HDKey.fromMasterSeed(masterSeed).derive("m/44'/60'/0'/0/0")
  const hdKey2 = bip32.HDKey.fromMasterSeed(hdKey1.privateKey)
  const hdKeyi = hdKey2.derive(path)

  const starknetPrivateKey = '0x' + mStarknet.grindKey(hdKeyi.privateKey)
  const starkKeyPubAX = ec.starkCurve.getStarkKey(starknetPrivateKey)
  const constructorAXCallData = CallData.compile([starkKeyPubAX, 0])
  const accountAXAddress = hash.calculateContractAddressFromHash(
    starkKeyPubAX,
    contractAXclassHash,
    constructorAXCallData,
    0
  )

  // Append data to CSV file
  fs.appendFileSync(csvFile, `${accountAXAddress},${starknetPrivateKey},${mnemonic}\n`, 'utf-8')
}

console.log('Data saved to wallets.csv')
