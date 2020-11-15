// COMPONENTE
import { Component, OnInit, TemplateRef  } from '@angular/core';
import { environment } from '../../../environments/environment';
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// MODELO
import { Message } from 'src/app/models/message';
import { Usuario } from 'src/app/models/usuario';
import { Notificacion } from 'src/app/models/notificaciones';
// SERVICIOS
import { MessageService } from 'src/app/shared/message.service';
import { ProductService } from 'src/app/shared/product.service';
import { UsuarioService } from 'src/app/shared/usuario.service';
import { LoginService } from 'src/app/shared/login.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalsService } from 'src/app/shared//globals.service';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})

export class MessagesComponent implements OnInit {

  closeResult = ''; //MODAL NG
  public message=new Message(null, null, null, null, null, null ,null)
  public message2=new Message(null, null, null, null, null, null ,null)
  public messagesNoles: any;
  public messagesSiles: any;
  public noles: any;
  public siles: any;
  public usuarioActual=new Usuario(null, null, null, null, null, null, null, null, null)
  public fecha = new Date();
  public products: any;
  public modalRef: BsModalRef;
  public chat_idParaBorrar: string;
  public cambio: any;
  public unicornio: string = this.globalsService.unicornio

  constructor(
    public usuarioService:UsuarioService, 
    public messageService:MessageService, 
    public productService:ProductService, 
    public loginService:LoginService,
    public globalsService:GlobalsService, 
    public modalServices:BsModalService, 
    private toastr: ToastrService) { 
      if(environment.log.INFO){
        console.log("Funcionando servicio messageService")
      }
    this.noles=[];
    this.siles=[];
    this.usuarioActual = this.loginService.usuarioActual;
    this.cargarSiles()
    this.cargarMensajesSiles()
    this.cargarNoles()
    this.cargarMensajesNoles()
  }

  //METODOS
  public pasarIdOwner(oid) {
    this.productService.ownerActual = oid
    if(environment.log.DEBUG){
      console.log(oid)
    }
    if(environment.log.DEBUG){
      console.log(this.productService.ownerActual)
    }
  }

  public pasarNole(nole){
    if(environment.log.DEBUG){
      console.log("El chat seleccionado es: " + nole.chat_id);
    }
    this.messageService.noleSeleccionado.chat_id = nole.chat_id;
    this.messageService.noleSeleccionado.product_id = nole.product_id;
    this.messageService.noleSeleccionado.user_id = nole.user_id;
    this.cargarMensajesNoles();
  }

  public pasarNoleParaBorrar(chat_id){
    if(environment.log.DEBUG){
      console.log("El chat seleccionado es: " + chat_id);
    }
    this.chat_idParaBorrar = chat_id;
    this.cargarMensajesNoles();
  }

  public pasarSile(sile){
    if(environment.log.DEBUG){
      console.log("El chat seleccionado es: " + sile.chat_id);
    }
    this.messageService.sileSeleccionado.chat_id = sile.chat_id;
    this.messageService.sileSeleccionado.product_id = sile.product_id;
    this.pasarIdOwner(sile.user_id)
    this.cargarMensajesSiles();
  }

  public enviarMsgNoleSeleccionado(text:string){
    if(environment.log.INFO){
      console.log('Hola desde enviarMsgNoleSeleccionado')
    }
    if(environment.log.DEBUG){
      console.log(text)
    }
    let sender_id = this.loginService.getUserId();
    let chat_id = this.messageService.noleSeleccionado.chat_id
    let product_id = this.messageService.noleSeleccionado.product_id
    let receiver_id = this.messageService.noleSeleccionado.user_id
    if(environment.log.DEBUG){
      console.log(receiver_id + 'dueño del nole')
    }
    let date = new Date();
    this.messageService.postMessage(new Message(null, chat_id, sender_id, receiver_id, product_id, text, date)).subscribe((data)=>{
      if(environment.log.DEBUG){
        console.log(data);
      }
      this.activarAvisoMensaje(receiver_id)
      this.cargarMensajesNoles();
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      } else if (error.status === 409) {
        this.toastr.error("Ya no puedes añadir más mensajes, haz alcanzado el maximo de 200", "Algo fue mal")
      }
    })
  }
  
  public eliminarNole(){
    this.messageService.deleteNole(this.chat_idParaBorrar).subscribe((data)=>{
      this.cargarNoles()
      this.cargarMensajesNoles()
      this.cargarSiles()
      this.cargarMensajesSiles()
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public cargarNoles() {
    let uid=this.loginService.getUserId()
    this.messageService.getNolesByUser(uid).subscribe((data)=>{
      this.noles = data
      if(environment.log.DEBUG){
        console.log(data);
      } 
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public cargarMensajesNoles() {
    let chat_id = this.messageService.noleSeleccionado.chat_id
    this.messageService.getMessages(chat_id).subscribe((data)=>{
      this.messagesNoles = data
      this.messagesNoles.forEach(msg => {
        let date:Date = new Date();
        date.setTime(Date.parse(msg.date));
        msg.date = date.toLocaleString();
      })
      if(environment.log.DEBUG){
        console.log(data);
      }  
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public cargarSiles() {
      let uid=this.loginService.getUserId()
      this.messageService.getSilesByUser(uid).subscribe((data)=>{
        this.siles = data
        if(environment.log.DEBUG){
          console.log(data);
        } 
      }, (error) => {
        if(environment.log.ERROR){
          console.log(error);
        }
        if (error.status === 401) {
          this.loginService.forcedLogout();
        }
      })
    }

  public cargarMensajesSiles() {
    let chat_id = this.messageService.sileSeleccionado.chat_id
    this.messageService.getMessages(chat_id).subscribe((data)=>{
      this.messagesSiles = data
      this.messagesSiles.forEach(msg => {
        let date:Date = new Date();
        date.setTime(Date.parse(msg.date));
        msg.date = date.toLocaleString();
      })
      if(environment.log.DEBUG){
        console.log(data);
      }  
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public enviarMsgSileSeleccionado(text:string){
    if(environment.log.INFO){
      console.log('Hola desde enviarMsgSileSeleccionado')
    }
    if(environment.log.DEBUG){
      console.log(text)
    }
    let sender_id = this.loginService.getUserId();
    let chat_id = this.messageService.sileSeleccionado.chat_id
    let product_id = this.messageService.sileSeleccionado.product_id
    let receiver_id = this.productService.ownerActual
    if(environment.log.DEBUG){
      console.log(receiver_id + 'interesado en mi sile')
    }
    let date = new Date();
    this.messageService.postMessage(new Message(null, chat_id, sender_id, receiver_id, product_id, text, date)).subscribe((data)=>{
      if(environment.log.DEBUG){
        console.log(data);
      }
      this.activarAvisoMensaje(receiver_id)
      this.cargarMensajesSiles();
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public activarAvisoMensaje(receiver_id){
    let notificacionActivar:Notificacion = new Notificacion(receiver_id, true)
    this.messageService.modifyNotificationsByUser(notificacionActivar).subscribe((data) => {
      if(environment.log.DEBUG){
        console.log(data);
      }
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public cambiarMensajeALeido(chatId){
    this.cambio = {
      chat_id: chatId,
      receiver_id: this.loginService.getUserId(),
    }
    if(environment.log.DEBUG){
      console.log(this.cambio)
    }
    this.messageService.changeMessageToRead(this.cambio).subscribe((data)=>{
      if(environment.log.DEBUG){
       console.log(data);
      }
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }
  
  //FORMULARIOS
  public onSubmit(form){
    if(environment.log.DEBUG){
      console.log(form.value)
    }
  }

  //MODALES
  public openModal(Upload: TemplateRef<any>){
    this.modalRef = this.modalServices.show(Upload)
  }

  ngOnInit(): void {
  }
  
} 