// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from "@angular/router";
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// MODELO
import { Product } from 'src/app/models/product';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrls: ['./my-products.component.css']
})

export class MyProductsComponent implements OnInit {

  closeResult = ''; //MODAL NG
  public productoActual= new Product(null,null,null,null,null,null,null)
  public products: any;
  public idProducto: number
  public idUsuario: number
  public modalRef:BsModalRef; //MODAL NGX
  public selectedFile: File; //para cargar la foto

  constructor(
    public productService:ProductService, 
    public loginService:LoginService, 
    private modalServices: BsModalService) { 
    this.products = [];
    this.selectedFile = null;
    this.mostrarProductos(this.idUsuario=this.loginService.usuarioActual.user_id)
  }

  // METODOS
  public mostrarProductos(uid){
    this.productService.getProductsByUser(uid).subscribe((data)=>{
      this.products = data
      console.log(data)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
        this.productService.usuarioActual = null;
      }
    })
  }

  public pasarIdProducto(pid){
    this.idProducto=pid
    console.log(this.idProducto)
  };

  public pasarProducto(p){
    this.productoActual=p
    console.log(this.productoActual)
  }

  //para cargar la foto
  public onFileSelected(event){
    this.selectedFile = <File>event.target.files[0]
  }

  /* PARA MODIFICAR PRODUCTOS */
  public modificarSile(product_id: number, nombre: string, descripcion: string, categoria: string, user_id: number){
    console.log('Hola desde modificarSile')
    let date = new Date();
    let productImageUrl;
    if(this.selectedFile === null) {
      productImageUrl = this.productoActual.product_image;
    } else {
     productImageUrl = this.productService.urlImg + this.selectedFile.name;
      //  productImageUrl = this.productService.urlImg + this.selectedFile.name + this.token() + "-" + user_id + ".jpg";
    }
    if(this.selectedFile === null) {
      this.productService.putProduct(new Product(product_id, nombre, descripcion, categoria, user_id, productImageUrl, date)).subscribe((data)=>{
        console.log(data)
        this.mostrarProductos(this.idUsuario)      
      }, (error) => {
        console.log(error);
        if (error.status === 401) {
          this.loginService.forcedLogout();
          this.productService.usuarioActual = null;
        }
      })
    } else {
      const fd = new FormData()
      fd.append('product_image',this.selectedFile, this.selectedFile.name);
      this.productService.uploadImageProduct(fd).subscribe((data)=>{
        console.log(data)
        this.productService.putProduct(new Product(product_id, nombre, descripcion, categoria, user_id, productImageUrl, date)).subscribe((data)=>{
          console.log(data)
          this.selectedFile = null;
          this.mostrarProductos(this.idUsuario)      
        }, (error) => {
          console.log(error);
          if (error.status === 401) {
            this.loginService.forcedLogout();
            this.productService.usuarioActual = null;
          }
        })
      })
    }
  }

  public cancelarCambio(): void {
    this.selectedFile = null;
    this.mostrarProductos(this.idUsuario)      
  }

  /* PARA BORRAR PRODUCTOS */
  public borrarSile(id: number){
    console.log('Hola desde borrarSile')
    this.productService.deleteProduct(id).subscribe((data)=>{
      console.log(data)
      this.mostrarProductos(this.idUsuario)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
        this.productService.usuarioActual = null;
      }
    })
  }

  //FORMULARIOS
  public onSubmit(form){
    console.log(form.value)
  }

  // MODALES
  openModal(template: TemplateRef<any>){
    this.modalRef = this.modalServices.show(template)
  }

  //Para generar nombres de ficheros aleatorios
  public random() {
    return Math.random().toString(36).substr(2); // Eliminar `0.`
  };

  public token() {
    return this.random() + this.random(); // Para hacer el token más largo
  };

  ngOnInit(): void {
  }

}
