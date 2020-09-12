export class Product {
    public product_id: number;
    public nombre: string;
    public descripcion: string;
    public categoria: string;
    public user_id: number;
    public product_image: string;
    public date: Date;
    
    constructor(product_id: number, nombre: string, descripcion: string, categoria: string, user_id: number, product_image: string, date: Date)
    {
        this.product_id = product_id;
        this.nombre= nombre;
        this.descripcion = descripcion;
        this.categoria= categoria;
        this.user_id= user_id;
        this.product_image= product_image;
        this.date= date;
    }
}