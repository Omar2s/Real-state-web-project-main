const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  images: {  type: [String],required: true},
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  property: { type: String, required: true },
  type: { type: String, required: true },
  bedroom: { type: Number, required: true },
  area: { type: Number, required: true },
  price: { type: Number, required: true },
  negotiationable: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);
