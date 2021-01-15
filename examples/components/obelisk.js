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
        let extSphere = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(geo),
            new THREE.MeshStandardMaterial({ color: new THREE.Color(this.data.color) }))
        geo.dispose();
        extSphere.rotation.set(-Math.PI / 2, 0, 0)
        top.object3D.add(extSphere)

        var self = this;

        let path = this.data.cubemap;
        let texture = new THREE.CubeTextureLoader().
            setPath(path).
            load([
                '/posx.jpg', '/negx.jpg',
                '/posy.jpg', '/negy.jpg',
                '/posz.jpg', '/negz.jpg'
            ], function loaded() {
                let scene = self.el.sceneEl
                scene.renderer.compile(scene.object3D, scene.camera) // precompiling should help, but I didn't feel a difference
            });
        texture.format = THREE.RGBFormat;
        texture.mapping = THREE.CubeRefractionMapping

        let wonderCube = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 32, 32),
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
        this.wonderCube = wonderCube
        this.faceCount = this.extSphere.geometry.attributes.position.count
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
                  
            camPos.setFromMatrixPosition( this.el.sceneEl.camera.el.object3D.matrixWorld ); // why getWorldPosition isn't working lol
            this.top.object3D.lookAt(camPos)

            // show / hide
            let mesh = this.extSphere
            mesh.getWorldPosition(objPos)
            let faces = mesh.geometry.attributes.position.count
            if (camPos.distanceTo(objPos) < 2.5) {
                if (faces <= 0) return;

                let removecount = Math.floor(Math.random() * 100);
                if (removecount > faces)
                    removecount = faces;

                mesh.geometry.attributes.position.count -= removecount;
                mesh.geometry.attributes.position.needsUpdate = true
            } else if (faces < this.faceCount) {
                let missingcount = this.faceCount - faces;
                let addcount = Math.ceil(Math.random() * missingcount) / 10
                if (addcount > missingcount)
                    addcount = missingcount;

                mesh.geometry.attributes.position.count += addcount;
                mesh.geometry.attributes.position.needsUpdate = true
            }
        }
    })()
})
