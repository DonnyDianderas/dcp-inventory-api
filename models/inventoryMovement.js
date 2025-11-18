module.exports = (mongoose) => {
  const Movement = mongoose.model(
    'inventoryMovements',
    mongoose.Schema(
      {
        movement_id: Number,
        product_id: String,
        type: String, //IN or OUT
        quantity: Number,
        date: Date,
        notes: String,
      },
      { timestamps: true }
    )
  );

  return Movement;
};



