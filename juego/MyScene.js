
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { OrbitControls } from '../libs/OrbitControls.js'
import { Stats } from '../libs/stats.module.js'

// Clases de mi proyecto

import { map } from '../models/map.js'
import { DayNight } from "../animations/daynight.js";

/// La clase fachada del modelo
class MyScene extends THREE.Scene {
  constructor (myCanvas) {
    super();

    this.nivelActual = 1;
    this.numeroMapas = 6;
    this.clock = new THREE.Clock();
    this.dayNightAngle = -1/6*Math.PI*2;
    // the day duraction in seconds
    this.dayDuration    = 60
    
    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas); //Redenderer = visualizador

    this.raycasterMouse = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    
    this.initStats();

    //Creamos el mapa
    this.mapa = new map (this.nivelActual);
    this.add (this.mapa);
   
    this.dayNight = new DayNight()
    this.add(this.dayNight);

    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera ();

    // new target para que la camara siga al personaje.
    this.newCameraTarget = new THREE.Vector3();

    //Detectar teclas para movimiento.
    document.addEventListener('keypress', (event) => {
      this.mapa.controlPersonaje(event.key)
    }, false);

    // Detectar click para recoger gemas y teletransportarse
    document.addEventListener('click', (event) => {
      { 
        // actaulizar el rayo con la poscion de la camara
        this.raycasterMouse.setFromCamera(this.pointer, this.camera);
        
        // Calculamos los objetos que intersecan con el rayo
        this.detectarGemas();
        this.detectarPortales();

        this.renderer.render(this, this.camera);
      }
    }, false);

    // Detectar los movimientos del raton para saber su posicion
    window.addEventListener( 'pointermove', (event) =>{
          // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }, false );

    this.initInterfaz();
  }

  detectarGemas(){
    const intersectGems = this.raycasterMouse.intersectObjects(this.mapa.gems);
        
    if ( intersectGems.length > 0) {
      var gema = intersectGems[0].object.parent
      this.mapa.recogerGema(gema);
    }
        
  }

  detectarPortales(){
    const intersectPortals = this.raycasterMouse.intersectObjects(this.mapa.portals);
    if (intersectPortals.length > 0)
      this.mapa.personaje.teletransportar(intersectPortals[0].object.parent, this.animation); 
  }
  
  initStats() {
  
    var stats = new Stats();
  
    stats.setMode(0); // 0: fps, 1: ms
    
    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.right = '0';
    stats.domElement.style.maxWidth = 'fit-content';
    
    $("#Stats-output").append( stats.domElement );
    
    this.stats = stats;
  }

  initInterfaz(){
    $("#info-juego").css("display", "block");
  }
  
  createCamera () {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // También se indica dónde se coloca
    this.camera.position.set(this.mapa.getPersonaje().getPositionX(), this.mapa.getPersonaje().getPositionY() + 5, this.mapa.getPersonaje().getPositionZ() - 5);

    // Y hacia dónde mira
    var look = new THREE.Vector3 (this.mapa.getPersonaje().getPositionX(), this.mapa.getPersonaje().getPositionY(), this.mapa.getPersonaje().getPositionZ());
    this.camera.lookAt(look);
    this.add (this.camera); //Conectar al grafo de escena
    
    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.cameraControl = new OrbitControls (this.camera, this.renderer.domElement);
    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 1;
    this.cameraControl.enableDamping = true;
    this.cameraControl.zoomSpeed = -1;
    this.cameraControl.minDistance = 5;
    this.cameraControl.maxDistance = 15;
    this.cameraControl.panSpeed = 0.5;
    this.cameraControl.minPolarAngle = Math.PI / 5
    this.cameraControl.maxPolarAngle = Math.PI / 2 - 0.05;
    this.cameraControl.minAzimuthAngle = Math.PI / 1.3;
    this.cameraControl.maxAzimuthAngle = Math.PI / -1.3;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;
  }
  
  createRenderer (myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
    
    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();
    
    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    
    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);
    
    return renderer;  
  }
  
  getCamera () {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
  }
  
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }
  
  onWindowResize () {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect (window.innerWidth / window.innerHeight);
    
    // Y también el tamaño del renderizador
    this.renderer.setSize (window.innerWidth, window.innerHeight);
  }

  update () {
    
    if (this.stats) this.stats.update();
    
    // Se actualizan los elementos de la escena para cada frame
    
    // Se actualiza la posición de la cámara según su controlador
    this.cameraControl.update();
    
    var position = new THREE.Vector3(this.mapa.getPersonaje().getPositionX(), this.mapa.getPersonaje().getPositionY(), this.mapa.getPersonaje().getPositionZ());

    this.newCameraTarget.position = position;
    this.mapa.personaje.getWorldPosition(this.newCameraTarget);
    this.camera.lookAt(this.newCameraTarget);
    this.cameraControl.target = this.newCameraTarget;

    this.actualizarInterfaz();
    
    // Si se ha completado el mapa, se pasa al siguiente nivel
    if(this.mapa.mapaCompletado() && this.nivelActual < this.numeroMapas){
      this.remove(this.mapa);
      this.nivelActual += 1;
      this.mapa = new map(this.nivelActual);
      this.add(this.mapa);
    }
    
    // Se actualiza el resto del modelo
    this.mapa.update()
    this.dayNightAngle += this.clock.getDelta()/this.dayDuration * Math.PI*2;

    this.dayNight.update(this.dayNightAngle)
    
    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.getCamera());

    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())
  }

  
  render() {
    // update the picking ray with the camera and pointer position
    this.raycasterMouse.setFromCamera( this.pointer, this.camera );
  
    // calculate objects intersecting the picking ray
    const intersects = this.raycasterMouse.intersectObjects( this.children );
  
    for ( let i = 0; i < intersects.length; i ++ ) {
      intersects[ i ].object.material.color.set( 0xff0000 );
    }
  
    renderer.render( this, this.camera );
  
  }  

  actualizarInterfaz() {
    $("#nivel").text("Nivel " + this.mapa.getNivel());
    $("#gemas").text( this.mapa.gemasRecogidas() + " / " + this.mapa.totalGemas());
    $("#numMovimientos").text("Movimientos: " + this.mapa.getPersonaje().totalMovimientos() );
  }
}

function showInstrucctions(){
  $("#instrucciones").css("display", "block")
}

function closeInstrucctions(){
  $("#instrucciones").css("display", "none")
}

/// La función   main
$(function () {

  
    // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
    var scene = new MyScene("#WebGL-output");
  
    // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
    window.addEventListener ("resize", () => scene.onWindowResize());
    $("#abrirInstrucciones").click(showInstrucctions)
    $("#cerrarInstrucciones").click(closeInstrucctions)
    
    // Que no se nos olvide, la primera visualización.
    scene.update();
});
