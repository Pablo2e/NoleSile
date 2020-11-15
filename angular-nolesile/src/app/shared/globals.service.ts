// SERVICIO
import { Injectable } from '@angular/core';

@Injectable({
providedIn: 'root'
})

export class GlobalsService {  

    public fotoUsuarioPorDefecto = "assets/img/perfil.jpg";
    public unicornio = "assets/img/unicornio.png"; 

    constructor() {}

}