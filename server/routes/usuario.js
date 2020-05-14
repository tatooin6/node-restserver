const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

// para crear objetos Usuario
const Usuario = require('../models/usuario');

const app = express();


app.get('/usuario', function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    // dentro del parametro find se pone la condicion para que los filtre - 2do arg se detalla los campos que se quiere devolver en la consulta
    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // dentro del parametro count se pone la condicion para que los filtre
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            })


        })

    //res.json('get usuario')
});

app.post('/usuario', function(req, res) {

    // body va a ser lo que aparece cuando el parser procece peticiones
    let body = req.body;

    // el 10 del bcrypt es para el numero de vueltas para realizar la encriptacion
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        })


    });

    //validacion
    /*     if (body.nombre === undefined) {
            res.status(400).json({
                ok: false,
                mensaje: 'El nombre es necesario'
            });
        } else {
            res.json({
                persona: body
            });
        } */


});

app.put('/usuario/:id', function(req, res) {

    // el id que se define en el endpoint es el de req.params.id
    let id = req.params.id;

    // filtrado de elementos del objeto que queremos filtrar para la actualizacion [underscore]
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //filtrado de password y google para que no se actualicen sin usar el undescore
    /* delete body.password;
    delete body.google; */

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

app.delete('/usuario/:id', function(req, res) {

    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    };

    // eliminar usuario
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    //cambia el estado del usuario
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    })



});

module.exports = app;