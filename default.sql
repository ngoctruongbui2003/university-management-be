-- Create academic years
INSERT INTO uni_test.academic_years (year, start_date, end_date, status, created_at, updated_at)
VALUES
(2023, '2023-09-10', '2024-06-30', 'Closed',  NOW(6), NOW(6)),
(2024, '2024-09-10', '2025-06-30', 'Closed',  NOW(6), NOW(6)),
(2025, '2025-09-10', '2026-06-30', 'Active', NOW(6), NOW(6));

-------------------------------------
-- Create faculty
INSERT INTO uni_test.faculties (name, dean, contact_info, created_at, updated_at, code)
VALUES
('Faculty of Computer Science', 'Dr. John Smith', 'Email: cs@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), '1'),
('Faculty of Engineering', 'Prof. Michael Johnson', 'Email: eng@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), '2'),
('Faculty of Business Administration', 'Dr. Sarah Williams', 'Email: ba@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), '3'),
('Faculty of Medicine', 'Prof. Robert Brown', 'Email: med@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), '4'),
('Faculty of Law', 'Dr. Emily Davis', 'Email: law@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), '5'),
('Faculty of Education', 'Dr. David Wilson', 'Email: edu@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), '6'),
('Faculty of Arts and Humanities', 'Prof. Linda Martinez', 'Email: arts@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), '7'),
('Faculty of Social Sciences', 'Dr. James Taylor', 'Email: ss@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), '8'),
('Faculty of Science', 'Prof. Barbara Anderson', 'Email: sci@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), '9'),
('Faculty of Agriculture', 'Dr. William Thomas', 'Email: agri@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), 'A'),
('Faculty of Architecture', 'Dr. Patricia Harris', 'Email: arch@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), 'B'),
('Faculty of Environmental Studies', 'Prof. Charles Clark', 'Email: env@kitetech.edu | Phone: 0123456789', NOW(6), NOW(6), 'C');

-------------------------------------
-- Create major
INSERT INTO uni_test.majors (name, code, description, faculty_id, created_at, updated_at)
VALUES
-- Faculty of Computer Science (id=1)
('Software Engineering', 'SE', 'Major in software development, testing, and project management.', 1, NOW(6), NOW(6)),
('Artificial Intelligence', 'AI', 'Major in AI, machine learning, and data science.', 1, NOW(6), NOW(6)),
('Information Security', 'IS', 'Focus on cybersecurity, encryption, and network protection.', 1, NOW(6), NOW(6)),
('Data Science', 'DS', 'Study of big data, statistics, and analytics.', 1, NOW(6), NOW(6)),

-- Faculty of Engineering (id=2)
('Civil Engineering', 'CE', 'Infrastructure, construction, and urban planning.', 2, NOW(6), NOW(6)),
('Mechanical Engineering', 'ME', 'Machines, manufacturing, and robotics.', 2, NOW(6), NOW(6)),
('Electrical Engineering', 'EE', 'Power systems, electronics, and circuits.', 2, NOW(6), NOW(6)),
('Chemical Engineering', 'CHE', 'Chemical processes and industrial production.', 2, NOW(6), NOW(6)),

-- Faculty of Business Administration (id=3)
('Marketing', 'MKT', 'Market research, branding, and advertising.', 3, NOW(6), NOW(6)),
('Finance & Banking', 'FB', 'Corporate finance, banking, and investments.', 3, NOW(6), NOW(6)),
('Human Resource Management', 'HRM', 'Managing people, organizations, and talent development.', 3, NOW(6), NOW(6)),
('International Business', 'IB', 'Global trade, export/import, and multinational management.', 3, NOW(6), NOW(6)),

-- Faculty of Medicine (id=4)
('General Medicine', 'MED', 'Human health, diagnosis, and treatment.', 4, NOW(6), NOW(6)),
('Pharmacy', 'PHAR', 'Drugs, pharmacology, and patient care.', 4, NOW(6), NOW(6)),
('Nursing', 'NUR', 'Patient care and clinical support.', 4, NOW(6), NOW(6)),
('Dentistry', 'DEN', 'Oral health and dental surgery.', 4, NOW(6), NOW(6)),

-- Faculty of Law (id=5)
('International Law', 'IL', 'International regulations and treaties.', 5, NOW(6), NOW(6)),
('Business Law', 'BL', 'Corporate and commercial law.', 5, NOW(6), NOW(6)),
('Criminal Law', 'CL', 'Criminal justice and legal systems.', 5, NOW(6), NOW(6)),
('Environmental Law', 'EL', 'Law for environmental protection and sustainability.', 5, NOW(6), NOW(6)),

-- Faculty of Education (id=6)
('Primary Education', 'PE', 'Teaching children at elementary level.', 6, NOW(6), NOW(6)),
('Early Childhood Education', 'ECE', 'Preschool and kindergarten teaching.', 6, NOW(6), NOW(6)),
('Educational Management', 'EM', 'School leadership and administration.', 6, NOW(6), NOW(6)),
('Special Education', 'SEDU', 'Teaching students with special needs.', 6, NOW(6), NOW(6)),

-- Faculty of Arts & Humanities (id=7)
('English Literature', 'ELIT', 'Study of English and world literature.', 7, NOW(6), NOW(6)),
('History', 'HIS', 'World history, culture, and civilizations.', 7, NOW(6), NOW(6)),
('Philosophy', 'PHIL', 'Human thought, ethics, and reasoning.', 7, NOW(6), NOW(6)),
('Linguistics', 'LING', 'Study of languages and communication.', 7, NOW(6), NOW(6)),

-- Faculty of Social Sciences (id=8)
('Psychology', 'PSY', 'Human mind and behavior.', 8, NOW(6), NOW(6)),
('Sociology', 'SOC', 'Study of society and social structures.', 8, NOW(6), NOW(6)),
('Political Science', 'POL', 'Governments, policies, and politics.', 8, NOW(6), NOW(6)),
('Anthropology', 'ANTH', 'Human cultures and evolution.', 8, NOW(6), NOW(6)),

-- Faculty of Science (id=9)
('Mathematics', 'MATH', 'Pure and applied mathematics.', 9, NOW(6), NOW(6)),
('Physics', 'PHY', 'Fundamental laws of nature.', 9, NOW(6), NOW(6)),
('Chemistry', 'CHEM', 'Matter, reactions, and materials.', 9, NOW(6), NOW(6)),
('Biology', 'BIO', 'Living organisms and ecosystems.', 9, NOW(6), NOW(6)),

-- Faculty of Agriculture (id=10)
('Agronomy', 'AGR', 'Crop production and soil science.', 10, NOW(6), NOW(6)),
('Animal Science', 'ANS', 'Livestock and veterinary studies.', 10, NOW(6), NOW(6)),
('Food Technology', 'FT', 'Food safety, processing, and nutrition.', 10, NOW(6), NOW(6)),
('Agricultural Economics', 'AGE', 'Economics of farming and agribusiness.', 10, NOW(6), NOW(6)),

-- Faculty of Architecture (id=11)
('Architecture', 'ARCH', 'Building design and urban planning.', 11, NOW(6), NOW(6)),
('Interior Design', 'ID', 'Design of living and working spaces.', 11, NOW(6), NOW(6)),
('Landscape Architecture', 'LAND', 'Design of outdoor environments.', 11, NOW(6), NOW(6)),

-- Faculty of Environmental Studies (id=12)
('Environmental Science', 'ENV', 'Sustainability and ecosystems.', 12, NOW(6), NOW(6)),
('Climate Studies', 'CLIM', 'Research on climate and global warming.', 12, NOW(6), NOW(6)),
('Renewable Energy', 'RE', 'Solar, wind, and green energy systems.', 12, NOW(6), NOW(6));




-------------------------------------
-- Thêm công thức
INSERT INTO uni_test.grading_formulas (name, description, created_at, updated_at)
VALUES
('Normal formula', '30% coursework (QT1, QT2), 20% midterm, 50% final exam', NOW(6), NOW(6)),
('Phylosophy formula', '30% coursework (QT1, QT2), 20% midterm, 50% final exam', NOW(6), NOW(6));

-- Thêm các loại điểm cho Formula 1
INSERT INTO uni_test.grade_types (grading_formula_id, gradeType, weight, description, created_at, updated_at)
VALUES
(1, 'QT1', 10.00, 'Coursework test 1', NOW(6), NOW(6)),
(1, 'QT2', 20.00, 'Coursework test 2', NOW(6), NOW(6)),
(1, 'GK', 20.00, 'Midterm exam', NOW(6), NOW(6)),
(1, 'CK', 50.00, 'Final exam', NOW(6), NOW(6));

-- Thêm các loại điểm cho Formula 2
INSERT INTO uni_test.grade_types (grading_formula_id, gradeType, weight, description, created_at, updated_at)
VALUES
(2, 'QT1', 30.00, 'Coursework assessment', NOW(6), NOW(6)),
(1, 'QT2', 0, 'Coursework test 2', NOW(6), NOW(6)),
(2, 'GK', 20.00, 'Midterm exam', NOW(6), NOW(6)),
(2, 'CK', 50.00, 'Final exam', NOW(6), NOW(6));


----- Subjects
INSERT INTO uni_test.subjects (name, credits, description, grading_formula_id, faculty_id, created_at, updated_at)
VALUES
-- Faculty of Computer Science (id = 1) - nhiều môn
('Introduction to Programming', 3, 'Fundamentals of programming using C language.', 1, 1, NOW(6), NOW(6)),
('Data Structures and Algorithms', 4, 'Study of data organization and algorithm design.', 1, 1, NOW(6), NOW(6)),
('Database Systems', 3, 'Relational databases, SQL, and normalization.', 1, 1, NOW(6), NOW(6)),
('Operating Systems', 3, 'Principles of OS, processes, and memory management.', 2, 1, NOW(6), NOW(6)),
('Computer Networks', 3, 'Networking models, TCP/IP, routing and switching.', 1, 1, NOW(6), NOW(6)),
('Software Engineering', 3, 'Software development life cycle and methodologies.', 1, 1, NOW(6), NOW(6)),
('Artificial Intelligence', 3, 'Introduction to AI, search, and knowledge representation.', 1, 1, NOW(6), NOW(6)),
('Machine Learning', 3, 'Supervised and unsupervised learning algorithms.', 1, 1, NOW(6), NOW(6)),
('Web Development', 3, 'Frontend and backend web technologies.', 2, 1, NOW(6), NOW(6)),
('Mobile Application Development', 3, 'Building Android/iOS apps.', 2, 1, NOW(6), NOW(6)),
('Cybersecurity Fundamentals', 3, 'Basic principles of system and network security.', 1, 1, NOW(6), NOW(6)),
('Cloud Computing', 3, 'Cloud infrastructure and services (AWS, Azure, GCP).', 1, 1, NOW(6), NOW(6)),

-- Faculty of Engineering (id = 2)
('Engineering Mathematics', 3, 'Applied mathematics for engineering.', 2, 2, NOW(6), NOW(6)),
('Thermodynamics', 3, 'Principles of energy and heat transfer.', 1, 2, NOW(6), NOW(6)),

-- Faculty of Business Administration (id = 3)
('Principles of Management', 3, 'Basics of organizational management.', 2, 3, NOW(6), NOW(6)),
('Financial Accounting', 3, 'Accounting principles and financial reports.', 1, 3, NOW(6), NOW(6)),

-- Faculty of Medicine (id = 4)
('Human Anatomy', 4, 'Structure of the human body.', 2, 4, NOW(6), NOW(6)),
('Pharmacology', 3, 'Study of drugs and their effects.', 1, 4, NOW(6), NOW(6)),

-- Faculty of Law (id = 5)
('Introduction to Law', 3, 'Fundamentals of legal systems.', 1, 5, NOW(6), NOW(6)),
('International Business Law', 3, 'Legal aspects of international business.', 2, 5, NOW(6), NOW(6)),

-- Faculty of Science (id = 9)
('Calculus I', 3, 'Differential and integral calculus.', 1, 9, NOW(6), NOW(6)),
('General Physics', 3, 'Mechanics, waves, and thermodynamics.', 2, 9, NOW(6), NOW(6));

---- Semester
INSERT INTO uni_test.semesters (academic_year_id, name, start_date, end_date, status, description, created_at, updated_at)
VALUES
-- Năm học 2024–2025
(2, 'Fall 2024', '2024-09-01', '2025-01-15', 'Closed', 'First semester of academic year 2024–2025', NOW(6), NOW(6)),
(2, 'Spring 2025', '2025-02-01', '2025-06-15', 'Closed', 'Second semester of academic year 2024–2025', NOW(6), NOW(6)),
(2, 'Summer 2025', '2025-07-01', '2025-08-15', 'Closed', 'Optional summer semester', NOW(6), NOW(6)),

-- Năm học 2025–2026
(3, 'Fall 2025', '2025-09-01', '2026-01-15', 'Active', 'First semester of academic year 2025–2026', NOW(6), NOW(6)),
(3, 'Spring 2026', '2026-02-01', '2026-06-15', 'Active', 'Second semester of academic year 2025–2026', NOW(6), NOW(6)),
(3, 'Summer 2026', '2026-07-01', '2026-08-15', 'Active', 'Optional summer semester', NOW(6), NOW(6));

-------------------------------------
INSERT INTO uni_test.classes (class_code, description, academic_year, major_id, created_at, updated_at)
VALUES
-- ===== Khóa 2023 =====
('23010101', 'Class of 2023, Computer Science Group 1', 2023, 1, NOW(6), NOW(6)),
('23010102', 'Class of 2023, Computer Science Group 2', 2023, 1, NOW(6), NOW(6)),
('23010201', 'Class of 2023, Information Technology Group 1', 2023, 2, NOW(6), NOW(6)),
('23010301', 'Class of 2023, Software Engineering Group 1', 2023, 3, NOW(6), NOW(6)),
('23010401', 'Class of 2023, Data Science Group 1', 2023, 4, NOW(6), NOW(6)),
('23010501', 'Class of 2023, Business Administration Group 1', 2023, 5, NOW(6), NOW(6)),
('23010601', 'Class of 2023, Accounting Group 1', 2023, 6, NOW(6), NOW(6)),
('23010701', 'Class of 2023, English Language Group 1', 2023, 7, NOW(6), NOW(6)),
('23010801', 'Class of 2023, Marketing Group 1', 2023, 8, NOW(6), NOW(6)),

-- ===== Khóa 2024 =====
('24010101', 'Class of 2024, Computer Science Group 1', 2024, 1, NOW(6), NOW(6)),
('24010102', 'Class of 2024, Computer Science Group 2', 2024, 1, NOW(6), NOW(6)),
('24010201', 'Class of 2024, Information Technology Group 1', 2024, 2, NOW(6), NOW(6)),
('24010301', 'Class of 2024, Software Engineering Group 1', 2024, 3, NOW(6), NOW(6)),
('24010401', 'Class of 2024, Data Science Group 1', 2024, 4, NOW(6), NOW(6)),
('24010501', 'Class of 2024, Business Administration Group 1', 2024, 5, NOW(6), NOW(6)),
('24010601', 'Class of 2024, Accounting Group 1', 2024, 6, NOW(6), NOW(6)),
('24010701', 'Class of 2024, English Language Group 1', 2024, 7, NOW(6), NOW(6)),
('24010801', 'Class of 2024, Marketing Group 1', 2024, 8, NOW(6), NOW(6)),

-- ===== Khóa 2025 =====
('25010101', 'Class of 2025, Computer Science Group 1', 2025, 1, NOW(6), NOW(6)),
('25010102', 'Class of 2025, Computer Science Group 2', 2025, 1, NOW(6), NOW(6)),
('25010201', 'Class of 2025, Information Technology Group 1', 2025, 2, NOW(6), NOW(6)),
('25010301', 'Class of 2025, Software Engineering Group 1', 2025, 3, NOW(6), NOW(6)),
('25010401', 'Class of 2025, Data Science Group 1', 2025, 4, NOW(6), NOW(6)),
('25010501', 'Class of 2025, Business Administration Group 1', 2025, 5, NOW(6), NOW(6)),
('25010601', 'Class of 2025, Accounting Group 1', 2025, 6, NOW(6), NOW(6)),
('25010701', 'Class of 2025, English Language Group 1', 2025, 7, NOW(6), NOW(6)),
('25010801', 'Class of 2025, Marketing Group 1', 2025, 8, NOW(6), NOW(6));


-- Students
INSERT INTO uni_test.students (full_name, email, phone, address, gender, birth_date, class_id, student_code)
VALUES
('Nguyễn Văn An', 'an.nguyen2025@example.com', '0912000001', 'TP Hồ Chí Minh', 1, '2005-05-12', 51, '12500001'),
('Trần Thị Bình', 'binh.tran2025@example.com', '0912000002', 'Long An', 0, '2005-08-21', 51, '12500002'),
('Lê Văn Cường', 'cuong.le2025@example.com', '0912000003', 'Gia Lai', 1, '2005-03-19', 51, '12500003'),
('Phạm Thị Dung', 'dung.pham2025@example.com', '0912000004', 'Bình Định', 0, '2005-11-02', 51, '12500004'),
('Hoàng Văn Dũng', 'dung.hoang2025@example.com', '0912000005', 'Quảng Ngãi', 1, '2005-06-17', 51, '12500005'),
('Ngô Thị Hoa', 'hoa.ngo2025@example.com', '0912000006', 'TP Hồ Chí Minh', 0, '2005-07-23', 51, '12500006'),
('Đỗ Văn Hùng', 'hung.do2025@example.com', '0912000007', 'Đà Nẵng', 1, '2005-09-15', 51, '12500007'),
('Bùi Thị Hương', 'huong.bui2025@example.com', '0912000008', 'Vũng Tàu', 0, '2005-04-30', 51, '12500008'),
('Nguyễn Văn Khánh', 'khanh.nguyen2025@example.com', '0912000009', 'TP Hồ Chí Minh', 1, '2005-12-25', 51, '12500009'),
('Phan Thị Lan', 'lan.phan2025@example.com', '0912000010', 'Hải Dương', 0, '2005-01-20', 51, '12500010'),

('Trần Văn Long', 'long.tran2025@example.com', '0912000011', 'Ninh Bình', 1, '2005-02-12', 51, '12500011'),
('Lê Thị Mai', 'mai.le2025@example.com', '0912000012', 'Quảng Ninh', 0, '2005-03-05', 51, '12500012'),
('Nguyễn Văn Minh', 'minh.nguyen2025@example.com', '0912000013', 'TP Hồ Chí Minh', 1, '2005-04-28', 51, '12500013'),
('Hoàng Thị Nga', 'nga.hoang2025@example.com', '0912000014', 'Hà Tĩnh', 0, '2005-05-14', 51, '12500014'),
('Phạm Văn Nam', 'nam.pham2025@example.com', '0912000015', 'Quảng Ngãi', 1, '2005-06-01', 51, '12500015'),
('Đinh Thị Ngọc', 'ngoc.dinh2025@example.com', '0912000016', 'Bình Định', 0, '2005-07-19', 51, '12500016'),
('Ngô Văn Phát', 'phat.ngo2025@example.com', '0912000017', 'TP Hồ Chí Minh', 1, '2005-08-27', 51, '12500017'),
('Vũ Thị Phương', 'phuong.vu2025@example.com', '0912000018', 'Long An', 0, '2005-09-09', 51, '12500018'),
('Nguyễn Văn Quân', 'quan.nguyen2025@example.com', '0912000019', 'Gia Lai', 1, '2005-10-12', 51, '12500019'),
('Trần Thị Quỳnh', 'quynh.tran2025@example.com', '0912000020', 'TP Hồ Chí Minh', 0, '2005-11-30', 51, '12500020'),

('Lê Văn Sơn', 'son.le2025@example.com', '0912000021', 'Đà Nẵng', 1, '2005-12-18', 51, '12500021'),
('Phạm Thị Thanh', 'thanh.pham2025@example.com', '0912000022', 'Bình Định', 0, '2005-01-25', 51, '12500022'),
('Hoàng Văn Thành', 'thanh.hoang2025@example.com', '0912000023', 'Quảng Ngãi', 1, '2005-02-08', 51, '12500023'),
('Đỗ Thị Thảo', 'thao.do2025@example.com', '0912000024', 'TP Hồ Chí Minh', 0, '2005-03-11', 51, '12500024'),
('Nguyễn Văn Thịnh', 'thinh.nguyen2025@example.com', '0912000025', 'TP Hồ Chí Minh', 1, '2005-04-17', 51, '12500025'),
('Bùi Thị Thu', 'thu.bui2025@example.com', '0912000026', 'Hải Dương', 0, '2005-05-29', 51, '12500026'),
('Trần Văn Tiến', 'tien.tran2025@example.com', '0912000027', 'TP Hồ Chí Minh', 1, '2005-06-07', 51, '12500027'),
('Nguyễn Thị Trang', 'trang.nguyen2025@example.com', '0912000028', 'TP Hồ Chí Minh', 0, '2005-07-14', 51, '12500028'),
('Phạm Văn Trường', 'truong.pham2025@example.com', '0912000029', 'Quảng Ngãi', 1, '2005-08-02', 51, '12500029'),
('Hoàng Thị Tâm', 'tam.hoang2025@example.com', '0912000030', 'Gia Lai', 0, '2005-09-20', 51, '12500030'),

('Nguyễn Văn Việt', 'viet.nguyen2025@example.com', '0912000031', 'TP Hồ Chí Minh', 1, '2005-10-05', 51, '12500031'),
('Trần Thị Vân', 'van.tran2025@example.com', '0912000032', 'Bình Định', 0, '2005-11-11', 51, '12500032'),
('Lê Văn Vũ', 'vu.le2025@example.com', '0912000033', 'Long An', 1, '2005-12-01', 51, '12500033'),
('Phạm Thị Xuân', 'xuan.pham2025@example.com', '0912000034', 'Đà Nẵng', 0, '2005-01-09', 51, '12500034'),
('Hoàng Văn Yên', 'yen.hoang2025@example.com', '0912000035', 'Gia Lai', 1, '2005-02-15', 51, '12500035'),
('Đinh Thị Yến', 'yen.dinh2025@example.com', '0912000036', 'TP Hồ Chí Minh', 0, '2005-03-27', 51, '12500036'),
('Nguyễn Văn Hải', 'hai.nguyen2025@example.com', '0912000037', 'TP Hồ Chí Minh', 1, '2005-04-13', 51, '12500037'),
('Trần Thị Hạnh', 'hanh.tran2025@example.com', '0912000038', 'Long An', 0, '2005-05-21', 51, '12500038'),
('Phạm Văn Lộc', 'loc.pham2025@example.com', '0912000039', 'Bình Định', 1, '2005-06-16', 51, '12500039'),
('Ngô Thị Loan', 'loan.ngo2025@example.com', '0912000040', 'TP Hồ Chí Minh', 0, '2005-07-08', 51, '12500040'),

('Nguyễn Văn Đức', 'duc.nguyen2025@example.com', '0912000041', 'TP Hồ Chí Minh', 1, '2005-08-12', 51, '12500041'),
('Trần Thị Giang', 'giang.tran2025@example.com', '0912000042', 'Ninh Bình', 0, '2005-09-07', 51, '12500042'),
('Phạm Văn Hòa', 'hoa.pham2025@example.com', '0912000043', 'Long An', 1, '2005-10-23', 51, '12500043'),
('Nguyễn Thị Hồng', 'hong.nguyen2025@example.com', '0912000044', 'Gia Lai', 0, '2005-11-19', 51, '12500044'),
('Lê Văn Khoa', 'khoa.le2025@example.com', '0912000045', 'TP Hồ Chí Minh', 1, '2005-12-29', 51, '12500045'),
('Vũ Thị Kim', 'kim.vu2025@example.com', '0912000046', 'TP Hồ Chí Minh', 0, '2005-01-03', 51, '12500046'),
('Nguyễn Văn Lâm', 'lam.nguyen2025@example.com', '0912000047', 'Bình Định', 1, '2005-02-21', 51, '12500047'),
('Hoàng Thị Liên', 'lien.hoang2025@example.com', '0912000048', 'Quảng Ngãi', 0, '2005-03-18', 51, '12500048'),
('Phạm Văn Tùng', 'tung.pham2025@example.com', '0912000049', 'TP Hồ Chí Minh', 1, '2005-04-07', 51, '12500049'),
('Trần Thị Hậu', 'hau.tran2025@example.com', '0912000050', 'TP Hồ Chí Minh', 0, '2005-05-15', 51, '12500050'),

('Nguyễn Đạt Khương', 'nguyendatkhuong@example.com', '0912000050', 'Cần Thơ', 1, '2005-05-15', 51, '12500051'),
('Bùi Ngọc Trường', 'ngoctruongbui@example.com', '0912000050', 'Quảng Ngãi', 1, '2005-05-15', 51, '12500052');

-- User
INSERT INTO uni_test.users (username, password, role, full_name, email, isActive, isDeleted, created_at, updated_at) VALUES
('12500001', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Văn An', '12500001@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500002', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Trần Thị Bình', '12500002@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500003', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Lê Văn Cường', '12500003@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500004', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Phạm Thị Dung', '12500004@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500005', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Hoàng Văn Dũng', '12500005@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500006', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Ngô Thị Hoa', '12500006@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500007', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Đỗ Văn Hùng', '12500007@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500008', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Bùi Thị Hương', '12500008@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500009', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Văn Khánh', '12500009@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500010', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Phan Thị Lan', '12500010@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500011', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Trần Văn Long', '12500011@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500012', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Lê Thị Mai', '12500012@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500013', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Văn Minh', '12500013@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500014', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Hoàng Thị Nga', '12500014@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500015', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Phạm Văn Nam', '12500015@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500016', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Đinh Thị Ngọc', '12500016@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500017', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Ngô Văn Phát', '12500017@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500018', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Vũ Thị Phương', '12500018@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500019', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Văn Quân', '12500019@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500020', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Trần Thị Quỳnh', '12500020@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500021', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Lê Văn Sơn', '12500021@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500022', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Phạm Thị Thanh', '12500022@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500023', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Hoàng Văn Thành', '12500023@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500024', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Đỗ Thị Thảo', '12500024@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500025', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Văn Thịnh', '12500025@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500026', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Bùi Thị Thu', '12500026@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500027', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Trần Văn Tiến', '12500027@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500028', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Thị Trang', '12500028@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500029', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Phạm Văn Trường', '12500029@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500030', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Hoàng Thị Tâm', '12500030@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500031', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Văn Việt', '12500031@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500032', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Trần Thị Vân', '12500032@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500033', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Lê Văn Vũ', '12500033@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500034', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Phạm Thị Xuân', '12500034@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500035', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Hoàng Văn Yên', '12500035@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500036', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Đinh Thị Yến', '12500036@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500037', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Văn Hải', '12500037@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500038', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Trần Thị Hạnh', '12500038@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500039', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Phạm Văn Lộc', '12500039@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500040', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Ngô Thị Loan', '12500040@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500041', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Văn Đức', '12500041@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500042', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Trần Thị Giang', '12500042@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500043', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Phạm Văn Hòa', '12500043@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500044', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Thị Hồng', '12500044@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500045', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Lê Văn Khoa', '12500045@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500046', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Vũ Thị Kim', '12500046@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500047', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Văn Lâm', '12500047@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500048', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Hoàng Thị Liên', '12500048@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500049', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Phạm Văn Tùng', '12500049@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500050', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Trần Thị Hậu', '12500050@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500051', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Nguyễn Đạt Khương', '12500051@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('12500052', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Student', 'Bùi Ngọc Trường', '12500052@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- Teacher
INSERT INTO uni_test.teachers (full_name, email, phone, address, gender, birth_date, qualification, department, faculty_id, created_at, updated_at) VALUES
('Nguyễn Văn Hùng', 'hung.nguyen@kitetech.edu.vn', '0903000001', 'TP Hồ Chí Minh', 1, '1975-03-15', 'Tiến sĩ', 'Công nghệ Thông tin', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Trần Thị Lan', 'lan.tran@kitetech.edu.vn', '0903000002', 'Đà Nẵng', 0, '1980-07-22', 'Thạc sĩ', 'Khoa học Máy tính', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Lê Văn Minh', 'minh.le@kitetech.edu.vn', '0903000003', 'Hà Nội', 1, '1978-11-10', 'Tiến sĩ', 'Hệ thống Thông tin', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Phạm Thị Hồng', 'hong.pham@kitetech.edu.vn', '0903000004', 'Cần Thơ', 0, '1982-05-30', 'Thạc sĩ', 'Kỹ thuật Phần mềm', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hoàng Văn Nam', 'nam.hoang@kitetech.edu.vn', '0903000005', 'Quảng Ngãi', 1, '1970-09-12', 'Tiến sĩ', 'Trí tuệ Nhân tạo', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Ngô Thị Thảo', 'thao.ngo@kitetech.edu.vn', '0903000006', 'Bình Định', 0, '1985-02-18', 'Thạc sĩ', 'An ninh Mạng', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Đỗ Văn Tuấn', 'tuan.do@kitetech.edu.vn', '0903000007', 'Long An', 1, '1973-12-25', 'Tiến sĩ', 'Khoa học Dữ liệu', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bùi Thị Mai', 'mai.bui@kitetech.edu.vn', '0903000008', 'Hải Phòng', 0, '1983-04-07', 'Thạc sĩ', 'Công nghệ Thông tin', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vũ Văn Thành', 'thanh.vu@kitetech.edu.vn', '0903000009', 'TP Hồ Chí Minh', 1, '1977-06-14', 'Tiến sĩ', 'Hệ thống Thông tin', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Nguyễn Văn Ngọc', 'ngoc.nguyen@kitetech.edu.vn', '0903000010', 'Đà Nẵng', 0, '1981-08-19', 'Thạc sĩ', 'Kỹ thuật Phần mềm', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- User Teacher
INSERT INTO uni_test.users (username, password, role, full_name, email, isActive, isDeleted, created_at, updated_at) VALUES
('nguyen_van_hung', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Nguyễn Văn Hùng', 'hung.nguyen@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tran_thi_lan', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Trần Thị Lan', 'lan.tran@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('le_van_minh', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Lê Văn Minh', 'minh.le@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pham_thi_hong', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Phạm Thị Hồng', 'hong.pham@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('hoang_van_nam', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Hoàng Văn Nam', 'nam.hoang@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ngo_thi_thao', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Ngô Thị Thảo', 'thao.ngo@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('do_van_tuan', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Đỗ Văn Tuấn', 'tuan.do@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bui_thi_mai', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Bùi Thị Mai', 'mai.bui@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vu_van_thanh', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Vũ Văn Thành', 'thanh.vu@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tran_thi_ngoc', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Teacher', 'Trần Thị Ngọc', 'ngoc.tran@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- User Admin
INSERT INTO uni_test.users (username, password, role, full_name, email, isActive, isDeleted, created_at, updated_at) VALUES
('admin', '$2b$10$qbfXm9buLT.q/blz63IdP.qcHfL29VrB9t6JIpn4Oc4qnoI5KyMWm', 'Admin', 'Admin', 'admin@kitetech.edu.vn', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- Classroom Member
INSERT INTO uni_test.classroom_members (classroom_id, user_id, role) VALUES
('1', '3', 'Student'),
('1', '4', 'Student'),
('1', '5', 'Student'),
('1', '6', 'Student'),
('1', '7', 'Student'),
('1', '8', 'Student'),
('1', '9', 'Student'),
('1', '10', 'Student'),
('1', '11', 'Student'),
('1', '12', 'Student'),
('1', '13', 'Student'),
('1', '14', 'Student'),
('1', '15', 'Student'),
('1', '16', 'Student'),
('1', '17', 'Student'),
('1', '18', 'Student'),
('1', '19', 'Student'),
('1', '53', 'Student'),
('1', '54', 'Student'),
('1', '64', 'Teacher');

-- Classroom Student Grade
INSERT INTO uni_test.classroom_student_grades (classroom_id, user_id, qt1_grade, qt2_grade, midterm_grade, final_grade) VALUES
('1', '3', 8.5, 9.0, 8.0, 8.5),
('1', '4', 7.5, 8.0, 7.0, 7.5),
('1', '5', 9.0, 9.5, 9.0, 9.5),
('1', '6', 8.0, 8.5, 8.0, 8.5),
('1', '7', 7.0, 7.5, 7.0, 7.5),
('1', '8', 8.5, 9.0, 8.5, 9.0),
('1', '9', 9.0, 9.5, 9.0, 9.5),
('1', '10', 8.0, 8.5, 8.0, 8.5),
('1', '11', 7.5, 8.0, 7.5, 8.0),
('1', '12', 8.5, 9.0, 8.5, 9.0),
('1', '13', 9.0, 9.5, 9.0, 9.5),
('1', '14', 8.0, 8.5, 8.0, 8.5),
('1', '15', 7.0, 7.5, 7.0, 7.5),
('1', '16', 8.5, 9.0, 8.5, 9.0),
('1', '17', 9.0, 9.5, 9.0, 9.5),
('1', '18', 8.0, 8.5, 8.0, 8.5),
('1', '19', 7.5, 8.0, 7.5, 8.0),
('1', '53', 8.5, 9.0, 8.5, 9.0),
('1', '54', 9.0, 9.5, 9.0, 9.5);
