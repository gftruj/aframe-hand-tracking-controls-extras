import { HandData } from './handdata';

export default AFRAME.registerComponent("hand-tracking-extras", {
    init: function () {
        this.el.addEventListener("enter-vr", this.play);
        this.el.addEventListener("exit-vr", this.pause);
    },
    tick: (function() {
        return function() {
        if (this.isPaused) return;
        var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
        
        var trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
        if (!trackedControlsWebXR) return;

        var referenceSpace = trackedControlsWebXR.system.referenceSpace;
        var frame = this.el.sceneEl.frame;

        if (!controller || !frame || !referenceSpace) { return; }

        if (!this.HandData) {
            this.HandData = new HandData();
            this.el.emit("hand-tracking-extras-ready", {data: this.HandData})
        }

        this.HandData.updateData(controller, frame, referenceSpace)
    }
    })(),
    play: function() {
        this.isPaused = false;
    },
    pause: function() {
        this.isPaused = true;
    },
    remove: function() {
        this.el.removeEventListener("enter-vr", this.play);
        this.el.removeEventListener("exit-vr", this.pause)
    },
    getRawJoints() {
        if (this.HandData) return this.HandData.joints;
        return null;
    },
    getJoints() {
        if (this.HandData) return this.HandData.jointAPI;
        return null;
    }
})
