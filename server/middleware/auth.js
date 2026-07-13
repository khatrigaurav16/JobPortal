const jwt = require('jsonwebtoken');
const db = require('../config/db');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        const token = authHeader.replace('Bearer ', '');
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from database
            const [users] = await db.query(
                'SELECT id, name, email, user_type FROM users WHERE id = ?',
                [decoded.id]
            );

            if (users.length === 0) {
                return res.status(401).json({ 
                    success: false,
                    message: 'User not found.' 
                });
            }

            req.user = users[0];
            next();
        } catch (jwtError) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid or expired token.' 
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error in authentication.' 
        });
    }
};

const studentOnly = (req, res, next) => {
    if (req.user.user_type !== 'student') {
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. Students only.' 
        });
    }
    next();
};

const recruiterOnly = (req, res, next) => {
    if (req.user.user_type !== 'recruiter') {
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. Recruiters only.' 
        });
    }
    next();
};

module.exports = { auth, studentOnly, recruiterOnly };
