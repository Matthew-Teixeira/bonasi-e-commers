const asyncHandler = require("express-async-handler");
const { User } = require("../../db/models");
const generateToken = require("../../utils/generateToken");

const getUsers = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "You got all users" });
});

const getUserProfile = asyncHandler(async (req, res) => {

});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && user.isCorrectPassword(password)) {
        generateToken(res, user._id);
        res.status(201).json({ _id: user._id, username: user.username, email: user.email });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        username,
        email,
        password
    });

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({ _id: user._id, username: user.username, email: user.email });
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: "You have successfully logged out" });
});

const updateUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "You have updated this user!" });
});

const deleteUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "You have DELETED this user!" });
});

module.exports = {
    getUsers,
    getUserProfile,
    loginUser,
    registerUser,
    logoutUser,
    updateUser,
    deleteUser
};