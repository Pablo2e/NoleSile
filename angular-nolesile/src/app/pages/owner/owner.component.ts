// COMPONENTE
import { Component, OnInit } from '@angular/core';
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

  constructor(
    public productService:ProductService, 
    public usuarioService:UsuarioService,
    public loginService:LoginService, 
    public messageService:MessageService,
    public globalsService: GlobalsService) {
      this.obtenerOwnerInfo(this.productService.ownerActual)
      this.mostrarProductos(this.productService.ownerActual)
   }
  
  // METODOS
  public mostrarProductos(uid){
    this.productService.getProductsByUser(uid).subscribe((data)=>{
      this.products = data
      if(this.globalsService.DEBUG){
        console.log()
      } else {
        console.log(data);
      }
    })
  }

  public obtenerOwnerInfo(uid){
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log(uid);
    }
    this.usuarioService.getUsuario(uid).subscribe((data)=>{
      if(this.globalsService.DEBUG){
        console.log()
      } else {
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
      if(this.globalsService.DEBUG){
        console.log()
      } else {
        console.log(data);
      }
    })
    this.messageService.noleSeleccionado = newNole;
  }

  ngOnInit(): void {
  }

}
