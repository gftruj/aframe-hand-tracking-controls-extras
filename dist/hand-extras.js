(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
require ("./src/drag-rotate")
require ("./src/drag-move")
require ("./src/hand-teleport")
require ("./src/finger-cursor")
},{"./src/drag-move":2,"./src/drag-rotate":3,"./src/finger-cursor":5,"./src/hand-teleport":6}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.component = void 0;
const component = AFRAME.registerComponent("drag-move", {
  schema: {
    rig: {
      type: "selector"
    },
    speed: {
      default: 1
    }
  },
  init: function () {
    this.isPinching = false;
    this.pinchUp = this.setPinch.bind(this, true);
    this.pinchDown = this.setPinch.bind(this, false);
    this.handExtrasReady = this.handExtrasReady.bind(this);
    this.el.addEventListener("pinchstarted", this.pinchUp);
    this.el.addEventListener("pinchmoved", this.pinchUp);
    this.el.addEventListener("pinchended", this.pinchDown);
    this.el.addEventListener("hand-tracking-extras-ready", this.handExtrasReady);
    this.lastPinchPosition = new THREE.Vector3();
    this.currentPinchPosition = new THREE.Vector3();
    this.camera = this.el.sceneEl.camera.el;
    this.rig = this.data.rig;
  },
  setPinch: function (isPinching, evt) {
    if (isPinching) {
      if (!this.isPinching) this.lastPinchPosition.copy(evt.detail.position);
      this.currentPinchPosition.copy(evt.detail.position);
    }

    this.isPinching = isPinching;
  },
  handExtrasReady: function (evt) {
    this.jointAPI = evt.detail.data.jointAPI;
  },
  remove: function () {
    this.el.removeEventListener("hand-tracking-extras-ready", this.handExtrasReady);
    this.el.removeEventListener("pinchstarted", this.pinchUp);
    this.el.removeEventListener("pinchmoved", this.pinchUp);
    this.el.removeEventListener("pinchended", this.pinchDown);
  },
  tick: function () {
    const pinchDiff = new THREE.Vector3(0, 0, 0);
    const tmpv = new THREE.Vector3();
    const tmp2 = new THREE.Vector3();
    return function () {
      if (!this.jointAPI) return;
      if (!this.data.rig) return;
      if (!this.isPinching) return;
      const index_tip = this.jointAPI.getIndexTip();
      if (!index_tip.isValid()) return;
      const rig = this.data.rig;
      const lastPinchPosition = this.lastPinchPosition;
      const currentPinchPosition = this.currentPinchPosition;
      tmpv.copy(lastPinchPosition);
      tmp2.copy(currentPinchPosition);
      pinchDiff.copy(tmpv).multiplyScalar(-1).add(tmp2).multiplyScalar(-1 * this.data.speed).applyQuaternion(rig.object3D.quaternion);
      rig.object3D.position.add(pinchDiff);
      lastPinchPosition.copy(currentPinchPosition);
    };
  }()
});
exports.component = component;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.component = void 0;
const component = AFRAME.registerComponent("drag-rotate", {
  schema: {
    rig: {
      type: "selector"
    },
    fingerToHMDHeight: {
      default: 0.15
    },
    fingerToHMDDistance: {
      default: 0.6
    }
  },
  init: function () {
    this.isPinching = false;
    this.pinchUp = this.setPinch.bind(this, true);
    this.pinchDown = this.setPinch.bind(this, false);
    this.handExtrasReady = this.handExtrasReady.bind(this);
    this.el.addEventListener("pinchstarted", this.pinchUp);
    this.el.addEventListener("pinchended", this.pinchDown);
    this.el.addEventListener("hand-tracking-extras-ready", this.handExtrasReady);
    this.camera = this.el.sceneEl.camera.el;
    this.rig = this.data.rig;
  },
  setPinch: function (isPinching) {
    this.isPinching = isPinching;
  },
  handExtrasReady: function (evt) {
    this.joints = evt.detail.data.joints;
  },
  remove: function () {
    this.el.removeEventListener("hand-tracking-extras-ready", this.handExtrasReady);
    this.el.removeEventListener("pinchstarted", this.pinchUp);
    this.el.removeEventListener("pinchended", this.pinchDown);
  },
  tick: function () {
    const indexPosition = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();
    const hand_camera_orientation = new THREE.Vector2();
    const UP = new THREE.Vector3(0, 1, 0);
    var prevAngle = undefined;

    function stopDragging(el) {
      prevAngle = undefined;
      el.emit("dragend");
    }

    return function () {
      if (!this.joints) return;
      let el = this.el;
      let index = this.joints.I_Tip;

      if (!index.isValid()) {
        return stopDragging(el);
      }

      index.getPosition(indexPosition);
      cameraPosition.copy(this.camera.object3D.position);
      let userdata = this.data;

      if (userdata.fingerToHMDHeight) {
        // check if index finger is on the HMD level
        if (Math.abs(indexPosition.y - cameraPosition.y) > userdata.fingerToHMDHeight) {
          return stopDragging(el);
        }
      }

      if (userdata.fingerToHMDDistance) {
        // check index finger to HMD distance
        if (indexPosition.distanceTo(cameraPosition) > userdata.fingerToHMDDistance) {
          return stopDragging(el);
        }
      }

      if (this.isPinching) {
        // get the "initial" angle
        let z = indexPosition.z - this.camera.object3D.position.z;
        let x = indexPosition.x - this.camera.object3D.position.x;
        hand_camera_orientation.set(x, z).normalize();
        let angle = Math.atan2(hand_camera_orientation.y, hand_camera_orientation.x);

        if (prevAngle === undefined) {
          prevAngle = angle;
          el.emit("dragstart");
          return;
        }

        let theta = -(prevAngle - angle);
        prevAngle = angle; // use a global

        cameraPosition.setFromMatrixPosition(this.camera.object3D.matrixWorld); // why getWorldPosition isn't working lol

        let point = cameraPosition; // rotate the rig around the camera

        let rig = this.rig;
        rig.object3D.position.add(point.negate()); // remove the offset

        rig.object3D.position.applyAxisAngle(UP, theta); // rotate the POSITION

        rig.object3D.position.add(point.negate()); // re-add the offset

        rig.object3D.rotateOnAxis(UP, theta); // rotate the OBJECT
      } else {
        return stopDragging(el);
      }
    };
  }()
});
exports.component = component;

},{}],4:[function(require,module,exports){
/* global THREE, AFRAME, Element  */
var cylinderTexture = require('./lib/cylinderTexture');
var parabolicCurve = require('./lib/ParabolicCurve');
var RayCurve = require('./lib/RayCurve');

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s);
            var i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) { /* no-op */ }
            return i > -1;
        };
}

module.exports = AFRAME.registerComponent('extended-teleport-controls', {
    schema: {
        type: { default: 'parabolic', oneOf: ['parabolic', 'line'] },
        button: { default: 'trackpad', oneOf: ['trackpad', 'trigger', 'grip', 'menu'] },
        startEvents: { type: 'array' },
        abortEvents: { type: 'array' },
        endEvents: { type: 'array' },
        collisionEntities: { default: '' },
        hitEntity: { type: 'selector' },
        cameraRig: { type: 'selector' },
        teleportOrigin: { type: 'selector' },
        hitCylinderColor: { type: 'color', default: '#99ff99' },
        hitCylinderRadius: { default: 0.25, min: 0 },
        hitCylinderHeight: { default: 0.3, min: 0 },
        interval: { default: 0 },
        maxLength: { default: 10, min: 0, if: { type: ['line'] } },
        curveNumberPoints: { default: 30, min: 2, if: { type: ['parabolic'] } },
        curveLineWidth: { default: 0.025 },
        curveHitColor: { type: 'color', default: '#99ff99' },
        curveMissColor: { type: 'color', default: '#ff0000' },
        curveShootingSpeed: { default: 5, min: 0, if: { type: ['parabolic'] } },
        defaultPlaneSize: { default: 100 },
        landingNormal: { type: 'vec3', default: { x: 0, y: 1, z: 0 } },
        landingMaxAngle: { default: '45', min: 0, max: 360 },
        drawIncrementally: { default: false },
        incrementalDrawMs: { default: 700 },
        missOpacity: { default: 1.0 },
        hitOpacity: { default: 1.0 }
    },

    init: function () {
        var data = this.data;
        var el = this.el;
        var teleportEntity;
        var i;

        this.active = false;
        this.obj = el.object3D;
        this.hitPoint = new THREE.Vector3();
        this.rigWorldPosition = new THREE.Vector3();
        this.newRigWorldPosition = new THREE.Vector3();
        this.teleportEventDetail = {
            oldPosition: this.rigWorldPosition,
            newPosition: this.newRigWorldPosition,
            hitPoint: this.hitPoint
        };
        this.orientation = 0;
        this.hit = false;
        this.prevCheckTime = undefined;
        this.prevHitHeight = 0;
        this.referenceNormal = new THREE.Vector3();
        this.curveMissColor = new THREE.Color();
        this.curveHitColor = new THREE.Color();
        this.raycaster = new THREE.Raycaster();

        this.defaultPlane = createDefaultPlane(this.data.defaultPlaneSize);
        this.defaultCollisionMeshes = [this.defaultPlane];

        teleportEntity = this.teleportEntity = document.createElement('a-entity');
        teleportEntity.classList.add('teleportRay');
        teleportEntity.setAttribute('visible', false);
        el.sceneEl.appendChild(this.teleportEntity);

        this.onButtonDown = this.onButtonDown.bind(this);
        this.onButtonUp = this.onButtonUp.bind(this);
        this.onAbort = this.onAbort.bind(this);
        if (this.data.startEvents.length && this.data.endEvents.length) {

            for (i = 0; i < this.data.startEvents.length; i++) {
                el.addEventListener(this.data.startEvents[i], this.onButtonDown);
            }
            for (i = 0; i < this.data.endEvents.length; i++) {
                el.addEventListener(this.data.endEvents[i], this.onButtonUp);
            }
            for (i = 0; i < this.data.endEvents.length; i++) {
                el.addEventListener(this.data.abortEvents[i], this.onAbort);
            }

        } else {
            el.addEventListener(data.button + 'down', this.onButtonDown);
            el.addEventListener(data.button + 'up', this.onButtonUp);
        }

        this.queryCollisionEntities();
    },

    update: function (oldData) {
        var data = this.data;
        var diff = AFRAME.utils.diff(data, oldData);

        // Update normal.
        this.referenceNormal.copy(data.landingNormal);

        // Update colors.
        this.curveMissColor.set(data.curveMissColor);
        this.curveHitColor.set(data.curveHitColor);


        // Create or update line mesh.
        if (!this.line ||
            'curveLineWidth' in diff || 'curveNumberPoints' in diff || 'type' in diff) {

            this.line = createLine(data);
            this.line.material.opacity = this.data.hitOpacity;
            this.line.material.transparent = this.data.hitOpacity < 1;
            this.numActivePoints = data.curveNumberPoints;
            this.teleportEntity.setObject3D('mesh', this.line.mesh);
        }

        // Create or update hit entity.
        if (data.hitEntity) {
            this.hitEntity = data.hitEntity;
        } else if (!this.hitEntity || 'hitCylinderColor' in diff || 'hitCylinderHeight' in diff ||
            'hitCylinderRadius' in diff) {
            // Remove previous entity, create new entity (could be more performant).
            if (this.hitEntity) { this.hitEntity.parentNode.removeChild(this.hitEntity); }
            this.hitEntity = createHitEntity(data);
            this.el.sceneEl.appendChild(this.hitEntity);
        }
        this.hitEntity.setAttribute('visible', false);

        if ('collisionEntities' in diff) { this.queryCollisionEntities(); }
    },

    remove: function () {
        var el = this.el;
        var hitEntity = this.hitEntity;
        var teleportEntity = this.teleportEntity;

        if (hitEntity) { hitEntity.parentNode.removeChild(hitEntity); }
        if (teleportEntity) { teleportEntity.parentNode.removeChild(teleportEntity); }

        el.sceneEl.removeEventListener('child-attached', this.childAttachHandler);
        el.sceneEl.removeEventListener('child-detached', this.childDetachHandler);
    },

    tick: (function () {
        var p0 = new THREE.Vector3();
        var v0 = new THREE.Vector3();
        var g = -9.8;
        var a = new THREE.Vector3(0, g, 0);
        var next = new THREE.Vector3();
        var last = new THREE.Vector3();
        var quaternion = new THREE.Quaternion();
        var translation = new THREE.Vector3();
        var scale = new THREE.Vector3();
        var shootAngle = new THREE.Vector3();
        var lastNext = new THREE.Vector3();
        var auxDirection = new THREE.Vector3();
        var timeSinceDrawStart = 0;

        return function (time, delta) {
            if (!this.active) { return; }
            if (this.data.drawIncrementally && this.redrawLine) {
                this.redrawLine = false;
                timeSinceDrawStart = 0;
            }
            timeSinceDrawStart += delta;
            this.numActivePoints = this.data.curveNumberPoints * timeSinceDrawStart / this.data.incrementalDrawMs;
            if (this.numActivePoints > this.data.curveNumberPoints) {
                this.numActivePoints = this.data.curveNumberPoints;
            }

            // Only check for intersection if interval time has passed.
            if (this.prevCheckTime && (time - this.prevCheckTime < this.data.interval)) { return; }
            // Update check time.
            this.prevCheckTime = time;

            var matrixWorld = this.obj.matrixWorld;
            matrixWorld.decompose(translation, quaternion, scale);

            var direction = shootAngle.set(0, 0, -1)
                .applyQuaternion(quaternion).normalize();
            this.line.setDirection(auxDirection.copy(direction));
            this.obj.getWorldPosition(p0);

            last.copy(p0);

            // Set default status as non-hit
            this.teleportEntity.setAttribute('visible', true);
            this.line.material.color.set(this.curveMissColor);
            this.line.material.opacity = this.data.missOpacity;
            this.line.material.transparent = this.data.missOpacity < 1;
            this.hitEntity.setAttribute('visible', false);
            this.hit = false;

            if (this.data.type === 'parabolic') {
                v0.copy(direction).multiplyScalar(this.data.curveShootingSpeed);

                this.lastDrawnIndex = 0;
                const numPoints = this.data.drawIncrementally ? this.numActivePoints : this.line.numPoints;
                for (var i = 0; i < numPoints + 1; i++) {
                    var t;
                    if (i == Math.floor(numPoints + 1)) {
                        t = numPoints / (this.line.numPoints - 1);
                    }
                    else {
                        t = i / (this.line.numPoints - 1);
                    }
                    parabolicCurve(p0, v0, a, t, next);
                    // Update the raycaster with the length of the current segment last->next
                    var dirLastNext = lastNext.copy(next).sub(last).normalize();
                    this.raycaster.far = dirLastNext.length();
                    this.raycaster.set(last, dirLastNext);

                    this.lastDrawnPoint = next;
                    this.lastDrawnIndex = i;
                    if (this.checkMeshCollisions(i, next)) { break; }

                    last.copy(next);
                }
                for (var j = this.lastDrawnIndex + 1; j < this.line.numPoints; j++) {
                    this.line.setPoint(j, this.lastDrawnPoint);
                }
            } else if (this.data.type === 'line') {
                next.copy(last).add(auxDirection.copy(direction).multiplyScalar(this.data.maxLength));
                this.raycaster.far = this.data.maxLength;
                this.raycaster.set(p0, direction);
                this.line.setPoint(0, p0);

                this.checkMeshCollisions(1, next);
            }
        };
    })(),

    /**
     * Run `querySelectorAll` for `collisionEntities` and maintain it with `child-attached`
     * and `child-detached` events.
     */
    queryCollisionEntities: function () {
        var collisionEntities;
        var data = this.data;
        var el = this.el;

        if (!data.collisionEntities) {
            this.collisionEntities = [];
            return;
        }

        collisionEntities = [].slice.call(el.sceneEl.querySelectorAll(data.collisionEntities));
        this.collisionEntities = collisionEntities;

        // Update entity list on attach.
        this.childAttachHandler = function childAttachHandler(evt) {
            if (!evt.detail.el.matches(data.collisionEntities)) { return; }
            collisionEntities.push(evt.detail.el);
        };
        el.sceneEl.addEventListener('child-attached', this.childAttachHandler);

        // Update entity list on detach.
        this.childDetachHandler = function childDetachHandler(evt) {
            var index;
            if (!evt.detail.el.matches(data.collisionEntities)) { return; }
            index = collisionEntities.indexOf(evt.detail.el);
            if (index === -1) { return; }
            collisionEntities.splice(index, 1);
        };
        el.sceneEl.addEventListener('child-detached', this.childDetachHandler);
    },

    // UGLYYYY - as i need to call it on the component
    updateOrientation: function (newOrientation) {
        this.orientation = newOrientation;
    },

    onAbort: function () {
        this.active = false;
        this.hitEntity.setAttribute('visible', false);
        this.teleportEntity.setAttribute('visible', false);
    },

    onButtonDown: function () {
        this.active = true;
        this.redrawLine = true;
    },

    /**
     * Jump!
     */
    onButtonUp: (function () {
        const teleportOriginWorldPosition = new THREE.Vector3();
        const newRigLocalPosition = new THREE.Vector3();

        return function (evt) {
            if (!this.active) { return; }
            // Hide the hit point and the curve
            this.onAbort();

            if (!this.hit) {
                // Button released but not hit point
                return;
            }

            const rig = this.data.cameraRig || this.el.sceneEl.camera.el;
            rig.object3D.getWorldPosition(this.rigWorldPosition);
            this.newRigWorldPosition.copy(this.hitPoint);

            // If a teleportOrigin exists, offset the rig such that the teleportOrigin is above the hitPoint
            const teleportOrigin = this.data.teleportOrigin;
            if (teleportOrigin) {
                teleportOriginWorldPosition.setFromMatrixPosition( teleportOrigin.object3D.matrixWorld ); // why getWorldPosition isn't working for the camera lol
                //teleportOrigin.object3D.getWorldPosition(teleportOriginWorldPosition);
                this.newRigWorldPosition.sub(teleportOriginWorldPosition).add(this.rigWorldPosition);
            }

            // Always keep the rig at the same offset off the ground after teleporting
            this.newRigWorldPosition.y = this.rigWorldPosition.y + this.hitPoint.y - this.prevHitHeight;
            this.prevHitHeight = this.hitPoint.y;

            // Finally update the rigs position
            newRigLocalPosition.copy(this.newRigWorldPosition);
            if (rig.object3D.parent) {
                rig.object3D.parent.worldToLocal(newRigLocalPosition);
            }
            rig.object3D.position.copy(newRigLocalPosition);

            /* apply rotation as well. Around the "player" axis 
            let theta = this.hitEntity.object3D.getObjectByName("cylinder").rotation.y;

            rig.object3D.rotation.set(0, 0, 0);

            point = document.querySelector("[camera]").object3D.getWorldPosition();
            rig.object3D.position.add(point.negate()); // remove the offset
            rig.object3D.position.applyAxisAngle(UP, theta); // rotate the POSITION
            rig.object3D.position.add(point.negate()); // re-add the offset
            rig.object3D.rotateOnAxis(UP, theta); // rotate the OBJECT
            */
            rig.setAttribute('position', rig.object3D.position);
            this.el.emit('teleported', this.teleportEventDetail);
        };
    })(),

    /**
     * Check for raycaster intersection.
     *
     * @param {number} Line fragment point index.
     * @param {number} Next line fragment point index.
     * @returns {boolean} true if there's an intersection.
     */
    checkMeshCollisions: function (i, next) {
        // @todo We should add a property to define if the collisionEntity is dynamic or static
        // If static we should do the map just once, otherwise we're recreating the array in every
        // loop when aiming.
        var meshes;
        if (!this.data.collisionEntities) {
            meshes = this.defaultCollisionMeshes;
        } else {
            meshes = this.collisionEntities.map(function (entity) {
                return entity.getObject3D('mesh');
            }).filter(function (n) { return n; });
            meshes = meshes.length ? meshes : this.defaultCollisionMeshes;
        }

        var intersects = this.raycaster.intersectObjects(meshes, true);
        if (intersects.length > 0 && !this.hit &&
            this.isValidNormalsAngle(intersects[0].face.normal)) {
            var point = intersects[0].point;

            this.line.material.color.set(this.curveHitColor);
            this.line.material.opacity = this.data.hitOpacity;
            this.line.material.transparent = this.data.hitOpacity < 1;
            this.hitEntity.setAttribute('position', point);
            this.hitEntity.setAttribute('visible', true);

            // apply the rotation offset
            let yRotOffset = (this.hitEntity.object3D.rotation.y - this.orientation);
            this.hitEntity.object3D.getObjectByName("cylinder").rotation.y = -yRotOffset

            this.hit = true;
            this.hitPoint.copy(intersects[0].point);

            // If hit, just fill the rest of the points with the hit point and break the loop
            for (var j = i; j < this.line.numPoints; j++) {
                this.line.setPoint(j, this.hitPoint);
            }
            return true;
        } else {
            this.line.setPoint(i, next);
            return false;
        }
    },

    isValidNormalsAngle: function (collisionNormal) {
        var angleNormals = this.referenceNormal.angleTo(collisionNormal);
        return (THREE.Math.RAD2DEG * angleNormals <= this.data.landingMaxAngle);
    },
});


function createLine(data) {
    var numPoints = data.type === 'line' ? 2 : data.curveNumberPoints;
    return new RayCurve(numPoints, data.curveLineWidth);
}

/**
 * Create mesh to represent the area of intersection.
 * Default to a combination of torus and cylinder.
 */
function createHitEntity(data) {
    var cylinder;
    var hitEntity;
    var torus;
    var arrow;

    // Parent.
    hitEntity = document.createElement('a-entity');
    hitEntity.className = 'hitEntity';

    // Torus.
    torus = document.createElement('a-entity');
    torus.setAttribute('geometry', {
        primitive: 'torus',
        radius: data.hitCylinderRadius,
        radiusTubular: 0.01
    });
    torus.setAttribute('rotation', { x: 90, y: 0, z: 0 });
    torus.setAttribute('material', {
        shader: 'flat',
        color: data.hitCylinderColor,
        side: 'double',
        depthTest: false
    });
    hitEntity.appendChild(torus);

    // Cylinder.
    cylinder = document.createElement('a-entity');
    cylinder.object3D.name = "cylinder"
    cylinder.setAttribute('position', { x: 0, y: data.hitCylinderHeight / 2, z: 0 });
    cylinder.setAttribute('geometry', {
        primitive: 'cylinder',
        segmentsHeight: 1,
        radius: data.hitCylinderRadius,
        height: data.hitCylinderHeight,
        openEnded: true
    });
    cylinder.setAttribute('material', {
        shader: 'flat',
        color: data.hitCylinderColor,
        side: 'double',
        src: cylinderTexture,
        transparent: true,
        depthTest: false
    });
    hitEntity.appendChild(cylinder);
    // Direction arrow
    arrow = document.createElement("a-triangle")
    arrow.setAttribute("rotation", "-90 0 0")
    arrow.setAttribute("scale", "0.25 0.25 0.25")
    arrow.setAttribute("position", "0 0 -0.40")
    arrow.setAttribute("material", "color", "green")
    //cylinder.appendChild(arrow)
    return hitEntity;
}

function createDefaultPlane(size) {
    var geometry;
    var material;

    geometry = new THREE.PlaneGeometry(size, size);
    geometry.rotateX(-Math.PI / 2);
    material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    return new THREE.Mesh(geometry, material);
}
},{"./lib/ParabolicCurve":7,"./lib/RayCurve":8,"./lib/cylinderTexture":9}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.component = void 0;
const component = AFRAME.registerComponent("finger-cursor", {
  schema: {
    lineColor: {
      default: "blue"
    },
    lineLength: {
      default: "5"
    },
    pointThreshold: {
      default: 0.95
    }
  },
  init: function () {
    this.el.setAttribute("line", {
      "color": "blue",
      "start": "0 0 0",
      "opacity": 0.25,
      "end": "0 0 -2"
    });
    this.el.setAttribute("cursor", {
      "rayOrigin": "entity",
      "fuse": "true"
    });
    this.activated = false;
    this.handEl = this.el.parentNode;
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onHandTrackingLoaded = this.onHandTrackingLoaded.bind(this);
    this.el.addEventListener("mouseenter", this.onMouseEnter);
    this.el.addEventListener("mouseleave", this.onMouseLeave);
    this.handEl.addEventListener("hand-tracking-extras-ready", this.onHandTrackingLoaded);
  },
  onMouseEnter: function (evt) {
    this.isec = evt.detail.intersectedEl;
  },
  onMouseLeave: function () {
    this.isec = null;
  },
  onHandTrackingLoaded: function (evt) {
    this.jointAPI = evt.detail.data.jointAPI;
  },
  activate: function () {
    this.activated = true;
    this.el.components.cursor.play();
    this.el.setAttribute("line", "visible", this.activated);
  },
  deactivate: function () {
    this.activated = false;
    this.el.components.cursor.pause();
    this.el.setAttribute("line", "visible", this.activated);
  },
  setLineLength: function (d) {
    if (this.currentLineLen && this.currentLineLen == d) return;
    this.currentLineLen = d;
    this.el.setAttribute("line", "end", AFRAME.utils.coordinates.stringify({
      x: 0,
      y: 0,
      z: -d
    }));
  },
  remove: function () {
    this.el.removeAttribute("cursor");
    this.el.removeAttribute("line");
  },
  tick: function () {
    const ITipDir = new THREE.Vector3();
    const ITipPosition = new THREE.Vector3();
    const ITipQuaternion = new THREE.Quaternion();
    const IProximalDir = new THREE.Vector3();
    return function () {
      if (!this.jointAPI) return;
      const IProximalBone = this.jointAPI.getIndexProximal();
      const ITipBone = this.jointAPI.getIndexTip();

      if (!(IProximalBone.isValid() && ITipBone.isValid())) {
        if (this.activated) this.deactivate();
        return;
      }

      IProximalBone.getDirection(IProximalDir);
      ITipBone.getDirection(ITipDir);
      ITipBone.getPosition(ITipPosition);
      ITipBone.getQuaternion(ITipQuaternion);
      const mesh = this.el.getObject3D("mesh") || this.el.object3D;
      mesh.position.copy(ITipPosition);
      mesh.quaternion.copy(ITipQuaternion); // show / hide line

      if (IProximalDir.dot(ITipDir) >= this.data.pointThreshold) {
        if (!this.activated) this.activate();
      } else if (this.activated) {
        this.deactivate();
      } // line length


      if (this.activated) {
        if (this.isec) {
          const rayEl = this.el.components.raycaster;
          const intersection = rayEl.getIntersection(this.isec);

          if (intersection) {
            this.setLineLength(intersection.point.distanceTo(ITipPosition));
          }
        } else {
          this.setLineLength(this.data.lineLength);
        }
      }
    };
  }()
});
exports.component = component;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.component = void 0;

require('./extended-teleport-controls');

const component = AFRAME.registerComponent("hand-teleport", {
  schema: {
    rig: {
      type: "selector"
    },
    xr: {
      default: true
    },
    origin: {
      type: "selector"
    },
    fadeSphereRadius: {
      default: "0.1"
    },
    fadeDuration: {
      default: 200
    }
  },
  init: function () {
    const tp_comp_name = "extended-teleport-controls"; // tp origin entity

    this.tpEntity = document.createElement("a-entity");
    this.tpEntity.setAttribute(tp_comp_name, {
      "startEvents": "tp-up",
      "endEvents": "tp-down",
      "cameraRig": this.data.rig,
      "abortEvents": "tp-abort",
      // I need a "nevermind" feature
      "teleportOrigin": this.data.origin
    });
    this.el.appendChild(this.tpEntity);
    this.tpComponent = this.tpEntity.components[tp_comp_name]; // anti - vomit crossfade sphere

    this.fadeSphere = document.createElement("a-sphere");
    this.fadeSphere.setAttribute("radius", this.data.fadeSphereRadius);
    this.fadeSphere.setAttribute("material", {
      "color": "black",
      "transparent": "true",
      "opacity": "0.0",
      "shader": "flat",
      "side": "back"
    });
    this.fadeSphere.setAttribute("animation__fadeout", {
      "property": "material.opacity",
      "to": "1.0",
      "dur": this.data.fadeDuration,
      "startEvents": "fadeout"
    });
    this.fadeSphere.setAttribute("animation__fadein", {
      "property": "material.opacity",
      "to": "0.0",
      "dur": this.data.fadeDuration,
      "startEvents": "fadein"
    });
    this.sphereFaded = this.sphereFaded.bind(this);
    this.fadeSphere.addEventListener("animationcomplete__fadeout", this.sphereFaded);
    this.el.sceneEl.camera.el.appendChild(this.fadeSphere); // one jump per pinch

    this.canJump = true; // whether we are ready to jump

    this.tpUp = false; // bind and listen

    this.handExtrasReady = this.handExtrasReady.bind(this);
    this.pinchStarted = this.pinchStarted.bind(this);
    this.pinchEnded = this.pinchEnded.bind(this);
    this.el.addEventListener("hand-tracking-extras-ready", this.handExtrasReady);
    this.el.addEventListener("pinchstarted", this.pinchStarted);
    this.el.addEventListener("pinchended", this.pinchEnded);
  },
  update: function (oldData) {
    let diff = AFRAME.utils.diff(this.data, oldData);

    if ("fadeSphereRadius" in diff) {
      this.fadeSphere.setAttribute("radius", this.data.fadeSphereRadius);
    }

    if ("fadeDuration" in diff) {
      this.fadeSphere.setAttribute("animation__fadeout", "dur", this.data.fadeDuration);
      this.fadeSphere.setAttribute("animation__fadein", "dur", this.data.fadeDuration);
    }

    if (!origin) {
      origin = this.el.sceneEl.camera.el;
    }
  },
  pinchStarted: function () {
    if (!(this.canJump && this.tpUp)) return;
    this.canJump = false;
    this.fadeSphere.emit("fadeout");
  },
  sphereFaded: function () {
    this.tpEntity.emit("tp-down");
    this.fadeSphere.emit("fadein");
  },
  pinchEnded: function () {
    // enable teleporting
    this.canJump = true;
    this.tpUp = !this.tpUp;
  },
  handExtrasReady: function (evt) {
    this.jointAPI = evt.detail.data.jointAPI;
  },
  remove: function () {
    this.fadeSphere.removeEventListener("animationcomplete__fadeout", this.sphereFaded);
    this.el.sceneEl.camera.el.removeChild(this.fadeSphere);
    this.el.removeEventListener("hand-tracking-extras-ready", this.handExtrasReady);
    this.el.removeEventListener("pinchstarted", this.pinchStarted);
    this.el.removeEventListener("pinchended", this.pinchEnded);
  },
  tick: function () {
    const normal = new THREE.Vector3();
    return function () {
      // grab hand data if valid
      if (!this.jointAPI) return; // teleport origin

      let wrist = this.jointAPI.getWrist();

      if (!wrist.isValid()) {
        // if the tp is up - hide it
        if (this.tpUp) {
          this.tpEntity.emit("tp-abort");
          this.tpUp = false;
        }

        return;
      } // position and orient the "tp helper" at the wrist


      wrist.getPosition(this.tpEntity.object3D.position);
      wrist.getQuaternion(this.tpEntity.object3D.quaternion); // gesture helpers

      wrist.getNormal(normal); // react only to "palm" up

      if (normal.y < 0.7) {
        if (this.tpUp) {
          this.tpEntity.emit("tp-abort");
          this.tpUp = false;
        }

        return;
      } // emit once


      if (!this.tpUp) {
        this.tpEntity.emit("tp-up");
        this.tpUp = true;
      }
    };
  }()
});
exports.component = component;

},{"./extended-teleport-controls":4}],7:[function(require,module,exports){
/* global THREE */
// Parabolic motion equation, y = p0 + v0*t + 1/2at^2
function parabolicCurveScalar (p0, v0, a, t) {
  return p0 + v0 * t + 0.5 * a * t * t;
}

// Parabolic motion equation applied to 3 dimensions
function parabolicCurve (p0, v0, a, t, out) {
  out.x = parabolicCurveScalar(p0.x, v0.x, a.x, t);
  out.y = parabolicCurveScalar(p0.y, v0.y, a.y, t);
  out.z = parabolicCurveScalar(p0.z, v0.z, a.z, t);
  return out;
}

module.exports = parabolicCurve;

},{}],8:[function(require,module,exports){
/* global THREE */
var RayCurve = function (numPoints, width) {
  this.geometry = new THREE.BufferGeometry();
  this.vertices = new Float32Array(numPoints * 3 * 2);
  this.uvs = new Float32Array(numPoints * 2 * 2);
  this.width = width;

  this.geometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setUsage(THREE.DynamicDrawUsage));

  this.material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: 0xff0000
  });

  this.mesh = new THREE.Mesh(this.geometry, this.material);
  //this.mesh.drawMode = THREE.TriangleStripDrawMode;

  this.mesh.frustumCulled = false;
  this.mesh.vertices = this.vertices;

  this.direction = new THREE.Vector3();
  this.numPoints = numPoints;
};

RayCurve.prototype = {
  setDirection: function (direction) {
    var UP = new THREE.Vector3(0, 1, 0);
    this.direction
      .copy(direction)
      .cross(UP)
      .normalize()
      .multiplyScalar(this.width / 2);
  },

  setWidth: function (width) {
    this.width = width;
  },

  setPoint: (function () {
    var posA = new THREE.Vector3();
    var posB = new THREE.Vector3();

    return function (i, point) {
      posA.copy(point).add(this.direction);
      posB.copy(point).sub(this.direction);

      var idx = 2 * 3 * i;
      this.vertices[idx++] = posA.x;
      this.vertices[idx++] = posA.y;
      this.vertices[idx++] = posA.z;

      this.vertices[idx++] = posB.x;
      this.vertices[idx++] = posB.y;
      this.vertices[idx++] = posB.z;

      this.geometry.attributes.position.needsUpdate = true;
    };
  })()
};

module.exports = RayCurve;

},{}],9:[function(require,module,exports){
module.exports = 'url(data:image/png;base64,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)';

},{}],10:[function(require,module,exports){
require ("./src/index")
require("./components/index")

},{"./components/index":1,"./src/index":14}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"./handdata":13}],13:[function(require,module,exports){
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

},{"./JointObject":11}],14:[function(require,module,exports){
"use strict";

require("./hand-tracking-extras.js");

},{"./hand-tracking-extras.js":12}]},{},[10]);
