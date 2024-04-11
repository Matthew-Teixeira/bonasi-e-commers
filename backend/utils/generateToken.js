const jwt = require("jsonwebtoken");

const generateToken = (res, userId) => {
    const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "dev",
        sameSite: 'strict',
        maxAge: 12 * 60 * 60 * 1000
    });
};

module.exports = generateToken;