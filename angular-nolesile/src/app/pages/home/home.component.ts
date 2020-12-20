// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// MODELOS
import { Product } from 'src/app/models/product';
import { Nole } from 'src/app/models/nole';
import { Message } from 'src/app/models/message';
import { Notificacion } from 'src/app/models/notificaciones';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';
import { MessageService } from 'src/app/shared/message.service';
import { GlobalsService } from 'src/app/shared/globals.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {
  
  //public usuarioActual = new Usuario(null, null, null, null, null, null, null, null, null)
  public product= new Product(null,null,null,null,null,null,null)
  public productsUltimos: any;
  public productsCercanos: any;
  public idProducto: number
  public unicornio: string = this.globalsService.unicornio
  public usuarioActual
  public modalRef: BsModalRef;
  public messagesNoles: any;
  public message=new Message(null, null, null, null, null, null ,null)

  constructor(
    public productService:ProductService, 
    public loginService: LoginService, 
    public messageService:MessageService,
    public globalsService: GlobalsService, 
    public modalServices:BsModalService, 
    private toastr: ToastrService) {
      this.loginService.loadExistingSession()
      this.productsCercanos = [];
      this.productsUltimos = [];
      this.usuarioActual=this.loginService.getUserId();
      this.mostrarUltimosProductos();
      this.mostraProductosCercanos();
      console.log(this.usuarioActual)
    }

  //METODOS
  public mostrarUltimosProductos(){
    this.productService.getLatestProducts().subscribe((data) => {
      this.productsUltimos = data
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

  public mostraProductosCercanos() {
    this.productService.getClosestProducts().subscribe((data) => {
      this.productsCercanos = data
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
  
  public pasarIdOwner(oid) {
    this.productService.ownerActual = oid
    if(environment.log.DEBUG){
      console.log(this.productService.ownerActual)
    }
  }
  
  public relacionarProductoMensaje(pid) {
    let uid = this.loginService.getUserId();
    this.productService.idProductoSeleccionado=pid;
    let newNole = new Nole(uid, pid);
    this.messageService.postNole(newNole).subscribe((data) => {
      if(environment.log.DEBUG){
        console.log(data)
      }
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
    this.messageService.noleSeleccionado = newNole;
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
    let receiver_id = this.productService.ownerActual
    //let receiver_id = this.messageService.noleSeleccionado.user_id
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
 
  ngOnInit(): void { }
  
}