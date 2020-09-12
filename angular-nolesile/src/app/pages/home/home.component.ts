// COMPONENTE
import { Component, OnInit } from '@angular/core';
// MODELOS
import { Product } from 'src/app/models/product';
import { Usuario } from './../../models/usuario';
import { Nole } from 'src/app/models/nole';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';
import { MessageService } from 'src/app/shared/message.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {
  
  public usuarioActual = new Usuario(null, null, null, null, null, null, null, null, null)
  public product= new Product(null,null,null,null,null,null,null)
  public productsUltimos: any;
  public productsCercanos: any;
  public idProducto: number

  constructor(
    public productService:ProductService, 
    public loginService: LoginService, 
    public messageService:MessageService) {
      this.productsCercanos = [];
      this.mostrarUltimosProductos();
      this.mostraProductosCercanos();
    }

  //METODOS
  public mostrarUltimosProductos(){
    this.productService.getLatestProducts().subscribe((data) => {
      this.productsUltimos = data
      console.log(data)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public mostraProductosCercanos() {
    this.productService.getClosestProducts().subscribe((data) => {
      this.productsCercanos = data
      console.log(data)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }
  
  public pasarIdOwner(oid) {
    this.productService.ownerActual = oid
    console.log(this.productService.ownerActual)
  }
  
  public relacionarProductoMensaje(pid) {
    let uid = this.loginService.usuarioActual.user_id;
    this.productService.idProductoSeleccionado=pid;
    let newNole = new Nole(uid, pid);
    this.messageService.postNole(newNole).subscribe((data) => {
      console.log(data)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
    this.messageService.noleSeleccionado = newNole;
  }
 
  ngOnInit(): void { }
  
}