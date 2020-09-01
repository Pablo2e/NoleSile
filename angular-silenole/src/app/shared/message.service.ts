// SERVICIO
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
// MODELOS
import { Message } from '../models/message';
import { Nole } from '../models/nole';
import { Notificacion } from '../models/notificaciones';
// SERVICIOS IMPORTADOS
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})

export class MessageService {

  private url = "http://localhost:3000/"
  public message:Message
  public noleSeleccionado = new Nole(0, 0);
  public sileSeleccionado = new Nole(0, 0);
  public notificacion = new Notificacion(null, false)

 
  constructor(
    private http:HttpClient,
    public loginService:LoginService) { }


  public getMessages(chat_id: string) {
    const accessToken = this.loginService.getToken();
    let user_id = this.loginService.usuarioActual.user_id.toString();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
        'User': user_id
      })
    };
    return this.http.get(this.url + "messages/" + chat_id, options)
  }

  public postMessage(nuevoMensaje: Message) {
    const accessToken = this.loginService.getToken();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
      })
    };
    console.log(nuevoMensaje);
    return this.http.post(this.url + "messages/", nuevoMensaje, options)
  } 

  public createUserNotification(nuevaNotificacion: Notificacion) {
    console.log(nuevaNotificacion);
    return this.http.post(this.url + "notifications/", nuevaNotificacion)
  }

  public modifyNotificationsByUser(nuevaNotificacion: Notificacion) {
    const accessToken = this.loginService.getToken();
    console.log(accessToken)
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
      })
    };
    console.log(nuevaNotificacion);
    return this.http.put(this.url + "notifications/", nuevaNotificacion, options)
  }

  public getNotificationsByUser(id: number) {
    const accessToken = this.loginService.getToken();
    console.log(id, accessToken)
      const options = {
        headers: new HttpHeaders({
          'Authorization': accessToken,
        })
      };
    return this.http.get(this.url + "notifications/"+ id, options)
  }

  public postNole(newNoleRelation: Nole) {
    const accessToken = this.loginService.getToken();
    const options = {
      headers: new HttpHeaders({
        'Authorization': accessToken, 
      })
    };
    return this.http.post(this.url + "noles/", newNoleRelation, options)
  }

  public getNolesByUser(id: number) {
    const accessToken = this.loginService.getToken();
      const options = {
        headers: new HttpHeaders({
          'Authorization': accessToken,
        })
      };
    return this.http.get(this.url + "noles/" + id, options);
  }

  public getSilesByUser(id: number) {
    const accessToken = this.loginService.getToken();
      const options = {
        headers: new HttpHeaders({
          'Authorization': accessToken,
        })
      };
    return this.http.get(this.url + "siles/" + id, options);
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
    return this.http.delete(this.url + "noles/" + chat_id, options);
  }
  
}