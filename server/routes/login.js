const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        // si se encuentra un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        // se evalua si el usuario existe en la base de datos
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "(Usuario) o Contraseña Incorrectos"
                }
            })
        }

        // se evalua la contraseña
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o (Contraseña) Incorrectos"
                }
            })
        }

        // generamos el toke, primero va la data que se manda, luego la seed o secreto y finalmente la expiracion
        // la expiracion empieza en segs * mins * horas * dias
        let token = jwt.sign({ usuario: usuarioDB },
            process.env.SEED, { expiresIn: 60 * 60 * 24 * 30 }
        );

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });

});

module.exports = app;