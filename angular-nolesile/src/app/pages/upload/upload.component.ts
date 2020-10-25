// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Ng2ImgMaxService } from 'ng2-img-max';
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// MODELO
import { Product } from 'src/app/models/product';
import { Usuario } from 'src/app/models/usuario';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';
import { GlobalsService } from 'src/app/shared/globals.service';


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
    public modalService:BsModalService,
    public globalsService: GlobalsService, 
    private toastr: ToastrService,
    private ng2ImgMax: Ng2ImgMaxService) {
    this.usuarioActual=this.loginService.usuarioActual
  }

  // METODOS
  public pasarIdProducto(numero){
    this.idProducto=numero
    if(this.globalsService.DEBUG){
      console.log(this.idProducto)
    }
  }
  
  public anyadirSile(nombre: string, descripcion: string, categoria: string, user_id: number, product_image: string, template: TemplateRef < any > ){
    if(this.globalsService.DEBUG){
      console.log(this.productService.product)
    }
    if (nombre === null || descripcion === null || categoria === null || product_image === null ||
      nombre === "" || descripcion === "" || categoria === "" || product_image === "") {
      this.toastr.error("Por favor, completa todos los campos", "Algo fue mal")
    } else {
      let productImageUrl;
      let date = new Date();
      productImageUrl = this.productService.urlImg + this.token() + "-" + user_id + ".jpg";
      const nombreFotoProducto = productImageUrl
      const fd = new FormData()
      fd.append('product_image',this.selectedFile, nombreFotoProducto);
      this.productService.uploadImageProduct(fd).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log(data);
        }
      })
      this.productService.postProduct(new Product(null, nombre, descripcion, categoria, user_id, productImageUrl, date)).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log(data);
        }
        this.openModal(template);
      }, (error) => {
        if(this.globalsService.ERROR){
          console.log(error);
        }
        if (error.status === 401) {
          this.loginService.forcedLogout();
        } else if (error.status === 409) {
          this.toastr.error("Ya no puedes añadir más productos, borra alguno antes", "Algo fue mal")
        }
      })
    }
  }
  
  //para cargar la foto
  public onFileSelected(event){
    this.selectedFile = <File>event.target.files[0]	
    this.ng2ImgMax.compressImage(this.selectedFile, 1.95).subscribe(
      result => {
        this.selectedFile = new File([result], result.name);
        if(this.globalsService.DEBUG){
          console.log(this.selectedFile.size)
        }
      }, (error) => {
        if(this.globalsService.DEBUG){
          console.log('😢 Oh no!', error);
        }
      }
    );
    // recuperamos la extensión del archivo
    let fileName = this.selectedFile.name;
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

  // FORMULARIO
  public onSubmit(form){
    if(this.globalsService.DEBUG){
      console.log(form.value)
    }
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
