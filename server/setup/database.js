const mysql = require('mysql2/promise');
require('dotenv').config();

const setupDatabase = async () => {
    let connection;
    
    try {
        // Connect without database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Connected to MySQL server...');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS jobportal`);
        await connection.query(`USE jobportal`);
        console.log('Using jobportal database...');

        // Create tables
        const tables = `
            -- Users table
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                user_type ENUM('student', 'recruiter') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_user_type (user_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            -- Student profiles table
            CREATE TABLE IF NOT EXISTS student_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE NOT NULL,
                phone VARCHAR(20),
                address VARCHAR(255),
                state VARCHAR(100),
                city VARCHAR(100),
                qualification ENUM('Second Year', 'Third Year', 'Fourth Year', 'Graduate', 'Post Graduate'),
                branch VARCHAR(100),
                skills TEXT,
                resume_path VARCHAR(255),
                resume_original_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            -- Recruiter profiles table
            CREATE TABLE IF NOT EXISTS recruiter_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE NOT NULL,
                company_name VARCHAR(200),
                company_website VARCHAR(255),
                company_size VARCHAR(50),
                industry VARCHAR(100),
                company_description TEXT,
                company_logo VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            -- Jobs table
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                recruiter_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                company VARCHAR(200) NOT NULL,
                location VARCHAR(100),
                job_type ENUM('Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance') DEFAULT 'Full-time',
                salary VARCHAR(100),
                experience VARCHAR(50),
                description TEXT,
                requirements TEXT,
                skills TEXT,
                status ENUM('active', 'closed', 'draft') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_recruiter_id (recruiter_id),
                INDEX idx_status (status),
                INDEX idx_job_type (job_type),
                INDEX idx_location (location),
                FULLTEXT INDEX idx_search (title, company, description, skills)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            -- Applications table
            CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_id INT NOT NULL,
                student_id INT NOT NULL,
                status ENUM('pending', 'under_review', 'accepted', 'rejected') DEFAULT 'pending',
                cover_letter TEXT,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_application (job_id, student_id),
                INDEX idx_job_id (job_id),
                INDEX idx_student_id (student_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            -- Saved jobs table
            CREATE TABLE IF NOT EXISTS saved_jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                job_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                UNIQUE KEY unique_saved_job (student_id, job_id),
                INDEX idx_student_id (student_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.query(tables);
        console.log('All tables created successfully!');

        console.log('\n========================================');
        console.log('Database setup complete!');
        console.log('========================================');
        console.log('\nRun "npm start" to start the server');

    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

// Run if called directly
if (require.main === module) {
    setupDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = setupDatabase;
