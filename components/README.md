
## Components.

Yay or nay? Feel free to suggest improvements in the issues tab if you like these.
![Navigation](https://gftruj.github.io/hand.tracking.controls.extras/screens/navigation.gif)

As of today these are more or less a PoC. There is an example [here](https://gftruj.github.io/hand.tracking.controls.extras/examples/navigation.html) ([source](../examples/navigation.html))

### Teleport

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

### World - drag
Pinch in front of your face and drag, to rotate the rig.

    <a-entity id="right-hand" hand-tracking-controls="hand: right" hand-tracking-extras world-drag="rig: #rig"></a-entity>

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

### Important

**!! Requires a rig for the camera and hands !!**

    <a-entity id="rig">
      <a-camera></a-camera>
      <a-entity id="left-hand" hand-tracking-controls="hand: left" 
      hand-tracking-extras hand-teleport="rig: #rig; origin: a-camera"></a-entity>
      <a-entity id="right-hand" hand-tracking-controls="hand: right"
      hand-tracking-extras world-drag="rig: #rig"></a-entity>
    </a-entity>
