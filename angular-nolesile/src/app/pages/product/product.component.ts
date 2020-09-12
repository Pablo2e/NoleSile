// COMPONENTE
import { Component, OnInit, TemplateRef } from '@angular/core';
// MODAL
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';



@Component({
  selector: 'app-product', 
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})


export class ProductComponent implements OnInit {

  public modalRef:BsModalRef

  constructor(private modalService: BsModalService) { }

  public openModal(template: TemplateRef<any>){
    this.modalRef = this.modalService.show(template)
  }

  ngOnInit(): void {}
  
}
