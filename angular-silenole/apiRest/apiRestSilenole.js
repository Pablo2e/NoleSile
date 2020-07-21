var express = require('express');
var bodyParser = require('body-parser');
var app = express();
let cors = require('cors')

let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    user: "root",
    password: null,
    database: 'silenole'
});
connection.connect(function(error){
    if(error)
    console.log(error)
    else
    console.log('Conexión correcta')
});
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Get
// GET /USERS/:USERID = Obtiene toda la información asociada al usuario 
app.get("/usuario/:id", function (request, response) {
    var id = request.params.id;
    let sql = "SELECT * FROM user WHERE user_id ="+id;
    connection.query(sql, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Datos del Usuario')
            console.log(result)
        } 
    response.send(result);
    })
});
// GET /SILES/:USERID = Obtiene el todos los siles creados por el usuario
app.get("/siles/:id", function (request, response) {
    var id = request.params.id;
    let sql = "SELECT * FROM product WHERE user_id ="+id;
    connection.query(sql, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Objetos Propios')
            console.log(result)
        } 
    response.send(result);
    })
});
// ?????????
// GET /NOLES/:USERID = Obtiene todos los productos del resto de los usuarios
app.get("/noles/:id", function (request, response) {
    var id = request.params.id;
    let sql = "SELECT * FROM product WHERE user_id !="+id;
    connection.query(sql, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Objetos del Usuario')
            console.log(result)
        } 
    response.send(result);
    })
});
// GET /buscar/ Obtiene los ultimos 4 productos agregados
app.get("/buscar/", function (request, response) {
    var id = request.params.id;
    let sql = "SELECT * FROM product ORDER BY product_id DESC LIMIT 4";
    connection.query(sql, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Objetos del Usuario')
            console.log(result)
        } 
    response.send(result);
    })
});
// GET /buscar/:categoria = Obtiene todos los noles solicitados segun categoria
app.get("/buscar/:id", function (request, response) {
    var id = request.params.id;
    let sql = "SELECT * FROM product WHERE categoria ="+id;
    connection.query(sql, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Objetos del Usuario')
            console.log(result)
        } 
    response.send(result);
    })
});

// TERMINAR CUANDO ESTÉ LA BASE DE DATOS
// GET /MESSAGES/: USERID/:OWNERID= Obtiene todos los mensajes intercambiados entre el usuario y el propietario del nole 
/* app.get("/messages/:user_id/:user_id2/:product_id", function (request, response) {
    var id = request.params.user_id;
    var id2 = request.params.user_id2;
    var id3 = request.params.product_id;
    let sql = "SELECT * FROM messages WHERE user_id ="+id+ "OR user_id2 ="+id2+"ORDER BY message_id";
    connection.query(sql, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Objetos del Usuario')
            console.log(result)
        } 
    response.send(result);
    })
}); */

//Post
// POST /USERS/REGISTER = Introduce a un usuario en la base de datos. parámetros : Usuario, Email & Password. 
app.post("/user/register", function (request, response) {
    let user_id = request.body.user_id
    let name = request.body.name
    let email = request.body.email
    let password = request.body.password
    let comunidad = request.body.comunidad
    let provincia = request.body.provincia
    let localidad = request.body.localidad
    let cp = request.body.cp
    let user_image = request.body.user_image
    let params = [user_id, name, email, password, comunidad, provincia, localidad, cp, user_image]
    let sql = "INSERT INTO user (user_id, name, email, password, comunidad, provincia, localidad, cp, user_image) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(sql, params, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Nuevo usuario Ingresado')
            console.log(result)
        } 
    response.send(result);
    })
});
// ??? NECESITA FUNCION DE COMPARACIÓN CON EL EMAIL COMO CLAVE UNICA
// POST /USERS/LOGIN = Autoriza la entrada a la plataforma o no. parámetros : Usuario & Password. 
app.post("/user/login", function (request, response) {
    let name = request.body.name
    let password = request.body.password
    let params = [name, password]
    let sql = "SELECT name, password FROM user";
    connection.query(sql, params, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Usuario Correcto')
            console.log(result)
        } 
    response.send(result);
    })
});
// POST /SILES/ = Añade un nuevo sile del usuario 
app.post("/siles", function (request, response) {
    let nombre = request.body.nombre
    let descripcion = request.body.descripcion
    let categoria = request.body.categoria
    let user_id  = request.body.user_id 
    let product_image = request.body.product_image
    let params = [product_id, nombre, descripcion, categoria, user_id , product_image]
    let sql = "INSERT INTO product (nombre, descripcion, categoria, user_id , product_image) VALUES ( ?, ?, ?, ?, ?)";
    connection.query(sql, params, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Nuevo producto Ingresado')
            console.log(result)
        } 
    response.send(result);
    })
});
// POST /MESSAGES/ = Añade un nuevo mensaje.
app.post("/messages", function (request, response) {
    let user_id  = request.body.user_id 
    let chat_id = request.body.chat_id 
    let text = request.body.text
    let date = request.body.date

    let params = [user_id , chat_id ,text ,date]
    let sql = "INSERT INTO messages (user_id , chat_id, text, date ) VALUES ( ?, ?, ?, ?)";
    connection.query(sql, params, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Mensaje Ingresado')
            console.log(result)
        } 
    response.send(result);
    })
});
//Put
// PUT /USERS/:USERID = Actualiza la información asociada al usuario. 
app.put("/users/:id", function (request, response) {
    let user_id = request.body.user_id
    let name = request.body.name
    let email = request.body.email
    let password = request.body.password
    let comunidad = request.body.comunidad
    let provincia = request.body.provincia
    let localidad = request.body.localidad
    let cp = request.body.cp
    let user_image = request.body.user_image
    let params = [name, email, password, comunidad, provincia, localidad, cp, user_image]
    let sql = "UPDATE user SET name = ?, email = ?, password = ?, comunidad = ?, provincia = ?, localidad = ?, cp = ?, user_image = ? WHERE user_id ="+user_id;
    connection.query(sql, params, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Usuario Modificado')
            console.log(result)
        } 
    response.send(result);
    })
});
// PUT /SILES/ = Actualiza un sile del usuario
app.put("/siles", function (request, response) {
    let product_id = request.body.product_id
    let nombre = request.body.nombre
    let descripcion = request.body.descripcion
    let categoria = request.body.categoria
    let user_id  = request.body.user_id 
    let product_image = request.body.product_image
    let params = [nombre, descripcion, categoria, user_id , product_image]
    let sql = "UPDATE product SET nombre = ?, descripcion = ?, categoria = ?, user_id = ?, product_image = ? WHERE product_id ="+product_id;
    connection.query(sql, params, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Producto Modificado')
            console.log(result)
        } 
    response.send(result);
    })
});

//Delete
app.delete("/siles", function (request, response) {
    let sile_id = request.body.sile_id
    let params = [sile_id]
    let sql = "DELETE FROM siles WHERE sile_id = ?"
    connection.query(sql, params, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Producto Borrado')
            console.log(result)
        } 
    response.send(result);
    })
});

// PARA BORRAR UN USUARIO
app.post("/user/delete", function (request, response) {
    let email = request.body.email
    let password = request.body.password
    let params = [email, password]
    let sql = "DELETE FROM user WHERE email = ? AND password = ?"
    connection.query(sql, params, function(err, result){
        if (err){
            console.log(err)
        }else{
            console.log('Usuario eliminado')
            console.log(result)
        } 
    response.send(result);
    })
});


app.listen(4300);