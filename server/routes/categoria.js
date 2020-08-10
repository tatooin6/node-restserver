const express = require('express');

let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

// USAR TOKENS

// ==============================
// Mostrar todas las categorias
// ==============================
app.get('/categoria', verificaToken,(req, res) => {
    // POPULATE revisa que id de usuarios existen en la categoria // 2do argumento indica los campos que se quiere que se filtren
    // SORT ordena segun una propiedad del categoria
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Categoria.countDocuments((err, conteo)=>{
                return res.json({
                    ok: true,
                    categorias,
                    cantidad: conteo
                });
            })
        })
});

// ==============================
// Mostrar una categoria por ID
// ==============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    // Categoria.finById(...);
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'El ID no es correcto'
                }
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
});


// ==============================
// Crear nueva categoria
// ==============================
app.post('/categoria', verificaToken, (req, res) => {
    // REGRESA nueva categoria
    // al crear categoria se tiene el id del usuario en el token
    // req.usuario._id // accesso al id de la persona que ejecuta la instrucciion
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

// ==============================
// Actualiza categoria
// ==============================
app.put('/categoria/:id', verificaToken, (req, res) => {
    // solo actualizar la descripcion de la categoria
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

// ==============================
// Borrar categoria
// ==============================
app.delete('/categoria/:id', (req, res) => {
    // solo un administrador puede borrar la categoria
    // categoria.findByIdAndRemove
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, [verificaToken, verificaAdminRole], (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'el id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
        })
    })

});

module.exports = app;