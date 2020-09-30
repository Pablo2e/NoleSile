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
import { CookiesComponent } from './pages/cookies/cookies.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';


const routes: Routes = [
  {path:"",component:LoginComponent},
  {path:"inicio",component:HomeComponent},
  {path:"usuario",component:ProfileComponent},
  {path:"siles",component:MyProductsComponent},
  {path:"subir",component:UploadComponent},
  {path:"buscar",component:SearchComponent},
  {path:"producto",component:ProductComponent},
  {path:"propietario",component:OwnerComponent},
  {path:"categorias",component:CategoriesComponent},
  {path:"mensajes",component:MessagesComponent},
  {path:"terminos",component:TermsComponent},
  {path:"privacidad",component:PrivacyComponent},
  {path:"cookies",component:CookiesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
