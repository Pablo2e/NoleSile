// COMPONENTE
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
// MODELO
import { Product } from 'src/app/models/product';
import { Nole } from 'src/app/models/nole';
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
  public usuarioActual

  constructor(
    public productService:ProductService, 
    public usuarioService:UsuarioService,
    public loginService:LoginService, 
    public messageService:MessageService,
    public globalsService: GlobalsService,
    private router: Router,
    private location: Location) {
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
    let newNole= new Nole(uid,pid);
    this.messageService.postNole(newNole).subscribe((data)=>{
      if(environment.log.DEBUG){
        console.log(data);
      }
    })
    this.messageService.noleSeleccionado = newNole;
  }

  ngOnInit(): void {
  }

}
