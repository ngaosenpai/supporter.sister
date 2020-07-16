const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
	week_issued : Number,
	item : String,
	quantity : Number,
	color : String
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order