// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { environment } from '../../../environments/environment';
import imageCompression from 'browser-image-compression';
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
  public unicornio: string = this.globalsService.unicornio
  public productImageUrl: string;
/*   public fotoProductoAntigua: string; */

  constructor(
    public productService:ProductService, 
    public loginService:LoginService, 
    private modalServices: BsModalService,
    public globalsService: GlobalsService, 
    private toastr: ToastrService,
    private ng2ImgMax: Ng2ImgMaxService) { 
    this.products = [];
    this.selectedFile = null;
    this.idUsuario = this.loginService.getUserId()
    this.mostrarProductos(this.idUsuario)
  }

  // METODOS
  public mostrarProductos(uid){
    this.productService.getProductsByUser(uid).subscribe((data)=>{
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

  public pasarFotoYIdProducto(idProducto,fotoProducto){
    this.idProducto=idProducto
    this.fotoProducto=fotoProducto
    if(environment.log.DEBUG){
      console.log(this.idProducto)
    }
    if(environment.log.DEBUG){
      console.log(this.fotoProducto)
    }
  };

  public pasarProducto(producto){
    this.productoActual=producto
    if(environment.log.DEBUG){
      console.log(this.productoActual)
    }
  }

  public getOrientation = async (file: File, callback: Function) => {
    var reader = new FileReader();
  
    reader.onload = (event: ProgressEvent) => {
  
      if (! event.target) {
        return;
      }
  
      const file = event.target as FileReader;
      const view = new DataView(file.result as ArrayBuffer);
  
      if (view.getUint16(0, false) != 0xFFD8) {
          return callback(-2);
      }
  
      const length = view.byteLength
      let offset = 2;
  
      while (offset < length)
      {
          if (view.getUint16(offset+2, false) <= 8) return callback(-1);
          let marker = view.getUint16(offset, false);
          offset += 2;
  
          if (marker == 0xFFE1) {
            if (view.getUint32(offset += 2, false) != 0x45786966) {
              return callback(-1);
            }
  
            let little = view.getUint16(offset += 6, false) == 0x4949;
            offset += view.getUint32(offset + 4, little);
            let tags = view.getUint16(offset, little);
            offset += 2;
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                return callback(view.getUint16(offset + (i * 12) + 8, little));
              }
            }
          } else if ((marker & 0xFF00) != 0xFF00) {
              break;
          }
          else {
              offset += view.getUint16(offset, false);
          }
      }
      return callback(-1);
    };
  
    reader.readAsArrayBuffer(file);
  }

  //para cargar la foto
  async onFileSelected(event) {
    this.selectedFile = <File>event.target.files[0];
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
      return;
    }
    if(environment.log.DEBUG){
      console.log('originalFile instanceof File', this.selectedFile instanceof File);
      console.log(`originalFile size ${this.selectedFile.size / 1024 / 1024} MB`);
      console.log('el tamaño maximo definido es ' + environment.maxFileSize);
    }
    let orientacionFoto;
    try {
      orientacionFoto = await imageCompression.getExifOrientation(this.selectedFile);
      if(environment.log.DEBUG){
        console.log('orientacion foto es: ', orientacionFoto);
      }
      const options = {
        maxSizeMB: environment.maxFileSize,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        exifOrientation: orientacionFoto
      }
      const compressedFile = await imageCompression(this.selectedFile, options);
      let orientacionFotoComprimida = await imageCompression.getExifOrientation(compressedFile);
      if(environment.log.DEBUG){
        console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
        console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
        console.log('orientacion foto es: ', orientacionFotoComprimida);
      }
      this.productImageUrl = this.productService.urlImg + this.token() + "-" + this.loginService.usuarioActual.user_id + ".jpg";
      const nombreFotoProducto = this.productImageUrl ;
      const fd = new FormData(); 
      fd.append('product_image',compressedFile, nombreFotoProducto); 
      this.productService.uploadImageProduct(fd).subscribe((data)=>{
        if(environment.log.DEBUG){
          console.log(data);
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  /* PARA MODIFICAR PRODUCTOS */
  public modificarSile(product_id: number, nombre: string, descripcion: string, categoria: string, user_id: number, template: TemplateRef < any >){
    if (nombre === null || descripcion === null || categoria === null || nombre === "" || descripcion === "" || categoria === "" ) {
      this.toastr.error("Por favor, completa todos los campos", "Algo fue mal")
      this.mostrarProductos(this.idUsuario)
      return
    }
    if(environment.log.INFO){
      console.log('Hola desde modificarSile')
    }
    let date = new Date();
  /*   let productImageUrl; */
    let oldImage = this.productoActual.product_image;
    if(environment.log.DEBUG){
      console.log(oldImage);
    }
    if(this.selectedFile === null) {
      this.productImageUrl = this.productoActual.product_image;
    } else {
      if(environment.log.DEBUG){
        console.log(oldImage);
      }
      oldImage = oldImage.replace(this.productService.urlImg, "");
      if(environment.log.DEBUG){
        console.log(oldImage);
      }
      /* productImageUrl = this.productService.urlImg + this.token() + "-" + this.idUsuario + ".jpg"; */
    }
    if(this.selectedFile === null) {
      this.productService.putProduct(new Product(product_id, nombre, descripcion, categoria, user_id, this.productImageUrl, date)).subscribe((data)=>{
        if(environment.log.DEBUG){
          console.log(data);
        }
        this.mostrarProductos(this.idUsuario)
        this.openModal(template);      
      }, (error) => {
        if(environment.log.ERROR){
          console.log(error);
        }
        if (error.status === 401) {
          this.loginService.forcedLogout();
        }
      })
    } else {
      /* const nombreFotoProducto = productImageUrl
      const fd = new FormData()
      fd.append('product_image',this.selectedFile, nombreFotoProducto); */
      this.productService.deleteImage(oldImage).subscribe((data)=>{
        if(environment.log.DEBUG){
          console.log(data);
        }
      })
/*       this.productService.uploadImageProduct(fd).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log(data);
        } */
        this.productService.putProduct(new Product(product_id, nombre, descripcion, categoria, user_id, this.productImageUrl, date)).subscribe((data)=>{
          if(environment.log.DEBUG){
            console.log(data);
          }
          this.selectedFile = null;
          this.mostrarProductos(this.idUsuario)
          this.openModal(template);      
        }, (error) => {
          if(environment.log.ERROR){
            console.log(error);
          }
          if (error.status === 401) {
            this.loginService.forcedLogout();
          }
        })
/*       }) */
    }
  }

  public cancelarCambio(): void {
    this.selectedFile = null;
    this.mostrarProductos(this.idUsuario)      
  }

  /* PARA BORRAR PRODUCTOS */
  public borrarSile(idProducto: number,fotoProducto: string){
    if(environment.log.INFO){
      console.log('Hola desde borrarSile')
    }
    if(environment.log.DEBUG){
      console.log(fotoProducto)
    }
    fotoProducto = fotoProducto.replace(this.productService.urlImg, "");
    this.productService.deleteImage(fotoProducto).subscribe((data)=>{
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
    this.productService.deleteProduct(idProducto).subscribe((data)=>{
      if(environment.log.DEBUG){
        console.log(data);
      }
      this.mostrarProductos(this.idUsuario)
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  //FORMULARIOS
  public onSubmit(form){
    if(environment.log.DEBUG){
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