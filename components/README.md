
## Components.

Yay or nay? Feel free to suggest improvements in the issues tab if you like these.
![Navigation](https://gftruj.github.io/hand.tracking.controls.extras/screens/navigation.gif)

As of today these are more or less a PoC. There is an example [here](https://gftruj.github.io/hand.tracking.controls.extras/examples/navigation.html) ([source](../examples/navigation.html))

### Teleport

Palm up to show the tp line.
Pinch to confirm the location.

    <a-entity id="left-hand" hand-tracking-controls="hand: left" 
    hand-tracking-extras hand-teleport="rig: #rig; origin: a-camera">

There are two attributes, the `rig` and the `origin` (the HMD).

### World - drag
Pinch in front of your face and drag, to rotate the rig.

    <a-entity id="right-hand" hand-tracking-controls="hand: right" hand-tracking-extras world-drag="rig: #rig"></a-entity>

The only attribute is the rig selector;

### Important

**!! Requires a rig for the camera and hands !!**

    <a-entity id="rig">
      <a-camera></a-camera>
      <a-entity id="left-hand" hand-tracking-controls="hand: left" 
      hand-tracking-extras hand-teleport="rig: #rig; origin: a-camera"></a-entity>
      <a-entity id="right-hand" hand-tracking-controls="hand: right"
      hand-tracking-extras world-drag="rig: #rig"></a-entity>
    </a-entity>
