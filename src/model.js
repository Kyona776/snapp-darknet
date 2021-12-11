export { runModel, getLabels };
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
// TODO: Consider making this a class

// run the model
function runModel( target_image ) {
  // set the threshold for the classification to 95%
  const threshold = 95;

  // create default map for the bytes
  // let's use the byte array and compare the values to the threshold
  // you only care about the order of the labels and if the probability
  // of the detected object is above your given threshold
  // TODO: Since there are 80 labels, we'd have to use another variable for the 
  // remaining 16 bits
  let labels = new getLabels( );
  let bytes = new Uint8Array( 64 ) // should be labels.length

  // run the model
  const child = spawnSync('./darknet', [ 'detect', 'cfg/yolov3.cfg', 'cfg/yolov3.weights', target_image ]);
  var stdout = child.stdout.toString().split(/\r?\n/) // split by new line
  console.log( stdout );
  
  // get it into a nice map
  stdout.shift(); // remove the first entry
  var stdout = stdout.filter(value => Object.keys(value).length !== 0); // remove empty strings
  
  // map the results
  let result_map = new Map();
  stdout.forEach(function (item, index) {
    item = item.replace( '%', '' ).split( ': ' )
    result_map.set(item[0],item[1] )
  });
  console.log( result_map )

  // use the map and overlay it with the byte array
  // only for bits 64 and under
  result_map.forEach( function ( value, key ) {
    (labels.indexOf( key ) <= 64 ) ? bytes[ labels.indexOf( key ) ] = parseInt( value ) : pass });

  // let's change it to bits. Sadly, only 64 bits
  labels.forEach( function( key, index ) {
    bytes[ index ] = ( bytes[ index ] >= threshold ) ? 1: 0;
  })
  console.log( bytes )

  // construct the string
  let output = "";
  bytes.forEach( function ( value ) {
    output += ( value == 1) ? 1 : 0
  })
  console.log( output )
  console.log( parseInt( output, 2 ) )
  return parseInt( output, 2 );
}

// return the labels
function getLabels( ) {
  // read the label file and return as array
  let target_file = './data/coco.names'; // TODO: make the labels an attribute later
  let text = readFileSync( target_file ).toString()
  let textByLine = text.split("\n")
  var output = textByLine.filter(value => Object.keys(value).length !== 0);
  return output;
}

runModel( './images/person.jpg' )