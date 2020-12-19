// COMPONENTE
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

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
  public isMenuCollapsed = true;

  constructor(
    public productService:ProductService, 
    public loginService: LoginService,
    public globalsService: GlobalsService) {}

  public pasarCategoria(categoria: string){
    this.productService.actualizarCategoriaSeleccionada(categoria);
    this.productService.mostrarProductosPorCategoria()
  }

  ngOnInit(): void {
    if(environment.log.INFO){
      console.log('ngOnInit.categories.ts');
    }
  }

}

