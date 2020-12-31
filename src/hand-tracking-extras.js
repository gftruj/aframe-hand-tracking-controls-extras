import { HandData } from './handdata';

export default AFRAME.registerComponent("hand-tracking-extras", {
    schema: {
        // whether you want to override the default behaviour
        override: { default: true }
    },
    init: function () {
        // parasite off the existing components
        const handTrackingComp = this.el.components["hand-tracking-controls"];
        const hand = this.el.getAttribute("hand-tracking-controls").hand;
        var trackedControlsComp = this.el.components["tracked-controls"];
        var trackedControlsWebXrComp = this.el.components["tracked-controls-webxr"];

        if (!handTrackingComp) {
            console.warn("hand-tracking-extras require hand-tracking-controls. The component needs to be re-attached")
            return;
        }
 
        var self = this;
        if (this.data.override) {
            // don't like this bit - hacking into the actual hand tracking controls.
            var bind = AFRAME.utils.bind;
            handTrackingComp.detectGesture = bind(() => {
                if (!trackedControlsComp && !trackedControlsWebXrComp) {
                    trackedControlsComp = this.el.components["tracked-controls"];
                    trackedControlsWebXrComp = this.el.components["tracked-controls-webxr"];
                    return;
                }

                if (!self.HandData) {
                    self.HandData = new HandData(hand);
                    self.el.emit("hand-tracking-extras-ready", {data: self.HandData})
                }

                var frame = this.el.sceneEl.frame;
                var controller = trackedControlsComp && trackedControlsComp.controller;
                var referenceSpace = this.referenceSpace || trackedControlsWebXrComp.system.referenceSpace;
                if (!(frame && controller && referenceSpace)) return;
                self.HandData.updateData(controller, frame, referenceSpace)
            })
        }
    }
})
