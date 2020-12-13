// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { environment } from '../../../environments/environment';
import imageCompression from 'browser-image-compression';
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
  public productImageUrl: string;

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
    if(environment.log.DEBUG){
      console.log(this.idProducto)
    }
  }
  
  public anyadirSile(nombre: string, descripcion: string, categoria: string, user_id: number, product_image: string, template: TemplateRef < any > ){
    if(environment.log.DEBUG){
      console.log(this.productService.product)
    }
    if (nombre === null || descripcion === null || categoria === null || product_image === null ||
      nombre === "" || descripcion === "" || categoria === "" || product_image === "") {
      this.toastr.error("Por favor, completa todos los campos", "Algo fue mal")
    } else {
      let date = new Date();
      /* let productImageUrl;
      let date = new Date();
      productImageUrl = this.productService.urlImg + this.token() + "-" + user_id + ".jpg";
      const nombreFotoProducto = productImageUrl
      const fd = new FormData()
      fd.append('product_image',this.selectedFile, nombreFotoProducto);
      this.productService.uploadImageProduct(fd).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log(data);
        }
      }) */
      this.productService.postProduct(new Product(null, nombre, descripcion, categoria, user_id, this.productImageUrl, date)).subscribe((data)=>{
        if(environment.log.DEBUG){
          console.log(data);
        }
        this.openModal(template);
      }, (error) => {
        if(environment.log.ERROR){
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

  // FORMULARIO
  public onSubmit(form){
    if(environment.log.DEBUG){
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
