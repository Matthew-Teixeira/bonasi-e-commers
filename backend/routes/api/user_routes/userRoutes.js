const router = require("express").Router();
const {
    getUsers,
    getUserProfile,
    loginUser,
    registerUser,
    logoutUser,
    updateUser,
    deleteUser
} = require("../../../controllers/userControllers/userController");
const protected = require("../../../middleware/authMiddleware");

router.get("/all", protected, getUsers);
router.get("/profile", protected, getUserProfile);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.put("/profile", protected, updateUser);
router.delete("/profile", protected, deleteUser);

module.exports = router;