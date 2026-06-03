export const createCategorySchema = {
  name: { required: true, type: "string", minLength: 2 },
};

export const updateCategorySchema = {
  name: { required: true, type: "string", minLength: 2 },
};
