const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// enumeracion de los roles
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// modificamos el metodo toJSON original para quitar el password al devolver el objeto usuario creado
// cuando se imprima el userSchema mediante un toJSON se quita el password
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

// con esto se valida que se use el validador con el esquema del usuario
usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser único'
});

// para exportar parametros del modelo es el nombre que queremos que tenga y la configuracion de donde proviene
module.exports = mongoose.model('Usuario', usuarioSchema);