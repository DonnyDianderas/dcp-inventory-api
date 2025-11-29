module.exports = (mongoose) => {
  const Product = mongoose.model(
    'products',
    mongoose.Schema(
      {
        product_id: String,
        name: String,
        presentation: String, 
        description: String,
      },
      { timestamps: true }
    ),
    'products'
  );

  return Product;
};


