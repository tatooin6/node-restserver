const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// uso de middleware - todos los archivos que se carguen caen dentro de req.file
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // console.log(req.files.foo); // the uploaded file object
    if (!req.files || Object.keys(req.files).length === 0) {
        return res
                .status(400)
                .json({
                    ok: false,
                    err: {
                        message: 'No se ha seleccionado ningun archivo'
                    }
                });
    }

    // Validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400)
                    .json({
                        ok: false,
                        err: {
                            message: 'Los tipos Validos permitidos son ' + tiposValidos.join(', '),
                            type: tipo
                        }
                    });
    }


    // "archivo" es el nombre del archivo que se va a ver 
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    /*console.log(`Extension del archivo subido:`);
    console.log(extension);*/

    // extensiones permitidas
    let extensionesValidas = ['jpg', 'jpeg', 'gif', 'png'];

    // si no se encuentra la extension en las extensiones validas entonces el index da -1
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400)
                    .json({
                        ok: false,
                        err: {
                            message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                            ext: extension
                        }
                    });
    }

    // Cambiar el nombre del archivo al id (usuario/producto) y su extension
    // ufsjh948j-999.jpg
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;


    // para mover el archivo a un lugar especifico
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
          return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
        }
    
        switch(tipo) {
            case 'usuarios': imagenUsuario(id, res, nombreArchivo); break;
            case 'productos': imagenProducto(id, res, nombreArchivo); break;
            default : console.log('Actualizacion de imagen erronea');
        }

        
      });
  });


  // para actualizar imagenes
  function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) =>{
        if (err) {
            // el objeto res no existe en este contexto por eso se lo manda por argumentos
            // nombre del archivo que se acaba de subir para que se elimine si existe algun error
            borraArchivo(nombreArchivo, 'usuarios');
            res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        if (!usuarioDB) {
            // para evitar que se llene de basura el servidor
            borraArchivo(nombreArchivo, 'usuarios');
            res.status(400)
                .json({
                    ok: false,
                    error: {
                        message: 'Usuario no existe'
                    }
                });
        }

        // se debe confirmar que la imagen anterior existe antes de borrarla
        borraArchivo(usuarioDB.img, 'usuarios');

        // imagen del usuario es el nombre del archivo guardado
        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado) => {
            if (err) {
                // el objeto res no existe en este contexto por eso se lo manda por argumentos
                res.status(500)
                    .json({
                        ok: false,
                        error: {
                            message: 'Error guardando usuario con nueva imagen',
                            err
                        }
                    });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })

    })
  }


  function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if(err) {
            borraArchivo(nombreArchivo, 'productos')
            res.status(500)
            .json({
                ok: false,
                err
            });
        }
        
        if(!productoDB) {
            borraArchivo(nombreArchivo, 'productos')
            res.status(400)
                .json({
                    ok: false,
                    error: {
                        message: 'No se encontro el producto en la BD'
                    }
                });
        }

        borraArchivo(productoDB.img, 'productos');
        
        productoDB.img = nombreArchivo;

        productoDB.save( (err, productoGuardado) => {
            if(err) {
                res.status(500)
                    .json({
                        ok: false,
                        err
                    })
            }

            if(!productoGuardado) {
                res.status(400)
                    .json({
                        ok: false,
                        error: {
                            message: 'Producto no guardado correctamente al querer actualizar imagen'
                        }
                    });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })

    });
  }

  function borraArchivo(nombreImagen, tipo) {
        // usar filesystem para confirmar que existe la imagen
        // se carga la direccion de la imagen usando el nombre de la ultima guardada en la base de datos
        // tipo es el tipo usuario o prodcuto a borrar
        let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

        // para verificar si existe la imagen
        if (fs.existsSync(pathImagen)) {
            // eliminar imagen
            fs.unlinkSync(pathImagen);
        }
  }

  // no olvidar exportar la configuracion de este controlador con...
  module.exports = app;