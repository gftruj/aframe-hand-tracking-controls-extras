import { JointObject } from './JointObject';

export function HandData(_side) {
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
    function initPoses() {
        this.joints = {
            // wrist
            Wrist: new JointObject(XRHand.WRIST, this),
            // thumb
            T_Metacarpal: new JointObject(XRHand.THUMB_METACARPAL, this),
            T_Proximal: new JointObject(XRHand.THUMB_PHALANX_PROXIMAL, this),
            T_Distal: new JointObject(XRHand.THUMB_PHALANX_DISTAL, this),
            T_Tip: new JointObject(XRHand.THUMB_PHALANX_TIP, this),
            // index
            I_Metacarpal: new JointObject(XRHand.INDEX_METACARPAL, this),
            I_Proximal: new JointObject(XRHand.INDEX_PHALANX_PROXIMAL, this),
            I_Intermediate: new JointObject(XRHand.INDEX_PHALANX_INTERMEDIATE, this),
            I_Distal: new JointObject(XRHand.INDEX_PHALANX_DISTAL, this),
            I_Tip: new JointObject(XRHand.INDEX_PHALANX_TIP, this),
            // middle
            M_Metacarpal: new JointObject(XRHand.MIDDLE_METACARPAL, this),
            M_Proximal: new JointObject(XRHand.MIDDLE_PHALANX_PROXIMAL, this),
            M_Intermediate: new JointObject(XRHand.MIDDLE_PHALANX_INTERMEDIATE, this),
            M_Distal: new JointObject(XRHand.MIDDLE_PHALANX_DISTAL, this),
            M_Tip: new JointObject(XRHand.MIDDLE_PHALANX_TIP, this),
            // ring
            R_Metacarpal: new JointObject(XRHand.RING_METACARPAL, this),
            R_Proximal: new JointObject(XRHand.RING_PHALANX_PROXIMAL, this),
            R_Intermediate: new JointObject(XRHand.RING_PHALANX_INTERMEDIATE, this),
            R_Distal: new JointObject(XRHand.RING_PHALANX_DISTAL, this),
            R_Tip: new JointObject(XRHand.RING_PHALANX_TIP, this),
            // little
            L_Metacarpal: new JointObject(XRHand.LITTLE_METACARPAL, this),
            L_Proximal: new JointObject(XRHand.LITTLE_PHALANX_PROXIMAL, this),
            L_Intermediate: new JointObject(XRHand.LITTLE_PHALANX_INTERMEDIATE, this),
            L_Distal: new JointObject(XRHand.LITTLE_PHALANX_DISTAL, this),
            L_Tip: new JointObject(XRHand.LITTLE_PHALANX_TIP, this),
        }
    }
    initPoses.call(this);

    // iterate through the poses and update the arrays
    this.updateData = (controller, frame, referenceSpace) => {
        for (let joint in this.joints) {
            var rawPose = frame.getJointPose(controller.hand[this.joints[joint].id], referenceSpace);
            if (rawPose) {
                setDataFromPose(this.joints[joint].id, rawPose)
            } else {
                setValidityById(this.joints[joint].id, false);
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


    // hand orientation helpers
    const side = _side;
    this.getSide = () => side;
    // "normal" is actually the "inside" 
    const normalQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    const rightHandOrientationBias = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI/2, 0));
    const leftHandOrientationBias = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI, -Math.PI/2, 0));

     function toForward(vector) {
        return vector.set(0, 0, -1);
    }
    
    this.getOrientedQuaternion = (id, _quaternion) => {
        let orientation = side === "left" ? leftHandOrientationBias : rightHandOrientationBias;
        return this.getPoseQuaternion(id, _quaternion).multiply(orientation);
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