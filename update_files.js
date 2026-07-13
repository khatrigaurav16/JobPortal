const fs = require('fs');

const addjobHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post a Job - JobPortal</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .page-header { background: linear-gradient(135deg, var(--gray-900) 0%, var(--primary-dark) 100%); padding: 60px 0 80px; color: white; position: relative; overflow: hidden; }
        .page-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%); }
        .page-header::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 40px; background: var(--gray-900); border-radius: 50% 50% 0 0; }
        .page-header .container { position: relative; z-index: 1; }
        .page-header h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .page-header h1 i { margin-right: 12px; }
        .page-header p { opacity: 0.8; font-size: 16px; }
        .content-area { max-width: 700px; margin: -40px auto 60px; padding: 0 24px; position: relative; z-index: 2; }
        .form-card { background: var(--gray-800); border-radius: var(--radius-xl); padding: 40px; border: 1px solid var(--gray-700); }
        .form-title { font-size: 20px; font-weight: 600; color: var(--white); margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--gray-700); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
        .input-icon-wrapper { position: relative; }
        .input-icon-wrapper .input-icon { position: absolute; left: 14px; top: 14px; color: var(--gray-500); }
        .input-icon-wrapper .form-input { padding-left: 42px; }
        .input-icon-wrapper:focus-within .input-icon { color: var(--primary-light); }
        .btn-submit { width: 100%; margin-top: 16px; padding: 16px; font-size: 16px; }
        .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .warning { background: rgba(245, 158, 11, 0.15); border: 1px solid var(--warning); border-radius: var(--radius); padding: 16px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px; color: #fcd34d; }
        .warning i { color: var(--warning); }
    </style>
</head>
<body>
    <header class="nav-header"><div class="nav-container"><a href="home.html" class="nav-logo"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg><span class="text-gradient">JobPortal</span></a><nav class="nav-links"><a href="recruiterdashboard.html" class="nav-link">Dashboard</a><a href="addjob.html" class="nav-link" style="color:var(--primary-light)">Post Jobs</a><a href="managejob.html" class="nav-link">Manage Jobs</a><a href="view-applicants.html" class="nav-link">Applicants</a></nav><div class="nav-actions"><a href="recruiterdashboard.html" class="btn btn-secondary btn-sm">Back</a></div></div></header>
    <div class="page-wrapper">
        <div class="page-header"><div class="container"><h1><i class="fas fa-plus-circle"></i>Post a New Job</h1><p>Fill in the details below to post a new job listing</p></div></div>
        <div class="content-area">
            <div class="form-card">
                <div id="companyWarning" class="warning" style="display:none"><i class="fas fa-exclamation-triangle"></i><p>Your company profile is incomplete. Please <a href="recruiterdashboard.html">update your company info</a> before posting jobs.</p></div>
                <h2 class="form-title"><i class="fas fa-briefcase" style="color:var(--primary-light);margin-right:10px"></i>Job Details</h2>
                <form id="jobForm">
                    <div class="form-group"><label class="form-label"><i class="fas fa-heading" style="margin-right:6px;color:var(--primary-light)"></i>Job Title</label><div class="input-icon-wrapper"><input type="text" class="form-input" id="title" placeholder="e.g. Senior Frontend Developer" required><i class="fas fa-briefcase input-icon"></i></div></div>
                    <div class="form-group"><label class="form-label"><i class="fas fa-building" style="margin-right:6px;color:var(--primary-light)"></i>Company Name</label><div class="input-icon-wrapper"><input type="text" class="form-input" id="company" placeholder="e.g. TechCorp India" required><i class="fas fa-building input-icon"></i></div></div>
                    <div class="form-row"><div class="form-group"><label class="form-label"><i class="fas fa-map-marker-alt" style="margin-right:6px;color:var(--primary-light)"></i>Location</label><select class="form-input form-select" id="location" required><option value="">Select</option><option>Mumbai</option><option>Bangalore</option><option>Delhi</option><option>Hyderabad</option><option>Pune</option><option>Chennai</option><option>Remote</option></select></div><div class="form-group"><label class="form-label"><i class="fas fa-clock" style="margin-right:6px;color:var(--primary-light)"></i>Job Type</label><select class="form-input form-select" id="jobType" required><option value="">Select</option><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Freelance</option></select></div></div>
                    <div class="form-row"><div class="form-group"><label class="form-label"><i class="fas fa-money-bill" style="margin-right:6px;color:var(--primary-light)"></i>Salary</label><div class="input-icon-wrapper"><input type="text" class="form-input" id="salary" placeholder="e.g. 8-12 LPA"><i class="fas fa-rupee-sign input-icon"></i></div></div><div class="form-group"><label class="form-label"><i class="fas fa-chart-line" style="margin-right:6px;color:var(--primary-light)"></i>Experience</label><select class="form-input form-select" id="experience"><option value="">Any</option><option>Fresher</option><option>0-1 years</option><option>1-3 years</option><option>3-5 years</option><option>5+ years</option></select></div></div>
                    <div class="form-group"><label class="form-label"><i class="fas fa-code" style="margin-right:6px;color:var(--primary-light)"></i>Required Skills</label><div class="input-icon-wrapper"><input type="text" class="form-input" id="skills" placeholder="e.g. React, JavaScript"><i class="fas fa-code input-icon"></i></div></div>
                    <div class="form-group"><label class="form-label"><i class="fas fa-file-alt" style="margin-right:6px;color:var(--primary-light)"></i>Description</label><textarea class="form-input" id="description" rows="4" placeholder="Describe the role..." required></textarea></div>
                    <div class="form-group"><label class="form-label"><i class="fas fa-list-check" style="margin-right:6px;color:var(--primary-light)"></i>Requirements</label><textarea class="form-input" id="requirements" rows="3" placeholder="List qualifications..."></textarea></div>
                    <button type="submit" class="btn btn-primary btn-submit" id="submitBtn"><i class="fas fa-paper-plane"></i>Post Job</button>
                </form>
            </div>
        </div>
    </div>
    <div class="toast" id="toast"></div>
    <script src="js/api.js"></script>
    <script>
        function showToast(m,t){const el=document.getElementById('toast');el.textContent=m;el.className='toast '+t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000);}
        async function checkProfile(){try{const r=await apiCall('/profile/recruiter');if(!r.data||!
