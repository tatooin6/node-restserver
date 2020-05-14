// ===========================
// PORT
// ===========================

process.env.PORT = process.env.PORT || 3000;


// ===========================
// ENTORNO
// ===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';



// ===========================
// BASE DE DATOS
// ===========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://tato:2L-EVuPbzkxuj8H@cluster0-irbp8.mongodb.net/cafe';
}
process.env.URLDB = urlDB;