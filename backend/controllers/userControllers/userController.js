const asyncHandler = require("express-async-handler");
const { User, Token } = require("../../db/models");
const generateToken = require("../../utils/generateToken");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");

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

    if (user && (await user.isCorrectPassword(password))) {
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

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404);
            throw new Error("Not a valid user email");
        }

        // Delete token if exits in DB for user
        let token = await Token.findOne({ userId: user._id });

        if (token) await Token.deleteOne({ _id: token._id });

        // Create Reset Token
        let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

        // Hash token to and save to db
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Save token to user in DB
        await new Token({
            userId: user._id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * (60 * 1000) // 30 minutes
        }).save();

        // Construct reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

        // Reset Email
        const message = `
      <h2>Hello ${user.username}</h2>
      <p>You have requested a password reset.</p>
      <p>The reset link is valid for 30 minutes.</p>
      <p>Please use the link to reset your password.</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>Thank you,</p>
      <p>AppSolo Tech.</p>
      `;

        const subject = `Password Reset Request`;
        const send_to = user.email;
        const sent_from = process.env.EMAIL_USER;

        await sendEmail(subject, message, send_to, sent_from);

        res.status(200).json({ success: true, message: "Reset email sent" });
    } catch (error) {
        res.status(400).json({ success: false, message: "email could not be sent", error });
    }
}

async function resetPassword(req, res) {
    try {
      const { resetToken } = req.params;
      const { newPassword, confirmPassword } = req.body;
      console.log(newPassword, confirmPassword);
      if (!newPassword || !confirmPassword) {
        throw new Error("No Data");
      } else if (newPassword !== confirmPassword) {
        throw new Error("Passwords don't match");
      }
  
      // Hash resetToken from link then compare it to DB token
  
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
  
      // Get DB token
      const dbToken = await Token.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() }
      });
  
      if (!dbToken) {
        throw new Error("Invalid or expired reset token");
      }
  
      // Find user
      const user = await User.findOne({ _id: dbToken.userId });
  
      user.password = newPassword;
      await user.save();
  
      res.status(201).json({
        success: true,
        message: "Password reset successful. Please log in."
      });
    } catch (error) {
      res.json({
        error: error.message,
        stack: error.stack
      });
    }
  }

module.exports = {
    getUsers,
    getUserProfile,
    loginUser,
    registerUser,
    logoutUser,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword
};