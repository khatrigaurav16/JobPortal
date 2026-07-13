const db = require('../config/db');
const { validationResult } = require('express-validator');

exports.getJobs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            location, 
            job_type, 
            salary_min, 
            salary_max,
            sort = 'newest' 
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['j.status = ?'];
        let params = ['active'];

        if (search) {
            whereConditions.push('(j.title LIKE ? OR j.company LIKE ? OR j.skills LIKE ? OR j.description LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (location) {
            whereConditions.push('j.location = ?');
            params.push(location);
        }

        if (job_type) {
            whereConditions.push('j.job_type = ?');
            params.push(job_type);
        }

        const whereClause = whereConditions.join(' AND ');

        // Sorting
        let orderBy = 'j.created_at DESC';
        if (sort === 'oldest') orderBy = 'j.created_at ASC';
        else if (sort === 'salary_high') orderBy = 'CAST(SUBSTRING_INDEX(j.salary, "-", 1) AS UNSIGNED) DESC';
        else if (sort === 'salary_low') orderBy = 'CAST(SUBSTRING_INDEX(j.salary, "-", 1) AS UNSIGNED) ASC';

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM jobs j WHERE ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get jobs
        const [jobs] = await db.query(
            `SELECT j.*, r.company_name, r.company_logo 
             FROM jobs j 
             LEFT JOIN recruiter_profiles r ON j.recruiter_id = r.user_id 
             WHERE ${whereClause} 
             ORDER BY ${orderBy} 
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: {
                jobs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching jobs.' 
        });
    }
};

exports.getJob = async (req, res) => {
    try {
        const { id } = req.params;

        const [jobs] = await db.query(
            `SELECT j.*, r.company_name, r.company_website, r.company_description, r.company_logo 
             FROM jobs j 
             LEFT JOIN recruiter_profiles r ON j.recruiter_id = r.user_id 
             WHERE j.id = ?`,
            [id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found.' 
            });
        }

        res.json({
            success: true,
            data: jobs[0]
        });
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching job.' 
        });
    }
};

exports.createJob = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { 
            title, company, location, job_type, salary, 
            experience, description, requirements, skills 
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO jobs (recruiter_id, title, company, location, job_type, salary, experience, description, requirements, skills) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, title, company, location, job_type, salary, experience, description, requirements, skills]
        );

        const [newJob] = await db.query('SELECT * FROM jobs WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Job posted successfully!',
            data: newJob[0]
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error creating job.' 
        });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const [jobs] = await db.query(
            'SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?',
            [id, req.user.id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found or you do not have permission to edit it.' 
            });
        }

        const { 
            title, company, location, job_type, salary, 
            experience, description, requirements, skills, status 
        } = req.body;

        await db.query(
            `UPDATE jobs SET title = ?, company = ?, location = ?, job_type = ?, 
             salary = ?, experience = ?, description = ?, requirements = ?, skills = ?, status = ? 
             WHERE id = ?`,
            [title, company, location, job_type, salary, experience, description, requirements, skills, status || 'active', id]
        );

        const [updatedJob] = await db.query('SELECT * FROM jobs WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Job updated successfully!',
            data: updatedJob[0]
        });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error updating job.' 
        });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const [jobs] = await db.query(
            'SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?',
            [id, req.user.id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found or you do not have permission to delete it.' 
            });
        }

        await db.query('DELETE FROM jobs WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Job deleted successfully!'
        });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error deleting job.' 
        });
    }
};

exports.getMyJobs = async (req, res) => {
    try {
        const [jobs] = await db.query(
            `SELECT j.*, 
             (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count 
             FROM jobs j 
             WHERE j.recruiter_id = ? 
             ORDER BY j.created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: jobs
        });
    } catch (error) {
        console.error('Get my jobs error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching your jobs.' 
        });
    }
};
