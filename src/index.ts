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
  Circuit,
} from 'snarkyjs';
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';

class Model {
  results: Field;
  model: string;
  operation: string;
  config_file: string;
  weight_file: string;
  label_file: string;
  threshold: number;
  labels: Array<string>;


  constructor( ) {
    // let's set some constants
    this.model = './bin/darknet.macos';
    this.operation = 'detect';
    this.config_file = './cfg/yolov3.cfg';
    this.weight_file = './cfg/yolov3.weights';
    this.label_file = './data/coco.names';
    this.threshold = 95;

    // obtain the labels
    this.labels = this.obtain_labels();

  }

  @method run_model( target_file: string )
  {
    // 1. Get the labels for the model
    let labels = this.get_labels( );
  
    // 2. Create empty Bool array 
    // create an empty results array that will contain the Bools 
    // and that will carry the results.
    // If the value for the classification meets the threshold,
    // set it to true; otherwise set to false
    // let's be safe and set it all to false
    let results = Array<Bool>();
    labels.forEach( function( key, index ) {
      results[ index ] = new Bool( false );
    })
    let threshold = this.get_threshold();
  
    // 3. Run the model
    // Note: This should be a snarkyjs implementation of a
    // Deep Neural network but that requires writing all the 
    // activation functions and all the neurons
    const child = spawnSync(this.model, [ this.operation, this.config_file, this.weight_file, target_file ]);
    var stdout = child.stdout.toString().split(/\r?\n/) // split by new line
    stdout.shift(); // remove the first entry
    var stdout = stdout.filter(value => Object.keys(value).length !== 0); // remove empty strings
    
    // 3. Map the results
    // TODO: add check for duplicate keys
    let result_map = new Map();
    stdout.forEach(function (item, index) {
      let split_item = item.replace( '%', '' ).split( ': ' )
      result_map.set(split_item[0], parseInt(split_item[1]) )
    });
    console.log( ' Model Labels Detected:', result_map.keys() )
    
    // 4. Write the map contents to the Bool array
    result_map.forEach( function ( value, key ) {
      results[ labels.indexOf( key ) ] = ( value >= threshold ) ? new Bool( true ) : new Bool( false ) });

    // 5. Save the result
    this.results = Field.ofBits( results );
  }

  @method obtain_labels( ) {
    // read the label file and return as array
    // TODO: I suppose this will have to be hard-coded into the snarky-js implementation
    let text = readFileSync( this.label_file ).toString()
    let textByLine = text.split("\n")
    var output = textByLine.filter(value => Object.keys(value).length !== 0);
    return output;
  }

  @method get_results() {
    // return the results
    return this.results;
  }

  @method get_threshold() {
    // return the threshold for the classification probability
    return this.threshold;
  }

  @method get_labels() {
    // return the label file
    return this.labels;
  }
}

class DogSnapp extends SmartContract {
  // Field State of 80 bit representation
  @state(Field) state: State<Field>;  // stored state
  model: Model;                       // model object
  reward_objects: Array<string>;      // objects to allow for reward call

  constructor(initialBalance: UInt64, address: PublicKey, init_state: Field, model: Model) {
    super(address);
    this.balance.addInPlace(initialBalance);

    // set the initial values
    this.state = State.init(init_state);
    this.model = model;
    this.reward_objects = ['bicycle', 'truck', 'dog', 'horse', 'giraffe', 'zebra']
  }

  @method async run_model( image: string ) {
    // run the model and return results
    this.model.run_model( image );
    return this.model.get_results();    
  }

  @method async get_labels( ) {
    // obtain the labels
    return this.model.get_labels();    
  }

  @method async get_reward() {
    // get the reward

    // 1. Get the labels 
    const labels = await this.get_labels( )

    // 2. Get the current state
    const state = await this.state.get();
    const state_bits = state.toBits( labels.length );

    // 3. Verify all objects have been detected in the list
    for (let i = 0; i < this.reward_objects.length; i++) {
      console.log( ' Verifying', this.reward_objects[ i ], 'is in current state.' );
      Bool.and( state_bits[ labels.indexOf( this.reward_objects[ i ] ) ], Bool( true ) ).assertEquals(true);
    }
  }

  @method async check_object( image: string ) {
    // the method will run the model on the specified image

    // 1. Get the labels 
    // the labels only really correspond when the model is run
    const labels = await this.get_labels( ) // TODO: make attribute

    // 2. Get the current state
    const state = await this.state.get();
    const state_bits = state.toBits( labels.length );
    
    // 3. Run the model and convert the results to the bit array
    const results = await this.run_model( image );
    let result_bits = results.toBits( labels.length )

    // 4. Verify that there is no overlap at all in the objects 
    let overlap = Array<Bool>();
    for (let i = 0; i < labels.length; i++) {
      // Use the circuit if and the bool not
      // if results_bit[i] is false, no further checking
      // if results_bit[i] is true, verify the state_bits is false
      overlap[ i ] = Circuit.if( Bool.not( result_bits[ i ] ), new Bool( false ), Bool.and( state_bits[ i ], new Bool( false ) ) );
    }
    // verify all the Bools are false
    console.log( ' Verify no overlap with the current state and the new results.');
    for (let i = 0; i < labels.length; i++) { Bool.not( overlap[ i ] ).assertEquals(true); }

    // 5. Combine the previous state with the results from the model
    let new_state_bits = Array<Bool>();
    for (let i = 0; i < labels.length; i++) {
      new_state_bits[ i ] = Circuit.if( Bool.not( result_bits[ i ] ), state_bits[ i ], new Bool( true ) );
    }
    let new_state = Field.ofBits( new_state_bits );

    // 6. Save the results 
    this.state.set(new_state);
    }
}

export async function runSimpleApp() {
  await isReady;

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);

  let False = new Bool(false);
  let True = new Bool(true);

  // several pictures to use
  let image_1 = './images/dog.jpg';       // Used in SNAPP Test 1 - Set condition with a dog, truck, and bike
  let image_2 = './images/person.jpg';    // Used in SNAPP Test 2 - Test will fail due to having a dog (person, horse, dog detected)
  let image_3 = './images/scream.jpg';    // Used in SNAPP Test 3 - Test will pass but the state remains the same as there are no labels detected
  let image_4 = './images/giraffe.jpg';   // Used in SNAPP Test 4 - Test will add the giraffe and zebra to the state
  let image_5 = './images/horses.jpg';    // Used in SNAPP Test 5 - Test will add the horse to the state

  // create two accounts to make the bets in an alternating manner
  const account1 = Local.testAccounts[0].privateKey;
  const account2 = Local.testAccounts[1].privateKey;

  const snappPrivkey = PrivateKey.random();
  const snappPubkey = snappPrivkey.toPublicKey();

  // let's create an instance of this dog snapp
  let snappInstance: DogSnapp;

  // Deploys the snapp
  await Mina.transaction(account1, async () => {
    // account2 sends 1000000000 to the new snapp account
    const amount = UInt64.fromNumber(1000000000);
    const p = await Party.createSigned(account2);
    p.balance.subInPlace(amount);
    snappInstance = new DogSnapp(amount, snappPubkey, Field.zero, new Model() );
  })
    .send()
    .wait();
  
//////////////////////////////// Test 1 ////////////////////////////////
  // Test 1: The initial state of the SNAPP is 0. Run the SNAPP on an image
  // of a dog, bike, and truck. It will pass all conditions and update the state
  // of the SNAPP to the corresponding bits in the bit array 
  console.log( 'Test 1 - Start:', image_1 );
  await Mina.transaction( account1, async () => {
    await snappInstance.check_object( image_1 );
    })
    .send()
    .wait()
    .catch((e) => console.log(' Test 1 Failed.'));
  console.log( 'Test 1 - End.' );
  const a = await Mina.getAccount(snappPubkey);
  console.log('State value:', a.snapp.appState[0].toString());
    
//////////////////////////////// Test 2 ////////////////////////////////
  // Test 2: Run the SNAPP on an image of a person, horse, and dog.
  // The test will actually fail because over the overlap of Test 1 where
  //  there was a dog present in both photos. The state will remain unchanged
  console.log( 'Test 2 - Start:', image_2 );
  await Mina.transaction( account1, async () => {
    await snappInstance.check_object( image_2 );
    })
    .send()
    .wait()
    .catch((e) => console.log(' Test 2 Failed.'));
  console.log( 'Test 2 - End.' );
  const b = await Mina.getAccount(snappPubkey);
  console.log('State value:', b.snapp.appState[0].toString());

//////////////////////////////// Test 3 ////////////////////////////////
  // Test 3: Run the SNAPP on an image of the scream and the test should
  // pass but the state won't change
  console.log( 'Test 2 - Start:', image_3 );
  await Mina.transaction( account1, async () => {
    await snappInstance.check_object( image_3 );
    })
    .send()
    .wait()
    .catch((e) => console.log(' Test 3 Failed.'));
  console.log( 'Test 3 - End.' );
  const c = await Mina.getAccount(snappPubkey);
  console.log('State value:', c.snapp.appState[0].toString());

//////////////////////////////// Test 4 ////////////////////////////////
  // Test 4:  Run the SNAPP on an image of a giraffe and a zebra
  // and watch the state change.
  console.log( 'Test 4 - Start:', image_4 );
  await Mina.transaction( account1, async () => {
    await snappInstance.check_object( image_4 );
    })
    .send()
    .wait()
    .catch((e) => console.log(' Test 4 Failed.'));
  console.log( 'Test 4 - End.' );
  const d = await Mina.getAccount(snappPubkey);
  console.log('State value:', d.snapp.appState[0].toString());

//////////////////////////////// Test 5 ////////////////////////////////
  // Test 5: Run the SNAPP on an image of horses. The SNAPP's state should
  // actually match the criteria now to actually claim the reward
  console.log( 'Test 5 - Start:', image_5 );
  await Mina.transaction( account1, async () => {
    await snappInstance.check_object( image_5 );
    })
    .send()
    .wait()
    .catch((e) => console.log(' Test 5 Failed.'));
  console.log( 'Test 5 - End.' );
  const e = await Mina.getAccount(snappPubkey);
  console.log('State value:', e.snapp.appState[0].toString());

//////////////////////////////// Test 6 ////////////////////////////////
  // Test 6: Obtain the reward
  // TODO: add the transaction
  console.log( 'Test 6 - Start:', image_5 );
  await Mina.transaction( account1, async () => {
    await snappInstance.get_reward( );
    })
    .send()
    .wait()
    .catch((e) => console.log(' Test 6 Failed.'));
  console.log( 'Test 6 - End.' );

  const f = await Mina.getAccount(snappPubkey);
  console.log('Final state value: ', f.snapp.appState[0].toString());
  shutdown();
}
runSimpleApp()
