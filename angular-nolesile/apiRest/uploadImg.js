//Creamos las constantes para la conexión
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
require('dotenv').config();

const PORT = process.env.FILESERVER_PORT || 3100;
const SSL_PORT = process.env.FILESERVER_SSL_PORT || 3103;

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

//EXTRAS PARA LA CARGA DE FOTOS 
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const _ = require('lodash'); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static('uploads'));
//Limitamos el tamaño maximo de las fotos 
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: process.env.MAX_FILESIZE * 1024 * 1024 * 1024 //max file(s) size
    },
}));

app.use(cors());
app.use(bodyParser.json());

//Puerto a usar 
app.listen(PORT, () => 
  console.log(`App is listening on port ${PORT}.`)
);

https.createServer(options, app).listen(SSL_PORT);

//Subir imagen de usuario
app.post('/upload-img', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Utilice el nombre del campo de entrada para recuperar el archivo cargado
            let user_image = req.files.user_image;
            //Utilice el método mv() para colocar el archivo en el directorio de subidas (carpeta "uploads")
            user_image.mv('./uploads/' + user_image.name);
            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: user_image.name,
                    mimetype: user_image.mimetype,
                    size: user_image.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

//Subir imagen de productos
app.post('/upload-imgProduct', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Utilice el nombre del campo de entrada para recuperar el archivo cargado
            let product_image = req.files.product_image;
            //Utilice el método mv() para colocar el archivo en el directorio de subidas (carpeta "uploads")
            product_image.mv('./uploads/' + product_image.name);
            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: product_image.name,
                    mimetype: product_image.mimetype,
                    size: product_image.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

//Borrar imagenes
app.delete('/delete-img/:imageName', async (req, res) => {
    const imageName = req.params.imageName;
    try {
        if(imageName === null || imageName === "") {
            res.send({
                status: false,
                message: 'No file to delete'
            });
        } else {
            const imagePath = './uploads/' + imageName;
            fs.unlink( imagePath, (err) => {
                // if (err) throw err;
                console.log(imageName + ' was not found');
            });
            //send response
            res.send({
                status: true,
                message: 'File is deleted',
                data: {
                    name: imageName
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});