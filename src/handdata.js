import { JointObject } from './JointObject';

export function HandData() {
    // float32 array helpers
    const Joint_Count = 25;
    const rotMtx = {
        elements: new Float32Array(16)
    }
    
    // Sacred keepers of all data available through the Object oriented JointObject
    const radii = new Float32Array(Joint_Count);
    const transforms = new Float32Array(4*4 * Joint_Count);
    var validPoses = false;


    // Threejs helpers. 
    var tmpVector = new THREE.Vector3();
    var tmpQuaternion = new THREE.Quaternion();
    var tmpDummy = new THREE.Object3D();

    // initialize all joint objects
    let num = 0;
    const joints = {
        // wrist
        Wrist: new JointObject("wrist", num++, this),
        // thumb
        T_Metacarpal: new JointObject("thumb-metacarpal", num++, this),
        T_Proximal: new JointObject("thumb-phalanx-proximal", num++, this),
        T_Distal: new JointObject("thumb-phalanx-distal", num++, this),
        T_Tip: new JointObject("thumb-tip", num++, this),
        // index
        I_Metacarpal: new JointObject("index-finger-metacarpal", num++, this),
        I_Proximal: new JointObject("index-finger-phalanx-proximal", num++, this),
        I_Intermediate: new JointObject("index-finger-phalanx-intermediate", num++, this),
        I_Distal: new JointObject("index-finger-phalanx-distal", num++, this),
        I_Tip: new JointObject("index-finger-tip", num++, this),
        // middle
        M_Metacarpal: new JointObject("middle-finger-metacarpal", num++, this),
        M_Proximal: new JointObject("middle-finger-phalanx-proximal", num++, this),
        M_Intermediate: new JointObject("middle-finger-phalanx-intermediate", num++, this),
        M_Distal: new JointObject("middle-finger-phalanx-distal", num++, this),
        M_Tip: new JointObject("middle-finger-tip", num++, this),
        // ring
        R_Metacarpal: new JointObject("ring-finger-metacarpal", num++, this),
        R_Proximal: new JointObject("ring-finger-phalanx-proximal", num++, this),
        R_Intermediate: new JointObject("ring-finger-phalanx-intermediate", num++, this),
        R_Distal: new JointObject("ring-finger-phalanx-distal", num++, this),
        R_Tip: new JointObject("ring-finger-tip", num++, this),
        // little
        L_Metacarpal: new JointObject("pinky-finger-metacarpal", num++, this),
        L_Proximal: new JointObject("pinky-finger-phalanx-proximal", num++, this),
        L_Intermediate: new JointObject("pinky-finger-phalanx-intermediate", num++, this),
        L_Distal: new JointObject("pinky-finger-phalanx-distal", num++, this),
        L_Tip: new JointObject("pinky-finger-tip", num++, this),
    }
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
        getLittleTip: () => joints.L_Tip,
    }

    // iterate through the poses and update the arrays
    this.updateData = (controller, frame, referenceSpace) => {
        frame.fillJointRadii(controller.hand.values(), radii);
        validPoses = frame.fillPoses(controller.hand.values(), referenceSpace, transforms)
        if (!validPoses) return;
    }

    // "normal" helper 
    const normalQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));


    this.getOrientedQuaternion = (id, _quaternion) => {
        return this.getQuaternion(id, _quaternion);
    }

    this.getDirection = (id , _vector) => {
        // normalized e[ 8 ], e[ 9 ], e[ 10 ] 
        const mtxOffset = id * 16;
        const vector = _vector ? _vector : tmpVector.clone();
        return vector.fromArray(transforms, mtxOffset + 8).normalize().negate();

    }

    this.getNormal = (id, _vector) => {
        let vector = _vector ? _vector : tmpVector.clone();
        this.getQuaternion(id, tmpQuaternion).multiply(normalQuaternion)
        tmpDummy.quaternion.copy(tmpQuaternion)
        tmpDummy.getWorldDirection(vector);
        return vector;
    }

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
    }
    this.getPosition = (id, _vector) => {
        // position is 12 13 14 in the world matrix
        const mtxOffset = id * 16;

        let vector = _vector ? _vector : tmpVector.clone();
        return vector.fromArray(transforms, mtxOffset + 12);
    }
    this.getRadius = (id) => {
        return radii[id];
    }
    this.getValidity = () => validPoses;
} 