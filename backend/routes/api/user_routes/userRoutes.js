const router = require("express").Router();
const {
    getUsers,
    getUserProfile,
    loginUser,
    registerUser,
    logoutUser,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword
} = require("../../../controllers/userControllers/userController");
const protected = require("../../../middleware/authMiddleware");

router.get("/all", protected, getUsers);
router.get("/profile", protected, getUserProfile);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.put("/profile", protected, updateUser);
router.delete("/profile/:_id", protected, deleteUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;