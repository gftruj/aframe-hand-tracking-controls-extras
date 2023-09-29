export const component = AFRAME.registerComponent("finger-cursor", {
    schema: {
        lineColor: { default: "blue" },
        lineLength: { default: "5" },
        pointThreshold: { default: 0.95 }
    },
    init: function () {
        this.el.setAttribute("line", {
            "color": "steelblue",
            "start": "0 0 0",
            "opacity": 0.25,
            "end": "0 0 -2"
        })
        this.el.setAttribute("cursor", {
            "rayOrigin": "entity",
            "fuse": "true"
        })

        this.activated = false;
        this.handEl = this.el.parentNode;

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onHandTrackingLoaded = this.onHandTrackingLoaded.bind(this);

        this.el.addEventListener("mouseenter", this.onMouseEnter)
        this.el.addEventListener("mouseleave", this.onMouseLeave)
        this.handEl.addEventListener("hand-tracking-extras-ready", this.onHandTrackingLoaded)
    },
    onMouseEnter: function (evt) {
        this.isec = evt.detail.intersectedEl;
    },
    onMouseLeave: function () {
        this.isec = null
    },
    onHandTrackingLoaded: function (evt) {
        this.jointAPI = evt.detail.data.jointAPI;
    },
    activate: function () {
        this.activated = true
        this.el.components.cursor.play();
        this.el.setAttribute("line", "visible", this.activated);
    },
    deactivate: function () {
        this.activated = false
        this.el.components.cursor.pause();
        this.el.setAttribute("line", "visible", this.activated)
    },
    setLineLength: function (d) {
        if (this.currentLineLen && this.currentLineLen == d) return;
        this.currentLineLen = d;
        this.el.setAttribute("line", "end", AFRAME.utils.coordinates.stringify({ x: 0, y: 0, z: -d }))
    },
    remove: function () {
        this.el.removeAttribute("cursor")
        this.el.removeAttribute("line")
    },
    tick: (function () {
        const ITipDir = new THREE.Vector3();
        const ITipPosition = new THREE.Vector3();
        const ITipQuaternion = new THREE.Quaternion();
        const IProximalDir = new THREE.Vector3();

        return function () {
            if (!this.jointAPI) return;

            const IProximalBone = this.jointAPI.getIndexProximal();
            const ITipBone = this.jointAPI.getIndexTip();

            if (!(IProximalBone.isValid() && ITipBone.isValid())) {
                if (this.activated) this.deactivate();
                return;
            }

            IProximalBone.getDirection(IProximalDir)
            ITipBone.getDirection(ITipDir)
            ITipBone.getPosition(ITipPosition)
            ITipBone.getQuaternion(ITipQuaternion)

            const mesh = this.el.getObject3D("mesh") || this.el.object3D

            mesh.position.copy(ITipPosition)
            mesh.quaternion.copy(ITipQuaternion)

            // show / hide line
            if (IProximalDir.dot(ITipDir) >= this.data.pointThreshold) {
                if (!this.activated) this.activate()
            } else if (this.activated) {
                this.deactivate()
            }

            // line length
            if (this.activated) {
                if (this.isec) {
                    const rayEl = this.el.components.raycaster;
                    const intersection = rayEl.getIntersection(this.isec);
                    if (intersection) {
                        this.setLineLength(intersection.point.distanceTo(ITipPosition))
                    }
                } else {
                    this.setLineLength(this.data.lineLength)
                }
            }
        }
    })()
})