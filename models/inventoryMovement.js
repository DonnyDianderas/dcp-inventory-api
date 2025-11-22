module.exports = (mongoose) => {
  const Movement = mongoose.model(
    'inventoryMovements',
    mongoose.Schema(
      {
        product_id: { type: String, required: true },
        type: { type: String, enum: ['IN', 'OUT'], required: true }, // IN or OUT
        quantity: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        notes: { type: String },
      },
      { timestamps: true }
    )
  );

  return Movement;
};



