# hand-tracking-controls-extras

## Why?

To provide a simplified API to get the [joints](https://immersive-web.github.io/webxr-hand-input/#skeleton-joints-section) data
    - Position, Quaternion, Direction, "Normal" (inside - palm), radius, validity

## How to use it

Import the script:

    <script src="https://gftruj.github.io/hand-tracking-controls-extras/dist/aframe-hand-tracking-controls-extras.js></script>

Add the `hand-tracking-extras` to the hand:
 
    <a-entity id="left-hand" hand-tracking-controls="hand: left; " hand-tracking-extras></a-entity>

Wait for the `hand-tracking-extras-ready` event:

    var hand = document.getElementById("left-hand");
    hand.addEventListener("hand-tracking-extras-ready", (evt) = { 
      var joints = evt.detail.data.joints;
    });

Or grab the joints manually:
    
    var joints = document.getElementById("left-hand").components["hand-tracking-extras"].joints
    var Wrist = joints.Wrist;
    console.log(Wrist.getPosition());
    
Check out the API and the [XRHand docs](https://immersive-web.github.io/webxr-hand-input/#skeleton-joints-section).

### Joints API

Arguments are optional, but providing them will save memory (as otherwise internal helpers are cloned and returned);

Joint object method  | Description
------------- | ------------- 
`getPosition(vector)` | fills the vector with the joint position
`getDirection(vector)` | fills the vector with the normalized direction
`getNormal(vector)` | fills the vector with the normal vector (looking inside the face)
`getRawQuaternion(quaternion)` | fills the quaternion with the raw quaternion data 
`getQuaternion(quaternion)` | the raw quaternion is rotated (WIP) so this one is supposed to be "correct"
`getRadius()` | joint radius
`isValid()` | whether we could read the pose data

### Joints

Similar to the WebXR hand API, the joints are

Joint name  | XRHand corresponding name
------------- | -------------   
Wrist | XRHand.WRIST 
T_Metacarpal | XRHand.THUMB_METACARPAL
T_Proximal | XRHand.THUMB_PHALANX_PROXIMAL
T_Distal | XRHand.THUMB_PHALANX_DISTAL
T_Tip | XRHand.THUMB_PHALANX_TIP
I_Metacarpal | XRHand.INDEX_METACARPAL
I_Proximal | XRHand.INDEX_PHALANX_PROXIMAL
I_Intermediate | XRHand.INDEX_PHALANX_INTERMEDIATE
I_Distal | XRHand.INDEX_PHALANX_DISTAL
I_Tip | XRHand.INDEX_PHALANX_TIP
M_Metacarpal | XRHand.MIDDLE_METACARPAL
M_Proximal | XRHand.MIDDLE_PHALANX_PROXIMAL
M_Intermediate | XRHand.MIDDLE_PHALANX_INTERMEDIATE
M_Distal | XRHand.MIDDLE_PHALANX_DISTAL
M_Tip | XRHand.MIDDLE_PHALANX_TIP
R_Metacarpal | XRHand.RING_METACARPAL
R_Proximal | XRHand.RING_PHALANX_PROXIMAL
R_Intermediate | RHand.RING_PHALANX_INTERMEDIATE
R_Distal | XRHand.RING_PHALANX_DISTAL
R_Tip: new JointObject(XRHand.RING_PHALANX_TIP
L_Metacarpal | XRHand.LITTLE_METACARPAL
L_Proximal | XRHand.LITTLE_PHALANX_PROXIMAL
L_Intermediate | XRHand.LITTLE_PHALANX_INTERMEDIATE
L_Distal | XRHand.LITTLE_PHALANX_DISTAL
L_Tip | XRHand.LITTLE_PHALANX_TIP


### Roadmap - wishful thinking

Provide:
1. a simple API for Joints orientation and relations:
    - `.islookingUp()`, `isHorizontallyAligned()`, `.isCloseTo(other)`, `orientedLike(other)`

2. Gesture detection. Define a gesture using the above orientations and relations and let the component do the rest.
