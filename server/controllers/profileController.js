const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getStudentProfile = async (req, res) => {
    try {
        const [profiles] = await db.query(
            `SELECT u.id, u.name, u.email, u.created_at,
             sp.phone, sp.address, sp.state, sp.city, sp.qualification, sp.branch, sp.skills,
             sp.resume_path, sp.resume_original_name
             FROM users u
             LEFT JOIN student_profiles sp ON u.id = sp.user_id
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Profile not found.' 
            });
        }

        res.json({
            success: true,
            data: profiles[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching profile.' 
        });
    }
};

exports.updateStudentProfile = async (req, res) => {
    try {
        const { phone, address, state, city, qualification, branch, skills } = req.body;

        // Check if profile exists
        const [existing] = await db.query(
            'SELECT * FROM student_profiles WHERE user_id = ?',
            [req.user.id]
        );

        if (existing.length === 0) {
            await db.query(
                'INSERT INTO student_profiles (user_id, phone, address, state, city, qualification, branch, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [req.user.id, phone, address, state, city, qualification, branch, skills]
            );
        } else {
            await db.query(
                `UPDATE student_profiles SET phone = ?, address = ?, state = ?, city = ?, 
                 qualification = ?, branch = ?, skills = ? WHERE user_id = ?`,
                [phone, address, state, city, qualification, branch, skills, req.user.id]
            );
        }

        // Also update user name
        if (req.body.name) {
            await db.query('UPDATE users SET name = ? WHERE id = ?', [req.body.name, req.user.id]);
        }

        res.json({
            success: true,
            message: 'Profile updated successfully!'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error updating profile.' 
        });
    }
};

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'Please upload a file.' 
            });
        }

        const resumePath = `/uploads/resumes/${req.file.filename}`;
        const originalName = req.file.originalname;

        await db.query(
            'UPDATE student_profiles SET resume_path = ?, resume_original_name = ? WHERE user_id = ?',
            [resumePath, originalName, req.user.id]
        );

        res.json({
            success: true,
            message: 'Resume uploaded successfully!',
            data: {
                resume_path: resumePath,
                resume_original_name: originalName
            }
        });
    } catch (error) {
        console.error('Upload resume error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error uploading resume.' 
        });
    }
};

exports.getRecruiterProfile = async (req, res) => {
    try {
        const [profiles] = await db.query(
            `SELECT u.id, u.name, u.email, u.created_at,
             rp.company_name, rp.company_website, rp.company_size, rp.industry, 
             rp.company_description, rp.company_logo
             FROM users u
             LEFT JOIN recruiter_profiles rp ON u.id = rp.user_id
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Profile not found.' 
            });
        }

        res.json({
            success: true,
            data: profiles[0]
        });
    } catch (error) {
        console.error('Get recruiter profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching profile.' 
        });
    }
};

exports.updateRecruiterProfile = async (req, res) => {
    try {
        const { company_name, company_website, company_size, industry, company_description } = req.body;

        const [existing] = await db.query(
            'SELECT * FROM recruiter_profiles WHERE user_id = ?',
            [req.user.id]
        );

        if (existing.length === 0) {
            await db.query(
                'INSERT INTO recruiter_profiles (user_id, company_name, company_website, company_size, industry, company_description) VALUES (?, ?, ?, ?, ?, ?)',
                [req.user.id, company_name, company_website, company_size, industry, company_description]
            );
        } else {
            await db.query(
                `UPDATE recruiter_profiles SET company_name = ?, company_website = ?, 
                 company_size = ?, industry = ?, company_description = ? WHERE user_id = ?`,
                [company_name, company_website, company_size, industry, company_description, req.user.id]
            );
        }

        if (req.body.name) {
            await db.query('UPDATE users SET name = ? WHERE id = ?', [req.body.name, req.user.id]);
        }

        res.json({
            success: true,
            message: 'Company profile updated successfully!'
        });
    } catch (error) {
        console.error('Update recruiter profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error updating profile.' 
        });
    }
};

exports.uploadCompanyLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'Please upload a file.' 
            });
        }

        const logoPath = `/uploads/logos/${req.file.filename}`;

        await db.query(
            'UPDATE recruiter_profiles SET company_logo = ? WHERE user_id = ?',
            [logoPath, req.user.id]
        );

        res.json({
            success: true,
            message: 'Company logo uploaded successfully!',
            data: {
                company_logo: logoPath
            }
        });
    } catch (error) {
        console.error('Upload logo error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error uploading logo.' 
        });
    }
};

exports.getSavedJobs = async (req, res) => {
    try {
        const [savedJobs] = await db.query(
            `SELECT sj.id as saved_id, sj.created_at as saved_at, 
             j.*, r.company_name, r.company_logo
             FROM saved_jobs sj
             JOIN jobs j ON sj.job_id = j.id
             LEFT JOIN recruiter_profiles r ON j.recruiter_id = r.user_id
             WHERE sj.student_id = ?
             ORDER BY sj.created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: savedJobs
        });
    } catch (error) {
        console.error('Get saved jobs error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching saved jobs.' 
        });
    }
};

exports.saveJob = async (req, res) => {
    try {
        const { job_id } = req.body;

        // Check if job exists
        const [jobs] = await db.query('SELECT id FROM jobs WHERE id = ?', [job_id]);
        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found.' 
            });
        }

        // Check if already saved
        const [existing] = await db.query(
            'SELECT id FROM saved_jobs WHERE student_id = ? AND job_id = ?',
            [req.user.id, job_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Job already saved.' 
            });
        }

        await db.query(
            'INSERT INTO saved_jobs (student_id, job_id) VALUES (?, ?)',
            [req.user.id, job_id]
        );

        res.status(201).json({
            success: true,
            message: 'Job saved successfully!'
        });
    } catch (error) {
        console.error('Save job error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error saving job.' 
        });
    }
};

exports.unsaveJob = async (req, res) => {
    try {
        const { job_id } = req.params;

        await db.query(
            'DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?',
            [req.user.id, job_id]
        );

        res.json({
            success: true,
            message: 'Job removed from saved!'
        });
    } catch (error) {
        console.error('Unsave job error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error removing saved job.' 
        });
    }
};

exports.checkSaved = async (req, res) => {
    try {
        const { job_id } = req.params;

        const [saved] = await db.query(
            'SELECT id FROM saved_jobs WHERE student_id = ? AND job_id = ?',
            [req.user.id, job_id]
        );

        res.json({
            success: true,
            data: {
                saved: saved.length > 0
            }
        });
    } catch (error) {
        console.error('Check saved error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error.' 
        });
    }
};

exports.getStats = async (req, res) => {
    try {
        let stats = {};

        if (req.user.user_type === 'student') {
            const [appCount] = await db.query(
                'SELECT COUNT(*) as count FROM applications WHERE student_id = ?',
                [req.user.id]
            );
            const [savedCount] = await db.query(
                'SELECT COUNT(*) as count FROM saved_jobs WHERE student_id = ?',
                [req.user.id]
            );
            const [acceptedCount] = await db.query(
                'SELECT COUNT(*) as count FROM applications WHERE student_id = ? AND status = ?',
                [req.user.id, 'accepted']
            );
            const [pendingCount] = await db.query(
                'SELECT COUNT(*) as count FROM applications WHERE student_id = ? AND status IN (?, ?)',
                [req.user.id, 'pending', 'under_review']
            );

            stats = {
                applications: appCount[0].count,
                saved: savedCount[0].count,
                accepted: acceptedCount[0].count,
                pending: pendingCount[0].count
            };
        } else {
            const [jobCount] = await db.query(
                'SELECT COUNT(*) as count FROM jobs WHERE recruiter_id = ?',
                [req.user.id]
            );
            const [appCount] = await db.query(
                `SELECT COUNT(*) as count FROM applications a
                 JOIN jobs j ON a.job_id = j.id
                 WHERE j.recruiter_id = ?`,
                [req.user.id]
            );
            const [pendingCount] = await db.query(
                `SELECT COUNT(*) as count FROM applications a
                 JOIN jobs j ON a.job_id = j.id
                 WHERE j.recruiter_id = ? AND a.status IN (?, ?)`,
                [req.user.id, 'pending', 'under_review']
            );
            const [acceptedCount] = await db.query(
                `SELECT COUNT(*) as count FROM applications a
                 JOIN jobs j ON a.job_id = j.id
                 WHERE j.recruiter_id = ? AND a.status = ?`,
                [req.user.id, 'accepted']
            );

            stats = {
                jobs: jobCount[0].count,
                applications: appCount[0].count,
                pending: pendingCount[0].count,
                accepted: acceptedCount[0].count
            };
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching stats.' 
        });
    }
};
