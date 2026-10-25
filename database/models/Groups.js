//group table model//

// loading mongoose library
const mongoose = require('mongoose');

// defining the schema for the groups model
const groupSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#FFFFFF' }, // default color is white
    sortOrder: { type: Number, default: 0 }, // default sort order is 0
}, { timestamps: true });   // adds createdAt / updatedAt

// users cant have 2 groups with same name, so we create a unique index on userId + name
groupSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Group', groupSchema);