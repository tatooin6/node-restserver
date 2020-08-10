// ===========================
// PORT
// ===========================

process.env.PORT = process.env.PORT || 3000;


// ===========================
// ENTORNO
// ===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===========================
// Vencimiento del TOKEN
// ===========================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días

process.env.CADUCIDAD_TOKEN = '48h'; // 60 * 60 * 24 * 30;

// ===========================
// SEED de autenticación
// ===========================
// variable declarada en heroku para que sea el seed de produccion

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ===========================
// BASE DE DATOS
// ===========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URL;
}
process.env.URLDB = urlDB;

/*
heroku config
heroku config:set NOMBRE=tato
heroku config:get NOMBRE
heroku config:unset NOMBRE
*/

// ===========================
// Google Client ID
// ===========================

process.env.CLIENT_ID = process.env.CLIENT_ID || '1085501733383-7kao18bh03aoaqaaqp1rcuauecijk0fn.apps.googleusercontent.com';