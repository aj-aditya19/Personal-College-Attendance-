create database PersonaCollege;
use PersonaCollege;
ALTER TABLE sub_bcaIII_214_L 
ADD UNIQUE KEY unique_student_date (student_id, class_date);
create table users (
	serial_no INT auto_increment primary key,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,            
    full_name VARCHAR(100),                    
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    status ENUM('active','inactive') DEFAULT 'active'
);

create table attendence_in_dates (
	student_id VARCHAR(50) NOT NULL,
    date_day VARCHAR(50) NOT NULL,
    class1 VARCHAR(10) default "-",
    class2 VARCHAR(10) default "-",
	class3 VARCHAR(10) default "-",
    class4 VARCHAR(10) default "-",
    class5 VARCHAR(10) default "-",
    class6 VARCHAR(10) default "-",
    class7 VARCHAR(10) default "-", 
    total_class INT NOT NULL,
    present INT NOT NULL,
    missed INT NOT NULL,
    cancelled INT NOT NULL,
    percent VARCHAR(10) NOT NULL
);

CREATE TABLE sub_bcaIII_213_L (
    student_id VARCHAR(50) NOT NULL,
    class_date VARCHAR(50) NOT NULL,
    total_class INT NOT NULL,
    present INT NOT NULL,
    absent INT NOT NULL,
    cancelled INT NOT NULL,
    PRIMARY KEY (student_id, class_date)
);
CREATE TABLE sub_bcaIII_213(
    student_id VARCHAR(50) NOT NULL,
    class_date VARCHAR(50) NOT NULL,
    total_class INT NOT NULL,
    present INT NOT NULL,
    absent INT NOT NULL,
    cancelled INT NOT NULL,
    PRIMARY KEY (student_id, class_date)
);
CREATE TABLE sub_bcaIII_214(
    student_id VARCHAR(50) NOT NULL,
    class_date VARCHAR(50) NOT NULL,
    total_class INT NOT NULL,
    present INT NOT NULL,
    absent INT NOT NULL,
    cancelled INT NOT NULL,
    PRIMARY KEY (student_id, class_date)
);
CREATE TABLE sub_bcaIII_214_L(
    student_id VARCHAR(50) NOT NULL,
    class_date VARCHAR(50) NOT NULL,
    total_class INT NOT NULL,
    present INT NOT NULL,
    absent INT NOT NULL,
    cancelled INT NOT NULL,
    PRIMARY KEY (student_id, class_date)
);
CREATE TABLE sub_bcaIII_212(
    student_id VARCHAR(50) NOT NULL,
    class_date VARCHAR(50) NOT NULL,
    total_class INT NOT NULL,
    present INT NOT NULL,
    absent INT NOT NULL,
    cancelled INT NOT NULL,
    PRIMARY KEY (student_id, class_date)
);
CREATE TABLE sub_bcaIII_211(
    student_id VARCHAR(50) NOT NULL,
    class_date VARCHAR(50) NOT NULL,
    total_class INT NOT NULL,
    present INT NOT NULL,
    absent INT NOT NULL,
    cancelled INT NOT NULL,
    PRIMARY KEY (student_id, class_date)
);
CREATE TABLE sub_bcaIII_217(
    student_id VARCHAR(50) NOT NULL,
    class_date VARCHAR(50) NOT NULL,
    total_class INT NOT NULL,
    present INT NOT NULL,
    absent INT NOT NULL,
    cancelled INT NOT NULL,
    PRIMARY KEY (student_id, class_date)
);

INSERT INTO sub_bcaIII_214_L 
(student_id, class_date, total_class, present, absent, cancelled)
VALUES
('24TSBCDDD01034', 'till-31-august-25', 2, 0, 2, 0);

INSERT INTO sub_bcaIII_217 
(student_id, class_date, total_class, present, absent, cancelled)
VALUES
('24TSBCDDD01034', 'till-31-august-25', 4, 2, 2, 0);

INSERT INTO sub_bcaIII_212 
(student_id, class_date, total_class, present, absent, cancelled)
VALUES
('24TSBCDDD01034', 'till-31-august-25', 4, 3, 1, 0);
select * from sub_bcaIII_213;
DELETE FROM sub_bcaIII_213
WHERE cancelled = 0;


SELECT * from attendence_in_dates;
ALTER TABLE attendence_in_dates
MODIFY COLUMN date_day VARCHAR(50) NOT NULL;
SET SQL_SAFE_UPDATES = 1;
DELETE FROM attendence_in_dates
WHERE date_day = 'Sunday 31 August, 2025';
 drop table sub_bcaIII_213_L;