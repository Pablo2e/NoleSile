// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as bcrypt from 'bcryptjs';
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// MODELO
import { Usuario } from './../../models/usuario';
import { Password } from './../../models/password';
// SERVICIOS
import { UsuarioService } from 'src/app/shared/usuario.service';
import { LoginService } from 'src/app/shared/login.service';
import { GlobalsService } from 'src/app/shared/globals.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  
  public closeResult = '';
  public modalRef: BsModalRef;
  public usuarioActual= new Usuario(null,null,null,null,null,null,null,null,null)
  public usuario= new Usuario(null,null,null,null,null,null,null,null,null)
  public nuevoPassword = new Password(null, null);
  public equals= false
  public selectedFile: File; //para cargar la foto
  private photoSize=2000000  

  constructor(
    public usuarioService:UsuarioService, 
    public loginService: LoginService, 
    public modalService: BsModalService,
    public globalsService: GlobalsService,
    private router: Router, 
    private toastr: ToastrService) { 
    this.usuarioActual=this.loginService.usuarioActual
    this.selectedFile = null;
  }

  // METODOS
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

  public validarUsuario(user_id: number, name: string, password: string, email: string, comunidad: string, provincia: string, localidad: string, cp: number) {
    if (password === null || password === "") {
      this.toastr.error("Sin la contraseña no podras modificar tus datos", "Escribe tu contraseña")
    } else {
      const resultPassword = this.confirmarPassword(password)
      if (resultPassword === true) {
        this.modificarUsuario(user_id, name, password, email, comunidad, provincia, localidad, cp)
      } else {
        this.toastr.error("Vuelve a escribir tu contraseña", "Algo fue mal")
      }
    }
  }  
  
  public modificarUsuario(idUsuario:number, name:string, password:string, email:string, comunidad:string, provincia:string, localidad:string, cp:number){
    if (idUsuario === null || name === null || password === null || email === null || comunidad === null || provincia === null || localidad === null || cp === null ||
      name === "" || password === "" || email === "" || comunidad === "" || provincia === "" || localidad === "" || cp === 0) {
      this.toastr.error("Por favor, completa todos los campos", "Algo fue mal")
      return
    }
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log('Usuario Modificado')
    }
    let userImageUrl;
    let oldImage;
    if(this.selectedFile === null) {
      userImageUrl = this.usuarioActual.user_image;
    } else {
      oldImage = this.usuarioActual.user_image;
      oldImage = oldImage.replace(this.usuarioService.urlImg, "");
      if(this.globalsService.DEBUG){
        console.log()
      } else {
        console.log(oldImage);
      }
      userImageUrl = this.usuarioService.urlImg + this.token() + "-" + idUsuario + ".jpg";
    }
    let userUpdated = new Usuario(idUsuario, name, password, email, comunidad, provincia, localidad, cp, userImageUrl);  
    if(this.selectedFile === null) {
      this.usuarioService.putUsuario(userUpdated).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log()
        } else {
          console.log(data);
        }
        this.usuarioService.getUsuario(idUsuario).subscribe(data => {
          if(this.globalsService.DEBUG){
            console.log()
          } else {
            console.log(data);
          }
          this.loginService.usuarioActual = data[0];
          this.usuarioActual = data[0];
          if(this.globalsService.DEBUG){
            console.log()
          } else {
            console.log(this.usuarioActual);
          }
          this.toastr.success("Tus datos se han actualizado", "Usuario modificado con éxito")
          this.router.navigate(["/usuario"]);
        })
      }, (error) => {
        console.log(error);
        if (error.status === 401) {
          this.loginService.forcedLogout();
        }
      })
    } else {
      const fd = new FormData()
      const nombreFoto = userImageUrl
      fd.append('user_image',this.selectedFile, nombreFoto);
      this.usuarioService.deleteImage(oldImage).subscribe((data)=>{
        console.log(data)
      })
      this.usuarioService.uploadImage(fd).subscribe((data)=>{
        if(this.globalsService.DEBUG){
          console.log()
        } else {
          console.log(data);
        }
        this.usuarioService.putUsuario(userUpdated).subscribe((data)=>{
          if(this.globalsService.DEBUG){
            console.log()
          } else {
            console.log(data);
          }
          this.usuarioService.getUsuario(idUsuario).subscribe(data => {
            if(this.globalsService.DEBUG){
              console.log()
            } else {
              console.log(data);
            }
            this.loginService.usuarioActual = data[0];
            this.usuarioActual = data[0];
            if(this.globalsService.DEBUG){
              console.log()
            } else {
              console.log(this.usuarioActual);
            }
            this.toastr.success("Tus datos se han actualizado", "Usuario modificado con éxito")
            this.router.navigate(["/usuario"]);
            this.selectedFile = null;
          })
        }, (error) => {
          console.log(error);
          if (error.status === 401) {
            this.loginService.forcedLogout();
          }
        })
      })
    }
  }

  public confirmarPassword(password:string){
    const resultPassword = bcrypt.compareSync(password, this.loginService.usuarioActual.password)
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log(resultPassword, password, this.loginService.usuarioActual.password )
    }
    return resultPassword;
  }

  public cambiarPassword(passwordActual:string, passwordNuevo: string, passwordNuevo2: string){
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log(passwordActual, passwordNuevo, passwordNuevo2)
    }
    const resultPassword = this.confirmarPassword(passwordActual);
      if (resultPassword === true && (passwordNuevo === passwordNuevo2) && passwordNuevo.length >= 6) {
        const user_id = this.usuarioActual.user_id
        const name =  this.usuarioActual.name;
        const email = this.usuarioActual.email;
        const comunidad = this.usuarioActual.comunidad;
        const provincia = this.usuarioActual.provincia;
        const localidad = this.usuarioActual.localidad;
        const cp = this.usuarioActual.cp;

        this.modificarUsuario(user_id, name, passwordNuevo, email, comunidad, provincia, localidad, cp)
        this.toastr.success("Tus datos se han actualizado", "Contraseña modificada con éxito")
        this.modalRef.hide();
      } else {
        this.toastr.error("Vuelve a escribir tus contraseñas", "Algo fue mal")
      }
  }

  public validarBorrarUsuario(user_id: number, name: string, password: string, email: string, comunidad: string, provincia: string, localidad: string, cp: number, template: TemplateRef < any > ) {
    if (password === null || password === "") {
      this.toastr.error("Sin la contraseña no podras modificar tus datos", "Escribe tu contraseña")
    } else {
      const resultPassword = this.confirmarPassword(password)
      if (resultPassword === true) {
        this.openModal(template);
      } else {
        this.toastr.error("Vuelve a escribir tu contraseña", "Algo fue mal")
      }
    }
  }

  public borrarUsuario(id:number){
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log('Usuario Borrado')
    }
    let fotoUsuario = this.usuarioActual.user_image
    fotoUsuario = fotoUsuario.replace(this.usuarioService.urlImg, "");
    this.usuarioService.deleteImage(fotoUsuario).subscribe((data)=>{
      if(this.globalsService.DEBUG){
        console.log()
      } else {
        console.log(data);
      }
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
        this.loginService.usuarioActual = null;
      }
    })
    this.usuarioService.deleteUsuario(id).subscribe((data)=>{
      if(this.globalsService.DEBUG){
        console.log()
      } else {
        console.log(data);
      }
      this.loginService.logout();
      this.usuarioActual = new Usuario(null,null,null,null,null,null,null,null,null);
      this.loginService.usuarioActual = this.usuarioActual;
      this.selectedFile = null;
      this.modalRef.hide();
      this.toastr.success("Esperamos que vuelvas pronto a NoleSile", "Usuario eliminado con éxito")
      this.router.navigate(["/"]);
    })
  }

  //Para generar nombres de ficheros aleatorios
  public random() {
    return Math.random().toString(36).substr(2); // Eliminar `0.`
  };

  public token() {
    return this.random() + this.random(); // Para hacer el token más largo
  };
  
  // FORMULARIO
  onSubmit(form){
    if(this.globalsService.DEBUG){
      console.log()
    } else {
      console.log(form.value)
    }
  }

  //MODALES NGX
  public openModal(template: TemplateRef < any > ) {
    this.modalRef = this.modalService.show(template)
  }

  ngOnInit(): void {
  }

}
