const mongoose = require('mongoose')

const Child = mongoose.model('Child', {
    name: String,
    sex: String,
    classChild: String,
    birthDate: Date,
    photograph: String,
    personalDocument: String,
    address: String,
    addressNumber: String,
    addressComplement: String,
    addressNeighborhood: String,
    addressMunicipality: String,
    addressZip: String,
    addressUF: String,
    telephone: String,
    responsible1: String,
    parentageResponsible1: String,
    telephoneResponsible1: String,
    responsible2: String,
    parentageResponsible2: String,
    telephoneResponsible2: String,
    allergenic: String,
    comments: String
})

module.exports = Child