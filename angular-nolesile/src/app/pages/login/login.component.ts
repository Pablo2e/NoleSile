// COMPONENTE
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
// MODAL
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
// MODELOS
import { Usuario } from 'src/app/models/usuario';
// SERVICIOS
import { UsuarioService } from 'src/app/shared/usuario.service';
import { LoginService } from 'src/app/shared/login.service';
import { ProductService } from 'src/app/shared/product.service';
import { MessageService } from 'src/app/shared/message.service';
import { Notificacion } from 'src/app/models/notificaciones';
import { GlobalsService } from 'src/app/shared/globals.service';
import { ToastrService } from 'ngx-toastr';
//NGX Logger
/* import { NGXLogger } from 'ngx-logger'; */


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  public modalRef: BsModalRef;
  public usuario = new Usuario(null, null, null, null, null, null, null, null, null)
  public email: string;
  public password: string;
  public password2: string;
  public form: FormGroup;
  public closeResult = '';
  public title = 'toaster-not'
  public notifyService: any;
  public chekboxTerminoActivo: boolean = false
  public chekboxPoliticaActivo: boolean = false
  public totalCheckboxMarcados: number = 0
  public chekboxsActivo: boolean
  //Modal cookies
  @ViewChild('autoShownModal', { static: false }) autoShownModal: ModalDirective;
  public isModalShown = false;

  constructor(
    public loginService: LoginService, 
    public usuarioService: UsuarioService,
    public productService: ProductService, 
    public messageService: MessageService,
    public globalsService: GlobalsService,
    public modalService: BsModalService,
    private fb: FormBuilder, 
    private toastr: ToastrService,
    private router: Router,
    /* private logger: NGXLogger */) 
    {
    // check for existing session
    if (this.loginService.loadExistingSession()) {
      this.router.navigate(["/inicio"]);
    }
    //checkea si ya hay cookies o no
    if(this.getCookie('closedApp')!=null){
      this.isModalShown = false;
    } else {
      this.isModalShown = true;
    }
  }

  //METODOS
  public checkOpenSession(template: TemplateRef < any > ) {
    // check for existing session
    if (this.loginService.getToken() != null) {
      // ya existe session
      // cargar datos session usuario
      const user_id = this.loginService.getUserId();
      this.loginService.getUsuario(user_id).subscribe(data => {
        if(environment.log.DEBUG){
          console.log(data);
        }
        this.loginService.usuarioActual = data[0];
        this.router.navigate(["/inicio"]);
      })
    } else {
      this.openModal(template);
    }
  }

  public newUsuario(name: string, password: string, email: string, comunidad: string, provincia: string, localidad: string, cp: number) {
    const pass2 = ( < HTMLInputElement > document.getElementById("pass2")).value
    if(environment.log.DEBUG){
      console.log(name, password, pass2, email, comunidad, provincia, localidad, cp)
    }
    if (name === null || password === null || email === null || comunidad === null ||
      provincia === null || cp === null || name === "" || password === "" || email === "" || 
      comunidad === "" || provincia === "" || cp === 0 || password.length < 6) {
      this.toastr.error("Por favor, revisa todos los campos", "Algo fue mal")
    } else {
      if (password !== pass2) {
        this.toastr.error("Las contraseñas no coinciden", "Algo fue mal")
      } else {
        this.loginService.register(new Usuario(null, name, password, email, comunidad, provincia, localidad, cp, this.loginService.defaultUserPicture)).subscribe((data:any) => {
          if(environment.log.DEBUG){
            console.log(data);
          }
          if (data === null) {
            this.toastr.error("No se registró correctamente", "Algo fue mal")
          } else {
            this.usuario.password = ""
            this.usuario.email = ""
            this.toastr.success("Registrado con éxito", "Bienvenido a NoleSile")
            this.modalRef.hide();
            const newUserId = data.insertId;
            if(environment.log.DEBUG){
              console.log(newUserId);
            }
            this.messageService.createUserNotification(new Notificacion(newUserId, false)).subscribe((data) => {
              if(environment.log.DEBUG){
                console.log(data);
              }
            })
          }
        }, (error) => {
          if(environment.log.ERROR){
            console.log(error);
          }
          if (error.status === 409) {
            this.toastr.error("No se registró correctamente", error.error.message)
          }
        })
      }
    }
  }
  
  public login(email1, password1) {
    if (email1 === null || password1 === null ||
      email1 === "" || password1 === "") {
      this.toastr.error("Por favor, revisa todos los campos", "Algo fue mal");
    }
    const user = {
      email: email1,
      password: password1
    };
    if(environment.log.DEBUG){
      console.log(user);
    }
    this.loginService.login(user).subscribe(data => {
      if(environment.log.DEBUG){
        console.log(data);
      }
      if (data !== null) {
        this.loginService.usuarioActual = data[0];
        if(environment.log.DEBUG){
          console.log(this.loginService.usuarioActual);
        }
        /* this.modalRef.hide(); */
        this.router.navigate(["/inicio"])
        this.messageService.getNotificationsByUser(this.loginService.usuarioActual.user_id).subscribe((data) => {
          if(environment.log.DEBUG){
            console.log(data);
          }
          if (data !== null && data[0] !== undefined) {
            this.loginService.avisoMensaje = data[0].mensajes_nuevos;
            this.router.navigate(["/inicio"])
          }
        }, (error) => {
          if(environment.log.ERROR){
            console.log(error);
          }
          if (error.status === 401) {
            /* this.loginService.forcedLogout(); */
          }
        })
      } else {
        if(environment.log.INFO){
          console.log("Usuario Inexistente")
        }
        this.toastr.error("El ususario o la contraseña no son válidos", "Algo fue mal");
        this.router.navigate(["/"])
      }
    }, (error) => {
      if(environment.log.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      } else if (error.status === 403){
        if(environment.log.INFO){
          console.log("Usuario Inexistente")
        }
        this.toastr.error("El ususario o la contraseña no son válidos", "Algo fue mal");
        this.router.navigate(["/"])
      }
    });
  }

  public resetPassword(email){
    console.log(email)
    if (email === null || email === "") {
      this.toastr.error("Por favor, revisa todos los campos", "Algo fue mal");
    }
    this.loginService.resetPassword(email).subscribe(data => {
      if(data===null){
        this.toastr.error("No existe este email", "Algo fue mal");
      } else {
        this.toastr.success("Correo enviado con éxito")
      }
    })
  }

  //FORMULARIOS
  onSubmit(form) {
    if(environment.log.DEBUG){
      console.log(form.value);
    }
  }

  initForm() {
    this.form = this.fb.group({
      'password': ['', Validators.required],
      'confirmarPassword': ['', Validators.required]
    });
  }

  //MODAL
  public openModal(template: TemplateRef < any > ) {
    this.modalRef = this.modalService.show(template)
  }

  //Modal Cookies
  showModal(): void {
    this.isModalShown = true;
  } 
  hideModal(): void {
    this.autoShownModal.hide();
  } 
  onHidden(): void {
    this.isModalShown = false;
  }

  //Terminos de uso y politica de privacidad
  public pasarTerminosATrue(e){
    if(e.target.checked==true){
      this.chekboxTerminoActivo = true
      this.totalCheckboxMarcados ++
      if(environment.log.DEBUG){
        console.log(this.chekboxTerminoActivo, this.totalCheckboxMarcados);
      }
    } else {
      this.chekboxTerminoActivo = false
      this.totalCheckboxMarcados --
      if(environment.log.DEBUG){
        console.log(this.chekboxTerminoActivo, this.totalCheckboxMarcados);
      }
    }
  }

  public pasarPoliticaATrue(e){
    if(e.target.checked==true){
      this.chekboxPoliticaActivo = true
      this.totalCheckboxMarcados ++
      if(environment.log.DEBUG){
        console.log(this.chekboxTerminoActivo, this.totalCheckboxMarcados);
      }
    } else {
      this.chekboxPoliticaActivo = false
      this.totalCheckboxMarcados --
      if(environment.log.DEBUG){
        console.log(this.chekboxTerminoActivo, this.totalCheckboxMarcados);
      }
    }
  }

  //Crear y leer cookies
  public setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
     let date = new Date();
     date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
     expires = "; expires=" + date.toUTCString();
    }
   document.cookie = name + "=" + (value || "") + expires + "; path=/";
   };

  public getCookie(name: string) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,
        c.length);
    }
   return null;
   };
  
  ngOnInit() {
    this.initForm();
  }
  
}

