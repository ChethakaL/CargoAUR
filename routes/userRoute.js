const express = require('express');
const { authUser, registerUser, getUserProfile,getAllUsers} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route("/").post(registerUser);
router.post("/login", authUser);
router.get("/profile",protect,getUserProfile);
router.get("/all",getAllUsers);
  


module.exports = router;