const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userId: {type: String},
    username: { type: String},
    password: { type: String },
    name: {type: String},
    email: {type: String},
    phone: {type: String},
    address: {type: String},
    dob: {type: String},
    nic:{type: String},
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log("Enter",enteredPassword,"This",this.password)
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



const User = mongoose.model("User", userSchema);

module.exports = User;
