import mongoose from "mongoose";

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "user"],
  }
},
{
timestamps: true
}
);

const UserModel = model("Users", UserSchema);

export default UserModel;
