const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: { type: String, unique: true, required:[true, 'La descripcion es obligatoria']},
    usuario: {type: Schema.Types.ObjectId, ref: 'Usuario'}
});

// no olvidar exportar parametros del modelo 
module.exports = mongoose.model('Categoria', categoriaSchema);