// COMPONENTE
import { Component, OnInit, TemplateRef  } from '@angular/core';
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


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})

export class MessagesComponent implements OnInit {

  closeResult = ''; //MODAL NG
  public message=new Message(null, null, null, null, null ,null)
  public message2=new Message(null, null, null, null, null ,null)
  public messagesNoles: any;
  public messagesSiles: any;
  public noles: any;
  public siles: any;
  public usuarioActual=new Usuario(null, null, null, null, null, null, null, null, null)
  public fecha = new Date();
  public products: any;
  public modalRef: BsModalRef;
  public chat_idParaBorrar: string;

  constructor(
    public usuarioService:UsuarioService, 
    public messageService:MessageService, 
    public productService:ProductService, 
    public loginService:LoginService, 
    public modalServices:BsModalService) { 
    console.log("Funcionando servicio messageService")
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
    console.log(oid)
    console.log(this.productService.ownerActual)
  }

  public pasarNole(nole){
    console.log("El chat seleccionado es: " + nole.chat_id);
    this.messageService.noleSeleccionado.chat_id = nole.chat_id;
    this.messageService.noleSeleccionado.product_id = nole.product_id;
    this.cargarMensajesNoles();
  }

  public pasarNoleParaBorrar(chat_id){
    console.log("El chat seleccionado es: " + chat_id);
    this.chat_idParaBorrar = chat_id;
    this.cargarMensajesNoles();
  }

  public pasarSile(sile){
    console.log("El chat seleccionado es: " + sile.chat_id);
    this.messageService.sileSeleccionado.chat_id = sile.chat_id;
    this.messageService.sileSeleccionado.product_id = sile.product_id;
    this.cargarMensajesSiles();
  }

  public enviarMsgNoleSeleccionado(text:string){
    console.log('Hola desde enviarMsgNoleSeleccionado')
    console.log(text)
    let sender_id = this.loginService.usuarioActual.user_id;
    let chat_id = this.messageService.noleSeleccionado.chat_id
    let product_id = this.messageService.noleSeleccionado.product_id
    let date = new Date();
    this.messageService.postMessage(new Message(null, chat_id, sender_id,  product_id, text, date)).subscribe((data)=>{
      console.log(data)
      this.cargarMensajesNoles();
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
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
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public cargarNoles() {
    let uid=this.loginService.usuarioActual.user_id
    this.messageService.getNolesByUser(uid).subscribe((data)=>{
      this.noles = data
      console.log(data) 
    }, (error) => {
      console.log(error);
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
      console.log(data)  
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public cargarSiles() {
      let uid=this.loginService.usuarioActual.user_id
      this.messageService.getSilesByUser(uid).subscribe((data)=>{
        this.siles = data
        console.log(data) 
      }, (error) => {
        console.log(error);
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
      console.log(data)  
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public enviarMsgSileSeleccionado(text:string){
    console.log('Hola desde enviarMsgSileeSeleccionado')
    console.log(text)
    let sender_id = this.loginService.usuarioActual.user_id;
    let chat_id = this.messageService.sileSeleccionado.chat_id
    let product_id = this.messageService.sileSeleccionado.product_id
    let date = new Date();
    this.messageService.postMessage(new Message(null, chat_id, sender_id,  product_id, text, date)).subscribe((data)=>{
      console.log(data)
      this.cargarMensajesSiles();
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

/*   public activarAvisoMensaje(){
    let notificacionActivar:Notificacion = new Notificacion(this.productService.ownerActual, true)
    console.log(notificacionActivar)
    this.messageService.modifyNotificationsByUser(notificacionActivar).subscribe((data) => {
      console.log(data)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    }) 
    console.log(this.loginService.avisoMensaje)
  } */
  
  //FORMULARIOS
  public onSubmit(form){
    console.log(form.value)
  }

  //MODALES
  public openModal(Upload: TemplateRef<any>){
    this.modalRef = this.modalServices.show(Upload)
  }

  ngOnInit(): void {
  }

}