// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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
    private modalService: BsModalService,
    private router: Router) { 
      console.log('Constructor del header.ts')
    }

  //METODOS
  public verificarUsuario(){
    let user_id = this.loginService.usuarioActual.user_id
    console.log(user_id)
    this.usuarioService.getUsuario(user_id).subscribe((data) => {
      console.log(data)
      this.router.navigate(["/usuario"]);
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
        this.productService.usuarioActual = null;
      }
    })
  }

  public buscarProducto(clave: string) {
    console.log(clave)
    this.productService.getProductsByName(clave).subscribe((data) => {
      this.productService.products = data
      console.log(data)
      this.router.navigate(["/buscar"]);
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public cerrarSesion(){
    this.loginService.logout().subscribe((data) => {
      this.loginService.usuarioActual = null;
      this.productService.usuarioActual = null;
      console.log(data)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public desactivarAvisoMensaje(){
    let notificacionDesactivar:Notificacion = new Notificacion(this.loginService.usuarioActual.user_id, false)
    this.messageService.modifyNotificationsByUser(notificacionDesactivar).subscribe((data) => {
      console.log(data)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    }) 
    console.log(this.loginService.avisoMensaje)
  }

  public verificarMensajesNuevos(){
    this.messageService.getNotificationsByUser(this.loginService.usuarioActual.user_id).subscribe((data) => {
      console.log(data)
      if (data !== null) {
        this.loginService.avisoMensaje = data[0].mensajes_nuevos;
        // this.router.navigate(["/home"])
      }
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  //FORMULARIO
  public onSubmit(form) {
    console.log(form.value)
  }

  //MODAL
  public openModal(template: TemplateRef < any > ) {
    this.modalRef = this.modalService.show(template)
  }
  
  ngOnInit(): void {
    console.log('ngOnInit.header.ts');
    this.verificarMensajesNuevos();
  }
  
}

