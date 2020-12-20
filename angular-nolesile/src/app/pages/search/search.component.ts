// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// MODELO
import { Product } from 'src/app/models/product';
import { Usuario } from './../../models/usuario';
import { Nole } from 'src/app/models/nole';
import { Message } from 'src/app/models/message';
import { Notificacion } from 'src/app/models/notificaciones';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';
import { MessageService } from 'src/app/shared/message.service';
import { GlobalsService } from 'src/app/shared/globals.service';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit {

  public usuarioActual = new Usuario(null, null, null, null, null, null, null, null, null)
  public product = new Product(null, null, null, null, null, null, null)
  public products: any;
  public idProducto: number;
  public categoriaActual: any;
  public usuario = new Usuario(null, null, null, null, null, null, null, null, null)
  public unicornio: string = this.globalsService.unicornio;
  public modalRef: BsModalRef;
  public messagesNoles: any;
  public message=new Message(null, null, null, null, null, null ,null)
  
  constructor(
    public productService: ProductService, 
    public loginService: LoginService, 
    public messageService:MessageService,
    public globalsService: GlobalsService, 
    public modalServices:BsModalService,  
    private router:Router, 
    private toastr: ToastrService) {
      if(!this.loginService.loadExistingSession()){
        this.router.navigate(["/"])
      } else {
        this.usuarioActual = this.loginService.usuarioActual;
        console.log(this.usuarioActual)
        if(this.productService.categoriaSeleccionada === null || this.productService.categoriaSeleccionada === undefined){
          this.productService.actualizarCategoriaSeleccionada('Todo')
          this.router.navigate(["/inicio"])
        }
      }
    }

  // METODOS
  public mostrarProductos() {
    this.productService.getAllProducts().subscribe((data) => {
      this.products = data
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

  public mostrarProductosPorUsuario(uid) {
    this.productService.getProductsByUser(uid).subscribe((data) => {
      this.products = data
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
  
  public buscarPorUbicacion(tipo: string, valor: any) {
    if(environment.log.INFO){
      console.log("Buscar en ubicacion", tipo , valor)
    }
    this.productService.getProductsBySelectedCategoryAndLocation(tipo, valor).subscribe((data) => {
      this.productService.products = data
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
  
  public buscarPorDias(dias: number) {
    if(environment.log.INFO){
      console.log("Buscar por dias")
    }
    this.productService.getProductsBySelectedCategoryAndDays(dias).subscribe((data) => {
      this.productService.products = data
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
  
  buscarUsuario(nombreUsuario){
    if(environment.log.DEBUG){
      console.log("Buscar usuario ", nombreUsuario)
    }
    this.productService.getOwnerByName(nombreUsuario).subscribe((data) => {
      if(data[0]===undefined || data[0]===null){
        this.toastr.error("EL usuario no existe", "Algo fue mal");
      } else {
        this.productService.ownerActual = data[0].user_id;
          if(environment.log.DEBUG){
            console.log(this.productService.ownerActual);
          }
        this.router.navigate(["/propietario"])
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
  
  public pasarIdProducto(pid) {
    this.idProducto = pid
    if(environment.log.DEBUG){
      console.log(this.idProducto)
    }
  }
  
  public relacionarProductoMensaje(pid) {
    let uid = this.loginService.usuarioActual.user_id;
    this.productService.idProductoSeleccionado=pid;
    let newNole = new Nole(uid, pid);
    this.messageService.postNole(newNole).subscribe((data) => {
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
 
  
  ngOnInit(): void {
    if(environment.log.INFO){
      console.log('ngOnInit.search.ts');
    }
  }
}

