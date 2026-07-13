const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const { auth, studentOnly, recruiterOnly } = require('../middleware/auth');

router.get('/', jobController.getJobs);
router.get('/my-jobs', auth, recruiterOnly, jobController.getMyJobs);
router.get('/:id', jobController.getJob);

router.post('/', auth, recruiterOnly, [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('company').trim().notEmpty().withMessage('Company name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('job_type').isIn(['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'])
], jobController.createJob);

router.put('/:id', auth, recruiterOnly, jobController.updateJob);
router.delete('/:id', auth, recruiterOnly, jobController.deleteJob);

router.get('/:jobId/applicants', auth, recruiterOnly, applicationController.getJobApplicants);

module.exports = router;
