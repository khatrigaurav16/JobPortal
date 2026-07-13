const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, studentOnly, recruiterOnly } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'resume') {
            cb(null, 'uploads/resumes/');
        } else if (file.fieldname === 'logo') {
            cb(null, 'uploads/logos/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only PDF and DOC files are allowed!'));
    }
});

// Student routes
router.get('/student', auth, studentOnly, profileController.getStudentProfile);
router.put('/student', auth, studentOnly, profileController.updateStudentProfile);
router.post('/student/resume', auth, studentOnly, upload.single('resume'), profileController.uploadResume);
router.get('/saved-jobs', auth, studentOnly, profileController.getSavedJobs);
router.post('/saved-jobs', auth, studentOnly, profileController.saveJob);
router.delete('/saved-jobs/:job_id', auth, studentOnly, profileController.unsaveJob);
router.get('/saved-jobs/:job_id/check', auth, studentOnly, profileController.checkSaved);

// Recruiter routes
router.get('/recruiter', auth, recruiterOnly, profileController.getRecruiterProfile);
router.put('/recruiter', auth, recruiterOnly, profileController.updateRecruiterProfile);
router.post('/recruiter/logo', auth, recruiterOnly, upload.single('logo'), profileController.uploadCompanyLogo);

// Stats
router.get('/stats', auth, profileController.getStats);

module.exports = router;
