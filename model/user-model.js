import mongoose from "mongoose";
import validator from "validator";


const { Schema, model } = mongoose;
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Minimum length is 8 characters"],
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 0,
            minUppercase: 0,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          "Password must include at least 1 number and 1 symbol, and be at least 8 characters long",
      },
    },
    shippingAddress: {
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zip: { type: String, default: '' }
},
phone: {
  type: String,
  default: ''
},
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
favorites: [
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    size: { type: String, default: "" },
  },
],
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", UserSchema);

export default UserModel;
