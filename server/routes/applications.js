const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { auth, studentOnly, recruiterOnly } = require('../middleware/auth');

router.post('/', auth, studentOnly, applicationController.applyForJob);
router.get('/', auth, studentOnly, applicationController.getMyApplications);
router.delete('/:id', auth, studentOnly, applicationController.withdrawApplication);

router.get('/all', auth, recruiterOnly, applicationController.getAllApplicants);
router.put('/:id/status', auth, recruiterOnly, applicationController.updateApplicationStatus);

router.get('/check/:job_id', auth, studentOnly, applicationController.checkApplicationStatus);

module.exports = router;
