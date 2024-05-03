const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    tokens: [{ type: String }]
});

module.exports = mongoose.model('Admin', adminSchema);
