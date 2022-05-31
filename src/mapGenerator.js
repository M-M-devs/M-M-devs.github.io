class MapGenerator{
    constructor(mapa){
        this.mapa = [];
        this.objetos = [];
        this.filas = 0;
        this.columnas = 0;
        this.mapa = this.leerMapa("tiles/" + mapa);
        this.objetos = this.leerMapa("objects/" + mapa);
    }

    getMap(){
        return this.mapa;
    }
    
    getObjects(){
        return this.objetos;
    }

    getFilas(){
        return this.filas;
    }

    getColumnas(){
        return this.columnas;
    }

    leerMapa(nombre){
        var text = this.getTXT(nombre);
        var filas = text.split('\n');
        this.filas = filas.length;
        this.columnas = filas[0].split(' ').length;

        var mapa = [];
        for (let i = 0; i < this.filas; i++) {
            mapa.push(filas[i].split(' '));
        }
        return mapa;
    }

    getTXT(nombre){
        var rawFile = new XMLHttpRequest();
        var file = "../maps/" + nombre + ".txt";
        var allText;
        
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4){
                if(rawFile.status === 200 || rawFile.status == 0){
                    allText = rawFile.responseText;
                }
            }
        }
        rawFile.send(null);
        return allText;
    }

}



export{ MapGenerator };
