require('./extended-teleport-controls');

export const component = AFRAME.registerComponent("hand-teleport", {
  schema: {
    rig: { type: "selector" },
    xr: {default: true},
    origin: { type: "selector" },
    fadeSphereRadius: { default: "0.1" },
    fadeDuration: { default: 200 }
  },
  init: function () {
    const tp_comp_name = "extended-teleport-controls"
    // tp origin entity
    this.tpEntity = document.createElement("a-entity")
    this.tpEntity.setAttribute(tp_comp_name, {
      "startEvents": "tp-up",
      "endEvents": "tp-down",
      "cameraRig": this.data.rig,
      "abortEvents": "tp-abort",  // I need a "nevermind" feature
      "teleportOrigin": this.data.origin
    })
    this.el.appendChild(this.tpEntity)
    this.tpComponent = this.tpEntity.components[tp_comp_name]

    // anti - vomit crossfade sphere
    this.fadeSphere = document.createElement("a-sphere")
    this.fadeSphere.setAttribute("radius", this.data.fadeSphereRadius)
    this.fadeSphere.setAttribute("material", {
      "color": "black",
      "transparent": "true",
      "opacity": "0.0",
      "shader": "flat",
      "side": "back"
    })
    this.fadeSphere.setAttribute("animation__fadeout", {
      "property": "material.opacity",
      "to": "1.0",
      "dur": this.data.fadeDuration,
      "startEvents": "fadeout"
    })
    this.fadeSphere.setAttribute("animation__fadein", {
      "property": "material.opacity",
      "to": "0.0",
      "dur": this.data.fadeDuration,
      "startEvents": "fadein"
    })
    this.sphereFaded = this.sphereFaded.bind(this);
    this.fadeSphere.addEventListener("animationcomplete__fadeout", this.sphereFaded);
    this.el.sceneEl.camera.el.appendChild(this.fadeSphere);

    // one jump per pinch
    this.canJump = true;
    // whether we are ready to jump
    this.tpUp = false;

    // bind and listen
    this.handExtrasReady = this.handExtrasReady.bind(this);
    this.pinchStarted = this.pinchStarted.bind(this);
    this.pinchEnded = this.pinchEnded.bind(this);

    this.el.addEventListener("hand-tracking-extras-ready", this.handExtrasReady)
    this.el.addEventListener("pinchstarted", this.pinchStarted);
    this.el.addEventListener("pinchended", this.pinchEnded);
  },
  update: function (oldData) {
    let diff = AFRAME.utils.diff(this.data, oldData);
    if ("fadeSphereRadius" in diff) {
      this.fadeSphere.setAttribute("radius", this.data.fadeSphereRadius)
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
  tick: (function () {
    const normal = new THREE.Vector3();

    return function () {
      // grab hand data if valid
      if (!this.jointAPI) return;

      // teleport origin
      let wrist = this.jointAPI.getWrist();

      if (!wrist.isValid()) {
        // if the tp is up - hide it
        if (this.tpUp) {
          this.tpEntity.emit("tp-abort");
          this.tpUp = false;
        }
        return;
      }

      // position and orient the "tp helper" at the wrist
      wrist.getPosition(this.tpEntity.object3D.position);
      wrist.getQuaternion(this.tpEntity.object3D.quaternion);

      // gesture helpers
      wrist.getNormal(normal);
      // react only to "palm" up
      if (normal.y < 0.7) {
        if (this.tpUp) {
          this.tpEntity.emit("tp-abort");
          this.tpUp = false;
        }
        return;
      }

      // emit once
      if (!this.tpUp) {
        this.tpEntity.emit("tp-up");
        this.tpUp = true;
      }
    }
  })()
})