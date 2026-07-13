# JobPortal - Professional Job Board Application

A full-stack job portal application built with Node.js, Express, MySQL, and vanilla JavaScript. This project is designed to be portfolio-ready and demonstrates modern web development practices.

![JobPortal](https://img.shields.io/badge/JobPortal-v1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

### For Job Seekers (Students)
- User registration and authentication with JWT
- Profile management with resume upload
- Browse and search jobs with filters
- Apply to jobs with one click
- Save jobs for later
- Track application status
- View application history

### For Recruiters
- Company profile setup
- Post new jobs with detailed requirements
- Manage existing job postings
- View and filter applicants
- Update application status (Accept/Reject/Pending)
- Application statistics dashboard

### Technical Features
- RESTful API architecture
- JWT-based authentication with bcrypt password hashing
- MySQL database with proper schema design
- File upload handling for resumes and company logos
- Input validation and error handling
- Responsive modern UI design
- Pagination for job listings
- Search and filter functionality

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MySQL
- JWT (JSON Web Tokens)
- bcryptjs (password hashing)
- express-validator

**Frontend:**
- HTML5 & CSS3
- Vanilla JavaScript (ES6+)
- Responsive design
- Modern UI components

## Project Structure

```
jobportal/
├── server/                 # Backend
│   ├── config/
│   │   └── db.js          # Database connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── applications.js
│   │   └── profile.js
│   ├── setup/
│   │   └── database.js   # Database setup script
│   ├── uploads/           # File uploads
│   │   ├── resumes/
│   │   └── logos/
│   ├── server.js          # Entry point
│   └── package.json
├── js/
│   └── api.js            # Frontend API service
├── styles.css             # Global styles
├── *.html                 # Frontend pages
├── .env.example          # Environment template
├── README.md
└── setup.html             # Database setup page
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jobportal
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=jobportal
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRE=7d
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   npm run setup-db
   ```
   
   This will:
   - Create the `jobportal` database
   - Create all required tables
   - Insert demo data (demo accounts and sample jobs)

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

6. **Open in browser**
    Navigate to: `http://localhost:3000`

## API Documentation

### Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Jobs

```
GET    /api/jobs              # List jobs (with pagination & filters)
GET    /api/jobs/:id          # Get single job
POST   /api/jobs              # Create job (recruiter only)
PUT    /api/jobs/:id          # Update job (recruiter only)
DELETE /api/jobs/:id          # Delete job (recruiter only)
GET    /api/jobs/my-jobs      # Get recruiter's jobs
```

### Applications

```
POST   /api/applications              # Apply for job
GET    /api/applications              # Get student's applications
DELETE /api/applications/:id          # Withdraw application
GET    /api/applications/all          # Get all applicants (recruiter)
PUT    /api/applications/:id/status   # Update status (recruiter)
```

### Profile

```
GET    /api/profile/student           # Get student profile
PUT    /api/profile/student           # Update student profile
POST   /api/profile/student/resume    # Upload resume
GET    /api/profile/recruiter         # Get recruiter profile
PUT    /api/profile/recruiter         # Update recruiter profile
POST   /api/profile/recruiter/logo   # Upload company logo
GET    /api/profile/saved-jobs        # Get saved jobs
POST   /api/profile/saved-jobs        # Save job
DELETE /api/profile/saved-jobs/:id    # Unsave job
GET    /api/profile/stats             # Get dashboard stats
```

## Database Schema

### Users
- `id`, `name`, `email`, `password`, `user_type`, `created_at`, `updated_at`

### Student Profiles
- `id`, `user_id`, `phone`, `address`, `state`, `city`, `qualification`, `branch`, `skills`, `resume_path`

### Recruiter Profiles
- `id`, `user_id`, `company_name`, `company_website`, `company_size`, `industry`, `company_description`

### Jobs
- `id`, `recruiter_id`, `title`, `company`, `location`, `job_type`, `salary`, `experience`, `description`, `requirements`, `skills`, `status`

### Applications
- `id`, `job_id`, `student_id`, `status`, `applied_at`, `updated_at`

### Saved Jobs
- `id`, `student_id`, `job_id`, `created_at`

## Adding to Your Resume

This project demonstrates the following skills that you can highlight:

### Backend Skills
- Node.js & Express.js REST API development
- MySQL database design and management
- JWT authentication implementation
- bcrypt password hashing
- API validation and error handling
- File upload handling

### Frontend Skills
- Responsive UI design with CSS3
- Vanilla JavaScript (ES6+)
- API integration with fetch
- Form validation
- Dynamic DOM manipulation

### Best Practices
- Clean code architecture
- RESTful API design
- Security best practices
- Git version control

## Deployment Options

### Option 1: Local (Already set up)
Run locally using `npm start` in the server directory.

### Option 2: Railway
1. Create a Railway account
2. Add a MySQL plugin
3. Deploy the server
4. Set environment variables

### Option 3: Render
1. Create Render account
2. Create Web Service
3. Add MySQL
4. Deploy

### Option 4: Heroku
1. Create Heroku app
2. Add ClearDB MySQL
3. Deploy via Git

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | jobportal |
| JWT_SECRET | Secret for JWT signing | - |
| JWT_EXPIRE | Token expiration | 7d |
| PORT | Server port | 3000 |

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check `.env` credentials
- Verify database exists

### CORS Errors
- The server is configured to allow all origins for development
- For production, update the CORS configuration in `server.js`

### File Upload Issues
- Ensure `uploads/` directory exists
- Check file size limits (default 5MB)

## License

This project is open source and available under the MIT License.

## Author

Your Name - [Your GitHub](link)

## Acknowledgments

- Design inspired by modern job portals
- Built as a learning project for full-stack development
