import { Component } from '@angular/core';
import { environment } from '../environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  apiServerUrl = environment.apiServerUrl;
  imageServerUrl = environment.imageServerUrl

  constructor() { 
    
  }

  title = 'angular-silenole';
}
 
