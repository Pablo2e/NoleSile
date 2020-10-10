// COMPONENTE
import { Component, OnInit } from '@angular/core';
// SERVICIOS
import { ProductService } from 'src/app/shared/product.service';
import { LoginService } from 'src/app/shared/login.service';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})


export class CategoriesComponent implements OnInit {

  public categoria: any;

  constructor(
    public productService:ProductService, 
    public loginService: LoginService) {}

  public pasarCategoria(categoria: string){
    this.productService.actualizarCategoriaSeleccionada(categoria);
    this.mostrarProductosPorCategoria()
  }

  public mostrarProductosPorCategoria(){
    this.productService.getProductsBySelectedCategory().subscribe((data)=>{
      this.productService.products = data
      console.log(data)
    }, (error) => {
      console.log(error);
      if (error.status === 401) {
        this.loginService.forcedLogout();
      }
    })
  }

  ngOnInit(): void {
  }

}

