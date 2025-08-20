import ProductsModel from "./model/product-model.js";
import BrandModel from "./model/brand-model.js";

const fixBrands = async () => {
  const nikeBrand = await BrandModel.findOne({ name: "Nike" });
  if (!nikeBrand) return console.log("Nike brand not found");

  const result = await ProductsModel.updateMany(
    { brand: "Nike" },
    { $set: { brand: nikeBrand._id } }
  );

  console.log(`Updated ${result.modifiedCount} products to use Nike brand ID`);
};

// Call it once when server starts
fixBrands();
