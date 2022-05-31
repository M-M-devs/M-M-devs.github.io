import * as THREE from '../libs/three.module.js'
import { Cube } from './cube.js'
import { personaje } from './personaje.js'
import { gem } from './gem.js'
import { portal } from './portal.js'
import { MapGenerator } from '../src/mapGenerator.js'

class map extends THREE.Object3D {

    constructor(level) {
        super();

        this.level = level;
        this.map = [];
        this.gems = [];
        this.portals = [];
        this.invisibleWalls = [];
        this.numeroGemas = 0;

        this.generateMap(this.level);
        this.generateBorders(); 
    }

    generateMap(){
        var mapGenerator = new MapGenerator(this.level);
        this.columnas = mapGenerator.getColumnas();
        this.filas = mapGenerator.getFilas();

        for(var i = 0; i < this.filas; i++){
            var row = [];
            for(var j = 0; j < this.columnas; j++){
                var texture = this.getTexture(mapGenerator.getMap()[i][j]);
                var object =  this.getObject(mapGenerator.getObjects()[i][j]);
               
                if(texture == "water"){
                    object = new Cube("transparent", 1);            
                    this.invisibleWalls.push(object)
                }

                var cube = new Cube(texture);
                cube.setPosition(i, 0, j);
                row[j] = cube;
                if(object != null){
                    object.setPosition(i, cube.getSize() / 2 + object.getHeight() /2 , j);
                    this.add(object);
                }
                this.add(cube);
            }
            this.map[i] = row;
        }
    }

    generateBorders(){
        var right = new Cube("transparent", 0.1, this.columnas);
        var left = new Cube("transparent", 0.1, this.columnas);
        var bottom = new Cube("transparent", this.filas, 0.1);
        var top = new Cube("transparent", this.filas, 0.1);

        right.setPosition(-right.getSize() / 2 - this.map[0][0].getSize() / 2, 1, this.columnas/2 - this.map[0][0].getSize() / 2);
        left.setPosition(left.getSize() / 2 + this.filas - this.map[0][0].getSize() / 2, 1, this.columnas/2 - this.map[0][0].getSize() / 2);

        bottom.setPosition(bottom.getSize() / 2 - this.map[0][0].getSize() / 2, 1, -bottom.getGrosor() / 2 - this.map[0][0].getSize() / 2)
        top.setPosition(bottom.getSize() / 2 - this.map[0][0].getSize() / 2, 1, top.getGrosor() / 2 + this.columnas - this.map[0][0].getSize() / 2)
        this.add(right)
        this.add(left)
        this.add(bottom)
        this.add(top)

        this.invisibleWalls.push(right, left, bottom, top);
    }

    getTexture(code) {
        var texture;
        switch (code) {
            case 'A':
                texture = 'water'
                break;
            case 'C':
                texture = 'grass'
                break;

            case 'T':
                texture = 'ground'
                break;

            default:
                texture = 'grass'
                break;
        }

        return texture;
    }

    getObject(code) {
        var object;
        switch (code) {
            case 'P':
                object = new personaje();
                this.personaje = object;   
                object.setScale(0.25);
                break;
                
            case 'G':
                object = new gem();
                this.gems.push(object);
                object.setScale(0.25);
                this.numeroGemas += 1;
                break;

            case 'T':
                object = new portal();
                this.portals.push(object)
                break;
            case 'C':
                object = new Cube("grass");
                this.invisibleWalls.push(object)
                break;

            default:
                object = null
                break;
        }

        return object;
    }

    getPersonaje(){
        return this.personaje;
    }

    gemasRecogidas(){
        return  this.numeroGemas - this.gems.length;
    }
    
    totalGemas(){
        return  this.numeroGemas;
    }

    recogerGema(gema){

        for(let i = 0; i < this.gems.length; i++){

            if(this.gems[i] == gema && gema == this.personaje.getGemaDelante()){
                var recogida = this.personaje.recogerGema();
                if(recogida){
                    var animation = this.gems[i].desaparecer();
                    // this.gems[i].gem.material.opacity = 0;
                    animation.onComplete(() => {
                        this.gems.splice(i, 1);
                    });
                    animation.start();
                }
                
            }
        }
    }

    getNivel(){
        return this.level;
    }

    mapaCompletado(){
        return (this.gemasRecogidas() == this.totalGemas());  
    }

    controlPersonaje(key){
        this.personaje.control(key);
    }

    update(){
        this.personaje.detectObjects(this.invisibleWalls, this.gems, this.portals);
        for(var i = 0; i < this.gems.length; i++){
            this.gems[i].update();
        }
        this.personaje.animation.update();
    }
    
}

export{ map };