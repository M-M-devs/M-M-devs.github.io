import * as THREE from '../libs/three.module.js'

class Skybox extends THREE.Object3D {

    constructor() {
        super();
        var cuboGeom = new THREE.BoxGeometry(1000, 1000, 1000);
        var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
        var loader = new THREE.TextureLoader();

        const textures = [
            new THREE.MeshBasicMaterial({ map: loader.load("../images/skybox/left.bmp"), side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({ map: loader.load("../images/skybox/right.bmp"), side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({ map: loader.load("../images/skybox/up.bmp"), side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({ map: loader.load("../images/skybox/down.bmp"), side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({ map: loader.load("../images/skybox/back.bmp"), side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({ map: loader.load("../images/skybox/front.bmp"), side: THREE.DoubleSide}),
            
        ];

        var cuboMat = new THREE.MeshFaceMaterial(textures)
        var cubo = new THREE.Mesh(cuboGeom, cuboMat);
        this.add(ambientLight);
        this.add(cubo);
    } 
    
}

export{ Skybox };