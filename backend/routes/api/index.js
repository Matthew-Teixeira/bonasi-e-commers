const router = require("express").Router();
const userRoutes = require("./user_routes/userRoutes");

router.use("/user", userRoutes);

module.exports = router;