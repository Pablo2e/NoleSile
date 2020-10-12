// SERVICIO
import { Injectable } from '@angular/core';

@Injectable({
providedIn: 'root'
})

export class GlobalsService {  

    public apiServerUrl = "http://localhost:3000";
    public imageServerUrl = "http://localhost:3100/";
    public fotoUsuarioPorDefecto = "assets/img/perfil.jpg";
    public unicornio = "assets/img/unicornio.png"; 

    constructor() {}

}