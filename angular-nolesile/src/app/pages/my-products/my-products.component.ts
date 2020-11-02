// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Ng2ImgMaxService } from 'ng2-img-max';
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

  public getOrientation(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {

        var view = new DataView(<ArrayBufferLike>e.target.result);
        if (view.getUint16(0, false) != 0xFFD8)
        {
            return callback(-2);
        }
        var length = view.byteLength, offset = 2;
        while (offset < length) 
        {
            if (view.getUint16(offset+2, false) <= 8) return callback(-1);
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) 
            {
                if (view.getUint32(offset += 2, false) != 0x45786966) 
                {
                    return callback(-1);
                }

                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++)
                {
                    if (view.getUint16(offset + (i * 12), little) == 0x0112)
                    {
                        return callback(view.getUint16(offset + (i * 12) + 8, little));
                    }
                }
            }
            else if ((marker & 0xFF00) != 0xFF00)
            {
                break;
            }
            else
            { 
                offset += view.getUint16(offset, false);
            }
        }
        return callback(-1);
    };
    reader.readAsArrayBuffer(file);
  }

  /* public cargarFoto(){
    this.productImageUrl = this.productService.urlImg + this.token() + "-" + this.loginService.usuarioActual + ".jpg";
      const nombreFotoProducto = this.productoActual.product_image;
      const fd = new FormData()
      fd.append('product_image',this.selectedFile, nombreFotoProducto);
      this.productService.uploadImageProduct(fd).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log(data);
        }
      })
    } */
  
  //para cargar la foto
  public onFileSelected(event){
    this.selectedFile = <File>event.target.files[0]
    this.getOrientation(this.selectedFile, function(orientation) {
      alert('orientation: ' + orientation);
    });
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
    /* this.cargarFoto() */
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