
const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    billType: { type: String, required: true }
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
