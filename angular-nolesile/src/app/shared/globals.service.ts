// SERVICIO
import { Injectable } from '@angular/core';

@Injectable({
providedIn: 'root'
})

export class GlobalsService {  

    //Estas 2 para el localhost
   /*public apiServerUrl = "http://localhost:3000";
    public imageServerUrl = "http://localhost:3100/"; 
    Estas 2 para el build
    public apiServerUrl = "https://nolesile.com:3003";
    public imageServerUrl = "https://nolesile.com:3103/";*/
    public fotoUsuarioPorDefecto = "assets/img/perfil.jpg";
    public unicornio = "assets/img/unicornio.png"; 
    /* public DEBUG= true
    public INFO= true
    public ERROR= true */

    constructor() 
        {
            /* if(this.INFO){
                console.log("Funcionando servicio globals")
            } */
        }

}