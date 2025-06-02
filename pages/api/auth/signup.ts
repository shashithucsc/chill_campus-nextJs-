 // pages/api/register.ts
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password, university } = req.body;

    if (!name || !email || !password || !university) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate email domain
    const allowedDomains = ['uom.lk', 'sjp.ac.lk', 'uwu.ac.lk', 'kln.ac.lk'];
    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({ message: "Only university emails are allowed" });
    }

    try {
      await connectDB();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return res.status(500).json({ message: "Database connection failed" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      university,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}
