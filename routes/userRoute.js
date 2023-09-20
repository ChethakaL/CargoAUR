const express = require('express');
const { authUser, registerUser, getUserProfile,getAllUsers,getUserProfileById} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { extractId } = require('../middleware/extractMiddleware');


const router = express.Router();

router.route("/").post(registerUser);
router.post("/login", authUser);
router.get("/profile",protect,getUserProfile);
router.get("/by/:id", getUserProfileById);
router.get("/all",getAllUsers);
  


module.exports = router;