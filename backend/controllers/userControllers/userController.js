const asyncHandler = require("express-async-handler");
const { User } = require("../../db/models");
const generateToken = require("../../utils/generateToken");
const { findOneAndDelete } = require("../../db/models/User");

const getUsers = asyncHandler(async (req, res) => {
    const allUsers = await User.find();
    res.status(200).json(allUsers);
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    res.status(200).json(user);
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
    const user = await User.findById(req.user._id).select("-__v");
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } else {
        res.status(404);
        throw new Error("User could not be found");
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params._id;

    const deletedUser = await User.findByIdAndDelete(
        { _id: userId },
        { new: true }
    );
    res.status(200).json(deletedUser);
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