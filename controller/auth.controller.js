
import User from "../models/auth.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, domain, skills } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 8 characters",
      });
    }

    // Check whether user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      domain,
      skills,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        domain: user.domain,
        skills: user.skills,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginUser = async(req,res)=>{
    try
    {
        const{email,password} = req.body
        const user = await User.findOne({email}).select('+password')
        if(!user)
        {
             return res.status(400).json({
            success: false,
            message: "Invalid Email or Password",
            });
        }
        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch)
        {
            return res.status(400).json({
            success: false,
            message: "Invalid Password",
            });

        }

        const token = jwt.sign({userId : user._id},process.env.JWT_SECRET)

        return res.status(200).json({
            success: true,
            message: "Login Successfully",
            user,
            token
            });

    }
    catch(e)
    {
        console.log(e.message)
         return res.status(500).json({
            success: false,
            message: "Internal Server Error",
           
            });

    }
}














