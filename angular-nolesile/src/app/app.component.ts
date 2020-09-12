import { Component } from '@angular/core';
import { ServService } from './serv.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  constructor(public servicio:ServService) { 
    
  }

  title = 'angular-silenole';
}
 
