# SNAPP Darknet Example
SNAPP Utilizing the YOLO V3 Model to Detect Objects

The SNAPP has the premise of feeding in images where the it 
will call a neural network to perform object detection and 
classification on the image. The SNAPP is broken down into 6 
test cases as follows:

Test 1: The initial state of the SNAPP is 0. Run the SNAPP on an image
of a dog, bike, and truck. It will pass all conditions and update the state
of the SNAPP to the corresponding bits in the bit array 

Test 2: Run the SNAPP on an image of a person, horse, and dog.
The test will actually fail because over the overlap of Test 1 where
there was a dog present in both photos. The state will remain unchanged
from Test 1

Test 3: Run the SNAPP on an image of the scream and the test should
pass but the state won't change.
Note: This can be improved but implementing a circuit check on the 
results from the model to ensure that it isn't an array of all false

Test 4: Run the SNAPP on an image of a giraffe and a zebra
and watch the state change.

Test 5: Run the SNAPP on an image of horses. The SNAPP's state should
actually match the criteria now to actually claim the reward

Test 6: Obtain the reward. The method checks the state of the snapp and 
compares it to an array of the associated labels to the bit array for 
comparison. If the criteria is met, it will allow for the reward

There seems to be an issue in which the state should be updating between
the test cases but it does not appear to be working. It is likely due to 
a missed call that is necessary to emulate the next block, etc. Or perhaps
the datatype used in the SNAPP is not working with the setter / getter properly.
Due to this, the overlap check will fail and the test 6 also fails as the states were not
changed between steps 1 and 2.

Notes:
The idea behind the SNAPP was to show that it is possible 
to integrate outside resources into a SNAPP such as a tensorflow 
You Only Look Once (YOLO) model and utilize the results.
However, after talking with Brandon and Izaak, the proper way to 
perform machine learning is to actually create the neurons and 
associated activation functions within snarkyjs. The dependencies
such as the weights, executable file, and configuration file 
can be considered security concerns as anybody would be able to 
replace the objects with malicious files that would give the 
model predictions to fool the SNAPP. 

How to Run:

Step 1: <br>
Clone and go into the repository
`git clone git@github.com:Makalfo/snapp-darknet.git`
`cd snapp-darknet`

Step 2: <br>
`npm install`

Step 3: <br>
Download the weights file and move it into the cfg folder:
`wget https://pjreddie.com/media/files/yolov3.weights`
`mv yolov3.weights ./cfg/`

Step 4: <br>
Create a link from the darknet executable from the bin folder
to the current folder depending on architecture
For MacOS: <br>
`ln -ls ./bin/darknet.macos .`
For Linux: <br>
`ln -ls ./bin/darknet.linux .`

Step 5: <br>
Run the snap
`npx tsc && node build/index.js`
