import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { UploadComponent } from './pages/upload/upload.component';
import { SearchComponent } from './pages/search/search.component';
import { OwnerComponent } from './pages/owner/owner.component';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ProductComponent } from './pages/product/product.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';


const routes: Routes = [
  {path:"",component:LoginComponent},
  {path:"home",component:HomeComponent},
  {path:"usuario",component:ProfileComponent},
  {path:"siles",component:MyProductsComponent},
  {path:"subir",component:UploadComponent},
  {path:"buscar",component:SearchComponent},
  {path:"producto",component:ProductComponent},
  {path:"owner",component:OwnerComponent},
  {path:"categories",component:CategoriesComponent},
  {path:"message",component:MessagesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
