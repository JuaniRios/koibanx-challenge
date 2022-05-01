const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  name: String,
  cuit: String,
  concepts: Array,
  currentBalance: Number,
  active: Boolean,
  lastSale: Date,
}, {timestamps: true, toJSON: {virtuals: true}, id: 0});

StoreSchema.virtual("concept1")
  .get(function () {
    return this.concepts[0]
  })
  .set(function(v) {
    this.concepts[0] = v
  })

StoreSchema.virtual("concept2")
  .get(function () {
    return this.concepts[1]
  })
  .set(function(v) {
    this.concepts[1] = v
  })

StoreSchema.virtual("concept3")
  .get(function () {
    return this.concepts[2]
  })
  .set(function(v) {
    this.concepts[2] = v
  })

StoreSchema.virtual("concept4")
  .get(function () {
    return this.concepts[3]
  })
  .set(function(v) {
    this.concepts[3] = v
  })

StoreSchema.virtual("concept5")
  .get(function () {
    return this.concepts[4]
  })
  .set(function(v) {
    this.concepts[4] = v
  })

StoreSchema.virtual("concept6")
  .get(function () {
    return this.concepts[5]
  })
  .set(function(v) {
    this.concepts[5] = v
  })

StoreSchema.pre('save', async function (callback) {
  //completar de ser necesario
});

module.exports = mongoose.model('Store', StoreSchema);
