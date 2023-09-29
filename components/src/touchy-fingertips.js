AFRAME.registerComponent("cube-ray", {
    schema: {
      showLines: {
        default: true
      },
      far: {
        default: 0.1
      },
      objects: {
        default: "[data-raycastable]"
      }
    },
    createRaySetupData: function(x, y, z) {
      return {
        direction: new THREE.Vector3(x, y, z),
        element: document.createElement("a-entity")
      }
    },
    init: function() {
      this.raySetup = {
        xUp: this.createRaySetupData(1, 0, 0),
        xDown: this.createRaySetupData(-1, 0, 0),
        yUp: this.createRaySetupData(0, 1, 0),
        yDown: this.createRaySetupData(0, -1, 0),
        zUp: this.createRaySetupData(0, 0, 1),
        zDown: this.createRaySetupData(0, 0, -1)
      }
      for (let dir in this.raySetup) {
        this.el.appendChild(this.raySetup[dir].element);
      }
      this.updateRaycaster = this.updateRaycaster.bind(this);
    },
    updateRaycaster(rayname) {
      this.raySetup[rayname].element.setAttribute(`cursor`, {
        fuse: true,
        fuseTimeout: 25
      })
      this.raySetup[rayname].element.setAttribute(`raycaster`, {
        direction: this.raySetup[rayname].direction,
        showLine: this.data.showLines,
        lineColor: "blue",
        far: this.data.far,
        objects: this.data.objects
      })
    },
    update: function() {
      for (let dir in this.raySetup) {
        this.updateRaycaster(dir)
      }
    },
    remove: function() {
      for (let dir in this.raySetup) {
        this.el.removeChild(this.raySetup[dir].element)
      }
    }
  });


AFRAME.registerComponent("touchy-fingertip", {
    schema: {
        debug: {
            default: false
        },
        far: {
            default: 0.01
        },
      objects: {
        default: "[data-raycastable]"
      }
    },
    init: function () {
        this.fingertips = {};
        this.onHandTrackingLoaded = this.onHandTrackingLoaded.bind(this);
        this.el.addEventListener("hand-tracking-extras-ready", this.onHandTrackingLoaded);
    },
    onHandTrackingLoaded: function (evt) {
        this.jointAPI = evt.detail.data.jointAPI;
        this.indexTip = this.jointAPI.getIndexTip();
        this.touchyTip = document.createElement("a-entity")
        this.touchyTip.setAttribute("cube-ray", {
            showLines: this.data.debug,
            far: this.data.far,
            objects: this.data.objects
        })
        console.log(this.data.far)
        this.el.appendChild(this.touchyTip)
    },
    tick: (function () {
        return function () {
            // wait for the fingertips
            if (!this.indexTip) return
            
            const tip = this.indexTip;
            const raysObj = this.touchyTip.object3D
            if (!tip.isValid()) {               
                return;
            }
            tip.getPosition(raysObj.position);
        }
    })()
})