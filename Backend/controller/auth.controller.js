import User from "../model/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../helpers/CloudHelper.js";
export const register = async (req, res) => {
  try {
    // console.log(req.file);

    const { username, email, password, phone, role } = req.body;

    const userRole = role || "user";

    const existingUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This Email or PhoneNumber is already in use",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Plz Choose Profile photo",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { url, publicId } = await uploadToCloudinary(req.file.path);

    const addUser = new User({
      name: username,
      email,
      password: hashedPassword,
      phone,
      role: userRole,
      url,
      publicId,
    });

    await addUser.save();

    return res.status(200).json({
      success: true,
      message: "the user created",
    });
  } catch (err) {
    console.log(`This is Error ${err}`);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(409).json({
        success: false,
        message: "Wrong credentials!",
      });
    }
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return res.status(409).json({
        success: false,
        message: "Wrong credentials!",
      });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false ,sameSite:"lax"});

    req.session.user = {
      id: user._id,
      username: user.name,
      email: user.email,
      role: user.role,
    };

    req.session.save((err) => {
      if (err) {
        console.log(`session err ==> ${err}`);
        return res
          .status(500)
          .json({ success: false, message: "Failed to save session" });
      }
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone:user.phone,
          role: user.role,
          url: user.url
        },
      });
    });
  } catch (err) {
    console.log(`This is Error ${err}`);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getProfileDetails = async (req, res) => {
  const ProfileId = req.session.user?.id;
  console.log(ProfileId);
  try {
    if (!ProfileId) {
      return res.status(401).json({
        success: false,
        message: "Not Logged In",
      });
    }
    const profile = await User.findById(ProfileId);
    res.status(200).json({
      success: true,
      message: profile,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Something Gone Wrong",
    });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    const { username, email, password, phone } = req.body;

    // 1️⃣ Check if user is logged in
    if (!profileId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    // 2️⃣ Verify if the logged-in user is updating their own profile
    if (req.session.user.id !== profileId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access!" });
    }

    // 3️⃣ Find the user in the database
    const user = await User.findById(profileId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 4️⃣ Prevent updating email to an already existing one
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use!" });
      }
    }

    // 5️⃣ Prepare updated data
    let updatedData = {
      name: username || user.name,
      email: email || user.email,
      phone: phone || user.phone,
    };

    // 6️⃣ Hash password if provided
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    // 7️⃣ Handle profile image update
    if (req.file) {
      if (user.publicId) {
        await cloudinary.uploader.destroy(user.publicId);
      }
      const { url, publicId } = await uploadToCloudinary(req.file.path);
      updatedData.url = url;
      updatedData.publicId = publicId;
    }

    // 8️⃣ Update and return updated user profile
    const updatedUser = await User.findByIdAndUpdate(profileId, updatedData, {
      new: true,
    }).select("-password");

    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully!",
        user: updatedUser,
      });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    req.session.destroy();
    res.status(200).json({ message: "Logout successfully!" });
  } catch (err) {
    console.log(`This is Error ${err}`);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
