-- ============================================================
-- Portfolio admin — seed content
-- Mirrors the copy already live on jayashankar-p.vercel.app.
-- Idempotent: `on conflict ... do nothing` keeps admin edits
-- if this file is ever run again.
--
-- Certificate PDFs referenced here already ship with the site
-- under assets/certificates/ (publicly served by Vercel).
-- New uploads from /admin go to Supabase Storage instead.
-- ============================================================

-- ------------------------------------------------------------
-- Projects (initial order matches the live site)
-- ------------------------------------------------------------

insert into public.projects
    (slug, name, subtitle, overview, problem, features, tech, full_tech,
     contribution_label, contribution, status, status_kind, tagline,
     live_url, github_url, featured, sort_order, is_published)
values
(
    'mediassist', 'MediAssist', 'AI-Powered Smart Medication Management System',
    array[
        'MediAssist is an ongoing Flutter-based healthcare application designed to combine medication management, artificial intelligence, prescription processing, medical report assistance, and doctor appointment services within a single mobile application.',
        'The system combines a Flutter frontend, Firebase services, and a Python FastAPI backend. A machine-learning symptom prediction model analyzes user-selected symptoms and returns a predicted disease, confidence score, disease description, precautions, medications, diet suggestions, and workout recommendations.'
    ],
    'Medication tracking, symptom analysis and doctor appointments usually live in separate tools and paperwork. MediAssist brings them together in one intelligent mobile application.',
    array[
        'AI-powered symptom analysis',
        'Machine-learning disease prediction',
        'Prescription OCR processing integration',
        'Medication reminder system',
        'Medical report interpretation',
        'Doctor discovery and appointment booking',
        'Firebase authentication and Firestore storage',
        'Flutter and REST API integration'
    ],
    array['Flutter', 'Firebase', 'Python', 'ML'],
    array['Flutter', 'Dart', 'Firebase', 'Firestore', 'Python', 'FastAPI', 'Scikit-learn', 'Machine Learning', 'REST APIs'],
    'My Contribution',
    array[
        'Leading the four-member development team',
        'Flutter application development',
        'UI/UX implementation',
        'Firebase and authentication integration',
        'Medication reminder module',
        'AI symptom analyzer development',
        'FastAPI backend integration',
        'OCR module integration',
        'System integration and final testing'
    ],
    'IN PRODUCTION', 'building', 'Currently building',
    null, null, true, 1, true
),
(
    'intervue', 'InterVue AI', 'AI-Powered Voice Interview Platform',
    array['InterVue AI is an AI-powered voice interview platform — practice interviews with an AI interviewer that listens, asks follow-ups, and scores your answers.'],
    'Interview practice usually needs a partner or static question banks. InterVue AI replaces both with a voice-driven AI interviewer that responds and follows up like a real one.',
    array['Voice-driven mock interviews', 'AI interviewer with follow-up questions', 'Automated answer scoring'],
    array['Next.js', 'AI', 'AssemblyAI', 'AWS'],
    array['Next.js', 'AI', 'Voice', 'AssemblyAI', 'AWS', 'Web'],
    'My Contribution',
    array['Designed and built the full platform', 'Voice interaction and AI interview flow', 'Deployment on AWS Amplify'],
    'LIVE', 'live', 'Deployed and running',
    'https://main.dhoxch7krfvdk.amplifyapp.com/', null, true, 2, true
),
(
    'verifyi', 'VeriFYI', 'Internship & Job Scam Detector for Students',
    array['VeriFYI is an AI-powered platform that helps students identify whether internship and job opportunities are genuine or potentially fraudulent.'],
    'Students are frequent targets of fake internship and job offers. VeriFYI gives them a fast way to check an opportunity before they commit personal data, time or money.',
    array['AI analysis of internship and job offers', 'Genuine vs potentially fraudulent classification', 'Built specifically for student safety'],
    array['AI', 'Web', 'Student Safety'],
    array['AI', 'Web', 'Student Safety'],
    'My Contribution',
    array['Designed and built the full platform', 'AI verification flow and interface', 'Deployment on AWS Amplify'],
    'LIVE', 'live', 'Deployed and running',
    'https://main.d1o8jaoxaet2sg.amplifyapp.com/', null, true, 3, true
),
(
    'imperial', 'Imperial Wheels', 'Luxury Car & Bike Rental Platform',
    array[
        'Imperial Wheels is a MERN-stack luxury car and bike rental platform designed to provide users with a modern vehicle discovery and booking experience while providing administrators with tools for managing vehicles and rental requests.',
        'The application combines React-based interfaces with Node.js and Express REST APIs, MongoDB Atlas for cloud database storage, and Nodemailer for booking-related email notifications.'
    ],
    'Browsing and booking luxury rentals usually means calls and paperwork. Imperial Wheels turns vehicle discovery, booking and approval into one clean online workflow.',
    array[
        'Luxury car and motorcycle listings',
        'Detailed vehicle information pages',
        'Vehicle image galleries',
        'Rental booking workflow',
        'Administrative dashboard',
        'Booking approval and rejection',
        'Email notification system',
        'Vehicle management operations',
        'MongoDB Atlas integration'
    ],
    array['MongoDB', 'Express.js', 'React', 'Node.js'],
    array['MongoDB', 'MongoDB Atlas', 'Express.js', 'React', 'Node.js', 'JavaScript', 'REST APIs', 'Nodemailer'],
    'Technical Implementation',
    array[
        'React component-based architecture',
        'Responsive user interfaces',
        'Node.js and Express backend',
        'RESTful API communication',
        'MongoDB database models',
        'Cloud-hosted MongoDB Atlas storage',
        'Nodemailer email notifications',
        'Administrative booking workflows'
    ],
    'LIVE', 'live', 'Deployed and running',
    'http://imperial-wheels-henna.vercel.app/',
    'https://github.com/Jayashankar369085/imperial-wheels',
    false, 4, true
),
(
    'metro', 'Bengaluru Metro Route Finder', 'Graph-Based Metro Route Discovery Application',
    array[
        'Bengaluru Metro Route Finder is a Java Swing desktop application that models metro stations and their connections using graph-based data structures.',
        'The application uses Depth First Search with recursion and backtracking to discover routes between source and destination stations. It displays route information, station count, interchange count, and calculated fares through an interactive Java Swing interface.'
    ],
    'Finding a valid route, interchange count and fare across a metro network is a classic graph problem — this application solves it interactively for the Bengaluru Metro.',
    array[
        'Source and destination station selection',
        'Graph-based metro network representation',
        'DFS route discovery',
        'Recursive backtracking',
        'Route display through Java Swing GUI',
        'Station counting',
        'Interchange detection and counting',
        'Fare calculation'
    ],
    array['Java', 'Java Swing', 'DFS', 'Graphs'],
    array['Java', 'Java Swing', 'Graphs', 'DFS', 'HashMap', 'Recursion'],
    'Technical Concepts',
    array[
        'Java Collections Framework',
        'HashMap-based graph representation',
        'Adjacency relationships',
        'Depth First Search',
        'Recursion',
        'Backtracking',
        'Java Swing GUI development',
        'Event-driven programming'
    ],
    'COMPLETED', 'done', 'Java desktop application',
    null, null, false, 5, true
),
(
    'cruzelab', 'CruzeLab', 'Interactive Car Customization Platform',
    array[
        'CruzeLab is an interactive web application centered on vehicle exploration and customization through a responsive user interface.',
        'The project combines HTML, CSS, Bootstrap, and JavaScript interfaces with PHP backend functionality and MySQL database integration through XAMPP.'
    ],
    'Exploring and customizing vehicles online is usually a static catalogue experience — CruzeLab makes it an interactive, responsive workflow backed by a real database.',
    array[
        'Vehicle exploration interface',
        'Interactive car customization workflows',
        'Responsive web layouts',
        'Interactive frontend components',
        'PHP backend functionality',
        'MySQL database integration'
    ],
    array['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
    array['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5', 'PHP', 'MySQL', 'XAMPP'],
    'Technology Stack',
    array['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5', 'PHP', 'MySQL', 'XAMPP'],
    'COMPLETED', 'done', 'Web application',
    null, 'https://github.com/Jayashankar369085/cruzelab',
    false, 6, true
),
(
    'gesture', 'Gesture-Controlled Car Infotainment', 'Touch-Free Vehicle Interface Prototype',
    array[
        'Gesture-Controlled Car Infotainment is a computer vision prototype designed to explore touch-free interaction with automotive infotainment systems.',
        'The system uses Python and MediaPipe to perform real-time hand landmark detection and gesture recognition. These gestures are mapped to controls for music, navigation, communication, and other dashboard interactions.'
    ],
    'Touching dashboard controls while driving splits attention — this prototype explores controlling music, navigation and communication touch-free with hand gestures.',
    array[
        'Real-time hand tracking',
        'Gesture recognition',
        'Touch-free interface interaction',
        'Music controls',
        'Navigation interface controls',
        'Communication controls'
    ],
    array['Python', 'MediaPipe', 'Computer Vision', 'JavaScript'],
    array['Python', 'MediaPipe', 'Computer Vision', 'Hand Landmark Detection', 'JavaScript', 'Web Interface'],
    'Technology Stack',
    array[
        'Python',
        'MediaPipe',
        'Computer Vision',
        'Hand Landmark Detection',
        'JavaScript',
        'Web Interface Development'
    ],
    'PROTOTYPE', 'done', 'Computer vision prototype',
    null, 'https://github.com/Jayashankar369085/Gesture_App',
    false, 7, true
)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Virtual experiences (job simulations only)
-- ------------------------------------------------------------

do $$
begin
if not exists (select 1 from public.experiences) then
insert into public.experiences
    (organization, title, experience_type, occurred_on, date_precision,
     description, skills, certificate_path, certificate_name,
     is_published, sort_order)
values
(
    'Deloitte', 'Data Analytics', 'Job Simulation · Forage',
    date '2026-08-30', 'day',
    'Worked on data analysis and forensic technology tasks to derive business insight.',
    array[]::text[],
    'assets/certificates/deloitte-job-simulation.pdf',
    'deloitte-job-simulation.pdf', true, 1
),
(
    'GE Aerospace', 'Explore Engineering', 'Job Simulation · Forage',
    date '2026-08-30', 'day',
    'Explore Engineering job simulation with the GE Aerospace engineering team.',
    array[]::text[],
    'assets/certificates/ge-aerospace-job-simulation.pdf',
    'ge-aerospace-job-simulation.pdf', true, 2
);
end if;
end;
$$;

-- ------------------------------------------------------------
-- Recent Highlights (certificates & participation proofs)
-- ------------------------------------------------------------

do $$
begin
if not exists (select 1 from public.highlights) then
insert into public.highlights
    (title, issuer, kind, occurred_on, date_precision, description,
     credential_id, verification_url, profile_url, project_label, project_url,
     feature, certificate_path, certificate_name, is_published, sort_order)
values
(
    'Kaggriculture — Autonomous Farming Agent', 'Kaggle', 'KAGGLE COMPETITION',
    date '2026-01-01', 'year',
    'Took part in Kaggle''s AI-agent competition — built an autonomous agent that manages a virtual farm, deciding what to plant, harvest and sell on every turn to maximise income against thousands of rival agents across the leaderboard.',
    null, null, 'https://www.kaggle.com/jayashankar369085',
    null, null, true, null, null, true, 1
),
(
    'AssemblyAI Voice Agent Hackathon', 'lablab.ai', 'HACKATHON',
    date '2026-01-01', 'year',
    'Built for AssemblyAI''s month-long Voice Agent Hackathon: InterVue AI — an AI interviewer that runs full mock interviews by voice, asks follow-ups the way a real one would, and scores every answer.',
    null, null, null,
    'INTERVUE AI', 'https://main.dhoxch7krfvdk.amplifyapp.com/',
    false, 'assets/certificates/assemblyai-voice-agent-hackathon.pdf',
    'assemblyai-voice-agent-hackathon.pdf', true, 2
),
(
    'WeMakeDevs × AWS Hackathon', 'Polaris School of Institution', 'HACKATHON',
    date '2026-01-01', 'year',
    'Hacked at the WeMakeDevs × AWS hackathon hosted at Polaris School of Institution — built VeriFYI, an AI tool that checks internship and job offers and flags the ones that look like scams before students get hurt.',
    null, null, null,
    'VERIFYI', 'https://main.d1o8jaoxaet2sg.amplifyapp.com/',
    false, 'assets/certificates/wemakedevs-aws-hackathon.pdf',
    'wemakedevs-aws-hackathon.pdf', true, 3
),
(
    'SAP Certification', 'SAP', 'CERTIFICATION',
    date '2026-01-01', 'year',
    'Finished my SAP certification — enterprise software fundamentals, core business processes, and how SAP systems hold large operations together.',
    null, null, null, null, null, false,
    'assets/certificates/sap-certification.pdf', 'sap-certification.pdf',
    true, 4
),
(
    'AWS Certification', 'Amazon Web Services', 'CERTIFICATION',
    date '2026-01-01', 'year',
    'Earned my AWS certification — cloud foundations, core services, and what it takes to deploy and run applications on AWS infrastructure.',
    null, null, null, null, null, false,
    'assets/certificates/aws-certification.pdf', 'aws-certification.pdf',
    true, 5
),
(
    'Google Cloud Computing Foundations', 'Google Cloud', 'CERTIFICATION',
    date '2025-01-01', 'year',
    'Completed the GCCF program — cloud computing basics, big data and machine learning concepts, and the core Google Cloud services everything else builds on.',
    null, null, null, null, null, false,
    'assets/certificates/gccf-certification.pdf', 'gccf-certification.pdf',
    true, 6
);
end if;
end;
$$;

-- ------------------------------------------------------------
-- Achievements
-- ------------------------------------------------------------

do $$
begin
if not exists (select 1 from public.achievements) then
insert into public.achievements
    (title, range_label, description, tag, featured, is_published, sort_order)
values
(
    'Outstanding Student', '1st Year → 3rd Year · Ongoing',
    'Recognized as an Outstanding Student every academic year — from 1st year through 3rd year so far. This recognition is associated with receiving a college scholarship.',
    'Scholarship-linked', true, true, 1
),
(
    'WebXellence — 2nd Prize', '2025',
    'Secured second place in WebXellence 2025, demonstrating web development, interface design, and problem-solving skills.',
    null, false, true, 2
),
(
    'WebXellence — 3rd Prize', '2024',
    'Secured third place in WebXellence 2024 through the development and presentation of a web-based software solution.',
    null, false, true, 3
),
(
    'JPL Cricket — Runner-Up', '2025',
    'Runner-up in the JPL Cricket Tournament — teamwork, coordination and competitive participation beyond academics.',
    null, false, true, 4
),
(
    'JPL Cricket — Runner-Up', '2026',
    'Runner-up again in the JPL Cricket Tournament — back-to-back finals with the same teamwork and competitive spirit.',
    null, false, true, 5
),
(
    'CSI Coding Challenge', 'Coding',
    'Received a consolation prize in the CSI Coding Challenge, demonstrating programming and algorithmic problem-solving skills.',
    null, false, true, 6
);
end if;
end;
$$;

-- ------------------------------------------------------------
-- Skills (grouped exactly like the live skills section)
-- ------------------------------------------------------------

do $$
begin
if not exists (select 1 from public.skills) then
insert into public.skills (name, category, category_icon, sort_order, is_published)
values
    ('HTML', 'Frontend', 'bi-window', 1, true),
    ('CSS', 'Frontend', 'bi-window', 2, true),
    ('JavaScript', 'Frontend', 'bi-window', 3, true),
    ('Bootstrap 5', 'Frontend', 'bi-window', 4, true),
    ('React', 'Frontend', 'bi-window', 5, true),
    ('Responsive Design', 'Frontend', 'bi-window', 6, true),

    ('Java', 'Programming', 'bi-code-square', 7, true),
    ('Python', 'Programming', 'bi-code-square', 8, true),
    ('C', 'Programming', 'bi-code-square', 9, true),
    ('C++', 'Programming', 'bi-code-square', 10, true),
    ('JavaScript', 'Programming', 'bi-code-square', 11, true),
    ('Dart', 'Programming', 'bi-code-square', 12, true),

    ('Node.js', 'Backend & APIs', 'bi-server', 13, true),
    ('Express.js', 'Backend & APIs', 'bi-server', 14, true),
    ('PHP', 'Backend & APIs', 'bi-server', 15, true),
    ('FastAPI', 'Backend & APIs', 'bi-server', 16, true),
    ('REST APIs', 'Backend & APIs', 'bi-server', 17, true),

    ('MySQL', 'Database & Cloud', 'bi-database', 18, true),
    ('MongoDB', 'Database & Cloud', 'bi-database', 19, true),
    ('MongoDB Atlas', 'Database & Cloud', 'bi-database', 20, true),
    ('Firebase', 'Database & Cloud', 'bi-database', 21, true),
    ('Firestore', 'Database & Cloud', 'bi-database', 22, true),

    ('Flutter', 'Mobile', 'bi-phone', 23, true),
    ('Dart', 'Mobile', 'bi-phone', 24, true),
    ('Firebase Integration', 'Mobile', 'bi-phone', 25, true),
    ('REST API Integration', 'Mobile', 'bi-phone', 26, true),

    ('Pandas', 'AI/ML & Tools', 'bi-cpu', 27, true),
    ('NumPy', 'AI/ML & Tools', 'bi-cpu', 28, true),
    ('Scikit-learn', 'AI/ML & Tools', 'bi-cpu', 29, true),
    ('TensorFlow', 'AI/ML & Tools', 'bi-cpu', 30, true),
    ('MediaPipe', 'AI/ML & Tools', 'bi-cpu', 31, true),
    ('Git', 'AI/ML & Tools', 'bi-cpu', 32, true),
    ('GitHub', 'AI/ML & Tools', 'bi-cpu', 33, true);
end if;
end;
$$;

-- ------------------------------------------------------------
-- Social links (hero + footer)
-- ------------------------------------------------------------

do $$
begin
if not exists (select 1 from public.social_links) then
insert into public.social_links (platform, label, url, sort_order, is_published)
values
    ('github',   'GitHub',   'https://github.com/Jayashankar369085', 1, true),
    ('linkedin', 'LinkedIn', 'https://www.linkedin.com/in/jayashankar-p-a67315293', 2, true),
    ('kaggle',   'Kaggle',   'https://www.kaggle.com/jayashankar369085', 3, true),
    ('leetcode', 'LeetCode', 'https://leetcode.com/u/Jayashankar-P/', 4, true),
    ('email',    'Email',    'mailto:jayashankaryt14@gmail.com', 5, true);
end if;
end;
$$;

-- ------------------------------------------------------------
-- Site settings
-- ------------------------------------------------------------

insert into public.site_settings (key, value) values
    ('contact_email', 'jayashankaryt14@gmail.com'),
    ('contact_phone', '+91 74065 52250'),
    ('resume_url', 'assets/resume/Jayashankar_resume.pdf')
on conflict (key) do nothing;

-- ============================================================
-- End of seed migration.
-- ============================================================
