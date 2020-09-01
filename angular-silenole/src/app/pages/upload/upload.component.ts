// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// MODELO
import { Product } from 'src/app/models/product';
import { Usuario } from 'src/app/models/usuario';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})


export class UploadComponent implements OnInit {

  public usuarioActual=new Usuario(null,null,null,null,null,null,null,null,null)
  public product= new Product(null,null,null,null,null,null,null)
  public products: any[];
  public idProducto: number
  public modalRef: BsModalRef;
  public selectedFile: File; //para cargar la foto

  constructor(
    public productService:ProductService, 
    public loginService:LoginService, 
    public modalService:BsModalService) {
    this.usuarioActual=this.loginService.usuarioActual
  }

  // METODOS
  public pasarIdProducto(numero){
    this.idProducto=numero
    console.log(this.idProducto)
  }
  
  public anyadirSile(nombre: string, descripcion: string, categoria: string, user_id: number, product_image: string){
    console.log('Hola desde anyadir')
    console.log(this.productService.product)
    let productImageUrl;
    let date = new Date();
    productImageUrl = this.productService.urlImg + this.token() + "-" + user_id + ".jpg";
    const nombreFotoProducto = productImageUrl
    const fd = new FormData()
    fd.append('product_image',this.selectedFile, nombreFotoProducto);
    this.productService.uploadImageProduct(fd).subscribe((data)=>{
      console.log(data)
    })
    this.productService.postProduct(new Product(null, nombre, descripcion, categoria, user_id, productImageUrl, date)).subscribe((data)=>{
      console.log(data)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
        this.productService.usuarioActual = null;
      }
    })
  }
  
  //para cargar la foto
  public onFileSelected(event){
    this.selectedFile = <File>event.target.files[0]
  }

  // FORMULARIO
  public onSubmit(form){
    console.log(form.value)
  }

  // MODAL
  public openModal(Upload: TemplateRef<any>){
    this.modalRef = this.modalService.show(Upload)
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
