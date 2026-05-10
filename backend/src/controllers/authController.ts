import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import generateToken from '../utils/generateToken';
import { RequestWithUser } from '../middleware/auth';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const normalizedEmail = email.toLowerCase();
    const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    console.log('✅ User registered successfully:', normalizedEmail);

    res.status(201).json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture
      },
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      console.log('❌ User not found:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log('✅ Login successful:', normalizedEmail);

    res.json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.user?.id },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Google OAuth Placeholder
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google data',
      });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          googleId,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
        },
      });
    } else if (!user.googleId) {
      // Link googleId if user exists but registered via email
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication',
    });
  }
};
