import * as THREE from '../libs/three.module.js'


class portal extends THREE.Object3D {

    constructor(color = 0xAF96FA ) {
        super();
        this.height = 0.05;
        this.radius = 0.4;
       
        this.createPortal(color);
        
        this.playVideo();
    }

    createPortal(color){
        this.createSuperficie();
        this.createBorde();
        this.createLuz(color);
        this.add(this.luz)
        this.add(this.portal);
        this.add(this.borde);
    }

    createLuz(color){
        this.luz = new THREE.SpotLight( color, 1, 3)
        this.luz.penumbra = 1;
        this.luz.decay = 1;
        this.luz.target.position.set(this.position.x,1,this.position.z)
        this.luz.target.updateMatrixWorld();
    }

    createSuperficie(){
        var geom = new THREE.CircleGeometry(this.radius, 32)
        geom.rotateX(-Math.PI / 2);

        var videoTexture = this.loadVideoTexture();
        var mat = new THREE.MeshPhysicalMaterial({ 
            map: videoTexture
        });
        this.portal = new THREE.Mesh(geom, mat);

    }

    loadVideoTexture(){
        this.video = document.createElement("video")
        this.video.crossOrigin = 'anonymous'
        this.video.preload = ''
        this.video.loop = true;
        this.video.autoplay = true;
        this.video.src = "../images/portal.mp4";
        this.video.load();

        var videoTexture = new THREE.VideoTexture(this.video);
        videoTexture.generateMipmaps = false;
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.maxFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;

        return videoTexture;
    }

    createBorde(){
        var  geom = new THREE.TorusGeometry(this.radius, 0.03, 16, 100)
        geom.rotateX(Math.PI / 2);
        var mat = new THREE.MeshLambertMaterial({ color: 0xB97EC9});
        this.borde = new THREE.Mesh(geom, mat);
    }

    playVideo(){
        this.video.play();
    }

    getHeight(){
        return this.height;
    }

    changeLight(estado){
        this.luz.visible = estado;
    }
    
    setPosition(x, y, z){
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.luz.target.position.set(this.position.x,1,this.position.z)
        this.luz.target.updateMatrixWorld();
    }

    getPositionX(){
        return this.position.x;
    }

    getPositionY(){
        return this.position.y;
    }

    getPositionZ(){
        return this.position.z;
    }
    
}

export{ portal };