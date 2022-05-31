import * as THREE from '../libs/three.module.js'
import { CSG } from '../libs/CSG-v2.js'
import { color } from '../libs/dat.gui.module.js';
import { gem } from './gem.js'
import * as KEY from '../libs/keycode.esm.js';
import { animation as animation } from '../animations/animatePersonaje.js';
 // lo que no se conecte al grafo de escena, no aparece en esta.
class personaje extends THREE.Object3D {
  constructor() {
    super();

    this.createPersonaje();

    this.animation = new animation(this, 0.5);

    this.direccion = new THREE.Vector3(0, 0, 1);
    this.setRayoColisiones(this.direccion);

    this.rayoTP = new THREE.Raycaster(this.position, new THREE.Vector3(0,-1,0));

    //Flags
    this.enMovimiento = false;
    this.puedeTeletransportarse = true;

    //Contador de movimientos para mostrarlos en la interfaz
    this.numMovimientos = 0;

  }

  createPersonaje(){
    this.personajeMat = new THREE.MeshPhongMaterial({color: 0xffffff});

    this.createCabeza()
    this.add(this.cabeza);
    this.createCuerpo();
    this.add(this.cuerpo);

    this.cabeza.position.y = 0.8;
    this.cuerpo.position.y = 0.8;

    this.createBrazos(this.cabeza, this.cuerpo);
    this.add(this.brazoIzq);
    this.add (this.brazoDcha);
    
    this.position.y = 0.6; // para centarlo 
  }

  createCabeza(){
    var geom = new THREE.SphereGeometry();  
    var esfera = new THREE.Mesh (geom, this.personajeMat);
    esfera.scale.y = 0.7;
    esfera.scale.x = 1.2;
    esfera.scale.z = 1.2;

    var geomRestar = new THREE.SphereGeometry(2);
    var restar = new THREE.Mesh (geomRestar, this.personajeMat);
    restar.position.y = -3.2;
    restar.scale.y = 2;

    geomRestar = new THREE.SphereGeometry(1);
    var sphRestar = new THREE.Mesh(geomRestar, this.personajeMat);

    var csg = new CSG();
    csg.intersect([esfera, restar]);
    csg.intersect([sphRestar]);
    

    this.cabeza = csg.toMesh();

    //OJOS
    var ojoGeom = new THREE.SphereGeometry(0.125);

    const glassTexture = new THREE.TextureLoader().load(
      "../images/glass.png",
      () => {
        glassTexture.mapping = THREE.EquirectangularReflectionMapping;
      }
    );

    // Material brillante para simular luz
    var ojoMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x74FFE5,
      metalness: 1,
      roughness: 0.5,
      transmission: 1,
      ior: 1.5,
      reflectivity: 0.5,
      thickness: 2.5,
      transparent: true,
      envMap: glassTexture,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });

    ojoGeom.scale(1,2,1);
    ojoGeom.translate(0, -0.1, 0.9)
    this.ojo_izq = new THREE.Mesh(ojoGeom, ojoMat );
    this.ojo_izq.position.x = -0.3;

    this.ojo_dch = new THREE.Mesh(ojoGeom, ojoMat );
    this.ojo_dch.position.x = 0.3;

    
    this.cabeza.add(this.ojo_izq);
    this.cabeza.add(this.ojo_dch);
  } 
  
  createCuerpo(){
    var geom = new THREE.SphereGeometry();
    geom.translate(0, -0.5 ,0);

    var mesh_cuerpo = new THREE.Mesh (geom, this.personajeMat);

    mesh_cuerpo.scale.y = 2;
    this.height = 2;
    mesh_cuerpo.position.y = -0.6;

    var csg = new CSG();
    csg.subtract([mesh_cuerpo, this.cabeza]);

    var restar = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32)); // Para quitar la parte que sobresale
    restar.position.y = 1;
    csg.subtract([restar]);

    this.cuerpo = csg.toMesh();
  }

  moverCabeza(posicion){
    this.cabeza.position.y = posicion + 0.8; 
  }

  createBrazo(){
    var brazoGeom = new THREE.SphereGeometry(0.5);
    brazoGeom.scale(1,2,1);
    var brazo = new THREE.Mesh(brazoGeom, this.personajeMat)

    return brazo;
  }

  createBrazos(){
    var brazoIzq = this.createBrazo();
    var brazoDcha = this.createBrazo();
    brazoIzq.position.x = 0.7;
    brazoDcha.position.x = -0.7;
    brazoIzq.position.y = -0.7;
    brazoDcha.position.y = -0.7;

    var csg = new CSG();
    csg.subtract([brazoIzq, this.cuerpo, this.cabeza]);
    this.brazoIzq = csg.toMesh();
    this.brazoIzq.position.x = 0.1;

    var csg = new CSG();
    csg.subtract([brazoDcha, this.cuerpo, this.cabeza]);
    this.brazoDcha = csg.toMesh();
    this.brazoDcha.position.x = -0.1;
  }

  getBrazoIzq(){
    return this.brazoIzq;
  }

  getBrazoDcho(){
    return this.brazoDcha;
  }

  rotateBrazo(brazo, rotation){
    brazo.rotation.x = rotation;
  }

  totalMovimientos(){
    return this.numMovimientos;
  }

  setRayoColisiones(direccion){
    this.rayoColisiones = new THREE.Raycaster(this.position, direccion);
  }

  getEnMovimiento(){
    return this.enMovimiento;
  }

  // · Control del personaje al pulsar las teclas para moverlo.
  control(key){
    //Solo lee las teclas de movimientos
    if(key == 'a' || key == 's' || key == 'd' || key == 'w'){
      if(this.rotation.y != this.rotacion(key)){
        this.numMovimientos ++;
        this.rotation.y = this.rotacion(key);
      } else if (!this.objetoDelante){
        if(!this.enMovimiento){
          this.animation.caminar(key, this.sigCasilla(key));
          this.enMovimiento = true;
          this.numMovimientos++;
        } 
      }
      this.cambioDireccion(key);
    }
  }

  // · Cambia la dirección del rayo que detecta las colisiones en función de hacia donde mira el personaje.
  cambioDireccion(key){
    switch (key) {
      case 'w':  
        this.direccion = new THREE.Vector3(0, 0, 1);
        this.setRayoColisiones(this.direccion);
      break;
          
      case 'a':
        this.direccion = new THREE.Vector3(1,0,0);
        this.setRayoColisiones(this.direccion);
      break;

      case 'd':
        this.direccion = new THREE.Vector3(-1,0,0);
        this.setRayoColisiones(this.direccion);
      break;

      case 's':
        this.direccion = new THREE.Vector3(0,0,-1);
        this.setRayoColisiones(this.direccion);
        break;
      }
  }

  finMovimiento(){
    this.enMovimiento = false;
  }

  sigCasilla(valor){
    var casilla;
    switch (valor) {
      case 'w': case 'a':
        casilla = 1;
        break;
      case 'd': case 's':
        casilla = -1;
        break;
    }
    return casilla;
  }

  rotacion(valor){
    var rotacion;
      switch (valor) {
        case 'w':
          rotacion = 0;
          break;
        case 'a':
          rotacion = Math.PI / 2;
          break;
        case 'd':
          rotacion = -Math.PI / 2
          break;
        case 's':
          rotacion= Math.PI;
          break;
      }
    return rotacion;
  }

  //Usado por la aniamción para llevar a cabo el movimiento del personaje
  mover(direccion, valor){
      switch (direccion) {
        case 'w':
          this.position.z = valor.z;
          break;
        case 'a':
          this.position.x = valor.x;
          break;
        case 'd':
          this.position.x = valor.x;
          break;
        case 's':
          this.position.z = valor.z;
          break;
      }
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
    this.height *= valor * 3; // para que no se quede por debajo del mapa al subirlo.
  }

  getHeight(){
    return this.height;
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

  rotateCabeza(rot){
    this.cabeza.rotate.y = rot;
  }

  //Detecta colisiones con las pareces invisibles, las gemas y los portales
  detectObjects(paredes, gemas, portales){
    var paredDelante = this.tieneObjetoDelante(this.rayoColisiones.intersectObjects(paredes));    

    this.gemaDelante = this.tieneObjetoDelante(this.rayoColisiones.intersectObjects(gemas));
    this.objetoDelante = (paredDelante != null || this.gemaDelante != null); 

    //Detectar teletransportador:
    var tp = this.rayoTP.intersectObjects(portales);
    if( tp.length > 0 && !this.enMovimiento){
      // Si esta encima de un portal y no esta en movimiento, puede teletransportarse
      this.puedeTeletransportarse = true;
    } else {
      this.puedeTeletransportarse = false;
    }
  }

  //Se teletransporta hacia el portal seleccionado
  teletransportar(portal){
    if(this.puedeTeletransportarse && !this.enMovimiento){
      this.animation.teletransportar(portal)
      this.enMovimiento = true;
    }
  }

  // Devuelve si el objeto mas cercano detectado por el rayo está justo enfrente del personaje
  tieneObjetoDelante(objetos) {
    var objetoDelante = null;

    if(objetos.length > 0)
      if(objetos[0].distance < this.direccion.length())
        objetoDelante = objetos[0].object;
      
    return objetoDelante;
  }
  
  // Recoge la gema que tiene justo delante.
  recogerGema(){
    var recogida = false;
    if(!this.enMovimiento){
      this.animation.recogerGema();
      recogida = true;
      this.enMovimiento = true;
    }
    return recogida;
  }

  getGemaDelante(){
    if(this.gemaDelante != null)
      return this.gemaDelante.parent;
    else 
      return null;
  }

}

export { personaje };