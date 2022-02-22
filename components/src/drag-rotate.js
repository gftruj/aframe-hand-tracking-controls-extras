export const component = AFRAME.registerComponent("drag-rotate", {
    schema: {
        rig: { type: "selector" },
        fingerToHMDHeight: { default: 0.15 },
        fingerToHMDDistance: { default: 0.6 }
    },
    init: function () {
        this.isPinching = false;

        this.pinchUp = this.setPinch.bind(this, true);
        this.pinchDown = this.setPinch.bind(this, false);
        this.handExtrasReady = this.handExtrasReady.bind(this);

        this.el.addEventListener("pinchstarted", this.pinchUp);
        this.el.addEventListener("pinchended", this.pinchDown);
        this.el.addEventListener("hand-tracking-extras-ready", this.handExtrasReady)

        this.camera = this.el.sceneEl.camera.el;
        this.rig = this.data.rig;
    },
    setPinch: function (isPinching) {
        this.isPinching = isPinching
    },
    handExtrasReady: function (evt) {
        this.joints = evt.detail.data.joints
    },
    remove: function () {
        this.el.removeEventListener("hand-tracking-extras-ready", this.handExtrasReady)
        this.el.removeEventListener("pinchstarted", this.pinchUp);
        this.el.removeEventListener("pinchended", this.pinchDown);
    },
    tick: (function () {
        const indexPosition = new THREE.Vector3();
        const cameraPosition = new THREE.Vector3();
        const hand_camera_orientation = new THREE.Vector2();
        const UP = new THREE.Vector3(0, 1, 0)

        var prevAngle = undefined;

        function stopDragging(el) {
            prevAngle = undefined;
            el.emit("dragend")
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
                let angle = Math.atan2(hand_camera_orientation.y, hand_camera_orientation.x)

                if (prevAngle === undefined) {
                    prevAngle = angle
                    el.emit("dragstart")
                    return;
                }

                let theta = -(prevAngle - angle)
                prevAngle = angle

                // use a global
                cameraPosition.setFromMatrixPosition(this.camera.object3D.matrixWorld); // why getWorldPosition isn't working lol
                let point = cameraPosition;

                // rotate the rig around the camera
                let rig = this.rig;
                rig.object3D.position.add(point.negate()); // remove the offset
                rig.object3D.position.applyAxisAngle(UP, theta); // rotate the POSITION
                rig.object3D.position.add(point.negate()); // re-add the offset
                rig.object3D.rotateOnAxis(UP, theta); // rotate the OBJECT
            } else {
                return stopDragging(el);
            }
        }
    })()
})