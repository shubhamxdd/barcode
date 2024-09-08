const User = require("../Models/User");
const bcrypt = require("bcrypt");

const crypto = require("crypto");


const generateRandomPassword = () => {
    return crypto.randomBytes(20).toString('hex').slice(0, 20);
  };
  

// Check if the user exists
const check_user = async (name) => {
  try {
    const user = await User.findOne({ name });
    if (user) {
      return { success: true, user };
    }
    return { success: false, message: "User not found" };
  } catch (error) {
    return { success: false, error };
  }
};

// Check if the password matches
const check_password = async (name, password) => {
  try {
    const { success, user } = await check_user(name);
    if (!success) return { success: false, message: "User does not exist" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return { success: true, message: "Password matches" };
    } else {
      return { success: false, message: "Invalid password" };
    }
  } catch (error) {
    return { success: false, error };
  }
};

// Create a new user
const create_user = async (name, password, role) => {
  try {
    const existingUser = await User.findOne({ name });
    console.log(existingUser)
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }
    console.log("called");

    // Generate a password if left empty
    if (!password) {
      password = generateRandomPassword();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      password: hashedPassword,
      role
    });

    await newUser.save();
    return { success: true, user: newUser };
  } catch (error) {
    console.log(error.message)
    return { success: false, error };
  }
};

// Delete a user
const delete_user = async (name) => {
  try {
    const user = await User.findOneAndDelete({ name });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return { success: true, message: "User deleted" };
  } catch (error) {
    return { success: false, error };
  }
};

// Login function
const login = async (name, password) => {
  const result = await check_password(name, password);
  if (result.success) {
    return { success: true, message: "Login successful" };
  } else {
    return { success: false, message: result.message };
  }
};


module.exports={
    check_user,check_password,create_user,delete_user,login
}