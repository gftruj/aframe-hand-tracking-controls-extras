
## Components - hand-teleport, drag-rotate, drag-move


https://user-images.githubusercontent.com/17348360/155238823-33074074-2885-40e3-be1b-d9c24392b4ce.mp4


An example with all three components is [here](https://gftruj.github.io/hand.tracking.controls.extras/examples/navigation.html) ([source](../examples/navigation.html))

### hand-teleport

Palm up to show the tp line.
Pinch to confirm the location.

    <a-entity id="left-hand" hand-tracking-controls="hand: left" 
    hand-tracking-extras hand-teleport="rig: #rig; origin: a-camera">

**Attributes**

| Attribute        | Description   | Default |
| ---------------- |:-------------:| -----:|
| rig              | camera and hands rig         | |
| origin           | teleport origin              | camera |
| fadeSphereRadius | fadein-fadeout sphere radius | 0.1 |
| fadeDuration     | fadein and fadeout duration  | 200 [ms] |

### drag-rotate
Pinch in front of your face and drag, to rotate the rig.

    <a-entity hand-tracking-controls="hand: right" hand-tracking-extras drag-rotate="rig: #rig"></a-entity>

**Attributes**

| Attribute        | Description   | Default |
| ---------------- |:-------------:| -----:|
| rig                 | camera and hands rig                                     |      |
| fingerToHMDHeight   | ( index finger ).*y* - ( HMD ).*y* acceptable difference | 0.15 |
| fingerToHMDDistance | How far can the finger be from the HMD                   | 0.6  |

**Events**
| Name          | Description   | 
| ------------- |:-------------:| 
| dragstart     | Emitted when the user started to drag the rig |
| dragstop      | Emitted when the dragging has ended           |

### drag-move

Move around by pinching and moving your hand

    <a-entity hand-tracking-controls="hand: right" hand-tracking-extras drag-move="rig: #rig"></a-entity>

**Attributes**

| Attribute        | Description   | Default |
| ---------------- |:-------------:| -----:|
| rig              | camera and hands rig                                          |      |
| speed            | How fast should the rig move around.  The example is set to 5 | 1    |

### finger-cursor

Fusing cursor directed at where you point your index finger

    <a-entity id="rightHand" hand-tracking-controls="hand: right;" hand-tracking-extras>
        <a-entity finger-cursor raycaster="objects: .interactable"></a-entity>
    </a-entity>

**Attributes**

| Attribute        | Description   | Default |
| ---------------- |:-------------:| -----:|
| lineLength       | How long should be the line when not intersecting | 5        |
| pointThreshold   | value between <0,1>. 0 - bent finger, 1 - straight finger | 0.95        |


https://user-images.githubusercontent.com/17348360/159160520-a4e327b3-78de-47a6-b6ba-9a30a952cf9c.mp4


### Important

**!! Requires a rig for the camera and hands !!**

    <a-entity id="rig">
      <a-camera></a-camera>
      <a-entity id="left-hand" hand-tracking-controls="hand: left" 
      hand-tracking-extras hand-teleport="rig: #rig; origin: a-camera"></a-entity>
      <a-entity id="right-hand" hand-tracking-controls="hand: right"
      hand-tracking-extras world-drag="rig: #rig"></a-entity>
    </a-entity>
