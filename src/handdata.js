import { JointObject } from './JointObject';

export function HandData() {
    // float32 array helpers
    const Quaternion_Size = 4;
    const Vector_Size = 3;
    const Joint_Count = 25;

    // Sacred keepers of all data available through the Object oriented JointObject
    var rawQuaternion_array = new Float32Array(Quaternion_Size * Joint_Count);
    var position_array = new Float32Array(Vector_Size * Joint_Count);
    var radius_array = new Float32Array(Joint_Count);
    var validity_array = new Int8Array(Joint_Count);

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
        getIndexIntermediat: () => joints.I_Intermediate,        
        getIndexDistal: () => joints.I_Distal,
        getIndexTip: () => joints.I_Tip,

        getMiddleMetacarpal: () => joints.M_Metacarpal,
        getMiddleProximal: () => joints.M_Proximal,
        getMiddleIntermediat: () => joints.M_Intermediate,        
        getMiddleDistal: () => joints.M_Distal,
        getMiddleTip: () => joints.M_Tip,

        getRingMetacarpal: () => joints.R_Metacarpal,
        getRingProximal: () => joints.R_Proximal,
        getRingIntermediat: () => joints.R_Intermediate,        
        getRingDistal: () => joints.R_Distal,
        getRingTip: () => joints.R_Tip,

        getLittleMetacarpal: () => joints.L_Metacarpal,
        getLittleProximal: () => joints.L_Proximal,
        getLittleIntermediat: () => joints.L_Intermediate,        
        getLittleDistal: () => joints.L_Distal,
        getLittleTip: () => joints.L_Tip,
    }
    
    // iterate through the poses and update the arrays
    this.updateData = (controller, frame, referenceSpace) => {

        for (let jointRef in this.joints) {
            // the XRHand joints can be nulls
            const joint = controller.hand.get(this.joints[jointRef].id);
            if (!joint) continue;

            // grab the pose and gather data
            var rawPose = frame.getJointPose(joint, referenceSpace);
            if (rawPose) {
                setDataFromPose(this.joints[jointRef].num, rawPose)
            } else {
                setValidityById(this.joints[jointRef].num, false);
            }
        }
    }

    function setDataFromPose(id, rawPose) {
        // orientation
        tmpQuaternion.copy(rawPose.transform.orientation)
        setPoseQuaternionById(id, tmpQuaternion)

        // position. 
        tmpVector.copy(rawPose.transform.position);
        setPositionById(id, tmpVector);

        // radius
        setRadiusById(id, rawPose.radius)

        // validity
        setValidityById(id, true);
    }

    // "normal" is actually the "inside" 
    const normalQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));

    function toForward(vector) {
        return vector.set(0, 0, -1);
    }

    this.getOrientedQuaternion = (id, _quaternion) => {
        return this.getPoseQuaternion(id, _quaternion);
    }

    this.getDirection = (id, _vector) => {
        let vector = _vector ? _vector : tmpVector.clone();
        toForward(vector).applyQuaternion(this.getOrientedQuaternion(id, tmpQuaternion));
        return vector.copy(vector);
    }

    this.getNormal = (id, _vector) => {
        let vector = _vector ? _vector : tmpVector.clone();
        this.getOrientedQuaternion(id, tmpQuaternion).multiply(normalQuaternion);

        tmpDummy.quaternion.copy(tmpQuaternion)
        tmpDummy.getWorldDirection(vector);
        return vector;
    }

    /* Pose Setters and getters */
    function setPoseQuaternionById(id, quaternion) {
        quaternion.toArray(rawQuaternion_array, id * Quaternion_Size)
    }

    function setPositionById(id, vector) {
        vector.toArray(position_array, id * Vector_Size)
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
    }
    this.getPosition = (id, _vector) => {
        let vector = _vector ? _vector : tmpVector.clone();
        return vector.fromArray(position_array, id * Vector_Size);
    }
    this.getRadius = (id) => radius_array[id];
    this.getValidity = (id) => validity_array[id];
} 