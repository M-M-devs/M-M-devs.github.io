import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'

class gem extends THREE.Object3D {
  constructor() {
    super();
    this.clock = new THREE.Clock();
    this.createGem();
    this.gem.position.y = 0.9337;
    this.add (this.gem);
    //Establecemos la duración de la rotación.
    this.segundos = 1.5;
  }

  createGem(){
    const verticesOfGem = 
    [-0.777261,0.485581,0.103065,
      -0.675344,-0.565479,-0.273294,
      -0.379795,-0.315718,0.778861,
      -0.221894,0.282623,-0.849372,
      -0.034619,1.231562,-0.282624,
      0.034619,-1.231562,0.282624,
      0.196076,0.635838,0.638599,
      0.405612,-0.602744,-0.568088,
      0.701162,-0.352983,0.484067,
      0.751443,0.43288,-0.313837];
    
    const indicesOfFaces = 
    [6,8,9,9,8,7,9,7,3,3,7,1,3,1,0,0,1,2,0,2,6,6,2,8,6,9,4,9,3,4,3,0,4,0,6,4,7,8,5,1,7,5,2,1,5,8,2,5];


    this.height = this.calculateHeight(verticesOfGem);
   
    const geom = new THREE.PolyhedronGeometry( verticesOfGem, indicesOfFaces );

    const glassTexture = new THREE.TextureLoader().load(
      "../images/glass.png",
      () => {
        glassTexture.mapping = THREE.EquirectangularReflectionMapping;
      }
    );

    // Utilizamos un material que dé la sensación de piedra preciosa.
    var gemMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xe0aaff,
      metalness: 0.6,
      roughness: 0.5,
      transmission: 1,
      ior: 1.5,
      reflectivity: 0.5,
      thickness: 2.5,
      transparent: true,
      envMap: glassTexture,
      envMapIntensity: 1.5,
      clearcoat: 0.4,
      clearcoatRoughness: 0.1,
    });
 
    this.gem = new THREE.Mesh (geom, gemMat);
    this.gem.scale.y = 2;
  }

  setPosition(x, y, z){
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  setScale(valor){
    this.scale.x = valor;
    this.scale.y = valor;
    this.scale.z = valor;
    this.height *= valor;
  }

  calculateHeight(vertices){
    var minHeight = vertices[1];
    var maxHeight = vertices[1];

    for(var i = 4; i < vertices.length; i += 3){
      if(vertices[i] < minHeight)
        minHeight = vertices[i];

      if(vertices[i] > maxHeight)
        maxHeight = vertices[i];
    }

    return Math.abs(minHeight - maxHeight);
  }

  getHeight(){
    return this.height;
  }

  // Animación que hace desaparecer la gema al ser recogida por el personaje
  desaparecer(){
    var origen = {o: 1, p: this.gem.position.y}
    var destino = {o: 0, p: this.gem.position.y+2}

    var desaparecer = new TWEEN.Tween(origen).to(destino, 1000);
    desaparecer.easing(TWEEN.Easing.Quadratic.InOut)
    desaparecer.onUpdate(() => {
      this.gem.material.opacity = origen.o;
      this.gem.position.y = origen.p;
    });

    return desaparecer;
  }

  update(){
    TWEEN.update();
    this.segundosTranscurridos = this.clock.getDelta();
    this.gem.rotation.y +=  Math.PI * this.segundosTranscurridos / this.segundos;
  }

}

export { gem };
