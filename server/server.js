require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // para resolver el path de la carpeta public

const app = express();

const bodyParser = require('body-parser')
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

// habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuracion global de rutas
app.use(require('./routes/index'));

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
//conexion con la base de datos
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {

    if (err) throw err;

    console.log(`Base de datos ONLINE`);

});

app.listen(process.env.PORT, () => {
    console.log(`Escuchando el puerto `, process.env.PORT);
})