// SERVICIO
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
// MODALES
import { ToastrService } from 'ngx-toastr';
// MODELOS
import { Usuario } from '../models/usuario';
// SERVICIOS IMPORTADOS
import { GlobalsService } from './globals.service';


@Injectable({
  providedIn: 'root'
})


export class LoginService {

  private backUrl: string = environment.apiServerUrl;
  public defaultUserPicture: string = this.globalsService.fotoUsuarioPorDefecto;
  private token: string;
  public usuarioActual = new Usuario(null, null, null, null, null, null, null, null, this.defaultUserPicture);
  public avisoMensaje: boolean;


  constructor(
    public globalsService:GlobalsService,
    private http: HttpClient,
    private router: Router, 
    private toastr: ToastrService) 
    {
      if(environment.log.INFO){
        console.log("Funcionando servicio login") 
      }
      if(!this.loadExistingSession()){
        this.router.navigate(["/"])
      }
    }

    public loadExistingSession(): any{
      if (this.getToken() != null) {
        // ya existe session
        // cargar datos session usuario
        const user_id = this.getUserId();
        this.getUsuario(user_id).subscribe(data => {
          if(environment.log.DEBUG){
            console.log(data);
          }
          this.usuarioActual = data[0];
        })
        return true
      } else {
        return false
      } 
    }

    public getUsuario(id: number){
      if (!id){
        return this.http.get(this.backUrl + "/user/register")
      }else{
        const accessToken = this.getToken();
        const user_id = this.getUserId();
        console.log(user_id)
        const options = {
          headers: new HttpHeaders({
            'Authorization': accessToken, 
            'User': user_id, 
          })
        };
        return this.http.get(this.backUrl + "/user/" + id, options)
      }
    }

  public register(nuevoUsuario: Usuario) {
    if(environment.log.DEBUG){
      console.log(this.backUrl)
    }
    return this.http.post(this.backUrl + "/user/register", nuevoUsuario)
  }

  public login(user: any): Observable < any > {
    return this.http.post < any > (this.backUrl + "/user/login", user).pipe(tap(
      (res: any) => {
        if (res) {
          if (res[1]) {
            // guardar token
            this.saveToken(res[1].accessToken, res[1].expiresIn);
          }
          if (res[0]) {
            // guardar user_id
            this.saveUserId(res[0].user_id);
          }
        }
      })
    );
  }

  private saveToken(token: string, expiresIn: string): void {
    localStorage.setItem("ACCESS_TOKEN", token);
    localStorage.setItem("EXPIRES_IN", expiresIn);
    this.token = token;
  }
  
  private saveUserId(userId: any): void {
    localStorage.setItem("USER_ID", userId);
  }

  public getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem("ACCESS_TOKEN");
    }
    //return this.token;
    return localStorage.getItem("ACCESS_TOKEN");
  }
  
  public getUserId(): any {
    return localStorage.getItem("USER_ID");
  }

  public logout() {
    const accessToken = this.getToken();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken,
      })
    };
    const body = {
      user_id: this.usuarioActual.user_id,
    };
    this.token = '';
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("EXPIRES_IN");
    localStorage.removeItem("USER_ID");
    return this.http.put(this.backUrl + "/user/token", body,  options)
  }

  public forcedLogout(){
    this.toastr.error("Por favor, ingresa de nuevo", "Algo fue mal")
    this.logout();
    this.usuarioActual = null;
    this.router.navigate(["/"]);
  }

  public resetPassword(email){
    const options = {
      headers: new HttpHeaders({
        /* 'Authorization': accessToken,  */ 
        'email': email, 
      })
    };
    return this.http.get(this.backUrl + "/reset-password", options)
  }
  
}