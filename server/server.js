require('./config/config');

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())




app.get('/usuario', function(req, res) {
    res.json('get usuario')
});

app.post('/usuario', function(req, res) {

    // body va a ser lo que aparece cuando el parser procece peticiones
    let body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    } else {
        res.json({
            persona: body
        });
    }


});

app.put('/usuario/:id', function(req, res) {

    // el id que se define en el endpoint es el de req.params.id
    let id = req.params.id;

    res.json({
        id
    });
});

app.delete('/usuario', function(req, res) {
    res.json('delete usuario')
});


app.listen(process.env.PORT, () => {
    console.log(`Escuchando el puerto `, process.env.PORT);
})