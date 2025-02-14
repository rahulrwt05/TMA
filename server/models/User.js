import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 🔹 Check if username or email exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res
        .status(400)
        .json({
          message: "Duplicate key error: Email or Username must be unique",
        });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};
