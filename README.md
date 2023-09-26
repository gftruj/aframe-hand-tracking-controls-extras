# hand-tracking-controls-extras


### Disclaimer

When I rushed at `a-frame`s finger tracking I wasn't aware, that I'm kinda reinventing the wheel.
A great place with multiple examples is [Marlon Lückerts repository](https://github.com/marlon360/webxr-handtracking).

Another great repo with gesture detection is [Ada Rose Cannon handy-work](https://github.com/AdaRoseCannon/handy-work)

On the other hand, I've learned a lot doing this, and am fully willing to continue :)
To all starring, and forking people - thank You! Any ideas are more then welcome ( i.e. in form of an issue )

----


## Navigation components

Teleport, drag yourself around, or rotate the world like this:

https://user-images.githubusercontent.com/17348360/155236391-98df435e-2949-4ea1-8a72-b7ca017ada9a.mp4

With a simple setup like this:

    <a-entity id="rig">
      <a-camera></a-camera>
      <!-- left hand can teleport, and drag the world position -->
      <a-entity hand-tracking-controls="hand: left" hand-tracking-extras
      hand-teleport="rig: #rig; origin: a-camera" drag-move="rig: #rig; speed: 5">
      </a-entity>
     
      <!-- right hand can rotate the world by dragging -->
      <a-entity hand-tracking-controls="hand: right" hand-tracking-extras drag-rotate="rig: #rig">
      </a-entity>
    </a-entity>

More info in the [docs](./components)

## Simplified (?) Joints API

### Hands in browser:
Import the script:

    <script src="https://gftruj.github.io/hand.tracking.controls.extras/dist/aframe-hand-tracking-controls-extras.js"></script>

Add the `hand-tracking-extras` to the hand:
 
    <a-entity id="left-hand" hand-tracking-controls="hand: left; " hand-tracking-extras></a-entity>

Wait for the `hand-tracking-extras-ready` event:

    var hand = document.getElementById("left-hand");
    hand.addEventListener("hand-tracking-extras-ready", (evt) => {
      var jointsAPI = evt.detail.data.jointsAPI;
    });

Or grab the joints manually:
    
    var joints = document.getElementById("left-hand").components["hand-tracking-extras"].jointsAPI
    var Wrist = joints.getWrist();
    console.log(Wrist.getPosition());
    
Check out the API and the [XRHand docs](https://immersive-web.github.io/webxr-hand-input/#skeleton-joints-section).

## API

Each joint has its "helper" method:

Arguments are optional, but providing them will save memory (as otherwise internal helpers are cloned and returned);

Joint object method  | Description
---------------------| ------------- 
`getPosition(vector)` | fills the vector with the joint position
`getDirection(vector)` | fills the vector with the normalized direction
`getNormal(vector)` | fills the vector with the normal vector.
`getQuaternion(quaternion)` | fills the quaternion with the joint orientation. 
`getRadius()` | get joint radius
`isValid()` | whether we could read the pose data

Joints

Grab the joints with:
   
    // jointsAPI.get<Finger><Bone>()
    // example: const index_tip = jointAPI.getIndexTip();
    // 
    // Fingers: Wrist(special case, single bone), Index, Middle, Ring, Little
    // Bones: Metacarpal, Proximal, Intermediate, Distal, Tip

From the [WebXR hand docs](https://www.w3.org/TR/webxr-hand-input-1/#xrjointpose):

![rawQ vs Q](https://immersive-web.github.io/webxr-hand-input/images/hand-layout.svg?raw=true "Normals")


Similar to the WebXR hand API, the joints are

Joint name  | XRHand corresponding name (index)
------------- | -------------   
Wrist | XRHand.WRIST (0)
T_Metacarpal | XRHand.THUMB_METACARPAL (1)
T_Proximal | XRHand.THUMB_PHALANX_PROXIMAL (2)
T_Distal | XRHand.THUMB_PHALANX_DISTAL (3)
T_Tip | XRHand.THUMB_PHALANX_TIP (4)
I_Metacarpal | XRHand.INDEX_METACARPAL (5)
I_Proximal | XRHand.INDEX_PHALANX_PROXIMAL (6)
I_Intermediate | XRHand.INDEX_PHALANX_INTERMEDIATE (7)
I_Distal | XRHand.INDEX_PHALANX_DISTAL (8)
I_Tip | XRHand.INDEX_PHALANX_TIP (9)
M_Metacarpal | XRHand.MIDDLE_METACARPAL (10)
M_Proximal | XRHand.MIDDLE_PHALANX_PROXIMAL (11)
M_Intermediate | XRHand.MIDDLE_PHALANX_INTERMEDIATE (12)
M_Distal | XRHand.MIDDLE_PHALANX_DISTAL (13)
M_Tip | XRHand.MIDDLE_PHALANX_TIP (14)
R_Metacarpal | XRHand.RING_METACARPAL (15)
R_Proximal | XRHand.RING_PHALANX_PROXIMAL (16)
R_Intermediate | RHand.RING_PHALANX_INTERMEDIATE (17)
R_Distal | XRHand.RING_PHALANX_DISTAL (18)
R_Tip | XRHand.RING_PHALANX_TIP (19)
L_Metacarpal | XRHand.LITTLE_METACARPAL (20)
L_Proximal | XRHand.LITTLE_PHALANX_PROXIMAL (21)
L_Intermediate | XRHand.LITTLE_PHALANX_INTERMEDIATE (22)
L_Distal | XRHand.LITTLE_PHALANX_DISTAL (23)
L_Tip | XRHand.LITTLE_PHALANX_TIP (24)

### Roadmap - wishful thinking

Provide:


1. a simple API for Joints orientation and relations:
    - `.islookingUp()`, `isHorizontallyAligned()`, `.isCloseTo(other)`, `orientedLike(other)`

2. Integrate navigation components with Adas `handy-work`
