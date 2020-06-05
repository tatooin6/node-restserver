const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID); // Este es el ID del proyecto creado en google

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
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });

});

// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    // el payload tiene la informacion del usuario con el que se abre sesión en la aplicacion
    const payload = ticket.getPayload();
    /*     console.log(payload.name);
        console.log(payload.email);
        console.log(payload.picture); */

    // ya tenemos los datos del usuario como esta funcion es async entonces podemos devolver un objeto personalizado
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    // verificacion de la existencia de ese usuario de google
    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err: e
            })
        });

    // Se verifica si en la BD existe ese usuario
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        // Si ocurre algun error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        // Si existe el usuario y fue creado con las credenciales de la aplicación
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                })
            } else { // si el usuario existe y fue creado con credenciales de google
                // renovar su token [crear token personalizado]
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // respuesta
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })

            }
        } else { // si el usuario no existe en nuestra base de datos, crear usuario
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            // password es obligatorio pero no lo vamos a usar
            // no será posible loguearse con este password encriptado
            usuario.password = ':)';

            // guardado del nuevo usuario de google
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                // renovar su token [crear token personalizado]
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // respuesta
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            });

        }

    })

    // Enviar como respuesta al usuario encontrado en google
    /* res.json({
        usuario: googleUser
    }); */

});

module.exports = app;