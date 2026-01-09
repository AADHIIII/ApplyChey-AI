
import { type ResumeData, type SectionVisibility } from '../types';

/**
 * Initial empty state for the resume data, populated with a generalized placeholder resume.
 */
export const initialResumeData: ResumeData = {
    name: 'Alex Doe',
    email: 'alex.doe@email.com',
    phone: '123-456-7890',
    linkedin: 'linkedin.com/in/alexdoe',
    github: 'github.com/alexdoe',
    portfolio: 'alexdoe.dev',
    summary: `Innovative Software Engineer with 4+ years of experience in building and maintaining scalable full-stack web applications. Proficient in JavaScript, Python, and cloud technologies. Passionate about creating clean, efficient code and collaborating in fast-paced, Agile environments to deliver high-quality software solutions.`,
    skills: [
        'JavaScript (React, Node.js)',
        'Python (Django, Flask)',
        'Java',
        'HTML5 & CSS3',
        'SQL & NoSQL (PostgreSQL, MongoDB)',
        'RESTful APIs',
        'Docker',
        'Amazon Web Services (AWS)',
        'CI/CD',
        'System Design',
        'Agile Methodologies'
    ],
    technologies: [
        'Git',
        'Jira',
        'Webpack',
        'Redux',
        'Kubernetes'
    ],
    coursework: [
        'Data Structures & Algorithms',
        'Object-Oriented Programming',
        'Operating Systems',
        'Database Management Systems'
    ],
    societies: [
        'ACM Chapter Member',
        'University Coding Club'
    ],
    links: [],
    experience: [
        { 
            id: `exp1`, 
            role: 'Software Engineer', 
            company: 'Tech Solutions Inc.', 
            duration: 'Jun 2021 - Present', 
            description: `- Engineered and maintained full-stack features for a SaaS platform using React and Node.js, serving over 50,000 users.\n- Developed RESTful APIs that improved data retrieval times by 30% and enhanced scalability.\n- Collaborated with a team of 5 engineers in an Agile sprint cycle to deliver new features and bug fixes, increasing team velocity by 15%.\n- Implemented a CI/CD pipeline using Jenkins and Docker, reducing deployment time from hours to minutes.\n- Wrote comprehensive unit and integration tests, improving code coverage to over 90% and reducing production bugs.`
        },
        { 
            id: `exp2`, 
            role: 'Junior Web Developer', 
            company: 'Innovate Co.', 
            duration: 'May 2020 – Jun 2021', 
            description: `- Assisted in the development of client-facing websites using HTML, CSS, and JavaScript.\n- Translated UI/UX design wireframes from Figma into responsive and interactive web pages.\n- Managed database content using SQL queries and contributed to backend API development with Python (Flask).\n- Participated in code reviews and learned best practices for software development and version control with Git.`
        },
    ],
    education: [
        { id: `edu1`, institution: 'State University', degree: 'B.S. in Computer Science', duration: '2016 - 2020' },
    ],
    internships: [],
    certifications: [
        { id: 'cert1', name: 'AWS Certified Developer - Associate', issuer: 'Amazon Web Services', date: '2022'},
    ],
    projects: [
        {
            id: 'proj1',
            name: 'E-commerce Platform',
            url: 'https://github.com/alexdoe/e-commerce-app',
            technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Redux'],
            description: 'Developed a full-stack e-commerce application featuring product listings, a shopping cart, user authentication, and a checkout process. Implemented a RESTful API for handling backend logic and data management.',
            sponsor: 'Personal Project',
            date: '2021'
        },
        {
            id: 'proj2',
            name: 'Task Management App',
            url: 'https://github.com/alexdoe/task-manager',
            technologies: ['Python', 'Django', 'PostgreSQL', 'JavaScript'],
            description: 'Built a web-based task manager that allows users to create, update, and track tasks. Features include user accounts, task categorization, and priority setting.',
            sponsor: 'Course Project',
            date: '2020'
        }
    ],
    publications: [],
    awards: [
        { id: 'award1', name: 'Dean\'s List', issuer: 'State University', date: '2018-2020'},
        { id: 'award2', name: 'Top Coder Hackathon - 1st Place', issuer: 'State University', date: '2019'}
    ],
    service: [],
};

/**
 * Initial visibility state for optional resume sections.
 */
export const initialSectionVisibility: SectionVisibility = {
    projects: true,
    certifications: true,
    publications: true,
    internships: true,
    awards: true,
    service: true,
    technologies: true,
    coursework: true,
    societies: true,
    links: true,
};