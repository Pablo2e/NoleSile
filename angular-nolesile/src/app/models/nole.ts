export class Nole {
    public user_id:number
    public product_id:number  
    public chat_id:string   
    
constructor(user_id:number, product_id:number){

    this.user_id=user_id;
    this.product_id=product_id;
    this.chat_id= "u" + user_id + "p" + product_id;
    }
}