import * as TWEEN from '../libs/tween.esm.js'

class animation {
  constructor(personaje, segundosTP = 2.5, segundos = 0.5) {
    this.personaje = personaje;
    this.segundos = segundos;
    this.segundosTP = segundosTP;
  }


  inicioCaminar(fin){
    var origen = {r:0};
    var destino = {r:fin}; 
        
    var duration = this.segundos / 2 * 1000;

    var inicio = new TWEEN.Tween(origen).to(destino, duration);
    inicio.easing(TWEEN.Easing.Quadratic.InOut)
    inicio.onUpdate(() => {
      this.personaje.rotateBrazo(this.personaje.getBrazoIzq(), origen.r)
      this.personaje.rotateBrazo(this.personaje.getBrazoDcho(), -origen.r)
    });

    inicio.start();

    return inicio;
  }

  mov1(direccion, casilla) {
    var origen = {
      x: this.personaje.getPositionX(),
      z: this.personaje.getPositionZ(),
      r: -Math.PI / 2,
      c: 0
    };
    var destino = {
      x: this.personaje.getPositionX() + casilla / 2,
      z: this.personaje.getPositionZ() + casilla / 2,
      r: Math.PI / 2,
      c: 0.4
    };

    var mov1 = new TWEEN.Tween(origen).to(destino, this.segundos * 1000);

    mov1.easing(TWEEN.Easing.Linear.None)
    mov1.onUpdate(() => {
      this.personaje.mover(direccion, origen)
      this.personaje.moverCabeza(origen.c);
      this.personaje.rotateBrazo(this.personaje.getBrazoIzq(), origen.r)
      this.personaje.rotateBrazo(this.personaje.getBrazoDcho(), -origen.r)
    });

    return mov1;
  }

  mov2(direccion, casilla) {
    var origen = {
      x: this.personaje.getPositionX() + casilla / 2,
      z: this.personaje.getPositionZ() + casilla / 2,
      r: Math.PI / 2,
      c: 0.4
    };
    var destino = {
      x: this.personaje.getPositionX() + casilla,
      z: this.personaje.getPositionZ() + casilla,
      r: -Math.PI / 2,
      c: 0
    };

    var mov2 = new TWEEN.Tween(origen).to(destino, this.segundos * 1000);

    mov2.easing(TWEEN.Easing.Linear.None)
    mov2.onUpdate(() => {
      this.personaje.mover(direccion, origen)
      this.personaje.moverCabeza(origen.c);
      this.personaje.rotateBrazo(this.personaje.getBrazoIzq(), origen.r)
      this.personaje.rotateBrazo(this.personaje.getBrazoDcho(), -origen.r)
    });

    return mov2;
  }

  finCaminar(inicio){
    var origen = {r:inicio};
    var destino = {r:0}; 
    
    var duration = this.segundos / 2 * 1000;

    var fin = new TWEEN.Tween(origen).to(destino, duration);
    fin.easing(TWEEN.Easing.Quadratic.InOut)
    fin.onUpdate(() => {
      this.personaje.rotateBrazo(this.personaje.getBrazoIzq(), origen.r)
      this.personaje.rotateBrazo(this.personaje.getBrazoDcho(), -origen.r)
    });

    return fin;
  }

  movimiento(direccion, casilla) {
    var mov1 = this.mov1(direccion, casilla);
    var mov2 = this.mov2(direccion, casilla);
    var fin = this.finCaminar(-Math.PI / 2);
    fin.onComplete(() => {
      this.personaje.finMovimiento()
    })
    mov2.chain(fin)
    mov1.chain(mov2);
    this.inicioCaminar(-Math.PI / 2).chain(mov1);
  }

  recoger(){
    var origen = {r:0};
    var destino = {r: -Math.PI/2};
        
    var duration = this.segundosTP * 1000;

    var recoger = new TWEEN.Tween(origen).to(destino, duration);
    recoger.easing(TWEEN.Easing.Cubic.Out)
    recoger.onUpdate(() => {
      this.personaje.rotateBrazo(this.personaje.getBrazoIzq(), origen.r)
      this.personaje.rotateBrazo(this.personaje.getBrazoDcho(), origen.r)
    });

    return recoger;  
  }

  finRecoger(){
    var origen = {r:-Math.PI/2};
    var destino = {r: 0};
        
    var duration = this.segundosTP * 1000;

    var finRecoger = new TWEEN.Tween(origen).to(destino, duration);
    finRecoger.easing(TWEEN.Easing.Cubic.Out)
    finRecoger.onUpdate(() => {
      this.personaje.rotateBrazo(this.personaje.getBrazoIzq(), origen.r)
      this.personaje.rotateBrazo(this.personaje.getBrazoDcho(), origen.r)
    });

    finRecoger.onComplete(() =>{
      this.personaje.finMovimiento();
    })

    return finRecoger;  
  }

  recogerGema(){
    var recoger = this.recoger();
    recoger.chain(this.finRecoger());
    recoger.start();
  }

  inicioTeletransporte(portal, fin = 8 * Math.PI){
    var origen = {r:0};
    var destino = {r:fin + this.personaje.rotation.y};
        
    var duration = this.segundosTP * 1000;

    var inicio = new TWEEN.Tween(origen).to(destino, duration);
    inicio.easing(TWEEN.Easing.Cubic.In)
    inicio.onUpdate(() => {
      this.personaje.rotation.y = (origen.r)
    });

    inicio.onComplete(() => {
      //Teletransporte
      this.personaje.setPosition(portal.getPositionX(), this.personaje.getPositionY(), portal.getPositionZ());
    })
    

    return inicio;    
  }

  finTeletransporte(inicio = 8 * Math.PI){
    var origen = {r:inicio};
    var destino = {r: this.personaje.rotation.y};
        
    var duration = this.segundosTP * 1000;

    var fin = new TWEEN.Tween(origen).to(destino, duration);
    fin.easing(TWEEN.Easing.Cubic.Out)
    fin.onUpdate(() => {
      this.personaje.rotation.y = (origen.r)
    });

    fin.onComplete(() => {
      this.personaje.finMovimiento();
    })

    return fin;    
  }

  teletransportar(portal){
    var inicio = this.inicioTeletransporte(portal);
    var fin = this.finTeletransporte();
    inicio.chain(fin);
    inicio.start();
  }

  caminar(direccion, casilla) {
    this.movimiento(direccion, casilla);
  }

  update() {
    TWEEN.update();
  }

}
export { animation };
