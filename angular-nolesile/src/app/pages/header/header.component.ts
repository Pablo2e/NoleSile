// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// MODELO
import { Product } from 'src/app/models/product';
import { Usuario } from 'src/app/models/usuario';
import { Notificacion } from 'src/app/models/notificaciones';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';
import { UsuarioService } from 'src/app/shared/usuario.service';
import { MessageService } from 'src/app/shared/message.service';
import { GlobalsService } from 'src/app/shared/globals.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})


export class HeaderComponent implements OnInit {
  
  public product= new Product(null,null,null,null,null,null, null)
  public products: any;
  public form: FormGroup; // para obtener los datos del formulario
  public modalRef:BsModalRef
  public usuario: Usuario;  
  // public notificacion = new Notificacion(null, null)

  constructor(
    public productService: ProductService,
    public loginService: LoginService,
    public usuarioService: UsuarioService, 
    public messageService: MessageService,
    public globalsService: GlobalsService,
    private modalService: BsModalService,
    private router: Router) {}

  //METODOS
  public verificarUsuario(){
    let user_id = this.loginService.getUserId()
    if(environment.log.DEBUG){
      console.log(user_id)
    }
    this.loginService.getUsuario(user_id).subscribe((data) => {
      if(environment.log.DEBUG){
        console.log(data)
      }
      this.router.navigate(["/usuario"]);
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public buscarProducto(clave: string) {
    if(environment.log.DEBUG){
      console.log(clave)
    }
    this.productService.getProductsByName(clave).subscribe((data) => {
      this.productService.products = data
      if(environment.log.DEBUG){
        console.log(data)
      }
      this.router.navigate(["/buscar"]);
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public cerrarSesion(){
    this.loginService.logout().subscribe((data) => {
      this.loginService.usuarioActual = null;
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
  }

  public desactivarAvisoMensaje(){
    let notificacionDesactivar:Notificacion = new Notificacion(this.loginService.getUserId(), false)
    this.messageService.modifyNotificationsByUser(notificacionDesactivar).subscribe((data) => {
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
    console.log(this.loginService.avisoMensaje)
  }

  public verificarMensajesNuevos(){
    this.messageService.getNotificationsByUser(this.loginService.getUserId()).subscribe((data) => {
      if(environment.log.DEBUG){
        console.log(data)
      }
      if (data !== null && data[0] !== undefined) {
        this.loginService.avisoMensaje = data[0].mensajes_nuevos;
        // this.router.navigate(["/home"])
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

  //FORMULARIO
  public onSubmit(form) {
    if(environment.log.DEBUG){
      console.log(form.value)
    }
  }

  //MODAL
  public openModal(template: TemplateRef < any > ) {
    this.modalRef = this.modalService.show(template)
  }
  
  ngOnInit(): void {
    if(environment.log.INFO){
      console.log('ngOnInit.header.ts');
    }
    this.verificarMensajesNuevos();
  }
  
}

