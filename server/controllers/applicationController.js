const db = require('../config/db');

exports.applyForJob = async (req, res) => {
    try {
        const { job_id } = req.body;

        // Check if job exists
        const [jobs] = await db.query(
            'SELECT * FROM jobs WHERE id = ? AND status = ?',
            [job_id, 'active']
        );

        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found or no longer accepting applications.' 
            });
        }

        // Check if already applied
        const [existing] = await db.query(
            'SELECT * FROM applications WHERE job_id = ? AND student_id = ?',
            [job_id, req.user.id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'You have already applied for this job.' 
            });
        }

        // Get student profile
        const [profiles] = await db.query(
            'SELECT * FROM student_profiles WHERE user_id = ?',
            [req.user.id]
        );

        if (profiles.length === 0 || !profiles[0].resume_path) {
            return res.status(400).json({ 
                success: false,
                message: 'Please upload your resume before applying.' 
            });
        }

        const [result] = await db.query(
            'INSERT INTO applications (job_id, student_id) VALUES (?, ?)',
            [job_id, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully!'
        });
    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error submitting application.' 
        });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const [applications] = await db.query(
            `SELECT a.*, j.title as job_title, j.company, j.location, j.salary, j.job_type,
             r.company_name, r.company_logo
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             LEFT JOIN recruiter_profiles r ON j.recruiter_id = r.user_id
             WHERE a.student_id = ?
             ORDER BY a.applied_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching applications.' 
        });
    }
};

exports.withdrawApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const [applications] = await db.query(
            'SELECT * FROM applications WHERE id = ? AND student_id = ?',
            [id, req.user.id]
        );

        if (applications.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Application not found.' 
            });
        }

        await db.query('DELETE FROM applications WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Application withdrawn successfully!'
        });
    } catch (error) {
        console.error('Withdraw error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error withdrawing application.' 
        });
    }
};

exports.getJobApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Check if job belongs to recruiter
        const [jobs] = await db.query(
            'SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?',
            [jobId, req.user.id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found or you do not have permission.' 
            });
        }

        const [applicants] = await db.query(
            `SELECT a.*, u.name, u.email, 
             sp.phone, sp.address, sp.state, sp.qualification, sp.branch, sp.skills,
             sp.resume_path, sp.resume_original_name
             FROM applications a
             JOIN users u ON a.student_id = u.id
             LEFT JOIN student_profiles sp ON u.id = sp.user_id
             WHERE a.job_id = ?
             ORDER BY a.applied_at DESC`,
            [jobId]
        );

        res.json({
            success: true,
            data: applicants
        });
    } catch (error) {
        console.error('Get applicants error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching applicants.' 
        });
    }
};

exports.getAllApplicants = async (req, res) => {
    try {
        // Get only applicants for this recruiter's jobs
        const [applicants] = await db.query(
            `SELECT a.*, u.name, u.email, 
             sp.phone, sp.address, sp.state, sp.qualification, sp.branch, sp.skills,
             sp.resume_path, sp.resume_original_name,
             j.title as job_title, j.company
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON a.student_id = u.id
             LEFT JOIN student_profiles sp ON u.id = sp.user_id
             WHERE j.recruiter_id = ?
             ORDER BY a.applied_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: applicants
        });
    } catch (error) {
        console.error('Get all applicants error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching applicants.' 
        });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'under_review', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid status.' 
            });
        }

        // Check if application belongs to recruiter's job
        const [applications] = await db.query(
            `SELECT a.* FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE a.id = ? AND j.recruiter_id = ?`,
            [id, req.user.id]
        );

        if (applications.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Application not found or you do not have permission.' 
            });
        }

        await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

        res.json({
            success: true,
            message: 'Application status updated!'
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error updating status.' 
        });
    }
};

exports.checkApplicationStatus = async (req, res) => {
    try {
        const { job_id } = req.params;

        const [applications] = await db.query(
            'SELECT * FROM applications WHERE job_id = ? AND student_id = ?',
            [job_id, req.user.id]
        );

        res.json({
            success: true,
            data: {
                applied: applications.length > 0,
                application: applications[0] || null
            }
        });
    } catch (error) {
        console.error('Check status error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error checking status.' 
        });
    }
};
