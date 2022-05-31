import * as THREE from '../libs/three.module.js'

class Cube extends THREE.Object3D {

    constructor(texture, size = 1, grosor = 1) {
        super();
        this.size = size;
        this.grosor = grosor;
        var cuboGeom = new THREE.BoxGeometry(this.size, this.size, this.size);
        this.cubo = null;
        var material = null;

 
        if(texture != "transparent"){
            var loader = new THREE.TextureLoader();

            const textures = [
                new THREE.MeshPhongMaterial({map: loader.load('../images/cube_texture/' + texture + '/side.png')}),
                new THREE.MeshPhongMaterial({map: loader.load('../images/cube_texture/' + texture + '/side.png')}),
                new THREE.MeshPhongMaterial({map: loader.load('../images/cube_texture/' + texture + '/top.png')}),
                new THREE.MeshPhongMaterial({map: loader.load('../images/cube_texture/' + texture + '/bottom.png')}),
                new THREE.MeshPhongMaterial({map: loader.load('../images/cube_texture/' + texture + '/side.png')}),
                new THREE.MeshPhongMaterial({map: loader.load('../images/cube_texture/' + texture + '/side.png')}),
            ];

            material = textures;
        }
        else{
            var cuboGeom = new THREE.BoxGeometry(this.size, 1, this.grosor);
            material = new THREE.MeshPhongMaterial({
                opacity: 0,
                transparent: true,
              });
        }

        this.cubo = new THREE.Mesh(cuboGeom, material);
        this.add(this.cubo);
    }

    getSize(){
        return this.size;
    }

    getHeight(){
        return this.size;
    }

    getGrosor(){
        return this.grosor;
    }
    
    setPosition(x, y, z){
        this.cubo.position.x = x;
        this.cubo.position.y = y;
        this.cubo.position.z = z;
    }

    setPositionX(x){
        this.cubo.position.x = x;
    }

    setPositionY(y){
        this.cubo.position.y = y;
    }

    setPositionZ(z){
        this.cubo.position.z = z;
    }

    getPositionX(){
        return this.cubo.position.x;
    }

    getPositionY(){
        return this.cubo.position.y;
    }

    getPositionZ(){
        return this.cubo.position.z;
    }
    
}

export{ Cube };