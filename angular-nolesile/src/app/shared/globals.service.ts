// SERVICIO
import { Injectable } from '@angular/core';

@Injectable({
providedIn: 'root'
})

export class GlobalsService {  

    /* public apiServerUrl = "http://localhost:3000";
    public imageServerUrl = "http://localhost:3100/"; */
    public apiServerUrl = "http://nolesile.com:3000";
    public imageServerUrl = "http://nolesile.com:3100/";
    public fotoUsuarioPorDefecto = "assets/img/perfil.jpg";
    public unicornio = "assets/img/unicornio.png"; 
    public DEBUG= true
    public INFO= true
    public ERROR= true

    constructor() {}

}