AFRAME.registerComponent("obelisk", {
    schema: {
        color: { default: "gray" },
        cubemap: {},
    },
    init: function () {
        let bottom = document.createElement("a-box")
        bottom.setAttribute("color", "gray")
        bottom.setAttribute("scale", "1 0.25 1")

        let top = document.createElement("a-entity")
        top.setAttribute("position", "0 1.25 0")
        top.setAttribute("look-at",)

        /* Having trouble with removing vertices with a spherebuffergeometry...??? */
        let geo = new THREE.SphereGeometry(1, 32, 32);
        let extSphere = new THREE.Mesh(geo,
            new THREE.MeshStandardMaterial({ color: new THREE.Color(this.data.color) }))
        //geo.dispose();
        extSphere.rotation.set(-Math.PI / 2, 0, 0)
        top.object3D.add(extSphere)

        this.theta = Math.PI

        let path = this.data.cubemap;
        let texture = new THREE.CubeTextureLoader().
            setPath(path).
            load([
                '/posx.jpg', '/negx.jpg',
                '/posy.jpg', '/negy.jpg',
                '/posz.jpg', '/negz.jpg'
            ]);
        texture.mapping = THREE.CubeRefractionMapping

        let wonderCube = new THREE.Mesh(this.getSphere(this.theta),
            new THREE.MeshBasicMaterial({ envMap: texture, side: THREE.BackSide }));
        wonderCube.frustumCulled = false;                           // render from the beginning to prevent freezing
        wonderCube.position.y = top.object3D.position.y
        this.el.object3D.add(wonderCube)

        top.setAttribute("animation__levitate", {
            "property": "position",
            "loop": "true",
            "from": "0 1.25 0",
            "to": "0 1.6 0",
            "easing": "easeInOutQuart",
            "dur": "5000",
            "dir": "alternate"
        })

        this.el.appendChild(bottom);
        this.el.appendChild(top);

        // expose
        this.top = top;
        this.extSphere = extSphere;

        extSphere.geometry.attributes.position.count = 100
        this.wonderCube = wonderCube
        this.faceCount = this.extSphere.geometry.attributes.position.count
    },
    getSphere(theta) {
        return new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, theta)
    },
    clampTheta(theta) {
        return Math.min(Math.max(theta, 0), Math.PI)
    },
    decreaseTheta(theta) {
        if (theta > 0) return this.clampTheta(theta - 0.02);
    },
    increaseTheta(theta) {
        if (theta < Math.PI) return this.clampTheta(theta + 0.02)
    },
    tick: (function () {

        let camPos = new THREE.Vector3();
        let objPos = new THREE.Vector3();

        // this is a freeze-prevention-workaround. renderer.compile did not help :(
        let ticks = 0;
        return function (t, dt) {

            // keep the cube animated
            this.wonderCube.position.y = this.top.object3D.position.y
            if (ticks++ > 30)
                this.wonderCube.frustumCulled = true;           // back to normal after a few ticks. This is purely workaroundish

            // keep the sphere oriented 
            camPos.setFromMatrixPosition(this.el.sceneEl.camera.el.object3D.matrixWorld); // why getWorldPosition isn't working lol
            this.top.object3D.lookAt(camPos)

            // show / hide
            let mesh = this.extSphere
            mesh.getWorldPosition(objPos)

            var oldGeo = null;
            if (camPos.distanceTo(objPos) < 2.5) {
                if (this.theta <= 0) return;
                this.theta = this.decreaseTheta(this.theta);
                oldGeo = this.extSphere.geometry;
            } else if (this.theta < Math.PI) {
                this.theta = this.increaseTheta(this.theta);
                oldGeo = this.extSphere.geometry;
            }
            if (oldGeo) {
                mesh.geometry = this.getSphere(this.theta);
                oldGeo.dispose();
            }
        }
    })()
})
