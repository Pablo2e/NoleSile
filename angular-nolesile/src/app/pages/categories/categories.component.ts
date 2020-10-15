// COMPONENTE
import { Component, OnInit } from '@angular/core';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';
import { GlobalsService } from 'src/app/shared/globals.service';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})


export class CategoriesComponent implements OnInit {

  public categoria: any;

  constructor(
    public productService:ProductService, 
    public loginService: LoginService,
    public globalsService: GlobalsService) {}

  public pasarCategoria(categoria: string){
    this.productService.actualizarCategoriaSeleccionada(categoria);
    this.productService.mostrarProductosPorCategoria()
  }

  /* public mostrarProductosPorCategoria(){
    this.productService.getProductsBySelectedCategory().subscribe((data)=>{
      this.productService.products = data
      if(this.globalsService.DEBUG){
        console.log()
      };
    }, (error) => {
      if(this.globalsService.ERROR){
        console.log(error);
      }
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  } */

  ngOnInit(): void {
    if(this.globalsService.INFO){
      console.log('ngOnInit.categories.ts');
    }
  }

}

