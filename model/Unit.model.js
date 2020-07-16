const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const unitSchema = new Schema({
	fabricCode : String,
	color : String,
	price : Number
})

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit