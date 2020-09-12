const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
//EXTRAS PARA LA PRUEBA CARGA DE FOTOS 
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const _ = require('lodash'); 
//PARA EL AUTENTICACIÓN REGISTER/LOGIN
const bodyParserJSON = bodyParser.json();
const bodyParserURLEncoded = bodyParser.urlencoded({ extended: true });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = 'secretkey123456';

const mysql = require('mysql');
const util = require( 'util' );

const connection = mysql.createConnection({
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

// conexión a BD para async/await en verificar accessToken
function makeDb(config) {
    const connection = mysql.createConnection(config);  
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
    host: 'localhost',
    user: "root",
    password: null,
    database: 'silenole'
} );

app.use(cors());
app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);

//EXTRAS PARA LA PRUEBA CARGA DE FOTOS 
app.use(fileUpload({
    createParentPath: true
}));

app.use(morgan('dev'));

// Función de verificación de tokens
verifyToken = async (accessToken, user_id) => {
    console.log("verificando token");
    let params = [user_id];
    let sql = "SELECT accessToken FROM user WHERE user_id = ?";
    let resultCode;
    await db.query(sql, params).then( result => {
        console.log ("token BBDD" , result);
        if (result[0] === undefined || result[0] === null){
            resultCode = 500;
        } else {
            if (result[0].accessToken === accessToken) {
                console.log('Token verificado')
                resultCode = 200;
            } else {
                console.log('Token no válido')
                resultCode = 401;
            }
        }
    });
    return resultCode;
}

const insertToken = (accessToken, email) => {
    console.log("insertando token");
    let params = [accessToken, email];
    let sql = "UPDATE user SET accessToken = ? WHERE email = ?";
    connection.query(sql, params, function(err, result){
        if (err) {
            console.log(err)
            console.log('error al insertar token')
            return false;
        } else {
            console.log('Token insertado')
            console.log(result)
            return true;
        }
    });
}

/* ---------------------------------PRODUCTOS----------------------------------- */
app.get("/products/:user_id", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
    let user_id_verificar = request.headers.user;
    let user_id = request.params.user_id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id_verificar)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [user_id];
            sql = "SELECT * FROM products WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                } else {
                    console.log('Objetos Propios')
                    console.log(result)
                } 
                response.send(result);
            })
            break;
        default:
    }
});

// GET /SILES= Obtiene todos los productos
/* app.get("/products", function (request, response) {
    let sql;
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
    sql = "SELECT accessToken FROM user WHERE user_id = ?";
    connection.query(sql, params, function(err, result){
        if (err){
            console.log(err)
        } else {
            console.log('Token recibido ', result)
            if (result[0] === undefined || result[0] === null) {
                //
                response.status(500).send({ message: 'Error en el servidor' });
                return;
            }
            let tokenRecibido = result[0].accessToken;
            if (tokenRecibido === accessTokenLocal){
                console.log('Los token coinciden. Usuario autorizado')
                sql = "SELECT * FROM products"
                connection.query(sql, params, function(err, result){
                    if (err){
                        console.log(err)
                    } else {
                        console.log('Objetos del usuario')
                        console.log(result)
                    } 
                response.send(result);
                })
            } else {
                console.log('Los token no coinciden. Operación no permitida')
                response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            }
        } 
    })
}); */

// POST /SILES/ = Añade un nuevo sile del usuario 
app.post("/products", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
    let nombre = request.body.nombre
    let descripcion = request.body.descripcion
    let categoria = request.body.categoria
    let user_id  = request.body.user_id 
    let product_image = request.body.product_image
    let date = request.body.date
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado')
            params = [nombre, descripcion, categoria, user_id, product_image, date]
            sql = `INSERT INTO products (nombre, descripcion, categoria, user_id , product_image, date) VALUES ( ?, ?, ?, ?, ?, ?)`;
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                } else {
                    console.log('Nuevo producto Ingresado')
                    console.log(result)
                } 
            response.send(result);
            })
            break;
        default:
    }
});

// PUT /SILES/ = Actualiza un sile del usuario
app.put("/products", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
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
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado')
            params = [nombre, descripcion, categoria, user_id , product_image, date]
            sql = "UPDATE products SET nombre = ?, descripcion = ?, categoria = ?, user_id = ?, product_image = ?, date = ? WHERE product_id =" + product_id;
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                } else {
                    console.log('Producto Modificado')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id  = request.body.user_id
    let product_id = request.body.product_id
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado')
            params = [product_id]
            sql = "DELETE FROM products WHERE product_id = ?"
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Producto Borrado')
                    console.log(result)
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
        console.log(err)
      } else {
          console.log(result);
          if (result[0] === undefined) {
            response.status(403).send({ message: 'Something is wrong' });
            return;
          }
        console.log('Usuario Correcto')
        var user = result[0];
        console.log(user);
        const resultPassword = bcrypt.compareSync(password, user.password);
        console.log("el password es correcto?: " + resultPassword);
        if (resultPassword) {
            const expiresIn = 24 * 60 * 60;
            const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: expiresIn });
    
            const tokenData = {
              accessToken: accessToken,
              expiresIn: expiresIn
            }
            console.log(tokenData);
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
    console.log('Token local ', accessTokenLocal);
    let user_id_verificar = request.headers.user;
    let user_id = request.params.id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id_verificar)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [user_id];
            sql = "SELECT * FROM user WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Datos del Usuario')
                    console.log(result)
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
    let sql = "INSERT INTO user (name, email, password, comunidad, provincia, localidad, cp, user_image) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)";
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

// PUT /USERS/:USERID = Actualiza la información asociada al usuario. 
app.put("/user", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
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
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado')
            params = [name, email, password, comunidad, provincia, localidad, cp, user_image]
            sql = "UPDATE user SET name = ?, email = ?, password = ?, comunidad = ?, provincia = ?, localidad = ?, cp = ?, user_image = ? WHERE user_id ="+user_id;
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Usuario Modificado')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id = request.body.user_id
    let tokenVacio = '';
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado')
            params = [tokenVacio,user_id]
            sql = "UPDATE user SET accessToken = ? WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Usuario Modificado')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id  = request.body.user_id
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado')
            params = [user_id]
            sql = "DELETE FROM user WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Usuario eliminado')
                    console.log(result)
                } 
            response.send(result);
            })
            break;
        default:
    }
});

/* ---------------------------------FIN USUARIOS----------------------------------- */

/* ---------------------------------MENSAJES----------------------------------- */
// POST /MESSAGES/ = Añade un nuevo mensaje.
app.post("/messages", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
    let chat_id = request.body.chat_id
    let sender_id  = request.body.sender_id 
    let user_id = sender_id
    let product_id = request.body.product_id 
    let text = request.body.text
    let date = request.body.date
    console.log("fecha mensaje es: " + date);
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado')
            params = [chat_id, sender_id , product_id ,text ,date]
            sql = "INSERT INTO messages (chat_id, sender_id, product_id ,text ,date) VALUES (?, ?, ?, ?, ?)";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Mensaje Ingresado')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id = request.headers.user;
    console.log(user_id)
    var chat_id = request.params.chat_id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [chat_id]
            sql = "SELECT user.name, messages.text, messages.date FROM messages INNER JOIN user ON (messages.sender_id = user.user_id)  WHERE messages.chat_id = ? ORDER BY messages.date";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Objetos del Usuario')
                    console.log(result)
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
            console.log(err)
        }else{
            console.log('Notificación Creada')
            console.log(result)
        } 
        response.send(result);
    })
});

// GET /NOTIFICATIONS/: Obtiene si el usuario tiene mensaje nuevo o no 
app.get("/notifications/:id", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
    let user_id = request.params.id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [user_id]
            sql = "SELECT mensajes_nuevos FROM notificaciones WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Mensaje del Usuario ' + sql)
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let tokenUserSession = request.headers.user;
    let user_id = request.body.user_id;
    let mensajes_nuevos = request.body.mensajes_nuevos;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, tokenUserSession)
    console.log ("put notification ");
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [mensajes_nuevos, user_id]
            sql = "UPDATE notificaciones SET mensajes_nuevos = ? WHERE user_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Mensaje del Usuario ' + sql)
                    console.log(result)
                } 
            response.send(result);
            })
            break;
        default:
    }
});
/* ---------------------------------FIN MENSAJES----------------------------------- */

/* ---------------------------------NOLES / SILES----------------------------------- */
// POST /NOLES/ inserta la relacion entre usuario y producto //PARA MENSAJES
app.post("/noles/", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
    let user_id  = request.body.user_id 
    let pid = request.body.product_id 
    let chat_id = request.body.chat_id
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [user_id , pid, chat_id]
            sql = "INSERT INTO noles (user_id, product_id, chat_id ) VALUES (?, ?, ?)";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Relación Nole creada')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id = request.params.user_id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [user_id];
            sql = "SELECT products.nombre, products.descripcion, products.product_image, noles.product_id, noles.chat_id, user.name, user.user_id FROM noles INNER JOIN products ON (noles.product_id = products.product_id) INNER JOIN user ON (products.user_id = user.user_id) WHERE noles.user_id = ?"
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Objetos del Usuario')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id = request.headers.user;
    console.log(user_id)
    let chat_id = request.params.chat_id
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [chat_id]
            sql = "DELETE FROM noles WHERE chat_id = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Nole eliminado')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id = request.params.user_id;
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [user_id];
            sql = "SELECT products.nombre, products.descripcion, products.product_image, noles.product_id, noles.chat_id, user.name, user.user_id FROM noles INNER JOIN products ON (noles.product_id = products.product_id) INNER JOIN user ON (noles.user_id = user.user_id) WHERE products.user_id = ?"
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Objetos del Usuario')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id = request.headers.user;
    console.log(user_id)
    let nombre = request.params.nombre;
    console.log("buscando usuario ", nombre)
    let params;
    let sql;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [nombre];
            sql = "SELECT * FROM user WHERE name = ?";
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Usuario por nombre')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id = request.headers.user;
    var categoria = request.params.categoria;
    var filtrar_user_id = request.query.filterUser;
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            if(categoria === "Todo"){
                params = [filtrar_user_id];
                sql = "SELECT * FROM products WHERE user_id != ?";
            }else{
                params = [categoria, filtrar_user_id]
                sql = "SELECT * FROM products WHERE categoria = ? AND user_id != ?"; 
            }
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                    console.log("hola desde api")
                }else{
                    console.log('Objetos en la categoria ' + categoria)
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id = request.headers.user;
    let filtrar_user_id = request.query.filterUser;
    let filtrar_name = "%" + request.query.filterProductName + "%";
    console.log(filtrar_name)
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: ", tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [filtrar_user_id, filtrar_name, filtrar_name];
            sql = "SELECT products.nombre, products.descripcion, products.product_image, products.user_id FROM products INNER JOIN user ON (user.user_id = products.user_id) WHERE user.user_id != ? AND (products.nombre LIKE ? OR products.descripcion LIKE ?) ORDER BY product_id DESC";
            console.log(sql);
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Buscar por Clave')
                    console.log(result)
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
    console.log('Token local ', accessTokenLocal);
    let user_id = request.headers.user;
    let filtrar_user_id = request.query.filterUser;
    let filtrar_fecha = request.query.days;
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            if (filtrar_fecha != null) {
                date = new Date();
                date.setDate(date.getDate() - filtrar_fecha)
                console.log("fitrando dias", filtrar_fecha, date);
                params = [filtrar_user_id, date];
                sql = "SELECT * FROM products WHERE user_id != ? AND date > ? ORDER BY product_id DESC";
            } else {
                params = [filtrar_user_id];
                sql = "SELECT * FROM products WHERE user_id != ? ORDER BY product_id DESC LIMIT 4";
            }
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Últimos productos añadidos')
                    console.log(result)
                } 
            response.send(result);
            })
            break;
        default:
    }
});

app.get("/buscar-cercanos/", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
    let user_id = request.headers.user;
    let filtrar_user_id = request.query.filterUser;
    let filtrar_where = request.query.filterWhere;
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            params = [filtrar_user_id, filtrar_where];
            console.log(filtrar_user_id,filtrar_where)
            sql = "SELECT * FROM user INNER JOIN products ON (user.user_id=products.user_id) WHERE user.user_id != ? AND user.localidad = ? ORDER BY product_id DESC LIMIT 4"
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Productos cercanos añadidos')
                    console.log(result)
                } 
            response.send(result);
            })
            break;
        default:
    }
});

app.get("/buscar-cercanos/categoria/:categoria/:tipo_loc/:valor_loc", async function (request, response) {
    let accessTokenLocal = request.headers.authorization;
    console.log('Token local ', accessTokenLocal);
    let user_id = request.headers.user;
    var categoria = request.params.categoria;
    var tipo_loc = "user." + request.params.tipo_loc
    var valor_loc = request.params.valor_loc;
    let filtrar_user_id = request.query.filterUser;
    console.log(filtrar_user_id, categoria, tipo_loc, valor_loc)
    let sql;
    let params;
    const tokenResult = await verifyToken(accessTokenLocal, user_id)
    console.log ("verifyToken result: " , tokenResult);
    switch (tokenResult) {
        case 500:
            response.status(500).send({ message: 'Error en el servidor' });
            break;
        case 401:
            console.log('Los token no coinciden. Operación no permitida')
            response.status(401).send({ message: 'No autorizado. Ingresa en tu cuenta.' });
            break;
        case 200:
            console.log('Los token coinciden. Usuario autorizado');
            if(categoria === "Todo"){
                params = [filtrar_user_id, valor_loc];
                sql = "SELECT products.nombre, products.descripcion, products.product_image, products.user_id FROM products INNER JOIN user ON (user.user_id = products.user_id) WHERE user.user_id != ? AND " + tipo_loc + " = ? ORDER BY products.product_id DESC";
            }else{
                params = [categoria, filtrar_user_id, valor_loc];
                sql = "SELECT products.nombre, products.descripcion, products.product_image, products.user_id FROM products INNER JOIN user ON (user.user_id = products.user_id) WHERE categoria = ? AND user.user_id != ? AND " + tipo_loc + " = ? ORDER BY products.product_id DESC"; 
            }
            connection.query(sql, params, function(err, result){
                if (err){
                    console.log(err)
                }else{
                    console.log('Productos cercanos por Localización y Categoria')
                    console.log(result)
                } 
            response.send(result);
            })
            break;
        default:
    }
});

/* ---------------------------------FIN BUSCAR----------------------------------- */


app.listen(3000);