export const createProductSchema = {
  title: { required: true, type: "string", minLength: 2 },
  description: { required: true, type: "string", minLength: 10 },
  price: { required: true, type: "number", min: 0 },
  stock: { required: false, type: "number", min: 0 }, // stock is optional, defaults to 0 if not provided
  category: { required: true, type: "string", minLength: 3 }, // Assuming category ID is a string
  images: { required: false, type: "object" }, // Assuming images is an array, checking type 'object' for array is a basic check
};

export const updateProductSchema = {
  title: { type: "string", minLength: 2 },
  description: { type: "string", minLength: 10 },
  price: { type: "number", min: 0 },
  stock: { type: "number", min: 0 },
  category: { type: "string", minLength: 3 },
  images: { type: "object" },
};
