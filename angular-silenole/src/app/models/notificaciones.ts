export class Notificacion{
    
    public user_id:number
    public mensajes_nuevos:boolean 
     
    constructor(user_id:number, mensajes_nuevos:boolean){

        this.user_id=user_id;
        this.mensajes_nuevos=mensajes_nuevos;
        
    }
    
}