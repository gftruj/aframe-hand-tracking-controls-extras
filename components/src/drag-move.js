export const component = AFRAME.registerComponent("drag-move", {
    schema: {
        rig: { type: "selector" },
        speed: { default: 1 }
    },
    init: function () {
        this.isPinching = false;

        this.pinchUp = this.setPinch.bind(this, true);
        this.pinchDown = this.setPinch.bind(this, false);
        this.handExtrasReady = this.handExtrasReady.bind(this);

        this.el.addEventListener("pinchstarted", this.pinchUp);
        this.el.addEventListener("pinchmoved", this.pinchUp);
        this.el.addEventListener("pinchended", this.pinchDown);
        this.el.addEventListener("hand-tracking-extras-ready", this.handExtrasReady)

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
        this.isPinching = isPinching
    },
    handExtrasReady: function (evt) {
        this.jointAPI = evt.detail.data.jointAPI
    },
    remove: function () {
        this.el.removeEventListener("hand-tracking-extras-ready", this.handExtrasReady)
        this.el.removeEventListener("pinchstarted", this.pinchUp);
        this.el.removeEventListener("pinchmoved", this.pinchUp);
        this.el.removeEventListener("pinchended", this.pinchDown);
    },
    tick: (function () {
        const pinchDiff = new THREE.Vector3(0, 0, 0)
        const tmpv = new THREE.Vector3();
        const tmp2 = new THREE.Vector3();
        return function () {
            if (!this.jointAPI) return;
            if (!this.data.rig) return;
            if (!this.isPinching) return;

            const index_tip = this.jointAPI.getIndexTip()
            if (!index_tip.isValid()) return

            const rig = this.data.rig;
            const lastPinchPosition = this.lastPinchPosition;
            const currentPinchPosition = this.currentPinchPosition;
            tmpv.copy(lastPinchPosition)
            tmp2.copy(currentPinchPosition)

            pinchDiff
                .copy(tmpv)
                .multiplyScalar(-1)
                .add(tmp2)
                .multiplyScalar(-1 * this.data.speed)
                .applyQuaternion(rig.object3D.quaternion)
                
            rig.object3D.position.add(pinchDiff)
            lastPinchPosition.copy(currentPinchPosition);
        }
    })()
})