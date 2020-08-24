const jwt = require('jsonwebtoken');

// ===========================
// VERIFICAR TOKEN
// ===========================

let verificaToken = (req, res, next) => {

    let token = req.get('token'); // aqui viene la key que se le da al header de la consulta

    // función para verificar el token conrrectamente, tiene el token, el SEED y un callback para errores y la info decondificada
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            // 401 unauthorized
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        // decoded tiene la informacion del usuario, es el payload desencriptado
        // para que si llega hasta esta linea entonces se devuelve el usuario del payload decodificado
        req.usuario = decoded.usuario;

        next();

    });

}

// ===========================
// VERIFICAR ADMIN_ROLE
// ===========================

let verificaAdminRole = (req, res, next) => {

    // el middleware de autenticacion devuelve el req.usuario decodificado
    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        })
    }
}

// ===========================
// VERIFICAR TOKEN PARA IMAGEN
// ===========================

let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    // función para verificar el token conrrectamente, tiene el token, el SEED y un callback para errores y la info decondificada
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            // 401 unauthorized
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        // decoded tiene la informacion del usuario, es el payload desencriptado
        // para que si llega hasta esta linea entonces se devuelve el usuario del payload decodificado
        req.usuario = decoded.usuario;

        next();

    });

}

module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
}