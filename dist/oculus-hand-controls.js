/* global THREE, XRRigidTransform */
var bind = function bind(fn, ctx/* , arg1, arg2 */) {
    return (function (prependedArgs) {
        return function bound() {
            // Concat the bound function arguments with those passed to original bind
            var args = prependedArgs.concat(Array.prototype.slice.call(arguments, 0));
            return fn.apply(ctx, args);
        };
    })(Array.prototype.slice.call(arguments, 2));
};

function findMatchingControllerWebVR(controllers, filterIdExact, filterIdPrefix, filterHand,
    filterControllerIndex) {
    var controller;
    var i;
    var matchingControllerOccurence = 0;
    var targetControllerMatch = filterControllerIndex >= 0 ? filterControllerIndex : 0;

    for (i = 0; i < controllers.length; i++) {
        controller = controllers[i];

        // Determine if the controller ID matches our criteria.
        if (filterIdPrefix && !controller.id.startsWith(filterIdPrefix)) {
            continue;
        }

        if (!filterIdPrefix && controller.id !== filterIdExact) { continue; }

        // If the hand filter and controller handedness are defined we compare them.
        if (filterHand && controller.hand && filterHand !== controller.hand) { continue; }

        // If we have detected an unhanded controller and the component was asking
        // for a particular hand, we need to treat the controllers in the array as
        // pairs of controllers. This effectively means that we need to skip
        // NUM_HANDS matches for each controller number, instead of 1.
        if (filterHand && !controller.hand) {
            targetControllerMatch = NUM_HANDS * filterControllerIndex + ((filterHand === DEFAULT_HANDEDNESS) ? 0 : 1);
        } else {
            return controller;
        }

        // We are looking for the nth occurence of a matching controller
        // (n equals targetControllerMatch).
        if (matchingControllerOccurence === targetControllerMatch) { return controller; }
        ++matchingControllerOccurence;
    }
    return undefined;
}

function findMatchingControllerWebXR(controllers, idPrefix, handedness, index, iterateProfiles, handTracking) {
    var i;
    var j;
    var controller;
    var controllerMatch = false;
    var controllerHasHandedness;
    var profiles;
    for (i = 0; i < controllers.length; i++) {
        controller = controllers[i];
        profiles = controller.profiles;
        if (handTracking) {
            controllerMatch = controller.hand;
        } else {
            if (iterateProfiles) {
                for (j = 0; j < profiles.length; j++) {
                    controllerMatch = profiles[j].startsWith(idPrefix);
                    if (controllerMatch) { break; }
                }
            } else {
                controllerMatch = profiles.length > 0 && profiles[0].startsWith(idPrefix);
            }
        }
        if (!controllerMatch) { continue; }
        // Vive controllers are assigned handedness at runtime and it might not be always available.
        controllerHasHandedness = controller.handedness === 'right' || controller.handedness === 'left';
        if (controllerHasHandedness) {
            if (controller.handedness === handedness) { return controllers[i]; }
        } else { // Fallback to index if controller has no handedness.
            if ((i === index)) { return controllers[i]; }
        }
    }
    return undefined;
}

function isControllerPresentWebXR(component, id, queryObject) {
    var controllers;
    var sceneEl = component.el.sceneEl;
    var trackedControlsSystem = sceneEl && sceneEl.systems['tracked-controls-webxr'];
    if (!trackedControlsSystem) { return false; }

    controllers = trackedControlsSystem.controllers;
    if (!controllers || !controllers.length) { return false; }

    return findMatchingControllerWebXR(
        controllers, id,
        queryObject.hand, queryObject.index, queryObject.iterateControllerProfiles, queryObject.handTracking);
}

var checkControllerPresentAndSetup = function (component, idPrefix, queryObject) {
    var el = component.el;
    var controller;
    var hasWebXR = el.sceneEl.hasWebXR;
    var isControllerPresent = hasWebXR ? isControllerPresentWebXR : isControllerPresentWebVR;
    var isPresent;

    controller = isControllerPresent(component, idPrefix, queryObject);
    isPresent = !!controller;

    // If component was previously paused and now playing, re-add event listeners.
    // Handle the event listeners here since this helper method is control of calling
    // `.addEventListeners` and `.removeEventListeners`.
    if (component.controllerPresent && !component.controllerEventsActive && !hasWebXR) {
        component.addEventListeners();
    }

    // Nothing changed, no need to do anything.
    if (isPresent === component.controllerPresent) { return isPresent; }

    component.controllerPresent = isPresent;

    // Update controller presence.
    if (isPresent) {
        component.addEventListeners();
        component.injectTrackedControls(controller);
        el.emit('controllerconnected', { name: component.name, component: component });
    } else {
        component.removeEventListeners();
        el.emit('controllerdisconnected', { name: component.name, component: component });
    }
};

var BONE_PREFIX = {
    left: 'b_l_',
    right: 'b_r_'
};

var JOINTS = [
    'wrist',
    'thumb-metacarpal',
    'thumb-phalanx-proximal',
    'thumb-phalanx-distal',
    'thumb-tip',
    'index-finger-metacarpal',
    'index-finger-phalanx-proximal',
    'index-finger-phalanx-intermediate',
    'index-finger-phalanx-distal',
    'index-finger-tip',
    'middle-finger-metacarpal',
    'middle-finger-phalanx-proximal',
    'middle-finger-phalanx-intermediate',
    'middle-finger-phalanx-distal',
    'middle-finger-tip',
    'ring-finger-metacarpal',
    'ring-finger-phalanx-proximal',
    'ring-finger-phalanx-intermediate',
    'ring-finger-phalanx-distal',
    'ring-finger-tip',
    'pinky-finger-metacarpal',
    'pinky-finger-phalanx-proximal',
    'pinky-finger-phalanx-intermediate',
    'pinky-finger-phalanx-distal',
    'pinky-finger-tip'
];

var BONE_MAPPING = {
    'wrist': 'wrist',
    'thumb-metacarpal': 'thumb1',
    'thumb-phalanx-proximal': 'thumb2',
    'thumb-phalanx-distal': 'thumb3',
    'thumb-tip': 'thumb_null',
    'index-finger-metacarpal': 'index0',
    'index-finger-phalanx-proximal': 'index1',
    'index-finger-phalanx-intermediate': 'index2',
    'index-finger-phalanx-distal': 'index3',
    'index-finger-tip': 'index_null',
    'middle-finger-metacarpal': 'middle0',
    'middle-finger-phalanx-proximal': 'middle1',
    'middle-finger-phalanx-intermediate': 'middle2',
    'middle-finger-phalanx-distal': 'middle3',
    'middle-finger-tip': 'middle_null',
    'ring-finger-metacarpal': 'ring0',
    'ring-finger-phalanx-proximal': 'ring1',
    'ring-finger-phalanx-intermediate': 'ring2',
    'ring-finger-phalanx-distal': 'ring3',
    'ring-finger-tip': 'ring_null',
    'pinky-finger-metacarpal': 'pinky0',
    'pinky-finger-phalanx-proximal': 'pinky1',
    'pinky-finger-phalanx-intermediate': 'pinky2',
    'pinky-finger-phalanx-distal': 'pinky3',
    'pinky-finger-tip': 'pinky_null'
};

var PINCH_START_DISTANCE = 0.015;
var PINCH_END_DISTANCE = 0.03;
var PINCH_POSITION_INTERPOLATION = 0.5;

/**
 * Controls for hand tracking
 */
AFRAME.registerComponent('oculus-hand-controls', {
    schema: {
        hand: { default: 'right', oneOf: ['left', 'right'] },
        modelStyle: { default: 'mesh', oneOf: ['dots', 'mesh'] },
        modelColor: { default: 'white' }
    },

    bindMethods: function () {
        this.onControllersUpdate = bind(this.onControllersUpdate, this);
        this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
        this.removeControllersUpdateListener = bind(this.removeControllersUpdateListener, this);
    },

    addEventListeners: function () {
        this.el.addEventListener('model-loaded', this.onModelLoaded);
        for (var i = 0; i < this.jointEls.length; ++i) {
            this.jointEls[i].object3D.visible = true;
        }
    },

    removeEventListeners: function () {
        this.el.removeEventListener('model-loaded', this.onModelLoaded);
        for (var i = 0; i < this.jointEls.length; ++i) {
            this.jointEls[i].object3D.visible = false;
        }
    },

    init: function () {
        var sceneEl = this.el.sceneEl;
        var webXROptionalAttributes = sceneEl.getAttribute('webxr').optionalFeatures;
        webXROptionalAttributes.push('hand-tracking');
        sceneEl.setAttribute('webxr', { optionalFeatures: webXROptionalAttributes });
        this.onModelLoaded = this.onModelLoaded.bind(this);
        this.jointEls = [];
        this.controllerPresent = false;
        this.isPinched = false;
        this.pinchEventDetail = { position: new THREE.Vector3() };
        this.indexTipPosition = new THREE.Vector3();

        this.bindMethods();

        this.updateReferenceSpace = this.updateReferenceSpace.bind(this);
        this.el.sceneEl.addEventListener('enter-vr', this.updateReferenceSpace);
        this.el.sceneEl.addEventListener('exit-vr', this.updateReferenceSpace);
    },

    updateReferenceSpace: function () {
        var self = this;
        var xrSession = this.el.sceneEl.xrSession;
        this.referenceSpace = undefined;
        if (!xrSession) { return; }
        var referenceSpaceType = self.el.sceneEl.systems.webxr.sessionReferenceSpaceType;
        xrSession.requestReferenceSpace(referenceSpaceType).then(function (referenceSpace) {
            self.referenceSpace = referenceSpace.getOffsetReferenceSpace(new XRRigidTransform({ x: 0, y: 1.5, z: 0 }));
        }).catch(function (error) {
            self.el.sceneEl.systems.webxr.warnIfFeatureNotRequested(referenceSpaceType, 'tracked-controls-webxr uses reference space ' + referenceSpaceType);
            throw error;
        });
    },

    checkIfControllerPresent: function () {
        var data = this.data;
        var hand = data.hand ? data.hand : undefined;
        checkControllerPresentAndSetup(
            this, '',
            { hand: hand, iterateControllerProfiles: true, handTracking: true });
    },

    play: function () {
        this.checkIfControllerPresent();
        this.addControllersUpdateListener();
    },

    tick: function () {
        var sceneEl = this.el.sceneEl;
        var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
        var frame = sceneEl.frame;
        var trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
        if (!controller || !frame || !trackedControlsWebXR) { return; }
        if (controller.hand) {
            this.el.object3D.position.set(0, 0, 0);
            this.el.object3D.rotation.set(0, 0, 0);
            if (frame.getJointPose) { this.updateHandModel(); }
            this.detectGesture();
        }
    },

    updateHandModel: function () {
        if (this.data.modelStyle === 'dots') {
            this.updateHandDotsModel();
        }

        if (this.data.modelStyle === 'mesh') {
            this.updateHandMeshModel();
        }
    },

    getBone: function (name) {
        var bones = this.bones;
        for (var i = 0; i < bones.length; i++) {
            if (bones[i].name === name) { return bones[i]; }
        }
        return null;
    },

    updateHandMeshModel: function () {
        var frame = this.el.sceneEl.frame;
        var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
        var referenceSpace = this.referenceSpace;

        if (!controller || !this.mesh || !referenceSpace) { return; }
        this.mesh.visible = false;
        for (var inputjoint of controller.hand.values()) {
            var bone;
            var jointPose;
            var jointTransform;
            jointPose = frame.getJointPose(inputjoint, referenceSpace);
            if (!BONE_MAPPING[inputjoint.jointName]) { continue; }
            bone = this.getBone(BONE_PREFIX[this.data.hand] + BONE_MAPPING[inputjoint.jointName]);
            if (bone != null && jointPose) {
                jointTransform = jointPose.transform;
                this.mesh.visible = true;
                bone.position.copy(jointTransform.position).multiplyScalar(100);
                bone.quaternion.set(jointTransform.orientation.x, jointTransform.orientation.y, jointTransform.orientation.z, jointTransform.orientation.w);
            }
        }
    },

    updateHandDotsModel: function () {
        var frame = this.el.sceneEl.frame;
        var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
        var trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
        var referenceSpace = trackedControlsWebXR.system.referenceSpace;
        var jointEl;
        var object3D;
        var jointPose;
        var i = 0;

        for (var inputjoint of controller.hand.values()) {
            jointEl = this.jointEls[i++];
            object3D = jointEl.object3D;
            jointPose = frame.getJointPose(inputjoint, referenceSpace);
            jointEl.object3D.visible = !!jointPose;
            if (!jointPose) { continue; }
            object3D.matrix.elements = jointPose.transform.matrix;
            object3D.matrix.decompose(object3D.position, object3D.rotation, object3D.scale);
            jointEl.setAttribute('scale', { x: jointPose.radius, y: jointPose.radius, z: jointPose.radius });
        }
    },

    detectGesture: function () {
        this.detectPinch();
    },

    detectPinch: (function () {
        var thumbTipPosition = new THREE.Vector3();
        return function () {
            var frame = this.el.sceneEl.frame;
            var indexTipPosition = this.indexTipPosition;
            var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
            var trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
            var referenceSpace = this.referenceSpace || trackedControlsWebXR.system.referenceSpace;
            var indexTip = controller.hand.get('index-finger-tip');
            var thumbTip = controller.hand.get('thumb-tip');
            if (!indexTip ||
                !thumbTip) { return; }
            var indexTipPose = frame.getJointPose(indexTip, referenceSpace);
            var thumbTipPose = frame.getJointPose(thumbTip, referenceSpace);

            if (!indexTipPose || !thumbTipPose) { return; }

            thumbTipPosition.copy(thumbTipPose.transform.position);
            indexTipPosition.copy(indexTipPose.transform.position);

            var distance = indexTipPosition.distanceTo(thumbTipPosition);

            if (distance < PINCH_START_DISTANCE && this.isPinched === false) {
                this.isPinched = true;
                this.pinchEventDetail.position.copy(indexTipPosition).lerp(thumbTipPosition, PINCH_POSITION_INTERPOLATION);
                this.pinchEventDetail.position.y += 1.5;
                this.el.emit('pinchstarted', this.pinchEventDetail);
            }

            if (distance > PINCH_END_DISTANCE && this.isPinched === true) {
                this.isPinched = false;
                this.pinchEventDetail.position.copy(indexTipPosition).lerp(thumbTipPosition, PINCH_POSITION_INTERPOLATION);
                this.pinchEventDetail.position.y += 1.5;
                this.el.emit('pinchended', this.pinchEventDetail);
            }

            if (this.isPinched) {
                this.pinchEventDetail.position.copy(indexTipPosition).lerp(thumbTipPosition, PINCH_POSITION_INTERPOLATION);
                this.pinchEventDetail.position.y += 1.5;
                this.el.emit('pinchmoved', this.pinchEventDetail);
            }

            indexTipPosition.y += 1.5;
        };
    })(),

    pause: function () {
        this.removeEventListeners();
        this.removeControllersUpdateListener();
    },

    injectTrackedControls: function () {
        var el = this.el;
        var data = this.data;
        el.setAttribute('tracked-controls', {
            hand: data.hand,
            iterateControllerProfiles: true,
            handTrackingEnabled: true
        });
        this.initDefaultModel();
    },

    addControllersUpdateListener: function () {
        this.el.sceneEl.addEventListener('controllersupdated', this.onControllersUpdate, false);
    },

    removeControllersUpdateListener: function () {
        this.el.sceneEl.removeEventListener('controllersupdated', this.onControllersUpdate, false);
    },

    onControllersUpdate: function () {
        var controller;
        this.checkIfControllerPresent();
        controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
        if (!this.el.getObject3D('mesh')) { return; }
        if (!controller || !controller.hand || !controller.hand[0]) {
            this.el.getObject3D('mesh').visible = false;
        }
    },

    initDefaultModel: function () {
        if (this.el.getObject3D('mesh')) { return; }
        if (this.data.modelStyle === 'dots') {
            this.initDotsModel();
        }

        if (this.data.modelStyle === 'mesh') {
            this.initMeshHandModel();
        }
    },

    initDotsModel: function () {
        // Add models just once.
        if (this.jointEls.length !== 0) { return; }
        for (var i = 0; i < JOINTS.length; ++i) {
            var jointEl = this.jointEl = document.createElement('a-entity');
            jointEl.setAttribute('geometry', {
                primitive: 'sphere',
                radius: 1.0
            });
            jointEl.setAttribute('material', { color: this.data.modelColor });
            jointEl.object3D.visible = false;
            this.el.appendChild(jointEl);
            this.jointEls.push(jointEl);
        }
    },

    initMeshHandModel: function () {
        var LEFT_HAND_MODEL = 'https://cdn.aframe.io/controllers/oculus-hands/v3/left.glb';
        var RIGHT_HAND_MODEL = 'https://cdn.aframe.io/controllers/oculus-hands/v3/right.glb';

        var modelURL = this.data.hand === 'left' ? LEFT_HAND_MODEL : RIGHT_HAND_MODEL;
        this.el.setAttribute('gltf-model', modelURL);
    },

    onModelLoaded: function () {
        var mesh = this.mesh = this.el.getObject3D('mesh').children[0];
        var skinnedMesh = this.skinnedMesh = mesh.children[30];
        if (!this.skinnedMesh) { return; }
        this.bones = skinnedMesh.skeleton.bones;
        this.el.removeObject3D('mesh');
        mesh.position.set(0, 1.5, 0);
        mesh.rotation.set(0, 0, 0);
        skinnedMesh.frustumCulled = false;
        skinnedMesh.material = new THREE.MeshStandardMaterial({ skinning: true, color: this.data.modelColor });
        this.el.setObject3D('mesh', mesh);
    }
});