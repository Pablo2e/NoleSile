// SERVICIO
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
// MODELOS
import { Usuario } from './../models/usuario';
// SERVICIOS IMPORTADOS
import { LoginService } from './login.service';
import { GlobalsService } from './globals.service';


@Injectable({
  providedIn: 'root'
})


export class UsuarioService {

  public usuario: Usuario;
  public idUsuario: number;
  
  private url: string = environment.apiServerUrl; 
  public urlImg: string = environment.imageServerUrl; 

  
  constructor(
    public globalsService:GlobalsService,
    private http: HttpClient,
    private router: Router, 
    public loginService:LoginService) 
    {
      if(environment.log.INFO){
        console.log("Funcionando servicio usuario")
      }
    }
    

  /* public getUsuario(id: number){
    if (!id){
      return this.http.get(this.url + "/user/register")
    }else{
      const accessToken = this.loginService.getToken();
      const user_id = this.loginService.getUserId();
      console.log(user_id)
      const options = {
        headers: new HttpHeaders({
          'Authorization': accessToken, 
          'User': user_id, 
        })
      };
      return this.http.get(this.url + "/user/" + id, options)
    }
  } */

  public putUsuario(cambios: Usuario){
    const accessToken = this.loginService.getToken();
      const options = {
        headers: new HttpHeaders({
          'Authorization': accessToken,
        })
      };
    return this.http.put(this.url + "/user", cambios, options)
  }
  
  public deleteUsuario(id: number){
    const accessToken = this.loginService.getToken();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
        'Content-Type': 'application/json',
      }),
      body: {
        user_id: id,
      },
    };
    return this.http.delete(this.url + "/user/", options)
  }
  
  //Para la carga y borrar fotos
  public uploadImage(fd: FormData){
    return this.http.post(this.urlImg + "upload-img", fd)
  }

  public deleteImage(imageName: string){
    return this.http.delete(this.urlImg + "delete-img/" + imageName)
  }
  
}