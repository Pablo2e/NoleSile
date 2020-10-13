// SERVICIO
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
// MODELOS
import { Message } from '../models/message';
import { Nole } from '../models/nole';
import { Notificacion } from '../models/notificaciones';
// SERVICIOS IMPORTADOS
import { LoginService } from './login.service';
import { GlobalsService } from './globals.service';


@Injectable({
  providedIn: 'root'
})

export class MessageService {

  private url: string = this.globalsService.apiServerUrl
  public message:Message
  public noleSeleccionado = new Nole(0, 0);
  public sileSeleccionado = new Nole(0, 0);
  public notificacion = new Notificacion(null, false)
    
 
  constructor(
    public loginService:LoginService,
    public globalsService:GlobalsService,
    private http:HttpClient) { }
    


  public getMessages(chat_id: string) {
    const accessToken = this.loginService.getToken();
    let user_id = this.loginService.usuarioActual.user_id.toString();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
        'User': user_id
      })
    };
    return this.http.get(this.url + "/messages/" + chat_id, options)
  }

  public postMessage(nuevoMensaje: Message) {
    const accessToken = this.loginService.getToken();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
      })
    };
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log(nuevoMensaje);
    }
    return this.http.post(this.url + "/messages/", nuevoMensaje, options)
  } 
  
  public changeMessageToRead(cambio){
    const accessToken = this.loginService.getToken();
    let user_id = this.loginService.usuarioActual.user_id.toString();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
        'User': user_id
      })
    };
    return this.http.put(this.url + "/messages/", cambio, options)
  }

  public createUserNotification(nuevaNotificacion: Notificacion) {
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log(nuevaNotificacion);
    }
    return this.http.post(this.url + "/notifications/", nuevaNotificacion)
  }

  public modifyNotificationsByUser(nuevaNotificacion: Notificacion) {
    const accessToken = this.loginService.getToken();
    let user_id = this.loginService.usuarioActual.user_id.toString();
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log(accessToken,nuevaNotificacion.user_id)
    }
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
        'User': user_id
      })
    };
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log(nuevaNotificacion);
    }
    return this.http.put(this.url + "/notifications/", nuevaNotificacion, options)
  }
 
  public getNotificationsByUser(id: number) {
    const accessToken = this.loginService.getToken();
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log(id, accessToken)
    }
      const options = {
        headers: new HttpHeaders({
          'Authorization': accessToken,
        })
      };
    return this.http.get(this.url + "/notifications/"+ id, options)
  }

  public postNole(newNoleRelation: Nole) {
    const accessToken = this.loginService.getToken();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
      })
    };
    return this.http.post(this.url + "/noles/", newNoleRelation, options)
  }

  public getNolesByUser(id: number) {
    const accessToken = this.loginService.getToken();
      const options = {
        headers: new HttpHeaders({
          'Authorization': accessToken,
        })
      };
    return this.http.get(this.url + "/noles/" + id, options);
  }

  public getSilesByUser(id: number) {
    const accessToken = this.loginService.getToken();
      const options = {
        headers: new HttpHeaders({
          'Authorization': accessToken,
        })
      };
    return this.http.get(this.url + "/siles/" + id, options);
  }

  public deleteNole(chat_id: string) {
    const accessToken = this.loginService.getToken();
    let user_id = this.loginService.usuarioActual.user_id.toString();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
        'User': user_id
      })
    };
    return this.http.delete(this.url + "/noles/" + chat_id, options);
  }
  
}