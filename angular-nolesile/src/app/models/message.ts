export class Message{
    public message_id:number
    public chat_id:string 
    public sender_id:number
    public product_id:number
    public text:string
    public date:Date    
    
    constructor(message_id:number, chat_id:string, sender_id:number, product_id:number, text:string, date:Date){
        this.message_id=message_id;
        this.chat_id=chat_id;
        this.sender_id=sender_id;
        this.product_id=product_id;
        this.text=text;
        this.date=date;  
    }
    
}