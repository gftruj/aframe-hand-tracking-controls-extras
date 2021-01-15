export const component = AFRAME.registerComponent("world-drag", {
    schema: {
        rig: { type: "selector" }
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
        this.el.removeEventListener("pinchstarted", this.pinchUp);
        this.el.removeEventListener("pinchended", this.pinchDown);
    },
    tick: (function () {

        const indexPosition = new THREE.Vector3();
        const cameraPosition = new THREE.Vector3();
        const hand_camera_orientation = new THREE.Vector2();
        const UP = new THREE.Vector3(0, 1, 0)

        var prevAngle = undefined;

        return function () {
            if (!this.joints) return;

            let index = this.joints.I_Tip;
            if (!index.isValid()) {
                return;
            }

            index.getPosition(indexPosition);
            cameraPosition.copy(this.camera.object3D.position);

            // position on head level near head
            if (Math.abs(indexPosition.y - cameraPosition.y) < 0.15 && indexPosition.distanceTo(cameraPosition) < 0.6 && this.isPinching) {
                // get the "initial" angle
                let z = indexPosition.z - this.camera.object3D.position.z;
                let x = indexPosition.x - this.camera.object3D.position.x;
                hand_camera_orientation.set(x, z).normalize();
                let angle = Math.atan2(hand_camera_orientation.y, hand_camera_orientation.x)

                if (prevAngle === undefined) {
                    prevAngle = angle
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
                prevAngle = undefined;
            }
        }
    })()
})