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
import { GlobalsService } from 'src/app/shared/globals.service';
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
  public idProducto: number;
  public fotoProducto: string;
  public idUsuario: number;
  public modalRef:BsModalRef; //MODAL NGX
  public selectedFile: File; //para cargar la foto
  private photoSize=2000000
  public unicornio: string = this.globalsService.unicornio

  constructor(
    public productService:ProductService, 
    public loginService:LoginService, 
    private modalServices: BsModalService,
    public globalsService: GlobalsService, 
    private toastr: ToastrService) { 
    this.products = [];
    this.selectedFile = null;
    this.idUsuario = this.loginService.getUserId()
    this.mostrarProductos(this.idUsuario)
  }

  // METODOS
  public mostrarProductos(uid){
    this.productService.getProductsByUser(uid).subscribe((data)=>{
      this.products = data
      if(this.globalsService.DEBUG){
       console.log(data);
      }
    }, (error) => {
      if(this.globalsService.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  public pasarFotoYIdProducto(idProducto,fotoProducto){
    this.idProducto=idProducto
    this.fotoProducto=fotoProducto
    if(this.globalsService.DEBUG){
      console.log(this.idProducto)
    }
    if(this.globalsService.DEBUG){
      console.log(this.fotoProducto)
    }
  };

  public pasarProducto(producto){
    this.productoActual=producto
    if(this.globalsService.DEBUG){
      console.log(this.productoActual)
    }
  }

  //para cargar la foto
  public onFileSelected(event){
    this.selectedFile = <File>event.target.files[0]	
	  let fileName = this.selectedFile.name; 
	  let fileSize = this.selectedFile.size; //recupera el tamaño del archivo
	if(fileSize > this.photoSize){
    this.toastr.error("El archivo no debe superar los 2MB", "Algo fue mal")
		fileName = '';
	}else{
		// recuperamos la extensión del archivo
		let ext = fileName.split('.').pop();
		// Convertimos en minúscula porque la extensión del archivo puede estar en mayúscula
		ext = ext.toLowerCase();
		switch (ext) {
			case 'jpg':
			case 'jpeg':
			case 'png': break;
			default:
				this.toastr.error('El archivo no tiene la extensión adecuada', "Algo fue mal");
				fileName = '';
		  }
    }
  }

  /* PARA MODIFICAR PRODUCTOS */
  public modificarSile(product_id: number, nombre: string, descripcion: string, categoria: string, user_id: number, template: TemplateRef < any >){
    if (nombre === null || descripcion === null || categoria === null || nombre === "" || descripcion === "" || categoria === "" ) {
      this.toastr.error("Por favor, completa todos los campos", "Algo fue mal")
      this.mostrarProductos(this.idUsuario)
      return
    }
    if(this.globalsService.INFO){
      console.log('Hola desde modificarSile')
    }
    let date = new Date();
    let productImageUrl;
    let oldImage = this.productoActual.product_image;
    if(this.globalsService.DEBUG){
      console.log(oldImage);
    }
    if(this.selectedFile === null) {
      productImageUrl = this.productoActual.product_image;
    } else {
      if(this.globalsService.DEBUG){
        console.log(oldImage);
      }
      oldImage = oldImage.replace(this.productService.urlImg, "");
      if(this.globalsService.DEBUG){
        console.log(oldImage);
      }
      productImageUrl = this.productService.urlImg + this.token() + "-" + this.idUsuario + ".jpg";
    }
    if(this.selectedFile === null) {
      this.productService.putProduct(new Product(product_id, nombre, descripcion, categoria, user_id, productImageUrl, date)).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log(data);
        }
        this.mostrarProductos(this.idUsuario)
        this.openModal(template);      
      }, (error) => {
        if(this.globalsService.ERROR){
          console.log(error);
        }
        if (error.status === 401) {
          this.loginService.forcedLogout();
        }
      })
    } else {
      const nombreFotoProducto = productImageUrl
      const fd = new FormData()
      fd.append('product_image',this.selectedFile, nombreFotoProducto);
      this.productService.deleteImage(oldImage).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log(data);
        }
      })
      this.productService.uploadImageProduct(fd).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log(data);
        }
        this.productService.putProduct(new Product(product_id, nombre, descripcion, categoria, user_id, productImageUrl, date)).subscribe((data)=>{
          if(this.globalsService.DEBUG){
            console.log(data);
          }
          this.selectedFile = null;
          this.mostrarProductos(this.idUsuario)
          this.openModal(template);      
        }, (error) => {
          if(this.globalsService.ERROR){
            console.log(error);
          }
          if (error.status === 401) {
            this.loginService.forcedLogout();
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
  public borrarSile(idProducto: number,fotoProducto: string){
    if(this.globalsService.INFO){
      console.log('Hola desde borrarSile')
    }
    if(this.globalsService.DEBUG){
      console.log(fotoProducto)
    }
    fotoProducto = fotoProducto.replace(this.productService.urlImg, "");
    this.productService.deleteImage(fotoProducto).subscribe((data)=>{
      if(this.globalsService.DEBUG){
        console.log(data);
      }
    }, (error) => {
      if(this.globalsService.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
    this.productService.deleteProduct(idProducto).subscribe((data)=>{
      if(this.globalsService.DEBUG){
        console.log(data);
      }
      this.mostrarProductos(this.idUsuario)
    }, (error) => {
      if(this.globalsService.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  //FORMULARIOS
  public onSubmit(form){
    if(this.globalsService.DEBUG){
      console.log(form.value)
    }
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