const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const generateToken = require("../generateToken");
const User = require("../models/userModel");

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const {
      userId,
      username,
      password,
      name,
      email,
      phone,
      address,
      dob,
      nic,
  } = req.body;

  if (!userId || !username || !password || !email || !phone || !address || !dob || !nic|| !name) {
      return res.status(400).json({
          message: "Please enter all the fields",
      });
  }

  const userExists = await User.findOne({ username });

  if (userExists) {
      return res.status(400).json({
          message: "User already exists",
      });
  }

  const user = await User.create({
      userId,
      username,
      password, // Use the plain-text password here, as the pre-save middleware will handle the hashing.
      name,
      email,
      phone,
      address,
      dob,
      nic,    // Add NIC field
  });

  if (user) {
      res.status(201).json({
          _id: user._id,
          userId: user.userId,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          dob: user.dob,
          nic: user.nic,          // Include NIC in the response
          token: generateToken(user._id),
      });
  }
});

  

const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    res.json({
        _id: user._id,
        userId: user.userId,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          dob: user.dob,
          nic: user.nic, 
        token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
  
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        id: user._id,
        userId: user.userId,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nic: user.nic, 
        dob: user.dob,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  });

  const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  });

    
  const getUserProfileById = asyncHandler(async (req, res) => {
    const user = await User.findOne({ userId: req.params.id });
    console.log(req.params.id)
    if (user) {
      res.json({
        userId: user.userId,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  });
  
  
module.exports = {registerUser ,authUser, getUserProfile, getAllUsers,getUserProfileById};
