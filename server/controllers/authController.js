const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, user_type: user.user_type },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { name, email, password, userType } = req.body;

        // Check if user exists
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Email already registered.' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, userType]
        );

        const user = {
            id: result.insertId,
            name,
            email,
            user_type: userType
        };

        // Create profile based on user type
        if (userType === 'student') {
            await db.query(
                'INSERT INTO student_profiles (user_id) VALUES (?)',
                [result.insertId]
            );
        } else {
            await db.query(
                'INSERT INTO recruiter_profiles (user_id) VALUES (?)',
                [result.insertId]
            );
        }

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration.' 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { email, password, userType } = req.body;

        // Get user
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password.' 
            });
        }

        const user = users[0];

        // Check if user type matches
        if (userType && user.user_type !== userType) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password.' 
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    user_type: user.user_type
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login.' 
        });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, user_type, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found.' 
            });
        }

        const user = users[0];

        // Get profile based on user type
        let profile = null;
        if (user.user_type === 'student') {
            const [profiles] = await db.query(
                'SELECT * FROM student_profiles WHERE user_id = ?',
                [user.id]
            );
            profile = profiles[0] || null;
        } else {
            const [profiles] = await db.query(
                'SELECT * FROM recruiter_profiles WHERE user_id = ?',
                [user.id]
            );
            profile = profiles[0] || null;
        }

        res.json({
            success: true,
            data: {
                ...user,
                profile
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error.' 
        });
    }
};
