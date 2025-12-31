-- =====================================================
-- CPAS SAMPLE DATA POPULATION SCRIPT
-- Run this after creating the schema
-- =====================================================

-- =====================================================
-- 1. CRIME TYPES
-- =====================================================
INSERT INTO Crime_Type (Type_Name, Category, Description) 
VALUES ('Street Theft', 'Property', 'Theft of personal belongings in public spaces');

INSERT INTO Crime_Type (Type_Name, Category, Description) 
VALUES ('Residential Burglary', 'Property', 'Breaking and entering into residential properties');

INSERT INTO Crime_Type (Type_Name, Category, Description) 
VALUES ('Armed Robbery', 'Violent', 'Robbery involving weapons or threat of violence');

INSERT INTO Crime_Type (Type_Name, Category, Description) 
VALUES ('Assault', 'Violent', 'Physical attack on another person');

INSERT INTO Crime_Type (Type_Name, Category, Description) 
VALUES ('Cybercrime', 'Cyber', 'Digital fraud, hacking, or online scams');

INSERT INTO Crime_Type (Type_Name, Category, Description) 
VALUES ('Drug Trafficking', 'Drug_Related', 'Illegal distribution of controlled substances');

INSERT INTO Crime_Type (Type_Name, Category, Description) 
VALUES ('Fraud', 'White_Collar', 'Financial deception for illegal gain');

INSERT INTO Crime_Type (Type_Name, Category, Description) 
VALUES ('Vandalism', 'Property', 'Deliberate destruction of property');

-- =====================================================
-- 2. LOCATIONS
-- =====================================================
INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Karachi', 'Defence', 'Khayaban-e-Shamsheer', 24.8138287, 67.0310580);

INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Karachi', 'Clifton', 'Boat Basin', 24.8081620, 67.0303910);

INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Karachi', 'Gulshan-e-Iqbal', 'Block 13-D', 24.9207294, 67.0877570);

INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Lahore', 'Johar Town', 'Main Boulevard', 31.4697133, 74.2727745);

INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Lahore', 'Gulberg', 'MM Alam Road', 31.5168834, 74.3487109);

INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Islamabad', 'F-6', 'Jinnah Avenue', 33.7211482, 73.0528336);

INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Islamabad', 'Blue Area', 'Jinnah Avenue', 33.7181145, 73.0665600);

INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Rawalpindi', 'Saddar', 'Mall Road', 33.5971004, 73.0477777);

INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Karachi', 'Saddar', 'Abdullah Haroon Road', 24.8546843, 67.0230075);

INSERT INTO Location (City, Area, Street, Latitude, Longitude) 
VALUES ('Lahore', 'Model Town', 'Link Road', 31.4854341, 74.3159370);

-- =====================================================
-- 3. OFFICERS (without passwords - will be set later)
-- =====================================================
INSERT INTO Officer (Name, Contact_No, Email) 
VALUES ('Inspector Ali Khan', '03001234567', 'ali.khan@cpas.gov.pk');

INSERT INTO Officer (Name, Contact_No, Email) 
VALUES ('Inspector Sara Ahmed', '03009876543', 'sara.ahmed@cpas.gov.pk');

INSERT INTO Officer (Name, Contact_No, Email) 
VALUES ('Inspector Usman Malik', '03007654321', 'usman.malik@cpas.gov.pk');

INSERT INTO Officer (Name, Contact_No, Email) 
VALUES ('Officer Fatima Zahra', '03004567890', 'fatima.zahra@cpas.gov.pk');

INSERT INTO Officer (Name, Contact_No, Email) 
VALUES ('Officer Ahmed Raza', '03002345678', 'ahmed.raza@cpas.gov.pk');

-- =====================================================
-- 4. SUSPECTS
-- =====================================================
INSERT INTO Suspect (Name, Gender, Age, Address, Criminal_Record, Status) 
VALUES ('Muhammad Hassan', 'Male', 28, 'Flat 12, Block A, Liaquatabad, Karachi', 1, 'At Large');

INSERT INTO Suspect (Name, Gender, Age, Address, Criminal_Record, Status) 
VALUES ('Bilal Ahmed', 'Male', 32, 'House 45, Street 7, Rawalpindi', 1, 'Arrested');

INSERT INTO Suspect (Name, Gender, Age, Address, Criminal_Record, Status) 
VALUES ('Ayesha Siddiqui', 'Female', 25, 'Apartment 3B, Gulshan-e-Iqbal, Karachi', 0, 'Unknown');

INSERT INTO Suspect (Name, Gender, Age, Address, Criminal_Record, Status) 
VALUES ('Imran Khan', 'Male', 35, 'House 78, Model Town, Lahore', 1, 'Released');

INSERT INTO Suspect (Name, Gender, Age, Address, Criminal_Record, Status) 
VALUES ('Unknown Male', 'Male', NULL, 'Unknown', 0, 'At Large');

-- =====================================================
-- 5. VICTIMS (without passwords - will be set later)
-- =====================================================
INSERT INTO Victim (Name, Age, Gender, Contact_Info, Address, Email) 
VALUES ('Zainab Hussain', 29, 'Female', '03011234567', 'House 23, Defence Phase 5, Karachi', 'zainab.hussain@email.com');

INSERT INTO Victim (Name, Age, Gender, Contact_Info, Address, Email) 
VALUES ('Kamran Iqbal', 42, 'Male', '03219876543', 'Flat 56, Clifton Block 2, Karachi', 'kamran.iqbal@email.com');

INSERT INTO Victim (Name, Age, Gender, Contact_Info, Address, Email) 
VALUES ('Nadia Shahid', 35, 'Female', '03337654321', 'House 89, Johar Town, Lahore', 'nadia.shahid@email.com');

INSERT INTO Victim (Name, Age, Gender, Contact_Info, Address, Email) 
VALUES ('Tariq Mahmood', 51, 'Male', '03454567890', 'Apartment 12, F-6, Islamabad', 'tariq.mahmood@email.com');

INSERT INTO Victim (Name, Age, Gender, Contact_Info, Address, Email) 
VALUES ('Sana Ali', 27, 'Female', '03562345678', 'House 34, Gulberg III, Lahore', 'sana.ali@email.com');

-- =====================================================
-- 6. WITNESSES (without passwords - will be set later)
-- =====================================================
INSERT INTO Witness (Name, Contact_Info, Address, Email) 
VALUES ('Rashid Ahmed', '03671234567', 'Shop 12, Saddar Market, Karachi', 'rashid.ahmed@email.com');

INSERT INTO Witness (Name, Contact_Info, Address, Email) 
VALUES ('Mariam Khan', '03789876543', 'House 67, Model Town, Lahore', 'mariam.khan@email.com');

INSERT INTO Witness (Name, Contact_Info, Address, Email) 
VALUES ('Fahad Ali', '03897654321', 'Flat 23, Blue Area, Islamabad', 'fahad.ali@email.com');

-- =====================================================
-- 7. INVESTIGATIONS
-- =====================================================
INSERT INTO Investigation (Case_Number, Lead_Officer_ID, Start_Date, Status, Outcome, Notes) 
VALUES ('KHI-2024-001', 1, TO_DATE('2024-11-15', 'YYYY-MM-DD'), 'Active', 'Pending', 'Multiple theft incidents in Defence area');

INSERT INTO Investigation (Case_Number, Lead_Officer_ID, Start_Date, Status, Outcome, Notes) 
VALUES ('LHR-2024-002', 2, TO_DATE('2024-11-20', 'YYYY-MM-DD'), 'Active', 'Pending', 'Armed robbery investigation ongoing');

INSERT INTO Investigation (Case_Number, Lead_Officer_ID, Start_Date, Close_Date, Status, Outcome, Notes) 
VALUES ('ISB-2024-003', 3, TO_DATE('2024-10-10', 'YYYY-MM-DD'), TO_DATE('2024-11-30', 'YYYY-MM-DD'), 'Closed', 'Solved', 'Cybercrime case resolved, suspect arrested');

-- =====================================================
-- 8. CRIMES
-- =====================================================
-- Crime 1: Street Theft in Karachi
INSERT INTO Crime (Crime_Type_ID, Date_Reported, Date_Occurred, Time_Occurred, Description, Status, Severity_Level, Location_ID, Officer_ID) 
VALUES (1, TO_DATE('2024-11-15', 'YYYY-MM-DD'), TO_DATE('2024-11-14', 'YYYY-MM-DD'), 
        TO_TIMESTAMP('2024-11-14 18:30:00', 'YYYY-MM-DD HH24:MI:SS'),
        'Mobile phone and wallet stolen from victim near main market', 'Under Investigation', 'Moderate', 1, 1);

-- Crime 2: Residential Burglary in Lahore
INSERT INTO Crime (Crime_Type_ID, Date_Reported, Date_Occurred, Time_Occurred, Description, Status, Severity_Level, Location_ID, Officer_ID) 
VALUES (2, TO_DATE('2024-11-20', 'YYYY-MM-DD'), TO_DATE('2024-11-19', 'YYYY-MM-DD'), 
        TO_TIMESTAMP('2024-11-19 03:15:00', 'YYYY-MM-DD HH24:MI:SS'),
        'House broken into, jewelry and electronics stolen', 'Under Investigation', 'Major', 4, 2);

-- Crime 3: Armed Robbery in Karachi
INSERT INTO Crime (Crime_Type_ID, Date_Reported, Date_Occurred, Time_Occurred, Description, Status, Severity_Level, Location_ID, Officer_ID) 
VALUES (3, TO_DATE('2024-11-18', 'YYYY-MM-DD'), TO_DATE('2024-11-18', 'YYYY-MM-DD'), 
        TO_TIMESTAMP('2024-11-18 21:45:00', 'YYYY-MM-DD HH24:MI:SS'),
        'Armed men robbed cash and valuables at gunpoint', 'Under Investigation', 'Critical', 2, 1);

-- Crime 4: Assault in Islamabad
INSERT INTO Crime (Crime_Type_ID, Date_Reported, Date_Occurred, Time_Occurred, Description, Status, Severity_Level, Location_ID, Officer_ID) 
VALUES (4, TO_DATE('2024-11-10', 'YYYY-MM-DD'), TO_DATE('2024-11-10', 'YYYY-MM-DD'), 
        TO_TIMESTAMP('2024-11-10 14:20:00', 'YYYY-MM-DD HH24:MI:SS'),
        'Physical altercation resulting in injuries', 'Closed', 'Moderate', 6, 3);

-- Crime 5: Cybercrime in Islamabad
INSERT INTO Crime (Crime_Type_ID, Date_Reported, Date_Occurred, Time_Occurred, Description, Status, Severity_Level, Location_ID, Officer_ID) 
VALUES (5, TO_DATE('2024-10-10', 'YYYY-MM-DD'), TO_DATE('2024-10-09', 'YYYY-MM-DD'), 
        TO_TIMESTAMP('2024-10-09 10:00:00', 'YYYY-MM-DD HH24:MI:SS'),
        'Online banking fraud, Rs. 500,000 stolen', 'Closed', 'Major', 7, 3);

-- Crime 6: Vandalism in Karachi
INSERT INTO Crime (Crime_Type_ID, Date_Reported, Date_Occurred, Time_Occurred, Description, Status, Severity_Level, Location_ID, Officer_ID) 
VALUES (8, TO_DATE('2024-11-25', 'YYYY-MM-DD'), TO_DATE('2024-11-25', 'YYYY-MM-DD'), 
        TO_TIMESTAMP('2024-11-25 02:30:00', 'YYYY-MM-DD HH24:MI:SS'),
        'Public property defaced with graffiti', 'Open', 'Minor', 9, 4);

-- Crime 7: Drug Trafficking in Rawalpindi
INSERT INTO Crime (Crime_Type_ID, Date_Reported, Date_Occurred, Time_Occurred, Description, Status, Severity_Level, Location_ID, Officer_ID) 
VALUES (6, TO_DATE('2024-11-22', 'YYYY-MM-DD'), TO_DATE('2024-11-22', 'YYYY-MM-DD'), 
        TO_TIMESTAMP('2024-11-22 23:00:00', 'YYYY-MM-DD HH24:MI:SS'),
        'Large quantity of narcotics seized during raid', 'Under Investigation', 'Critical', 8, 5);

-- =====================================================
-- 9. CRIME-VICTIM LINKS
-- =====================================================
INSERT INTO Crime_Victim (Crime_ID, Victim_ID, Injury_Severity) VALUES (1, 1, 'None');
INSERT INTO Crime_Victim (Crime_ID, Victim_ID, Injury_Severity) VALUES (2, 3, 'None');
INSERT INTO Crime_Victim (Crime_ID, Victim_ID, Injury_Severity) VALUES (3, 2, 'Minor');
INSERT INTO Crime_Victim (Crime_ID, Victim_ID, Injury_Severity) VALUES (4, 4, 'Serious');
INSERT INTO Crime_Victim (Crime_ID, Victim_ID, Injury_Severity) VALUES (5, 5, 'None');

-- =====================================================
-- 10. CRIME-SUSPECT LINKS
-- =====================================================
INSERT INTO Crime_Suspect (Crime_ID, Suspect_ID, Role, Arrest_Status) VALUES (1, 5, 'Primary Suspect', 'Pending');
INSERT INTO Crime_Suspect (Crime_ID, Suspect_ID, Role, Arrest_Status) VALUES (2, 1, 'Primary Suspect', 'Pending');
INSERT INTO Crime_Suspect (Crime_ID, Suspect_ID, Role, Arrest_Status) VALUES (3, 1, 'Primary Suspect', 'Pending');
INSERT INTO Crime_Suspect (Crime_ID, Suspect_ID, Role, Arrest_Status) VALUES (3, 5, 'Accomplice', 'Pending');
INSERT INTO Crime_Suspect (Crime_ID, Suspect_ID, Role, Arrest_Status) VALUES (5, 2, 'Primary Suspect', 'Arrested');
INSERT INTO Crime_Suspect (Crime_ID, Suspect_ID, Role, Arrest_Status) VALUES (7, 4, 'Primary Suspect', 'Released');

-- =====================================================
-- 11. CRIME-WITNESS LINKS
-- =====================================================
INSERT INTO Crime_Witness (Crime_ID, Witness_ID, Statement_Date, Statement_Text, Is_Key_Witness) 
VALUES (1, 1, TO_DATE('2024-11-15', 'YYYY-MM-DD'), 'I saw two men on a motorcycle snatch the victims phone and speed away', 1);

INSERT INTO Crime_Witness (Crime_ID, Witness_ID, Statement_Date, Statement_Text, Is_Key_Witness) 
VALUES (3, 1, TO_DATE('2024-11-19', 'YYYY-MM-DD'), 'I witnessed the armed robbery. Three men with guns entered the shop', 1);

INSERT INTO Crime_Witness (Crime_ID, Witness_ID, Statement_Date, Statement_Text, Is_Key_Witness) 
VALUES (2, 2, TO_DATE('2024-11-21', 'YYYY-MM-DD'), 'I heard breaking glass around 3 AM and saw someone climbing over the wall', 1);

INSERT INTO Crime_Witness (Crime_ID, Witness_ID, Statement_Date, Statement_Text, Is_Key_Witness) 
VALUES (4, 3, TO_DATE('2024-11-11', 'YYYY-MM-DD'), 'I saw the entire fight. It started as an argument and escalated quickly', 0);

-- =====================================================
-- 12. INVESTIGATION-CRIME LINKS
-- =====================================================
INSERT INTO Investigation_Crime (Investigation_ID, Crime_ID) VALUES (1, 1);
INSERT INTO Investigation_Crime (Investigation_ID, Crime_ID) VALUES (1, 3);
INSERT INTO Investigation_Crime (Investigation_ID, Crime_ID) VALUES (2, 2);
INSERT INTO Investigation_Crime (Investigation_ID, Crime_ID) VALUES (3, 5);

-- =====================================================
-- 13. EVIDENCE
-- =====================================================
INSERT INTO Evidence (Crime_ID, Type, Description, Collected_By, Date_Collected) 
VALUES (1, 'CCTV Footage', 'CCTV footage from nearby shop showing the suspects', 1, TO_DATE('2024-11-15', 'YYYY-MM-DD'));

INSERT INTO Evidence (Crime_ID, Type, Description, Collected_By, Date_Collected) 
VALUES (2, 'Fingerprint', 'Fingerprints lifted from window frame at crime scene', 2, TO_DATE('2024-11-20', 'YYYY-MM-DD'));

INSERT INTO Evidence (Crime_ID, Type, Description, Collected_By, Date_Collected) 
VALUES (3, 'Weapon', 'Empty shell casings found at scene', 1, TO_DATE('2024-11-18', 'YYYY-MM-DD'));

INSERT INTO Evidence (Crime_ID, Type, Description, Collected_By, Date_Collected) 
VALUES (3, 'CCTV Footage', 'Security camera footage from street', 1, TO_DATE('2024-11-18', 'YYYY-MM-DD'));

INSERT INTO Evidence (Crime_ID, Type, Description, Collected_By, Date_Collected) 
VALUES (5, 'Digital', 'IP logs and transaction records from bank servers', 3, TO_DATE('2024-10-10', 'YYYY-MM-DD'));

INSERT INTO Evidence (Crime_ID, Type, Description, Collected_By, Date_Collected) 
VALUES (5, 'Document', 'Fraudulent email correspondence', 3, TO_DATE('2024-10-10', 'YYYY-MM-DD'));

INSERT INTO Evidence (Crime_ID, Type, Description, Collected_By, Date_Collected) 
VALUES (7, 'Other', 'Narcotics samples sent to lab for analysis', 5, TO_DATE('2024-11-22', 'YYYY-MM-DD'));

-- =====================================================
-- 14. CRIME REPORTS
-- =====================================================
INSERT INTO Crime_Report (Reported_By_Victim_ID, Reported_By_Name, Report_Details, Report_Status) 
VALUES (1, 'Zainab Hussain', 'I was walking near the market when someone on a motorcycle snatched my phone and bag', 'Under Investigation');

INSERT INTO Crime_Report (Reported_By_Victim_ID, Reported_By_Name, Report_Details, Report_Status) 
VALUES (2, 'Kamran Iqbal', 'Armed men entered my shop and took cash at gunpoint. I fear for my safety.', 'Under Investigation');

INSERT INTO Crime_Report (Reported_By_Victim_ID, Reported_By_Name, Report_Details, Report_Status) 
VALUES (5, 'Sana Ali', 'I received suspicious emails and lost money from my account. This appears to be online fraud.', 'Resolved');

INSERT INTO Crime_Report (Reported_By_Name, Report_Details, Report_Status) 
VALUES ('Anonymous', 'I witnessed drug dealing activity in my neighborhood. Want to report anonymously.', 'Pending Review');

-- =====================================================
-- 15. REPORT-CRIME LINKS
-- =====================================================
INSERT INTO Report_Crime (Report_ID, Crime_ID, Notes) VALUES (1, 1, 'Report matched to crime incident');
INSERT INTO Report_Crime (Report_ID, Crime_ID, Notes) VALUES (2, 3, 'Victim report filed');
INSERT INTO Report_Crime (Report_ID, Crime_ID, Notes) VALUES (3, 5, 'Cybercrime report');

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
SELECT 'Crime Types: ' || COUNT(*) AS Count FROM Crime_Type;
SELECT 'Locations: ' || COUNT(*) AS Count FROM Location;
SELECT 'Officers: ' || COUNT(*) AS Count FROM Officer;
SELECT 'Suspects: ' || COUNT(*) AS Count FROM Suspect;
SELECT 'Victims: ' || COUNT(*) AS Count FROM Victim;
SELECT 'Witnesses: ' || COUNT(*) AS Count FROM Witness;
SELECT 'Investigations: ' || COUNT(*) AS Count FROM Investigation;
SELECT 'Crimes: ' || COUNT(*) AS Count FROM Crime;
SELECT 'Evidence: ' || COUNT(*) AS Count FROM Evidence;
SELECT 'Crime Reports: ' || COUNT(*) AS Count FROM Crime_Report;

SELECT '✅ Sample data populated successfully!' AS Status FROM DUAL;
