const express = require('express');

// no es necesario una verificacion de usuario administrador, todos pueden crear un producto siempre y cuando esten autenticados
const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');
const { json } = require('body-parser');


// ===========================
// Obtener todos los productos
// ===========================
app.get('/producto', verificaToken, (req, res) => {
    // trae todos los productos
    // con el populate debe cargar el usuario y la categoria
    // paginado 

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limit || 5;
    limite = Number(limite);

    Producto.find({disponible: true})
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre role')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments((err, conteo) => {
                res.json({
                    ok: true,
                    cantidad: conteo,
                    productos: productosDB,
                })
            })
        })
});

// ===========================
// Obtener producto por ID
// ===========================
app.get('/producto/:id', verificaToken, (req, res) => {
    // trae un producto
    // con el populate debe cargar el usuario y la categoria
    // params es lo que viene luego de los puntitos y query es loq ue viene despues del ?
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB)=>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'No existe (ID) en la base de datos',
                        err
                    }
                });
            }
    
            res.json({
                ok: true,
                productoDB
            })
        })
    
});

// ===========================
// Crear producto
// ===========================
app.get('/producto/buscar/:termino', verificaToken, (req, res) =>{
    
    let termino = req.params.termino;

    // Expresion regular para poder hacer match con el nombre tomando algunos o todos los terminos de la busqueda
    let regex = new RegExp(termino, 'i');

    // entre las llaves dentro de find se va a filtrar segun la expresion regular que se contenga en su interior
    Producto.find({nombre: regex})
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        })

})

// ===========================
// Crear producto
// ===========================
app.post('/producto', verificaToken,(req, res) => {
    // grabar el usuario que lo creo 
    // grabar una categoria del listado de categoria
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id,
    })

    // apuntar que ni descripcion ni disponible es requerido
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }


        res.status(201).json({
            ok: true,
            producto: productoDB
        })
    })

/*     return res.json({
        ok: true,
        producto
    }); */
});

// ===========================
// Acualizar producto
// ===========================
app.put('/producto/:id', verificaToken, (req, res) => {
    // grabar el usuario que lo creo 
    // grabar una categoria del listado de categoria
    let body =  req.body;
    
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'El producto ID no existe'
                }
            });
        }

    productoDB.nombre = body.nombre;
    productoDB.precioUni = body.precioUni;
    productoDB.categoria = body.categoria;
    productoDB.disponible = body.disponible;
    productoDB.descripcion = body.descripcion;

    productoDB.save( (err, productoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: {
                    err,
                    message: 'Error al actualizar'
                }
            });
        }

        res.json({
            ok:true,
            producto: productoGuardado
        });
    });
        
    })
});

// ===========================
// Borrar un producto
// ===========================
app.delete('/producto/:id', verificaToken, (req, res) => {
    // en vez de borrarlo cambiar la propiedad disponible a falso
    // mensaje de salida es que se ha borrado el producto
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Producto a eliminar no encontrado'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save( (err, productoEliminado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        err,
                        message: 'Error al eliminar'
                    }
                });
            }

            res.json({
                ok: true,
                message: 'Eliminado con exito'
            })
        })

    })

});

module.exports = app;