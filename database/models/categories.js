const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipes",
      },
    ],
  },{
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
