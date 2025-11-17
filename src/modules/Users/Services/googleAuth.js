import express from "express";
import { google } from "googleapis";
import User from "../../../DB/models/users.model.js";
import { generateToken } from "../../../utils/token.utils.js";

const router = express.Router();

// Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/auth/google/callback" 
);

// Generate Google login URL
router.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(url);
});

// Google callback
router.get("/auth/google/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const { email, name, id: googleId } = data;

    let user = await User.findOne({ email });

    if (!user) {
      // If the user is new, create an account
      user = new User({ name, email, googleId });
      await user.save();
    }

    // Generate JWT directly
    const accessToken = generateToken(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = generateToken(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    // Return user and tokens to the frontend
    res.status(200).json({
      message: "Logged in with Google",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log("Google login error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;