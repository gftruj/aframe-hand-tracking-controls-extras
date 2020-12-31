(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JointObject = void 0;

class JointObject {
  constructor(id, parent) {
    this.id = id;
    this.parent = parent;
  }

  getPosition(_vector) {
    return this.parent.getPosition(this.id, _vector);
  }

  getDirection(_vector) {
    return this.parent.getDirection(this.id, _vector);
  }

  getNormal(_vector) {
    return this.parent.getNormal(this.id, _vector);
  }

  getRawQuaternion(_quaternion) {
    return this.parent.getPoseQuaternion(this.id, _quaternion);
  }

  getQuaternion(_quaternion) {
    return this.parent.getOrientedQuaternion(this.id, _quaternion);
  }

  getRadius() {
    return this.parent.getRadius(this.id);
  }

  isValid() {
    return this.parent.getValidity(this.id);
  }
  /*
      Gesture helper API
                          */


  isTouchingJoint(other) {}

  isNearJoint(other) {}

  isSameDirection(other) {}

  isOppositeDirection(other) {}

  isHorizontal() {}

  isVertical() {}

  isUp() {}

  isDown() {}

}

exports.JointObject = JointObject;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _handdata = require("./handdata");

var _default = AFRAME.registerComponent("hand-tracking-extras", {
  schema: {
    // whether you want to override the default behaviour
    override: {
      default: true
    }
  },
  init: function () {
    // parasite off the existing components
    const handTrackingComp = this.el.components["hand-tracking-controls"];
    const hand = this.el.getAttribute("hand-tracking-controls").hand;
    var trackedControlsComp = this.el.components["tracked-controls"];
    var trackedControlsWebXrComp = this.el.components["tracked-controls-webxr"];

    if (!handTrackingComp) {
      console.warn("hand-tracking-extras require hand-tracking-controls. The component needs to be re-attached");
      return;
    }

    var self = this;

    if (this.data.override) {
      // don't like this bit - hacking into the actual hand tracking controls.
      var bind = AFRAME.utils.bind;
      handTrackingComp.detectGesture = bind(() => {
        if (!trackedControlsComp && !trackedControlsWebXrComp) {
          trackedControlsComp = this.el.components["tracked-controls"];
          trackedControlsWebXrComp = this.el.components["tracked-controls-webxr"];
          return;
        }

        if (!self.HandData) {
          self.HandData = new _handdata.HandData(hand);
          self.el.emit("hand-tracking-extras-ready", {
            data: self.HandData
          });
        }

        var frame = this.el.sceneEl.frame;
        var controller = trackedControlsComp && trackedControlsComp.controller;
        var referenceSpace = this.referenceSpace || trackedControlsWebXrComp.system.referenceSpace;
        if (!(frame && controller && referenceSpace)) return;
        self.HandData.updateData(controller, frame, referenceSpace);
      });
    }
  }
});

exports.default = _default;

},{"./handdata":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HandData = HandData;

var _JointObject = require("./JointObject");

function HandData(_side) {
  // float32 array helpers
  const Quaternion_Size = 4;
  const Vector_Size = 3;
  const Joint_Count = 25; // Sacred keepers of all data available through the Object oriented JointObject

  var rawQuaternion_array = new Float32Array(Quaternion_Size * Joint_Count);
  var position_array = new Float32Array(Vector_Size * Joint_Count);
  var radius_array = new Float32Array(Joint_Count);
  var validity_array = new Int8Array(Joint_Count); // Threejs helpers. 

  var tmpVector = new THREE.Vector3();
  var tmpQuaternion = new THREE.Quaternion();
  var tmpDummy = new THREE.Object3D(); // initialize all joint objects

  function initPoses() {
    this.joints = {
      // wrist
      Wrist: new _JointObject.JointObject(XRHand.WRIST, this),
      // thumb
      T_Metacarpal: new _JointObject.JointObject(XRHand.THUMB_METACARPAL, this),
      T_Proximal: new _JointObject.JointObject(XRHand.THUMB_PHALANX_PROXIMAL, this),
      T_Distal: new _JointObject.JointObject(XRHand.THUMB_PHALANX_DISTAL, this),
      T_Tip: new _JointObject.JointObject(XRHand.THUMB_PHALANX_TIP, this),
      // index
      I_Metacarpal: new _JointObject.JointObject(XRHand.INDEX_METACARPAL, this),
      I_Proximal: new _JointObject.JointObject(XRHand.INDEX_PHALANX_PROXIMAL, this),
      I_Intermediate: new _JointObject.JointObject(XRHand.INDEX_PHALANX_INTERMEDIATE, this),
      I_Distal: new _JointObject.JointObject(XRHand.INDEX_PHALANX_DISTAL, this),
      I_Tip: new _JointObject.JointObject(XRHand.INDEX_PHALANX_TIP, this),
      // middle
      M_Metacarpal: new _JointObject.JointObject(XRHand.MIDDLE_METACARPAL, this),
      M_Proximal: new _JointObject.JointObject(XRHand.MIDDLE_PHALANX_PROXIMAL, this),
      M_Intermediate: new _JointObject.JointObject(XRHand.MIDDLE_PHALANX_INTERMEDIATE, this),
      M_Distal: new _JointObject.JointObject(XRHand.MIDDLE_PHALANX_DISTAL, this),
      M_Tip: new _JointObject.JointObject(XRHand.MIDDLE_PHALANX_TIP, this),
      // ring
      R_Metacarpal: new _JointObject.JointObject(XRHand.RING_METACARPAL, this),
      R_Proximal: new _JointObject.JointObject(XRHand.RING_PHALANX_PROXIMAL, this),
      R_Intermediate: new _JointObject.JointObject(XRHand.RING_PHALANX_INTERMEDIATE, this),
      R_Distal: new _JointObject.JointObject(XRHand.RING_PHALANX_DISTAL, this),
      R_Tip: new _JointObject.JointObject(XRHand.RING_PHALANX_TIP, this),
      // little
      L_Metacarpal: new _JointObject.JointObject(XRHand.LITTLE_METACARPAL, this),
      L_Proximal: new _JointObject.JointObject(XRHand.LITTLE_PHALANX_PROXIMAL, this),
      L_Intermediate: new _JointObject.JointObject(XRHand.LITTLE_PHALANX_INTERMEDIATE, this),
      L_Distal: new _JointObject.JointObject(XRHand.LITTLE_PHALANX_DISTAL, this),
      L_Tip: new _JointObject.JointObject(XRHand.LITTLE_PHALANX_TIP, this)
    };
  }

  initPoses.call(this); // iterate through the poses and update the arrays

  this.updateData = (controller, frame, referenceSpace) => {
    for (let joint in this.joints) {
      var rawPose = frame.getJointPose(controller.hand[this.joints[joint].id], referenceSpace);

      if (rawPose) {
        setDataFromPose(this.joints[joint].id, rawPose);
      } else {
        setValidityById(this.joints[joint].id, false);
      }
    }
  };

  function setDataFromPose(id, rawPose) {
    // orientation
    tmpQuaternion.copy(rawPose.transform.orientation);
    setPoseQuaternionById(id, tmpQuaternion); // position. 

    tmpVector.copy(rawPose.transform.position);
    setPositionById(id, tmpVector); // radius

    setRadiusById(id, rawPose.radius); // validity

    setValidityById(id, true);
  } // hand orientation helpers


  const side = _side;

  this.getSide = () => side; // I'm out of time to figure out what i've screwed up in the calculations. So the hands need opposite quats
  // "normal" is actually the "inside" 


  const leftNormalQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const rightNormalQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  const positiveXQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
  const negativeXQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0));

  function toForward(vector) {
    return vector.set(0, 0, -1);
  }

  this.getOrientedQuaternion = (id, _quaternion) => {
    // lol this bit
    let orientation = side === "left" ? negativeXQuaternion : positiveXQuaternion;
    return this.getPoseQuaternion(id, _quaternion).multiply(orientation);
  };

  this.getDirection = (id, _vector) => {
    let vector = _vector ? _vector : tmpVector.clone();
    toForward(vector).applyQuaternion(this.getOrientedQuaternion(id, tmpQuaternion));
    return vector.copy(vector);
  };

  this.getNormal = (id, _vector) => {
    let vector = _vector ? _vector : tmpVector.clone();
    let normalQ = side === "left" ? leftNormalQuaternion : rightNormalQuaternion;
    this.getOrientedQuaternion(id, tmpQuaternion).multiply(normalQ);
    tmpDummy.quaternion.copy(tmpQuaternion);
    tmpDummy.getWorldDirection(vector);
    return vector;
  };
  /* Pose Setters and getters */


  function setPoseQuaternionById(id, quaternion) {
    quaternion.toArray(rawQuaternion_array, id * Quaternion_Size);
  }

  function setPositionById(id, vector) {
    vector.toArray(position_array, id * Vector_Size);
  }

  function setRadiusById(id, radius) {
    radius_array[id] = radius;
  }

  function setValidityById(id, validity) {
    validity_array[id] = validity;
  }

  this.getPoseQuaternion = (id, _quaternion) => {
    let quaternion = _quaternion ? _quaternion : tmpQuaternion.clone();
    return quaternion.fromArray(rawQuaternion_array, id * Quaternion_Size);
  };

  this.getPosition = (id, _vector) => {
    let vector = _vector ? _vector : tmpVector.clone();
    return vector.fromArray(position_array, id * Vector_Size);
  };

  this.getRadius = id => radius_array[id];

  this.getValidity = id => validity_array[id];
}

},{"./JointObject":1}]},{},[2]);
