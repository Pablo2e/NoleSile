// COMPONENTE
import { Component, OnInit, TemplateRef  } from '@angular/core';
import { Router } from "@angular/router";
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// MODELO
import { Product } from 'src/app/models/product';
import { Nole } from 'src/app/models/nole';
import { Message } from 'src/app/models/message';
import { Notificacion } from 'src/app/models/notificaciones';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';
import { UsuarioService } from 'src/app/shared/usuario.service';
import { MessageService } from 'src/app/shared/message.service';
import { GlobalsService } from 'src/app/shared/globals.service';


@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.css']
})

export class OwnerComponent implements OnInit {

  public productoActual= new Product(null,null,null,null,null,null,null)
  public products: any;
  public idProducto: number;
  public idUsuario: number;
  public nombreOwner: string;
  public imagenOwner: string;
  public usuarioActual;
  public modalRef: BsModalRef;
  public messagesNoles: any;
  public message=new Message(null, null, null, null, null, null ,null)

  constructor(
    public productService:ProductService, 
    public usuarioService:UsuarioService,
    public loginService:LoginService, 
    public messageService:MessageService, 
    public modalServices:BsModalService,
    public globalsService: GlobalsService,
    private router: Router,
    private location: Location, 
    private toastr: ToastrService) {
      this.usuarioActual=this.loginService.getUserId();
      if(this.productService.ownerActual !== null && this.productService.ownerActual !== undefined){
        this.obtenerOwnerInfo(this.productService.ownerActual)
        this.mostrarProductos(this.productService.ownerActual)
      } else {
        /* this.router.navigate(["/inicio"]) */
        this.location.back();
     }

      }
  
  // METODOS
  public mostrarProductos(uid){
    this.productService.getProductsByUser(uid).subscribe((data)=>{
      this.products = data
      if(environment.log.DEBUG){
        console.log(data);
      }
    })
  }

  public obtenerOwnerInfo(uid){
    if(environment.log.DEBUG){
      console.log(uid);
    }
    this.loginService.getUsuario(uid).subscribe((data)=>{
      if(environment.log.DEBUG){
        console.log(data);
      }
      this.nombreOwner = data[0].name;
      this.imagenOwner = data[0].user_image;
    })
  }

  public relacionarProductoMensaje(pid){
    let uid=this.loginService.usuarioActual.user_id;
    console.log(uid,pid)
    let newNole= new Nole(uid,pid);
    this.messageService.postNole(newNole).subscribe((data)=>{
      if(environment.log.DEBUG){
        console.log(data);
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

  public pasarIdOwner(oid) {
    this.productService.ownerActual = oid
    if(environment.log.DEBUG){
      console.log(this.productService.ownerActual)
    }
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
 

  ngOnInit(): void {
  }

}
