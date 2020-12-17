//Creamos las constantes para la conexión
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
require('dotenv').config();

//PARA EL AUTENTICACIÓN REGISTER/LOGIN
const bodyParserJSON = bodyParser.json();
const bodyParserURLEncoded = bodyParser.urlencoded({ extended: true });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = process.env.SECRET_KEY;

//PARA LA CONEXION A HTTPS
const https = require("https"),
fs = require("fs");

var options = {};
if(process.env.NODE_ENV === 'production'){
    options = {
        key : fs.readFileSync(process.env.SSL_KEY),
        cert : fs.readFileSync(process.env.SSL_CERT)
    };
}

//Para el reseteo de la contraseña
const nodemailer = require('nodemailer');
const crypto = require('crypto');

//Conexión a la base de datos
const mysql = require('mysql');
const util = require( 'util' );
const PORT = process.env.BACKEND_PORT || 3000;
const SSL_PORT = process.env.BACKEND_SSL_PORT || 3003;

const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;
const db_database = process.env.DB_NAME;

const connection = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});
/* connection.connect(function(error){
    if(error)
    console.log(error)
    else
    console.log('Conexión correcta')
});
 */
// conexión a la base de datos para async/await en verificar accessToken
function makeDb(config) {
    const connection = mysql.createPool(config);  
    return {
        query( sql, args ) {
            return util.promisify( connection.query )
            .call( connection, sql, args );
        },
        close() {
            return util.promisify( connection.end ).call( connection );
        }
    };
}
const db = makeDb( {
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});

//EXTRAS PARA LA CARGA DE FOTOS 
/* const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const _ = require('lodash'); 
app.use(morgan('dev')); */
//Limitamos el tamaño maximo de las fotos
/* app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: process.env.MAX_FILESIZE * 1024 * 1024 * 1024 //max file(s) size
    },
})); */

app.use(cors());
app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);

//Constantes para limitar cantidad de productos y mensajes
const limiteProductos = process.env.LIMITE_PRODUCTOS
const limiteMensages = process.env.LIMITE_MENSAJES

//Constantes para limitar los console.log
const DEBUG = process.env.DEBUG
const INFO = process.env.INFO
const ERROR = process.env.ERROR

app.listen(PORT);
https.createServer(options, app).listen(SSL_PORT);
console.log(PORT,SSL_PORT)

// Función de verificación de tokens
const verifyToken = async (accessToken, user_id) => {
    if(INFO){
        console.log("verificando token");
    }
    let params = [user_id];
    let sql = "SELECT accessToken FROM user WHERE user_id = ?";
    let resultCode;
    await db.query(sql, params).then( result => {
        if(INFO){
            console.log ("token BBDD" , result);
        }
        if (result[0] === undefined || result[0] === null){
            resultCode = 500;
        } else {
            if (result[0].accessToken === accessToken) {
                if(INFO){
                    console.log('Token verificado')
                }
                resultCode = 200;
            } else {
                if(INFO){
                    console.log('Token no válido')
                }
                resultCode = 401;
            }
        }
    });
    return resultCode;
}

// Función de verificación de número de productos
const verifyNumberOfProducts = async (user_id) => {
    if(INFO){
        console.log("verificando número de productos");
    }
    let params = [user_id];
    let sql = `SELECT COUNT(*) AS cuentaProductos FROM products WHERE user_id =?`;
    let resultCode;
    await db.query(sql, params).then( result => {
        if(INFO){
            console.log ("número de productos" , result);
        }
        if (result[0] === undefined || result[0] === null){
            resultCode = 500;
        } else {
            if (result[0].cuentaProductos < limiteProductos) {
                if(INFO){
                    console.log('Puedes añadir mas productos');
                }
                resultCode = 200;
            } else {
                if(INFO){
                    console.log('Has alcanzado la cantidad de productos que puedes subir');
                }
                resultCode = 409;
            }
        }
    });
    return resultCode;
}

// Función de verificación de número de mensajes
const verifyNumberOfMessages = async (sender_id) => {
    if(INFO){
        console.log("verificando número de mensajes");
    }
    let params = [sender_id];
    let sql = `SELECT COUNT(*) AS cuentaMensajes FROM messages WHERE sender_id =?`;
    let resultCode;
    await db.query(sql, params).then( result => {
        if(INFO){
            console.log ("número de productos" , result);
        }
        if (result[0] === undefined || result[0] === null){
            resultCode = 500;
        } else {
            if (result[0].cuentaMensajes < limiteMensages) {
                if(INFO){
                    console.log('Puedes añadir mas mensajes');
            }
                resultCode = 200;
            } else {
                if(INFO){
                    console.log('Has alcanzado la cantidad de mensajes que puedes enviar');
            }
                resultCode = 409;
            }
        }
    });
    return resultCode;
}

const insertToken = (accessToken, email) => {
    if(INFO){
        console.log("insertando token");
    }
    let params = [accessToken, email];
    let sql = "UPDATE user SET accessToken = ? WHERE email = ?";
    connection.query(sql, params, function(err, result){
        if (err) {
            if(DEBUG){
                console.log(err)
            }
            if(INFO){
                console.log('error al insertar token')
            }
            return false;
        } else {
            if(INFO){
                console.log('Token insertado')
            }
            if(DEBUG){
                console.log(result)
            }
            return true;
        }
    });
}

/* ---------------------------------PRODUCTOS----------------------------------- */
app.get("/products/:user_id", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id_verificar = request.headers.user;
    let user_id = request.params.user_id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id_verificar)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [user_id];
            sql = "SELECT * FROM products WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Objetos Propios');
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
                response.send(result);
            })
            break;
        default:
    }
});

// POST /SILES/ = Añade un nuevo sile del usuario 
app.post("/products", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let nombre = request.body.nombre
    let descripcion = request.body.descripcion
    let categoria = request.body.categoria
    let user_id  = request.body.user_id 
    let product_image = request.body.product_image
    let date = request.body.date
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    const productNumberResult = await verifyNumberOfProducts(user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            switch (productNumberResult) {
                case 500:
                    response.status(500).send({ message: 'Error en el servidor' });
                    break;
                case 409:
                    if(INFO){
                        console.log('Has alcanzado la cantidad de productos que puedes subir');
                    }
                    response.status(409).send({ message: 'No puedes añadir más productos.' });
                    break;
                case 200:
                    params = [nombre, descripcion, categoria, user_id, product_image, date]
                    sql = `INSERT INTO products (nombre, descripcion, categoria, user_id , product_image, date) VALUES ( ?, ?, ?, ?, ?, ?)`;
                    connection.query(sql, params, function(err, result){
                        if (err){
                            if(DEBUG){
                                console.log(err);
                            }
                        } else {
                            if(INFO){
                                console.log('Nuevo producto Ingresado');
                            }
                            if(DEBUG){
                                console.log(result);
                            }
                        } 
                        response.send(result);
                    })
                    break;
                default:
                }
            break;
        default:
    }
});

// PUT /SILES/ = Actualiza un sile del usuario
app.put("/products", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let product_id = request.body.product_id
    let nombre = request.body.nombre
    let descripcion = request.body.descripcion
    let categoria = request.body.categoria
    let user_id  = request.body.user_id 
    let product_image = request.body.product_image
    let date = request.body.date
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [nombre, descripcion, categoria, user_id , product_image, date]
            sql = "UPDATE products SET nombre = ?, descripcion = ?, categoria = ?, user_id = ?, product_image = ?, date = ? WHERE product_id =" + product_id;
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Producto Actualizado');
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// DELETE PARA BORRAR UN PRODUCTO
app.delete("/products", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id  = request.body.user_id
    let product_id = request.body.product_id
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [product_id]
            sql = "DELETE FROM products WHERE product_id = ?"
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Producto Borrado')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
        })
        break;
    default:
}
});
/* ---------------------------------FIN PRODUCTOS----------------------------------- */

/* ---------------------------------USUARIOS----------------------------------- */
//Login y comparación de datos
app.post("/user/login", function (request, response) {
  let email = request.body.email;
  let password = request.body.password;
  let params = [email];
  let sql = "SELECT * FROM user WHERE email = ?";
  if (email && password) {
    connection.query(sql, params, function (err, result) {
      if (err) {
        if(DEBUG){
            console.log(err);
        }
      } else {
        if(DEBUG){
            console.log(email, password, result);
        }
        if (result[0] === undefined) {
        response.status(403).send({ message: 'Something is wrong' });
        return;
        }
        if(INFO){
            console.log('Usuario Correcto')
        }
        let user = result[0];
        if(DEBUG){
            console.log(user);
        }
        const resultPassword = bcrypt.compareSync(password, user.password);
        if(INFO){
            console.log("el password es correcto?: " + resultPassword);
        }
        if (resultPassword) {
            const expiresIn = 24 * 60 * 60;
            const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: expiresIn });
            const tokenData = {
              accessToken: accessToken,
              expiresIn: expiresIn
            }
            if(DEBUG){
                console.log(tokenData);
            }
            result.push(tokenData);
            insertToken(accessToken, email);
            // prueba
            if (verifyToken(accessToken,email)) {
                //ok
            } else {
                // no ok
            }
            response.send(result);
        } else {
            // password wrong
            //response.status(403).send({ message: 'Something is wrong' });
            response.send(null);
        }
      }
    })
  }
});

// GET /USERS/:USERID = Obtiene toda la información asociada al usuario 
app.get("/user/:id", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id_verificar = request.headers.user;
    let user_id = request.params.id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id_verificar)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [user_id];
            sql = "SELECT * FROM user WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Datos del Usuario')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// POST /USERS/REGISTER = Introduce a un usuario en la base de datos.
app.post("/user/register", function (request, response) {
    let name = request.body.name;
    let email = request.body.email;
    let password = bcrypt.hashSync(request.body.password);
    let comunidad = request.body.comunidad;
    let provincia = request.body.provincia;
    let localidad = request.body.localidad;
    let cp = request.body.cp;
    let user_image = request.body.user_image;
    let params = [name, email, password, comunidad, provincia, localidad, cp, user_image]
    let sql = "INSERT INTO user (name, email, password, comunidad, provincia, localidad, cp, user_image, accessToken) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, '')";
    connection.query(sql, params, function(err, result){
        if (err){
            if (err.sqlMessage.includes('email')){
                response.status(409).send({ message: 'Email duplicado' });
            } else if (err.sqlMessage.includes('name')){
                response.status(409).send({ message: 'Nombre duplicado' });
            } else {
                response.status(409).send({ message: 'No se ha podido registrar el usuario' });
            }
        }else{
            if(INFO){
                console.log('Nuevo usuario Ingresado')
            }
            if(DEBUG){
                console.log(result)
            }
            response.send(result);
        } 
    })
});

// PUT /USERS/:USERID = Actualiza la información asociada al usuario. 
app.put("/user", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.body.user_id
    let name = request.body.name
    let email = request.body.email
    let password = bcrypt.hashSync(request.body.password);
    let comunidad = request.body.comunidad
    let provincia = request.body.provincia
    let localidad = request.body.localidad
    let cp = request.body.cp
    let user_image = request.body.user_image
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [name, email, password, comunidad, provincia, localidad, cp, user_image]
            sql = "UPDATE user SET name = ?, email = ?, password = ?, comunidad = ?, provincia = ?, localidad = ?, cp = ?, user_image = ? WHERE user_id ="+user_id;
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Usuario Modificado')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// PUT /USERS/TOKEN = Borra el token asociada al usuario. 
app.put("/user/token", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.body.user_id
    let tokenVacio = '';
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [tokenVacio,user_id]
            sql = "UPDATE user SET accessToken = ? WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Usuario Modificado')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// DELETE PARA BORRAR UN USUARIO
app.delete("/user", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id  = request.body.user_id
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [user_id]
            sql = "DELETE FROM user WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Usuario eliminado')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

const NODEMAILER_HOST = process.env.NODEMAILER_HOST
const NODEMAILER_PORT = process.env.NODEMAILER_PORT
const NODEMAILER_USER = process.env.NODEMAILER_USER
const NODEMAILER_PASS = process.env.NODEMAILER_PASS
const MAIL_OPTIONS_FROM = process.env.MAIL_OPTIONS_FROM

//GET /RESET-PASSWORD = para recuperar la contraseña
app.get("/reset-password", async function (request, response){
    let email = request.headers.email;
    if(INFO){
        console.log('Existe el correo')
    }
    let params = [email]
    let sql = "SELECT COUNT(email) AS emailCount FROM user WHERE email = ?";
    connection.query(sql, params, function(err, result){
        if (err){
            if(DEBUG){
                console.log(err);
            }
        } else {
            console.log(params,result[0].emailCount);
            if(result[0].emailCount===1){
                if(INFO){
                    console.log('Existe el correo')
                }

                let password = Math.random().toString(36).substr(2);
                let nuevoPassword = bcrypt.hashSync(password);
                params = [nuevoPassword, email]
                let sql2 = "UPDATE user SET password = ? WHERE email = ?";
                connection.query(sql2, params, function(err, result){
                    if (err){
                        if(DEBUG){
                            console.log(err);
                        }
                    } else {
                        if(INFO){
                            console.log('Usuario Modificado')
                        }
                        if(DEBUG){
                            console.log(result);
                        }
                    } 
                })
                const transport = nodemailer.createTransport({
                    host: NODEMAILER_HOST,
                    port: NODEMAILER_PORT,
                    secure: false,
                    auth: {
                        user: NODEMAILER_USER,
                        pass: NODEMAILER_PASS
                    }
                });
                var mailOptions = {
                    from: MAIL_OPTIONS_FROM,
                    to: email,
                    subject: 'Link para cambiar tu contraseña',
                    text: 'Introduce este link en el campo contraseña al ingresar ('+ password +'), ve a tu perfil y vuelve a usarlo como contraseña actual, escribe tu nueva contraseña, confirmala y listo, ya puedes volver a entrar.', 
                    /* html: '<b>Hola ✔</b>' */
                };
                console.log(mailOptions)
                transport.sendMail(mailOptions, (error, info) => {
                    console.log(transport.options.host);
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Correo enviado.', info.messageId);
                });
            } else {
                if(INFO){
                    console.log('El correo no existe')
                } 
            }
            if(DEBUG){
                console.log(result);
            }
        } 
    response.send(result);
    })
})

/* ---------------------------------FIN USUARIOS----------------------------------- */

/* ---------------------------------MENSAJES----------------------------------- */
// POST /MESSAGES/ = Añade un nuevo mensaje.
app.post("/messages", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let chat_id = request.body.chat_id
    let sender_id  = request.body.sender_id 
    let user_id = sender_id
    let receiver_id = request.body.receiver_id
    let product_id = request.body.product_id 
    let text = request.body.text
    let date = request.body.date
    if(INFO){
        console.log("fecha mensaje es: " + date);
    }
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    const messageNumberResult = await verifyNumberOfMessages(sender_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            switch (messageNumberResult) {
                case 500:
                    response.status(500).send({ message: 'Error en el servidor' });
                    break;
                case 409:
                    if(INFO){
                        console.log('Has alcanzado la cantidad de productos que puedes subir');
                    }
                    response.status(409).send({ message: 'No puedes añadir más mensajes.' });
                    break;
                case 200:
                    params = [chat_id, sender_id, receiver_id, false, product_id ,text ,date]
                    sql = "INSERT INTO messages (chat_id, sender_id, receiver_id, leido, product_id ,text ,date) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    connection.query(sql, params, function(err, result){
                        if (err){
                            if(DEBUG){
                                console.log(err);
                            }
                        } else {
                            if(INFO){
                                console.log('Mensaje Ingresado')
                            }
                            if(DEBUG){
                                console.log(result);
                            }
                        } 
                    response.send(result);
                    })
                    break;
                default:
                }
            break;
        default:
    }
});

// PUT /CHANGEMESSAGES/ = Cambia un mensaje de no leido a leido.
app.put("/messages", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    let user_id = request.headers.user;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let chat_id = request.body.chat_id
    let receiver_id = request.body.receiver_id
    if(INFO){
        console.log("muestra el chat_id y el receiver_id "+chat_id, receiver_id);
    }
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [chat_id, receiver_id]
            sql = "UPDATE messages SET leido = 1 WHERE chat_id = ? AND receiver_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Mensaje Ingresado')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// GET /MESSAGES/: USERID/:OWNERID= Obtiene todos los mensajes intercambiados entre el usuario y el propietario del nole 
 app.get("/messages/:chat_id", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.headers.user;
    if(DEBUG){
        console.log(user_id);
    }
    var chat_id = request.params.chat_id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [chat_id]
            sql = "SELECT user.name, messages.text, messages.date FROM messages INNER JOIN user ON (messages.sender_id = user.user_id)  WHERE messages.chat_id = ? ORDER BY messages.date";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Objetos del Usuario')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

/* ---------------------------------FIN MENSAJES----------------------------------- */

/* ---------------------------------NOTIFICACIONES----------------------------------- */

// POST /NOTIFICATIONS/ = Añade una nueva notificación.
app.post("/notifications", function (request, response) {
    let user_id = request.body.user_id
    let mensajes_nuevos = request.body.mensajes_nuevos 
    let params = [user_id, mensajes_nuevos]
    let sql = "INSERT INTO notificaciones (user_id, mensajes_nuevos) VALUES (?, ?)";
    connection.query(sql, params, function(err, result){
        if (err){
            if(DEBUG){
                console.log(err);
            }
        } else {
            if(INFO){
                console.log('Notificación Creada')
        }
        if(DEBUG){
            console.log(result);
        }
        } 
        response.send(result);
    })
});

// GET /NOTIFICATIONS/: Obtiene si el usuario tiene mensaje nuevo o no 
app.get("/notifications/:user_id", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.params.user_id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [user_id]
            sql = "SELECT mensajes_nuevos FROM notificaciones WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Mensaje del Usuario ' + sql)
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// PUT /NOTIFICATIONS/: vuelve el mensaje del usuario a false
app.put("/notifications", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let tokenUserSession = request.headers.user;
    let user_id = request.body.user_id;
    let mensajes_nuevos = request.body.mensajes_nuevos;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, tokenUserSession)
    if(INFO){
        console.log ("put notification ");
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [mensajes_nuevos, user_id]
            sql = "UPDATE notificaciones SET mensajes_nuevos = ? WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Mensaje del Usuario ' + sql)
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});
/* ---------------------------------FIN NOTIFICACIONES----------------------------------- */

/* ---------------------------------NOLES / SILES----------------------------------- */
// POST /NOLES/ inserta la relacion entre usuario y producto //PARA MENSAJES
app.post("/noles/", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id  = request.body.user_id 
    let pid = request.body.product_id 
    let chat_id = request.body.chat_id
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [user_id , pid, chat_id]
            sql = "INSERT INTO noles (user_id, product_id, chat_id ) VALUES (?, ?, ?)";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Relación Nole creada')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// GET /NOLES= Obtiene todos los productos
app.get("/noles/:user_id", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.params.user_id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [user_id, user_id];
            sql = `SELECT products.nombre, products.descripcion, products.product_image, noles.product_id, noles.chat_id, user.name, user.user_id, 
                    (SELECT COUNT(leido) FROM messages WHERE receiver_id = ? AND leido = 0 AND chat_id = noles.chat_id GROUP BY chat_id) AS num_mensajes_nuevos 
                    FROM noles 
                    INNER JOIN products ON (noles.product_id = products.product_id) 
                    INNER JOIN user ON (products.user_id = user.user_id) WHERE noles.user_id = ?`
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Objetos del Usuario')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// DELETE PARA BORRAR UN NOLE
app.delete("/noles/:chat_id", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.headers.user;
    if(DEBUG){
        console.log(user_id);
    }
    let chat_id = request.params.chat_id
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [chat_id]
            sql = "DELETE FROM noles WHERE chat_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Nole eliminado')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// GET /SILES= Obtiene todos los productos
app.get("/siles/:user_id", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.params.user_id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [user_id, user_id];
            sql = `SELECT products.nombre, products.descripcion, products.product_image, noles.product_id, noles.chat_id, user.name, user.user_id,
                    (SELECT COUNT(leido) FROM messages WHERE receiver_id = ? AND leido = 0 AND chat_id = noles.chat_id GROUP BY chat_id) AS num_mensajes_nuevos 
                    FROM noles 
                    INNER JOIN products ON (noles.product_id = products.product_id) 
                    INNER JOIN user ON (noles.user_id = user.user_id) WHERE products.user_id = ?`
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Objetos del Usuario')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

/* ---------------------------------FIN NOLES / SILES----------------------------------- */

/* ---------------------------------BUSCAR----------------------------------- */

app.get("/buscar/usuario/:nombre", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.headers.user;
    if(DEBUG){
        console.log(user_id);
    }
    let nombre = request.params.nombre;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [nombre];
            sql = "SELECT * FROM user WHERE name = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Usuario por nombre')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// GET BUSCAR/CATEGORIA Obtiene los productos segun categoria
app.get("/buscar/:categoria", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.headers.user;
    var categoria = request.params.categoria;
    //var filtrar_user_id = request.query.filterUser;
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            if(categoria === "Todo"){
                /* params = [filtrar_user_id];
                sql = "SELECT * FROM products WHERE user_id != ?"; */
                sql = "SELECT * FROM products";
            }else{
                /* params = [categoria, filtrar_user_id]
                sql = "SELECT * FROM products WHERE categoria = ? AND user_id != ?"; */
                params = [categoria]
                sql = "SELECT * FROM products WHERE categoria = ?"; 
            }
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Objetos en la categoria ' + categoria)
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// GET /buscar/ por nombre de producto
app.get("/buscar/", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.headers.user;
    let filtrar_user_id = request.query.filterUser;
    let filtrar_name = "%" + request.query.filterProductName + "%";
    if(DEBUG){
        console.log(filtrar_name);
    }
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            /* params = [filtrar_user_id, filtrar_name, filtrar_name];
            sql = "SELECT products.nombre, products.descripcion, products.product_image, products.user_id FROM products INNER JOIN user ON (user.user_id = products.user_id) WHERE user.user_id != ? AND (products.nombre LIKE ? OR products.descripcion LIKE ?) ORDER BY product_id DESC"; */
            params = [filtrar_name, filtrar_name];
            sql = "SELECT products.nombre, products.descripcion, products.product_image, products.user_id FROM products INNER JOIN user ON (user.user_id = products.user_id) WHERE (products.nombre LIKE ? OR products.descripcion LIKE ?) ORDER BY product_id DESC";
            console.log(sql);
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Buscar por Clave')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// GET /buscar/ Obtiene los ultimos 4 productos agregados
app.get("/buscar-ultimos/", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.headers.user;
    //let filtrar_user_id = request.query.filterUser;
    let filtrar_fecha = request.query.days;
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            if (filtrar_fecha != null) {
                date = new Date();
                date.setDate(date.getDate() - filtrar_fecha)
                console.log("fitrando dias", filtrar_fecha, date);
                /* params = [filtrar_user_id, date];
                sql = "SELECT * FROM products WHERE user_id != ? AND date > ? ORDER BY product_id DESC"; */
                params = [date];
                sql = "SELECT * FROM products WHERE date > ? ORDER BY product_id DESC";
            } else {
                /* params = [filtrar_user_id];
                sql = "SELECT * FROM products WHERE user_id != ? ORDER BY product_id DESC LIMIT 4"; */
                sql = "SELECT * FROM products ORDER BY product_id DESC LIMIT 4";
            }
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Últimos productos añadidos')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

app.get("/buscar-cercanos/", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.headers.user;
    let filtrar_user_id = request.query.filterUser;
    let filtrar_where = request.query.filterWhere;
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            params = [filtrar_user_id, filtrar_where];
            console.log(filtrar_user_id,filtrar_where)
            sql = "SELECT * FROM user INNER JOIN products ON (user.user_id=products.user_id) WHERE user.user_id != ? AND user.localidad = ? ORDER BY product_id DESC LIMIT 4"
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Productos cercanos añadidos')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

app.get("/buscar-cercanos/categoria/:categoria/:tipo_loc/:valor_loc", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    if(INFO){
        console.log('Token local ', accessTokenLocal);
    }
    let user_id = request.headers.user;
    var categoria = request.params.categoria;
    var tipo_loc = "user." + request.params.tipo_loc
    var valor_loc = request.params.valor_loc;
    let filtrar_user_id = request.query.filterUser;
    if(DEBUG){
        console.log(filtrar_user_id, categoria, tipo_loc, valor_loc)
    }
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    if(INFO){
        console.log ("verifyToken result: " , tokenResult);
    }
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            if(INFO){
                console.log('Los token no coinciden. Operación no permitida');
            }
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            if(INFO){
                console.log('Los token coinciden. Usuario autorizado');
            }
            if(categoria === "Todo"){
                params = [valor_loc];
                sql = "SELECT products.nombre, products.descripcion, products.product_image, products.user_id FROM products INNER JOIN user ON (user.user_id = products.user_id) WHERE " + tipo_loc + " = ? ORDER BY products.product_id DESC";
            }else{
                params = [categoria, valor_loc];
                sql = "SELECT products.nombre, products.descripcion, products.product_image, products.user_id FROM products INNER JOIN user ON (user.user_id = products.user_id) WHERE categoria = ? AND " + tipo_loc + " = ? ORDER BY products.product_id DESC"; 
            }
            connection.query(sql, params, function(err, result){
                if (err){
                    if(DEBUG){
                        console.log(err);
                    }
                } else {
                    if(INFO){
                        console.log('Productos cercanos por Localización y Categoria')
                    }
                    if(DEBUG){
                        console.log(result);
                    }
                } 
            response.send(result);
            })
            break;
        default:
    }
});

/* ---------------------------------FIN BUSCAR----------------------------------- */


