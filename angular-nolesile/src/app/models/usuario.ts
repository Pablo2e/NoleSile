export class Usuario {
    public user_id:number
    public name:string;
    public password:string;
    public email:string;
    public comunidad: string;
    public provincia:string;
    public localidad:string;
    public cp:number;
    public user_image:string

    constructor(user_id:number,name:string, password:string, email:string, comunidad:string, provincia:string, localidad:string, cp:number, user_image:string){
        
        this.user_id = user_id;
        this.name = name;
        this.password = password;
        this.email = email;
        this.comunidad = comunidad;
        this.provincia = provincia;
        this.localidad = localidad;
        this.cp = cp;
        this.user_image = user_image
    }
}