import {
  UInt64,
  Field,
  shutdown,
  SmartContract,
  PublicKey,
  method,
  PrivateKey,
  Mina,
  state,
  State,
  isReady,
  Party,
  Bool,
} from 'snarkyjs';
import { runModel } from './model.js';

class DogSnapp extends SmartContract {
  @state(Field) value: State<Field>;

  constructor(initialBalance: UInt64, address: PublicKey, x: Field) {
    super(address);
    this.balance.addInPlace(initialBalance);
    this.value = State.init(x);
  }

  @method async update(squared: Field) {
    const x = await this.value.get();
    x.square().assertEquals(squared);
    this.value.set(squared);
  }

  @method async check_dog(bitmask: any) {
    const x = await this.value.get();
    // check if the bit is set for a dog
    const dog_bit = 17;
    const isSet = ((dog_bit>>bitmask) & 1) != 0;
    console.log( isSet )
    Bool.and(isSet, true).assertEquals(true)
    console.log( 'Bitmask: ', bitmask );
    console.log( 'Field Bitmask:', Field( bitmask ) );
    this.value.set(Field( bitmask ));
    console.log( 'Did I reach this??' );
    console.log( this.value.get() );

    }
}

async function runSimpleApp() {
  await isReady;

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);

  let False = new Bool(false);
  let True = new Bool(true);

  // several pictures to use
  let dog_bike = './images/dog.jpg';

  // create two accounts to make the bets in an alternating manner
  const account1 = Local.testAccounts[0].privateKey;
  const account2 = Local.testAccounts[1].privateKey;

  const snappPrivkey = PrivateKey.random();
  const snappPubkey = snappPrivkey.toPublicKey();

  // let's create an instance of this dog snapp
  let snappInstance: DogSnapp;

  // initial state of 0
  // we'll assume that we only use 64 bits for the state value
  const initSnappState = new Field(0);

  // Deploys the snapp
  await Mina.transaction(account1, async () => {
    // account2 sends 1000000000 to the new snapp account
    const amount = UInt64.fromNumber(1000000000);
    const p = await Party.createSigned(account2);
    p.balance.subInPlace(amount);

    snappInstance = new DogSnapp(amount, snappPubkey, initSnappState);
  })
    .send()
    .wait();

  // let's run some object detection on the dog.jpg
  let dog_mask = runModel( dog_bike );

  // Update the snapp
  // let's see if the model actually saw a dog 
  await Mina.transaction(account1, async () => {
    await snappInstance.check_dog(dog_mask);
  })
    .send()
    .wait();

  const a = await Mina.getAccount(snappPubkey);

  console.log('final state value', a.snapp.appState[0].toString());
}
runSimpleApp()
shutdown();
