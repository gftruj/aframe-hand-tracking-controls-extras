(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JointObject = void 0;

class JointObject {
  constructor(id, num, parent) {
    this.id = id;
    this.num = num;
    this.parent = parent;
  }

  getId() {
    return this.id;
  }

  getPosition(_vector) {
    return this.parent.getPosition(this.num, _vector);
  }

  getDirection(_vector) {
    return this.parent.getDirection(this.num, _vector);
  }

  getNormal(_vector) {
    return this.parent.getNormal(this.num, _vector);
  }

  getQuaternion(_quaternion) {
    return this.parent.getQuaternion(this.num, _quaternion);
  }

  getRadius() {
    return this.parent.getRadius(this.num);
  }

  isValid() {
    return this.parent.getValidity(this.num);
  }
  /*
      Gesture helper API
                          */


  isCloserThan(other, distance) {}

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
  init: function () {
    this.el.addEventListener("enter-vr", this.play);
    this.el.addEventListener("exit-vr", this.pause);
  },
  tick: function () {
    return function () {
      if (this.isPaused) return;
      var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
      var trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
      if (!trackedControlsWebXR) return;
      var referenceSpace = trackedControlsWebXR.system.referenceSpace;
      var frame = this.el.sceneEl.frame;

      if (!controller || !frame || !referenceSpace) {
        return;
      }

      if (!this.HandData) {
        this.HandData = new _handdata.HandData();
        this.el.emit("hand-tracking-extras-ready", {
          data: this.HandData
        });
      }

      this.HandData.updateData(controller, frame, referenceSpace);
    };
  }(),
  play: function () {
    this.isPaused = false;
  },
  pause: function () {
    this.isPaused = true;
  },
  remove: function () {
    this.el.removeEventListener("enter-vr", this.play);
    this.el.removeEventListener("exit-vr", this.pause);
  },

  getRawJoints() {
    if (this.HandData) return this.HandData.joints;
    return null;
  },

  getJoints() {
    if (this.HandData) return this.HandData.jointAPI;
    return null;
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

function HandData() {
  // float32 array helpers
  const Joint_Count = 25;
  const rotMtx = {
    elements: new Float32Array(16)
  }; // Sacred keepers of all data available through the Object oriented JointObject

  const radii = new Float32Array(Joint_Count);
  const transforms = new Float32Array(4 * 4 * Joint_Count);
  var validPoses = false; // Threejs helpers. 

  var tmpVector = new THREE.Vector3();
  var tmpQuaternion = new THREE.Quaternion();
  var tmpDummy = new THREE.Object3D(); // initialize all joint objects

  let num = 0;
  const joints = {
    // wrist
    Wrist: new _JointObject.JointObject("wrist", num++, this),
    // thumb
    T_Metacarpal: new _JointObject.JointObject("thumb-metacarpal", num++, this),
    T_Proximal: new _JointObject.JointObject("thumb-phalanx-proximal", num++, this),
    T_Distal: new _JointObject.JointObject("thumb-phalanx-distal", num++, this),
    T_Tip: new _JointObject.JointObject("thumb-tip", num++, this),
    // index
    I_Metacarpal: new _JointObject.JointObject("index-finger-metacarpal", num++, this),
    I_Proximal: new _JointObject.JointObject("index-finger-phalanx-proximal", num++, this),
    I_Intermediate: new _JointObject.JointObject("index-finger-phalanx-intermediate", num++, this),
    I_Distal: new _JointObject.JointObject("index-finger-phalanx-distal", num++, this),
    I_Tip: new _JointObject.JointObject("index-finger-tip", num++, this),
    // middle
    M_Metacarpal: new _JointObject.JointObject("middle-finger-metacarpal", num++, this),
    M_Proximal: new _JointObject.JointObject("middle-finger-phalanx-proximal", num++, this),
    M_Intermediate: new _JointObject.JointObject("middle-finger-phalanx-intermediate", num++, this),
    M_Distal: new _JointObject.JointObject("middle-finger-phalanx-distal", num++, this),
    M_Tip: new _JointObject.JointObject("middle-finger-tip", num++, this),
    // ring
    R_Metacarpal: new _JointObject.JointObject("ring-finger-metacarpal", num++, this),
    R_Proximal: new _JointObject.JointObject("ring-finger-phalanx-proximal", num++, this),
    R_Intermediate: new _JointObject.JointObject("ring-finger-phalanx-intermediate", num++, this),
    R_Distal: new _JointObject.JointObject("ring-finger-phalanx-distal", num++, this),
    R_Tip: new _JointObject.JointObject("ring-finger-tip", num++, this),
    // little
    L_Metacarpal: new _JointObject.JointObject("pinky-finger-metacarpal", num++, this),
    L_Proximal: new _JointObject.JointObject("pinky-finger-phalanx-proximal", num++, this),
    L_Intermediate: new _JointObject.JointObject("pinky-finger-phalanx-intermediate", num++, this),
    L_Distal: new _JointObject.JointObject("pinky-finger-phalanx-distal", num++, this),
    L_Tip: new _JointObject.JointObject("pinky-finger-tip", num++, this)
  };
  this.joints = joints;
  this.jointAPI = {
    getWrist: () => joints.Wrist,
    getThumbMetacarpal: () => joints.T_Metacarpal,
    getThumbProximal: () => joints.T_Proximal,
    getThumbDistal: () => joints.T_Distal,
    getThumbTip: () => joints.T_Tip,
    getIndexMetacarpal: () => joints.I_Metacarpal,
    getIndexProximal: () => joints.I_Proximal,
    getIndexIntermediate: () => joints.I_Intermediate,
    getIndexDistal: () => joints.I_Distal,
    getIndexTip: () => joints.I_Tip,
    getMiddleMetacarpal: () => joints.M_Metacarpal,
    getMiddleProximal: () => joints.M_Proximal,
    getMiddleIntermediate: () => joints.M_Intermediate,
    getMiddleDistal: () => joints.M_Distal,
    getMiddleTip: () => joints.M_Tip,
    getRingMetacarpal: () => joints.R_Metacarpal,
    getRingProximal: () => joints.R_Proximal,
    getRingIntermediate: () => joints.R_Intermediate,
    getRingDistal: () => joints.R_Distal,
    getRingTip: () => joints.R_Tip,
    getLittleMetacarpal: () => joints.L_Metacarpal,
    getLittleProximal: () => joints.L_Proximal,
    getLittleIntermediate: () => joints.L_Intermediate,
    getLittleDistal: () => joints.L_Distal,
    getLittleTip: () => joints.L_Tip
  }; // iterate through the poses and update the arrays

  this.updateData = (controller, frame, referenceSpace) => {
    frame.fillJointRadii(controller.hand.values(), radii);
    validPoses = frame.fillPoses(controller.hand.values(), referenceSpace, transforms);
    if (!validPoses) return;
  }; // "normal" helper 


  const normalQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));

  this.getOrientedQuaternion = (id, _quaternion) => {
    return this.getQuaternion(id, _quaternion);
  };

  this.getDirection = (id, _vector) => {
    // normalized e[ 8 ], e[ 9 ], e[ 10 ] 
    const mtxOffset = id * 16;
    const vector = _vector ? _vector : tmpVector.clone();
    return vector.fromArray(transforms, mtxOffset + 8).normalize().negate();
  };

  this.getNormal = (id, _vector) => {
    let vector = _vector ? _vector : tmpVector.clone();
    this.getQuaternion(id, tmpQuaternion).multiply(normalQuaternion);
    tmpDummy.quaternion.copy(tmpQuaternion);
    tmpDummy.getWorldDirection(vector);
    return vector;
  };
  /* Pose Setters and getters */


  this.getQuaternion = (id, _quaternion) => {
    const mtxOffset = id * 16;
    let quaternion = _quaternion ? _quaternion : tmpQuaternion.clone();
    var idx = 0;

    for (var i = mtxOffset; i <= mtxOffset + 12; i++) {
      rotMtx.elements[idx++] = transforms[i];
    }

    quaternion.setFromRotationMatrix(rotMtx);
    return quaternion;
  };

  this.getPosition = (id, _vector) => {
    // position is 12 13 14 in the world matrix
    const mtxOffset = id * 16;
    let vector = _vector ? _vector : tmpVector.clone();
    return vector.fromArray(transforms, mtxOffset + 12);
  };

  this.getRadius = id => {
    return radii[id];
  };

  this.getValidity = () => validPoses;
}

},{"./JointObject":1}]},{},[2]);
