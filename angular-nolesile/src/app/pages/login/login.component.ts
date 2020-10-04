// COMPONENTE
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ToastrService } from 'ngx-toastr';


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
  public isModalShown = true;

  constructor(
    public loginService: LoginService, 
    public usuarioService: UsuarioService,
    public productService: ProductService, 
    public messageService: MessageService,
    public modalService: BsModalService,
    private fb: FormBuilder, 
    private toastr: ToastrService,
    private router: Router) 
    {console.log("Funcionando servicio usuario")
    // check for existing session
    if (this.loginService.getToken() != null) {
      // ya existe session
      // cargar datos session usuario
      const user_id = this.loginService.getUserId();
      this.usuarioService.getUsuario(user_id).subscribe(data => {
        console.log(data);
        this.loginService.usuarioActual = data[0];
        this.productService.usuarioActual = data[0];
        this.router.navigate(["/inicio"]);
      })
    }
  }

  //METODOS
  public checkOpenSession(template: TemplateRef < any > ) {
    // check for existing session
    if (this.loginService.getToken() != null) {
      // ya existe session
      // cargar datos session usuario
      const user_id = this.loginService.getUserId();
      this.usuarioService.getUsuario(user_id).subscribe(data => {
        console.log(data);
        this.loginService.usuarioActual = data[0];
        this.productService.usuarioActual = data[0];
        this.router.navigate(["/inicio"]);
      })
    } else {
      this.openModal(template);
    }
  }

  public newUsuario(name: string, password: string, email: string, comunidad: string, provincia: string, localidad: string, cp: number) {
    const pass2 = ( < HTMLInputElement > document.getElementById("pass2")).value
    console.log(name, password, pass2, email, comunidad, provincia, localidad, cp)
    if (name === null || password === null || email === null || comunidad === null ||
      provincia === null || cp === null || name === "" || password === "" || email === "" || 
      comunidad === "" || provincia === "" || cp === 0 || password.length < 3) {
      this.toastr.error("Por favor, revisa todos los campos", "Algo fue mal")
    } else {
      if (password !== pass2) {
        this.toastr.error("Las contraseñas no coinciden", "Algo fue mal")
      } else {
        this.loginService.register(new Usuario(null, name, password, email, comunidad, provincia, localidad, cp, this.loginService.defaultUserPicture)).subscribe((data:any) => {
          console.log(data)
          if (data === null) {
            this.toastr.error("No se registró correctamente", "Algo fue mal")
          } else {
            this.usuario.password = ""
            this.usuario.email = ""
            this.toastr.success("Registrado con éxito", "Bienvenido a NoleSile")
            this.modalRef.hide();
            const newUserId = data.insertId;
            console.log(newUserId);
            this.messageService.createUserNotification(new Notificacion(newUserId, false)).subscribe((data) => {
              console.log(data)
            })
          }
        }, (error) => {
          console.log(error);
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
    console.log(user)
    this.loginService.login(user).subscribe(data => {
      console.log(data);
      if (data !== null) {
        this.loginService.usuarioActual = data[0];
        this.productService.usuarioActual = data[0];
        console.log(this.loginService.usuarioActual);
        this.modalRef.hide();
        this.router.navigate(["/inicio"])
        this.messageService.getNotificationsByUser(this.loginService.usuarioActual.user_id).subscribe((data) => {
          console.log(data)
          if (data !== null) {
            this.loginService.avisoMensaje = data[0].mensajes_nuevos;
            this.router.navigate(["/inicio"])
          }
        }, (error) => {
          console.log(error);
          if (error.status === 401) {
            /* this.loginService.forcedLogout(); */
          }
        })
      } else {
        console.log("Usuario Inexistente")
        this.toastr.error("El ususario o la contraseña no son válidos", "Algo fue mal");
        this.router.navigate(["/"])
      }
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      } else if (error.status === 403){
        console.log("Usuario Inexistente")
        this.toastr.error("El ususario o la contraseña no son válidos", "Algo fue mal");
        this.router.navigate(["/"])
      }
    });
  }

  //FORMULARIOS
  onSubmit(form) {
    console.log(form.value)
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

  public pasarTerminosATrue(e){
    if(e.target.checked==true){
      this.chekboxTerminoActivo = true
      this.totalCheckboxMarcados ++
      console.log(this.chekboxTerminoActivo, this.totalCheckboxMarcados)
    } else {
      this.chekboxTerminoActivo = false
      this.totalCheckboxMarcados --
      console.log(this.chekboxTerminoActivo, this.totalCheckboxMarcados)
    }
  }

  public pasarPoliticaATrue(e){
    if(e.target.checked==true){
      this.chekboxPoliticaActivo = true
      this.totalCheckboxMarcados ++
      console.log(this.chekboxPoliticaActivo, this.totalCheckboxMarcados)
    } else {
      this.chekboxPoliticaActivo = false
      this.totalCheckboxMarcados --
      console.log(this.chekboxPoliticaActivo, this.totalCheckboxMarcados)
    }
  }
  
  ngOnInit() {
    this.initForm();
  }
  
}

/* export class DemoAutoShownModalComponent {
    constructor(){
    @ViewChild('autoShownModal', { static: false }) autoShownModal: ModalDirective;
    isModalShown = false;
   
    showModal(): void {
      this.isModalShown = true;
    }
   
    hideModal(): void {
      this.autoShownModal.hide();
    }
   
    onHidden(): void {
      this.isModalShown = false;
    }
  }
}
 */