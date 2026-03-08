import { useState, useEffect } from "react";

// ── EMBEDDED DATA ─────────────────────────────────────────────────────────────
const DB = {"frameworks":["PCI DSS v4.01","COBIT 2019","ISO 27001","NIST CSF 2.0","NIS 2","TISAX","NIST SP 800-171 R3","FDA 21 CFR Part-11","MLPS"],"table":[["01. IT Strategy","1.1.Strategy & Planning","Cost Benefit Analysis",{"1":["APO05.05","APO06.05"]}],["01. IT Strategy","1.1.Strategy & Planning","Financial Management Framework",{"1":["EDM03.01"]}],["01. IT Strategy","1.1.Strategy & Planning","IT Costing Model",{"1":["APO05.03","APO06.01","APO06.03","APO06.04","APO06.05"]}],["01. IT Strategy","1.1.Strategy & Planning","IT Financial Management Framework",{"1":["APO05.01","APO05.02","APO05.04","APO06.02","APO06.01"]}],["01. IT Strategy","1.1.Strategy & Planning","IT Strategy",{"1":["APO02.01","APO02.02","APO02.03","APO02.05","APO08.01","APO08.02","EDM02.01"],"8":["7.1.9.2","8.1.9.2"]}],["01. IT Strategy","1.1.Strategy & Planning","Management Reporting",{"1":["EDM02.04","APO01.02","EDM05.02","EDM05.03"],"2":["7.4","9.2"],"8":["7.1.7.4"]}],["01. IT Strategy","1.2. Enterprise IT Architecture","Enterprise IT Architecture Model",{"1":["APO02.04","APO03.01","APO03.02","APO03.03"],"2":["8.27"]}],["01. IT Strategy","1.2. Enterprise IT Architecture","Enterprise IT Architecture Review",{"1":["APO03.03","APO03.04","APO03.05"],"2":["9.3","8.27"]}],["01. IT Strategy","1.3. IT Innovation","IT Innovation Management",{"1":["APO04.01","APO04.02","APO04.03","APO04.04","APO04.05","APO04.06"]}],["01. IT Strategy","1.4. Project Management Standards & Governance","Information Security in Project Management",{"1":["APO13.01"],"2":["5.8"],"5":["1.2.3"]}],["01. IT Strategy","1.4. Project Management Standards & Governance","Project Closure",{"1":["BAI11.09","BAI01.06"]}],["01. IT Strategy","1.4. Project Management Standards & Governance","Project Initiation",{"1":["BAI01.02","BAI11.02"]}],["01. IT Strategy","1.4. Project Management Standards & Governance","Project Management Framework",{"1":["BAI01.03","BAI01.08","BAI01.09","BAI11.01","BAI11.03","BAI01.01","BAI01.04"],"8":["7.1.9.6","8.1.9.6"]}],["01. IT Strategy","1.4. Project Management Standards & Governance","Project Management Plan",{"1":["BAI11.04","BAI11.08","BAI01.05"],"5":["8.2.4"]}],["01. IT Strategy","1.4. Project Management Standards & Governance","Project Monitoring",{"1":["BAI11.06","BAI01.06","BAI11.07"]}],["01. IT Strategy","1.4. Project Management Standards & Governance","Project Quality Management",{"1":["APO11.02","APO11.03","APO11.04","APO11.05","BAI11.05","APO11.01","BAI01.07"],"2":["9.3"]}],["02. Information Security","2.1. Identity & Access Management","Access Control System",{"0":["3.5.1.3","7.2.1","7.2.2","7.2.5","7.2.6","7.3.1","7.3.2","7.3.3","A1.1.2","A1.1.3"],"1":["DSS05.04","DSS06.03"],"2":["5.15","5.18","8.3"],"5":["4.2.1"],"6":["03.01.01","03.01.02","03.01.03","03.01.05","03.01.06","03.01.12","03.01.16","03.01.18"],"7":["11.1"],"8":["7.1.2.3","7.1.4.2","7.1.7.3","7.1.10.6","8.1.4.2","8.1.7.3","8.1.10.6"]}],["02. Information Security","2.1. Identity & Access Management","Access Entitlement Inventory",{"0":["7.2.4"],"6":["03.05.05"],"8":["7.1.4.2","8.1.4.2"]}],["02. Information Security","2.1. Identity & Access Management","Access Request",{"0":["8.2.4"]}],["02. Information Security","2.1. Identity & Access Management","Access Rights Review",{"0":["7.2.4","7.2.5.1"],"1":["DSS05.04","DSS06.03"],"2":["5.18"],"6":["03.01.01","03.01.05"],"8":["8.1.7.3"]}],["02. Information Security","2.1. Identity & Access Management","Account Inactivity",{"0":["8.2.6"],"6":["03.01.01","03.01.08"],"8":["7.1.4.2"]}],["02. Information Security","2.1. Identity & Access Management","Application Authentication",{"6":["03.01.09"],"8":["7.1.4.1","8.1.4.1"]}],["02. Information Security","2.1. Identity & Access Management","Dual Access",{"0":["8.2.2"],"6":["03.01.01","03.01.20"]}],["02. Information Security","2.1. Identity & Access Management","External Digital Identity",{"0":["8.2.2","8.2.3"],"6":["03.01.01","03.01.20"],"8":["7.1.4.2"]}],["02. Information Security","2.1. Identity & Access Management","Generic IDs Management",{"0":["8.2.2"],"6":["03.01.01"],"8":["7.1.4.2","8.1.4.2"]}],["02. Information Security","2.1. Identity & Access Management","Password Management",{"0":["2.2.2","2.3.1","8.3.5","8.3.6","8.3.7","8.3.9","8.3.10","8.3.10.1","8.6.2","8.6.3"],"1":["DSS05.04"],"6":["03.05.07"],"7":["11.3"],"8":["7.1.4.1","8.1.4.1"]}],["02. Information Security","2.1. Identity & Access Management","Password Management Process",{"2":["5.17"]}],["02. Information Security","2.1. Identity & Access Management","Privilege Access Control",{"0":["7.2.3","7.2.5.1"],"1":["DSS05.04","DSS06.03"],"2":["8.2"],"6":["03.01.01","03.01.05","03.01.06","03.01.07"],"8":["7.1.4.2","7.1.5.1","7.1.7.3","8.1.4.2","8.1.5.1","8.1.5.3","8.1.7.3"]}],["02. Information Security","2.1. Identity & Access Management","Segregation of Duties",{"0":["6.5.4"],"1":["DSS06.03"],"2":["5.3"],"6":["03.01.04","03.04.05"],"8":["7.1.10.6","8.1.10.6"]}],["02. Information Security","2.1. Identity & Access Management","User Access De-provisioning",{"0":["8.2.5"],"1":["DSS05.04"],"2":["5.16","5.18"],"6":["03.09.02"],"8":["7.1.4.2"]}],["02. Information Security","2.1. Identity & Access Management","User Access Provisioning",{"0":["8.2.1"],"1":["DSS05.04","DSS06.03"],"2":["5.16","5.18"],"5":["4.1.2","4.1.3"],"6":["03.05.01"],"8":["7.1.4.2","7.1.7.3","8.1.4.2","8.1.7.3"]}],["02. Information Security","2.1. Identity & Access Management","User Authentication",{"0":["8.3.1","8.3.3","8.3.4","8.3.8","8.3.11","8.4.1","8.4.2","8.4.3","8.5.1","8.6.1"],"2":["5.17","8.5"],"6":["03.05.01","03.05.02","03.05.03","03.05.04","03.05.11","03.05.12"],"8":["7.1.4.1","7.1.4.6","7.1.3.6","8.1.3.6","8.1.4.1","8.1.4.6"]}],["02. Information Security","2.1. Identity & Access Management","Workforce/Contractor Account Transfers",{"6":["03.09.02"]}],["02. Information Security","2.2. Vulnerability Management","Penetration Testing and Remediation",{"0":["6.3.1","6.4.1","11.3.1","11.4.1","11.4.2","11.4.3","11.4.4","11.4.5","11.4.6","11.4.7","A1.1.4"],"1":["DSS05.07"],"2":["8.8"],"8":["7.1.10.5","8.1.10.5"]}],["02. Information Security","2.2. Vulnerability Management","Post-remediation Validation",{"0":["11.3.1","11.3.1.1","11.3.1.2","11.3.1.3","11.3.2","11.3.2.1"],"6":["03.11.02","03.14.01"]}],["02. Information Security","2.2. Vulnerability Management","Vulnerability & Pentest Metrics Reporting",{"6":["03.11.02","03.14.01"]}],["02. Information Security","2.2. Vulnerability Management","Vulnerability Prioritization",{"0":["6.3.1"]}],["02. Information Security","2.2. Vulnerability Management","Vulnerability Scanning and Remediation",{"0":["6.3.1","6.4.1","11.3.1","11.3.1.1","11.3.1.2","11.3.1.3","11.3.2","11.3.2.1"],"1":["DSS05.07"],"2":["8.8"],"5":["5.2.5","5.2.6"],"6":["03.11.02","03.12.02","03.14.01"],"8":["7.1.4.4","7.1.7.5","7.1.10.5","8.1.7.5","8.1.10.5"]}],["02. Information Security","2.2. Vulnerability Management","Vulnerability and Penetration Testing of Vendor Managed Applications",{"0":["6.4.1","11.3.1","11.3.1.1","11.3.1.2","11.3.1.3","11.3.2","11.3.2.1","11.4.1","11.4.2","11.4.3","11.4.4","11.4.5","11.4.6","11.4.7"],"6":["03.11.02"],"8":["7.1.10.5","8.1.10.5"]}],["02. Information Security","2.2. Vulnerability Management","Zero-day Vulnerability Management",{"0":["6.3.1"],"6":["03.11.02","03.14.01"],"8":["7.1.10.5","8.1.10.5"]}],["02. Information Security","2.3. Network Security","Clock Synchronization",{"0":["10.6.1","10.6.2","10.6.3"],"2":["8.17"],"6":["03.03.07"]}],["02. Information Security","2.3. Network Security","Firewall Rules",{"0":["1.2.5","1.4.1","1.4.2","1.4.5"],"1":["DSS05.02"],"2":["8.2","8.21"],"6":["03.13.06"],"8":["7.1.3.2","8.1.3.2"]}],["02. Information Security","2.3. Network Security","Inbound and Outbound Traffic on Networks",{"0":["1.2.6","1.3.1","1.3.2","1.4.2"],"1":["DSS05.02"],"2":["8.2","8.21"],"5":["5.3.2"],"6":["03.01.20","03.13.01","03.14.06"],"8":["7.1.3.1","7.1.3.2","8.1.3.1","8.1.3.2"]}],["02. Information Security","2.3. Network Security","Intrusion Detection and Prevention Systems",{"0":["1.2.6","1.4.3","11.5.1","11.5.1.1"],"1":["DSS05.02"],"2":["8.16","8.2","8.21"],"6":["03.13.04"],"8":["7.1.3.1","7.1.3.3","8.1.3.1","8.1.3.3"]}],["02. Information Security","2.3. Network Security","Network Architecture Diagram",{"0":["1.2.3","1.2.4"],"2":["8.21"]}],["02. Information Security","2.3. Network Security","Network Authentication Controls",{"1":["DSS05.02"],"2":["8.2","8.21"]}],["02. Information Security","2.3. Network Security","Remote Access Accounts",{"0":["8.2.7"],"1":["DSS05.02"],"2":["6.7","8.21"],"5":["2.1.4"],"6":["03.01.12","03.01.20"],"8":["7.1.4.1","8.1.4.1"]}],["02. Information Security","2.3. Network Security","Segregation of Networks",{"0":["1.4.1","1.4.4"],"1":["DSS05.02"],"2":["8.2","8.21","8.22"],"5":["5.2.7","5.3.4"],"6":["03.13.01"],"8":["7.1.2.1","8.1.2.1","8.1.5.4"]}],["02. Information Security","2.3. Network Security","Session Controls",{"0":["8.2.8"],"2":["8.2","8.21"],"6":["03.01.10","03.01.11","03.13.09","03.13.15"],"8":["7.1.4.1","8.1.4.1"]}],["02. Information Security","2.3. Network Security","Wireless Devices Controls",{"0":["1.3.3","2.3.1","11.2.1","11.2.2"],"1":["DSS05.02"],"2":["8.2","8.21"],"6":["03.01.16"],"8":["8.1.3.1"]}],["02. Information Security","2.4. Logging & Monitoring","Administrator and Operator Logs",{"0":["10.2.1.2","10.2.1.3"],"1":["DSS01.03","DSS06.05"],"2":["8.15"],"5":["5.2.4"],"6":["03.03.01","03.03.02"],"7":["11.1"],"8":["7.1.3.5","7.1.5.2","8.1.3.5","8.1.5.2"]}],["02. Information Security","2.4. Logging & Monitoring","Audit Log Backup & Protection",{"0":["10.5.1"],"1":["DSS01.03"],"6":["03.03.03"],"7":["11.1"],"8":["7.1.3.5","7.1.4.3","7.1.5.2","8.1.3.5","8.1.5.2"]}],["02. Information Security","2.4. Logging & Monitoring","Audit Log Backup and Protection",{"0":["10.3.3"],"1":["DSS04.07"]}],["02. Information Security","2.4. Logging & Monitoring","Audit Logging",{"0":["10.2.1","10.2.1.1","10.2.1.3","10.2.1.4","10.2.1.5","10.2.1.6","10.2.1.7","10.2.2","A1.2.1"],"1":["DSS01.03","DSS06.05"],"2":["8.15"],"5":["5.2.4"],"6":["03.03.01","03.03.02"],"7":["11.1"],"8":["7.1.3.5","7.1.4.3","7.1.5.2","7.1.10.6","8.1.5.2","8.1.10.6"]}],["02. Information Security","2.4. Logging & Monitoring","Log Reviews",{"0":["10.4.1","10.4.1.1","10.4.2","10.4.2.1","10.4.3","10.7.1","10.7.2","10.7.3","11.6.1","12.10.5","A1.2.1"],"1":["DSS01.03"],"2":["8.15"],"5":["5.2.4"],"6":["03.03.04","03.03.05","03.03.06","03.14.06"],"7":["11.1"],"8":["7.1.5.2","8.1.5.2"]}],["02. Information Security","2.4. Logging & Monitoring","Protection of Log Information",{"0":["10.2.1.3","10.3.1","10.3.2","10.3.4","11.5.2"],"1":["DSS01.03"],"2":["8.15"],"6":["03.03.08"],"7":["11.1"],"8":["7.1.3.5","7.1.5.2","8.1.3.5","8.1.5.2"]}],["02. Information Security","2.5. Malware Protection","Anti-Malware Deployment",{"0":["5.2.1","5.2.2","5.2.3","5.2.3.1","5.3.1","5.3.2","5.3.3","5.3.5"],"1":["DSS05.01"],"5":["5.2.3"],"6":["03.14.02"],"8":["7.1.4.5","7.1.10.7","8.1.4.5","8.1.5.4","8.1.10.7"]}],["02. Information Security","2.5. Malware Protection","Anti-Malware Software Logging and Monitoring",{"0":["5.3.4"],"1":["DSS05.03"]}],["02. Information Security","2.5. Malware Protection","Controls on Malicious Attacks",{"0":["5.2.2","5.3.2","5.3.3","5.4.1"],"1":["DSS05.01","DSS05.02","DSS05.03"],"2":["8.7","8.23"],"8":["7.1.3.4","7.1.4.5","7.1.10.7","8.1.3.4","8.1.4.5","8.1.10.7"]}],["02. Information Security","2.5. Malware Protection","Malware Management",{"2":["8.7"]}],["02. Information Security","2.6. Cybersecurity Incident Response ","Collection and Preservation of Evidence",{"2":["5.28"],"8":["7.1.10.12","8.1.10.12"]}],["02. Information Security","2.6. Cybersecurity Incident Response ","Cyber Forensics Investigation",{"0":["A1.2.2"],"8":["7.1.10.12","8.1.10.12"]}],["02. Information Security","2.6. Cybersecurity Incident Response ","Cybersecurity Incident Containment Strategies",{"2":["5.26"],"5":["1.6.1","1.6.2"],"8":["7.1.10.12","8.1.10.12"]}],["02. Information Security","2.6. Cybersecurity Incident Response ","Cybersecurity Incident Prioritization",{"1":["DSS02.02"],"2":["5.25"],"8":["7.1.10.12","8.1.10.12"]}],["02. Information Security","2.6. Cybersecurity Incident Response ","Cybersecurity Incident Reporting Channel",{"0":["A1.2.3"],"2":["6.8"],"5":["1.6.1","1.6.2"],"8":["7.1.10.12","8.1.10.12"]}],["02. Information Security","2.6. Cybersecurity Incident Response ","Cybersecurity Incident Response Plans",{"0":["12.10.1","12.10.2","12.10.3","12.10.6","12.10.7"],"2":["5.24"],"5":["9.6.2"],"8":["7.1.10.12","8.1.10.12"]}],["02. Information Security","2.6. Cybersecurity Incident Response ","Cybersecurity Incident Response and Handling",{"0":["A1.2.3"],"1":["DSS02.01","DSS02.03"],"2":["5.26"],"5":["1.6.1","1.6.2","9.6.2"],"8":["7.1.10.12","8.1.10.12"]}],["02. Information Security","2.6. Cybersecurity Incident Response ","Investigation of Cybersecurity Incidents",{"1":["DSS02.04"],"2":["5.7"],"8":["7.1.10.12","8.1.10.12"]}],["02. Information Security","2.6. Cybersecurity Incident Response ","Post Cybersecurity Incident Recovery",{"2":["5.27"],"5":["1.6.2"],"8":["7.1.10.12","8.1.10.12"]}],["03. Infrastructure Security","3.1. Mobile Device Management","Mobile Device Security Management",{"0":["1.5.1"],"1":["DSS05.03"],"5":["3.1.4"],"6":["03.01.18"]}],["03. Infrastructure Security","3.1. Mobile Device Management","Policy on Mobile Code",{"1":["DSS05.03"],"6":["03.13.13"],"8":["8.1.4.5"]}],["03. Infrastructure Security","3.1. Mobile Device Management","Remote Wipe Capability",{"0":["1.5.1"],"1":["DSS05.03"],"6":["03.01.18"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Cabling Security",{"0":["9.2.2","9.2.3"],"2":["7.12"],"6":["03.10.08"],"8":["7.1.1.3","7.1.1.10","8.1.1.3","8.1.1.10"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Data Center Physical Security",{"0":["9.3.1.1"],"6":["03.10.07"],"8":["7.1.10.1","8.1.10.1"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Environmental Threats",{"1":["DSS01.04"],"2":["7.5"],"5":["8.1.1"],"8":["7.1.1.5","7.1.1.6","7.1.1.7","7.1.1.8","7.1.10.1","8.1.1.5","8.1.1.6","8.1.1.7","8.1.1.8","8.1.10.1"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Equipment Maintenance",{"2":["7.13"],"6":["03.07.04","03.07.05"],"8":["7.1.1.3","8.1.1.3","8.1.10.4"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Facility Security Plan",{"5":["8.1.8"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Facility Security Plans",{"1":["DSS01.04","DSS01.05"],"2":["7.1","7.3"],"8":["7.1.1.1","7.1.1.4","7.1.10.1","8.1.1.1","8.1.1.4","8.1.10.1"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Labeling and Equipment Tracking",{"0":["9.2.2","9.5.1.1"],"1":["BAI09.03","DSS05.06"],"2":["5.9"],"6":["03.08.04"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Physical Entry Controls",{"0":["9.2.1","9.3.1","9.3.1.1"],"1":["DSS05.05"],"2":["5.15","7.4"],"5":["4.1.1","8.1.2","8.1.3","8.1.5","8.2.5"],"6":["03.07.06","03.10.01","03.10.02","03.10.07"],"8":["7.1.1.2","8.1.1.2"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Physical Security of Paper, Electronic Media and Equipment",{"0":["9.2.3","9.2.4","9.4.1","9.4.3","9.4.4","9.5.1","9.5.1.2","9.5.1.2.1"],"1":["DSS05.06","DSS06.06"],"2":["7.8","7.10"],"5":["8","8.1","8.2","8.3.1","8.3.2","8.4"],"6":["03.08.01","03.08.02"],"8":["7.1.10.1","7.1.10.3","8.1.10.1","8.1.10.3","8.1.10.4"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Physical Security of Secure Areas",{"2":["7.1","7.2","7.4","7.6"],"5":["3.1.1"],"6":["03.10.07"],"8":["7.1.1.1","8.1.1.1"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Power Failure Protection",{"1":["DSS01.05"],"2":["7.11"],"8":["7.1.1.9","8.1.1.4","8.1.1.9"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Removal of Asset",{"1":["BAI09.03","DSS05.06"],"2":["7.9"],"5":["3.1.3"],"6":["03.08.05"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Security Perimeter Controls",{"0":["9.2.1"],"2":["7.1"],"5":["8.1.3","8.1.4","8.1.5","8.2.5","8.4.2","8.4.3","8.5","8.5.1","8.5.2"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Surveillance Mechanisms",{"0":["9.2.1.1"],"2":["7.4"],"5":["8.1.6"],"6":["03.10.07"],"8":["8.1.1.3"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Visitor Access Management",{"0":["9.3.1","9.3.1.1","9.3.2","9.3.3","9.3.4"],"1":["DSS05.05"],"2":["5.15"],"5":["8.1.7"],"6":["03.07.06","03.10.07"],"8":["7.1.1.2","7.1.8.4","8.1.1.2","8.1.8.4"]}],["03. Infrastructure Security","3.2. Physical & Environmental Security","Work Area Security",{"2":["7.7"],"5":["8.1.5"],"6":["03.10.06"]}],["03. Infrastructure Security","3.3. Database Management","Database Integrity Checks",{"8":["7.1.4.7","8.1.4.7"]}],["03. Infrastructure Security","3.3. Database Management","Database Inventory",{"0":["9.4.5"],"1":["BAI09.01"],"2":["5.9"],"6":["03.04.10"],"8":["7.1.10.2","8.1.10.2"]}],["03. Infrastructure Security","3.3. Database Management","Database Maintenance",{"0":["7.2.6"],"1":["DSS05.01"]}],["03. Infrastructure Security","3.4. Platform Management","Executable Programs on Platforms",{"1":["DSS05.07"],"2":["8.18"],"6":["03.13.12"]}],["03. Infrastructure Security","3.4. Platform Management","Onboarding of New Application",{"1":["BAI10.01"]}],["03. Infrastructure Security","3.4. Platform Management","Security Testing for Platforms",{"0":["6.4.1","11.3.1","11.3.1.1","11.3.1.2","11.3.1.3","11.3.2","11.3.2.1"],"1":["DSS05.07"],"2":["8.8"],"6":["03.11.02"],"8":["7.1.10.5","8.1.10.5"]}],["03. Infrastructure Security","3.5. Patch Management","Patch Applicability",{"0":["6.3.3"],"1":["DSS05.01"]}],["03. Infrastructure Security","3.5. Patch Management","Patch Deployment and Coverage",{"0":["6.3.3"],"1":["DSS05.01"]}],["03. Infrastructure Security","3.5. Patch Management","Patch Detection",{"0":["6.3.3"],"1":["DSS05.01"]}],["03. Infrastructure Security","3.5. Patch Management","Patch Planning",{"0":["6.3.3"],"1":["DSS05.01"]}],["03. Infrastructure Security","3.5. Patch Management","Patch Testing",{"0":["6.3.3"],"1":["DSS05.01"]}],["03. Infrastructure Security","3.5. Patch Management","Patch Validation",{"0":["6.3.3"],"1":["DSS05.01"]}],["04. Data Governance","4.1. Data Management","Data Catalog and Tagging",{"1":["APO14.02","APO14.03","APO14.05","BAI08.02"],"2":["5.9","5.12","5.13"]}],["04. Data Governance","4.1. Data Management","Data Classification",{"0":["9.4.2"],"1":["BAI08.01"],"2":["5.12","5.13"],"5":["1.3.2"],"8":["7.1.9.1","8.1.9.1","8.1.10.2"]}],["04. Data Governance","4.1. Data Management","Data Discovery",{"1":["APO14.05"],"5":["9.3.1"]}],["04. Data Governance","4.1. Data Management","Data Inventory",{"1":["APO14.08","BAI08.04"],"2":["5.9"],"5":["1.3.1"]}],["04. Data Governance","4.1. Data Management","Data Loss Prevention",{"2":["8.12"]}],["04. Data Governance","4.1. Data Management","Data Loss Prevention (DLP)",{"2":["5.33"],"7":["11.3"]}],["04. Data Governance","4.1. Data Management","Data Protection",{"0":["3.3.1","3.3.1.1","3.3.1.2","3.3.1.3","3.3.2","3.3.3","3.4.1","3.4.2","3.5.1","4.2.1","4.2.1.2","4.2.2"],"1":["DSS06.06"],"2":["5.33","5.34","8.1","8.11"],"5":["1.3.2","5.1.2","7.1.2"],"6":["03.13.08"],"7":["11.1","11.3","11.5"],"8":["7.1.2.2","7.1.4.7","8.1.4.7","8.1.4.8"]}],["04. Data Governance","4.1. Data Management","Data Quality Management",{"1":["APO14.04","APO14.06","APO14.07"],"7":["11.1"]}],["04. Data Governance","4.1. Data Management","Data Retention and Disposition",{"0":["3.2.1","11.4.1"],"1":["APO14.09"],"2":["7.5.3","7.1","7.14","8.10"],"6":["03.14.08"],"7":["11.1"]}],["04. Data Governance","4.1. Data Management","Extraneous requirement related to Data Privacy",{"5":["9.4.1","9.6.1","9.6.2"],"8":["7.1.4.10","8.1.4.11"]}],["04. Data Governance","4.1. Data Management","Restrictions on Transfer of Corporate Information",{"2":["5.14"],"5":["9.5.1","9.5.2","9.5.3"],"7":["11.3"]}],["04. Data Governance","4.2. Encryption and Key Management","Certificates Backup and Archival",{"0":["3.6.1.1"],"2":["8.24"]}],["04. Data Governance","4.2. Encryption and Key Management","Certificates Expiration Monitoring",{"0":["3.6.1.1"]}],["04. Data Governance","4.2. Encryption and Key Management","Certificates Generation",{"2":["8.24"]}],["04. Data Governance","4.2. Encryption and Key Management","Cryptographic Key Management",{"0":["2.2.7","2.3.2","3.3.2","3.3.3","3.5.1","3.5.1.1","3.5.1.2","3.5.1.3","3.6.1","3.6.1.1","3.6.1.2","3.6.1.3","3.7.1","3.7.2","3.7.4","3.7.5","3.7.6","3.7.7","3.7.8","3.7.9","4.2.1.1"],"2":["8.24"],"5":["5.1.1"],"6":["03.13.10"],"7":["11.5"]}],["04. Data Governance","4.2. Encryption and Key Management","Cryptographic key management",{"0":["4.2.1"]}],["04. Data Governance","4.2. Encryption and Key Management","Electronic Signature",{"7":["11.5","11.7","11.1","11.2"]}],["04. Data Governance","4.2. Encryption and Key Management","Key Backup and Archival",{"0":["3.5.1.1","3.6.1","3.6.1.1","3.6.1.4","3.7.3","3.7.4","3.7.5","3.7.6"],"2":["8.24"],"6":["03.13.10"]}],["04. Data Governance","4.2. Encryption and Key Management","Legal and Regulatory Adherence of Cryptographic Controls",{"0":["8.3.2","12.3.3"],"2":["5.31"],"5":["5.1.1"],"6":["03.13.11"],"8":["7.1.9.3","7.1.10.9","8.1.9.3","8.1.10.9"]}],["04. Data Governance","4.2. Encryption and Key Management","Securing Certificates",{"2":["8.24"],"7":["11.1"]}],["04. Data Governance","4.2. Encryption and Key Management","Securing Cryptographic Keys",{"0":["3.6.1","3.6.1.1","3.6.1.2","3.6.1.3","3.7.7","4.2.1.1"],"2":["8.24"],"5":["5.1.1"]}],["04. Data Governance","4.2. Encryption and Key Management","Unapproved Certificate Monitoring",{"0":["3.6.1.1"],"2":["8.24"]}],["05. Service Continuity Management","5.1. Business Continuity Management","BCM Arrangements in Third Parties",{"1":["DSS04.01"],"2":["5.30"]}],["05. Service Continuity Management","5.1. Business Continuity Management","BCM Governance Framework",{"1":["DSS04.01","DSS04.05"],"5":["5.2.8"]}],["05. Service Continuity Management","5.1. Business Continuity Management","Business Continuity Plan",{"1":["DSS04.01","DSS04.03"],"2":["5.30","8.14"],"5":["5.2.8"]}],["05. Service Continuity Management","5.1. Business Continuity Management","Business Continuity Plan Testing",{"1":["DSS04.04","DSS04.08"],"2":["5.30"],"5":["5.2.8"]}],["05. Service Continuity Management","5.1. Business Continuity Management","Business Impact Analysis (BIA)",{"1":["DSS04.02"],"2":["5.29","5.30"]}],["05. Service Continuity Management","5.2. Disaster Recovery Management","Crisis Communication",{"1":["DSS04.02"],"5":["1.6.3"]}],["05. Service Continuity Management","5.2. Disaster Recovery Management","Crisis Management Plan",{"1":["DSS04.02","DSS04.03"],"2":["5.29"],"5":["1.6.3"]}],["05. Service Continuity Management","5.2. Disaster Recovery Management","Crisis Scenario Testing",{"1":["DSS04.04"],"5":["1.6.3"]}],["05. Service Continuity Management","5.2. Disaster Recovery Management","Disaster Recovery Plan",{"1":["DSS04.01","DSS04.02","DSS04.03"],"2":["5.29"]}],["05. Service Continuity Management","5.2. Disaster Recovery Management","Disaster Recovery Plan Testing",{"1":["DSS04.04","DSS04.08"]}],["05. Service Continuity Management","5.3. Data Backup","Backup Protection & Monitoring",{"0":["9.4.1.1","9.4.1.2"],"5":["5.2.9"],"6":["03.08.09"],"8":["7.1.10.11","8.1.10.11"]}],["05. Service Continuity Management","5.3. Data Backup","Data Backup Management",{"0":["9.4.1.1","9.4.1.2"],"1":["APO14.10","DSS04.07"],"2":["8.13"],"5":["5.2.9"],"6":["03.08.09"],"8":["7.1.4.8","7.1.7.5","7.1.10.11","8.1.4.9","8.1.10.11"]}],["05. Service Continuity Management","5.3. Data Backup","Data Restoration Testing",{"2":["8.13"],"6":["03.08.09"],"8":["7.1.10.11","8.1.10.11"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Application Programming Interfaces (APIs)",{"0":["6.4.3"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Application Security",{"0":["6.2.1","6.2.4","6.4.2","6.4.3"],"1":["DSS05.07"],"2":["8.29"],"5":["1.3.4"],"8":["7.1.9.4","7.1.9.5","7.1.9.7","8.1.9.4","8.1.9.5","8.1.9.7"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Escrows for Third Party Source Codes",{"1":["BAI03.04"],"2":["8.4"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Outsourced Development",{"1":["DSS01.02"],"2":["8.3"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Protection of Production Data in Test Environment",{"0":["6.5.5"],"2":["8.33"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Release Management",{"1":["BAI07.01","BAI07.02","BAI07.06","BAI07.07","BAI07.08"],"2":["8.19"],"7":["11.1"],"8":["7.1.9.5","7.1.9.6","7.1.9.8","8.1.9.4","8.1.9.6","8.1.9.8"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Separation of Development, Test, and Operational Environments",{"0":["6.5.3"],"1":["BAI03.03","BAI07.05"],"2":["8.31"],"5":["5.2.2"],"8":["7.1.9.4","8.1.9.4"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Software Data Migration",{"1":["BAI07.01","BAI07.02"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Software Design",{"1":["BAI03.01","BAI03.02"],"8":["7.1.9.5","8.1.9.4"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Software Development Methodology",{"0":["6.2.1"],"1":["DSS01.01","BAI03.03","BAI03.05","BAI03.06","BAI03.10","BAI03.11","BAI03.12","BAI07.01"],"5":["5.3.1"],"6":["03.16.01"],"8":["8.1.9.4"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Software Requirement Analysis",{"1":["BAI02.01","BAI02.02","BAI02.03","BAI02.04","BAI03.09"],"2":["8.26"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","Software Testing",{"0":["6.5.6"],"1":["BAI03.07","BAI03.08","BAI07.03","BAI07.04","BAI07.05"],"2":["8.29"],"8":["7.1.9.4","7.1.9.5","7.1.9.7","8.1.9.5","8.1.9.7"]}],["06. Systems Development Lifecycle","6.1. System Development Lifecycle Management","System Development Methodology",{"2":["8.25","8.27","8.28"]}],["06. Systems Development Lifecycle","6.2. Source Code Management","Open Source Code Management",{"0":["6.2.3","6.2.3.1"],"1":["BAI03.03"],"2":["8.4"]}],["06. Systems Development Lifecycle","6.2. Source Code Management","Source Code Management",{"1":["BAI03.03"],"8":["8.1.9.4"]}],["06. Systems Development Lifecycle","6.2. Source Code Management","Source Code Review",{"0":["6.2.3","6.2.3.1"],"1":["BAI03.06"],"2":["8.28"],"8":["7.1.9.5","8.1.9.4","8.1.9.5"]}],["06. Systems Development Lifecycle","6.3. System Acquisition & Maintenance","Acquisition and Maintenance",{"1":["APO14.08","BAI03.04"],"2":["5.23"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Error Management",{"1":["DSS03.03"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Incident Classification and Prioritization",{"1":["DSS02.01","DSS02.02"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Incident Management",{"6":["03.06.01","03.06.03","03.06.05"],"8":["7.1.2.3","7.1.3.6","8.1.3.6","8.1.5.4"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Incident Notification",{"6":["03.06.02"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Incident Reporting",{"1":["DSS02.07"],"6":["03.06.02"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Incident Response and Resolution",{"1":["DSS02.03","DSS02.04","DSS02.05","DSS02.06"],"6":["03.06.02"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Learning from Incidents",{"1":["DSS02.07"],"6":["03.06.04","03.06.05"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Major Incidents",{"1":["DSS02.01","DSS02.02","DSS02.03","DSS02.04","DSS02.05","DSS02.06"],"8":["7.1.10.13","8.1.10.13"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Post-Incident Activities",{"1":["DSS02.07"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Problem Investigation and Diagnosis",{"1":["DSS03.01","DSS03.02"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Problem Management",{"1":["DSS03.01"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Problem Resolution and Closure",{"1":["DSS03.04"]}],["07. Service Delivery & Operations","7.1. Incident & Problem Management","Trend Analysis for Problem Identification",{"1":["DSS03.05"]}],["07. Service Delivery & Operations","7.2. Change Management","Backout Plans",{"0":["6.5.1"],"2":["8.1"],"8":["8.1.10.10"]}],["07. Service Delivery & Operations","7.2. Change Management","Change Approval and Review",{"0":["6.5.1"],"1":["BAI06.01","BAI06.03"],"6":["03.04.05"],"8":["7.1.10.10","8.1.10.10"]}],["07. Service Delivery & Operations","7.2. Change Management","Change Closure",{"0":["6.5.2"],"1":["BAI06.03","BAI06.04"]}],["07. Service Delivery & Operations","7.2. Change Management","Change Deployment",{"0":["6.5.1"],"6":["03.04.04"]}],["07. Service Delivery & Operations","7.2. Change Management","Change Management",{"0":["1.2.2","6.5.1"],"1":["BAI06.01","BAI06.02","BAI06.03"],"2":["8.1","8.32"],"5":["5.2.1"],"6":["03.04.03"]}],["07. Service Delivery & Operations","7.2. Change Management","Change Request Management",{"0":["6.5.1"],"1":["BAI06.01"],"8":["7.1.10.10","8.1.10.10"]}],["07. Service Delivery & Operations","7.2. Change Management","Change Tracking and Communication",{"0":["6.5.2"],"1":["BAI06.03"]}],["07. Service Delivery & Operations","7.2. Change Management","Emergency Change Approval and Review",{"1":["BAI06.02"]}],["07. Service Delivery & Operations","7.2. Change Management","Emergency Change Management",{"1":["BAI06.02"]}],["07. Service Delivery & Operations","7.2. Change Management","Emergency Change Request",{"1":["BAI06.01","BAI06.02"]}],["07. Service Delivery & Operations","7.2. Change Management","Pre-Approved Change Management",{"1":["BAI06.01"]}],["07. Service Delivery & Operations","7.2. Change Management","Testing of Changes",{"0":["6.5.1"],"2":["8.1"],"6":["03.04.03","03.04.04"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Acceptable Use of Assets",{"0":["12.2.1"],"1":["APO14.01"],"2":["5.10","5.32"],"5":["8.2.7"],"6":["03.08.07"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Asset Catalog Management",{"0":["6.3.2","9.4.5","12.5.1"],"1":["BAI09.01","BAI09.02","BAI09.03"],"2":["5.9"],"6":["03.04.10","03.04.11"],"8":["7.1.10.2","8.1.10.2"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Asset Configuration Baselines",{"0":["1.2.1","1.2.8","2.2.1","2.2.3","2.2.4","2.2.5","2.2.6"],"1":["BAI10.01","BAI10.02","BAI10.03","BAI10.04","BAI10.05"],"2":["8.9"],"6":["03.04.01","03.04.02","03.04.06","03.04.08","03.04.12"],"8":["7.1.4.4","7.1.10.6","7.1.10.8","8.1.4.4","8.1.10.6","8.1.10.8"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Asset Discovery",{"1":["BAI09.01"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Asset Disposition",{"0":["9.4.6","9.4.7"],"1":["BAI09.03"],"2":["7.10","7.14"],"6":["03.08.03"],"8":["7.1.4.9","8.1.4.10","8.1.10.4"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Asset End of Life Management",{"1":["BAI09.03"],"2":["7.10"],"6":["03.16.02"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Asset Maintenance",{"1":["APO14.01"],"6":["03.07.04","03.07.05"],"8":["8.1.10.4"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Asset Ownership",{"1":["APO01.07","BAI09.01"],"2":["5.9"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Asset Protection",{"1":["APO14.01"],"2":["7.9"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Asset Recertification",{"1":["BAI09.04"],"2":["5.9"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Configuration Baseline Monitoring",{"0":["1.2.1","1.2.7","1.2.8","2.2.1","2.2.6"],"1":["BAI10.03","BAI10.05"],"2":["8.9"],"6":["03.04.06"],"8":["8.1.10.8"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Configuration Baseline Testing",{"0":["2.2.1"],"1":["BAI10.05"],"6":["03.04.02"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","License Management",{"1":["BAI09.05"]}],["07. Service Delivery & Operations","7.3. IT Asset & Configuration Management","Return of Assets",{"2":["5.11"],"5":["5.3.3"],"8":["7.1.8.2","8.1.8.2"]}],["07. Service Delivery & Operations","7.4. Service Level Management","Service Catalog Management",{"1":["APO09.02","BAI03.11"]}],["07. Service Delivery & Operations","7.4. Service Level Management","Service Level Agreement",{"1":["APO09.03","APO09.05"],"8":["7.1.10.14","8.1.10.14"]}],["07. Service Delivery & Operations","7.4. Service Level Management","Service Level Monitoring",{"1":["APO09.01","APO09.04","DSS01.02"],"2":["5.22","5.23"]}],["07. Service Delivery & Operations","7.5. Capacity Management","Capacity  Baseline and Thresholds",{"1":["BAI04.01"],"8":["8.1.2.1"]}],["07. Service Delivery & Operations","7.5. Capacity Management","Capacity Baseline and Thresholds",{"2":["8.6"]}],["07. Service Delivery & Operations","7.5. Capacity Management","Capacity Forecasting",{"1":["BAI04.02","BAI04.03"],"2":["8.6"]}],["07. Service Delivery & Operations","7.5. Capacity Management","Capacity Monitoring",{"1":["BAI04.04","BAI04.05"],"2":["8.6"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","4th/ N-th Parties Governance",{"2":["5.19"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","IT Contract Change Management",{"1":["APO10.03"],"2":["5.22"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","IT Contract Execution",{"0":["12.8.2","12.8.5","12.9.1","12.9.2"],"1":["APO09.03","APO10.01","APO10.03"],"2":["5.19","5.20"],"5":["6.1.2","8.2.1","8.2.2"],"6":["03.12.05"],"8":["7.1.10.14","8.1.9.10","8.1.10.14"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","IT Contract Monitoring",{"0":["8.2.3","12.8.2","12.9.1"],"1":["APO09.05","APO10.03"],"2":["5.20","5.22"],"6":["03.16.03"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","IT Contract Renewals and Termination",{"1":["APO09.05","APO10.03"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","IT Third Party Due Diligence",{"0":["12.8.3"],"1":["APO10.02"],"2":["5.19","5.21"],"5":["1.3.3"],"6":["03.17.01"],"8":["8.1.10.14"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","IT Third Party Planning & Selection",{"1":["APO10.01","APO10.02"],"5":["1.3.3"],"8":["7.1.10.14","8.1.9.10","8.1.10.14"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","IT Third Party Risk Assessment",{"0":["12.8.4"],"2":["5.19","5.21"],"5":["1.3.3"],"6":["03.11.01","03.17.01","03.17.03"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","IT Third Party Risk Issue Management",{"1":["APO10.04","APO10.05"],"2":["5.21"],"6":["03.16.03","03.17.01"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","IT Third Party Risk Management Framework",{"0":["12.8.1","12.8.3"],"1":["APO09.01","APO10.04"],"2":["5.19","5.20","5.21"],"5":["1.3.3","6.1.1","8.2.2"],"6":["03.16.03","03.17.01"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","Third Party Concentration Risk",{"2":["5.19"]}],["08. IT Third Party Management","8.1. IT Third Party Risk Management","Third Party Offboarding & Exit Strategies",{"2":["5.23"]}],["08. IT Third Party Management","8.2. IT Third Party Service Monitoring","IT Third Party Recourse",{"1":["APO10.05"]}],["08. IT Third Party Management","8.2. IT Third Party Service Monitoring","IT Third Party Service Monitoring",{"0":["12.9.1","12.9.2"],"1":["APO09.01","APO09.04","APO10.05"],"2":["5.22"],"6":["03.16.03"],"8":["8.1.9.10"]}],["09. IT Governance","9.1. IT Governance & Control","Background Screening",{"0":["12.7.1"],"2":["6.1"],"5":["2.1.1"],"6":["03.09.01"],"8":["7.1.8.1","8.1.8.1"]}],["09. IT Governance","9.1. IT Governance & Control","Communication",{"1":["APO02.06","EDM05.02"],"2":["7.4"],"8":["7.1.7.4","8.1.7.4"]}],["09. IT Governance","9.1. IT Governance & Control","Contact with Authorities & Special Interest Groups",{"2":["5.5","5.6"],"6":["03.14.03"],"8":["7.1.7.4","8.1.7.4"]}],["09. IT Governance","9.1. IT Governance & Control","Continual Process Improvement",{"1":["APO08.05","APO01.11","EDM01.03","MEA01.01","MEA01.02","MEA01.03","MEA01.04","MEA01.05"],"2":["6.1.1","7.1","9.3","10.2"]}],["09. IT Governance","9.1. IT Governance & Control","Dependence on Key Individuals",{"1":["APO07.02","EDM05.01","EDM05.03"],"8":["7.1.7.2","8.1.7.2"]}],["09. IT Governance","9.1. IT Governance & Control","Disciplinary Process",{"5":["2.1.2"]}],["09. IT Governance","9.1. IT Governance & Control","Disciplinary process",{"2":["6.4"]}],["09. IT Governance","9.1. IT Governance & Control","Employee Roles & Responsibilities",{"0":["1.1.2","2.1.2","3.1.2","4.1.2","5.1.2","6.1.2","7.1.2","8.1.2","9.1.2","10.1.2","11.1.2","12.1.3"],"1":["APO01.05"],"2":["5.2","5.3","5.4","6.2","6.5"],"5":["1.2.2","1.2.4","9.2.1"],"6":["03.15.03"],"8":["7.1.7.1","7.1.10.6","8.1.7.1","8.1.10.6"]}],["09. IT Governance","9.1. IT Governance & Control","IT Governance",{"5":["1.2.4"]}],["09. IT Governance","9.1. IT Governance & Control","IT Governance Framework",{"0":["12.1.4","12.4.1"],"1":["APO01.10","APO08.03","APO08.04","BAI05.01","BAI05.02","BAI05.05","BAI05.06","EDM02.02","EDM02.03","APO01.01","APO01.04","APO01.05","APO01.06","BAI05.03","EDM01.01","EDM01.02"],"2":["6.2","9.1","5.2"],"8":["7.1.7.1","8.1.7.1"]}],["09. IT Governance","9.1. IT Governance & Control","IT Policies and Standards Management",{"0":["1.1.1","2.1.1","3.1.1","3.7.1","3.7.2","3.7.3","4.1.1","5.1.1","6.1.1","7.1.1","8.1.1","9.1.1","10.1.1","11.1.1"],"2":["7.5.2","5.1","5.37"],"5":["1.1.1","9.1.1"],"6":["03.15.01"],"7":["11.1"],"8":["7.1.6.3","7.1.6.4","7.1.10.6","8.1.6.3","8.1.6.4","8.1.10.6"]}],["09. IT Governance","9.1. IT Governance & Control","Information Security Management System (ISMS)",{"0":["12.1.1","12.1.2"],"1":["APO01.09","APO13.01","APO13.02","APO13.03"],"2":["4.1","4.3","4.4","5.1","5.2","7.5.1","9.1"],"5":["1.2.1"],"6":["03.15.02"],"8":["7.1.6.1","7.1.6.2","7.1.7.1","8.1.6.1","8.1.6.2"]}],["09. IT Governance","9.1. IT Governance & Control","NA",{"6":["03.01.13","03.01.14","03.01.15","03.01.17","03.01.19","03.01.21","03.02.03","03.03.09","03.04.07","03.04.09","03.05.06","03.05.08","03.05.09","03.05.10","03.07.01","03.07.02","03.07.03","03.08.06","03.08.08","03.10.03","03.10.04","03.10.05","03.11.03","03.12.04","03.13.02","03.13.03","03.13.05","03.13.07","03.13.14","03.13.16","03.14.04","03.14.05","03.14.07"]}],["09. IT Governance","9.1. IT Governance & Control","Performance Management",{"1":["APO07.04"],"2":["7.2"]}],["09. IT Governance","9.1. IT Governance & Control","Resource Management",{"1":["EDM04.01","EDM04.02","EDM04.03","APO01.08","APO07.01","APO07.02","APO07.05","EDM05.01"],"8":["7.1.7.2","8.1.7.2"]}],["09. IT Governance","9.1. IT Governance & Control","Terms and Conditions of Employment",{"1":["APO07.06"],"2":["6.2","6.6"],"5":["6.1.2","8.2.1"],"8":["8.1.8.4"]}],["09. IT Governance","9.1. IT Governance & Control","Training and Awareness",{"0":["6.2.2","9.5.1.3","12.6.1","12.6.2","12.6.3","12.6.3.1","12.6.3.2","12.10.4","12.10.4.1"],"1":["BAI05.07","APO01.02","APO07.03","BAI05.04","BAI08.03","DSS04.06"],"2":["7.2","7.3","5.4","6.3"],"5":["2.1.3","8.2.3"],"6":["03.01.22","03.02.01","03.02.02","03.06.04"],"7":["11.1"],"8":["7.1.8.3","7.1.9.8","7.1.10.13","8.1.8.3","8.1.9.8","8.1.10.13"]}],["09. IT Governance","9.2. IT Risk Management","IT Risk Assessment",{"0":["5.3.2.1","12.3.1","12.3.2","12.3.4"],"1":["APO12.02","APO12.03","MEA04.07"],"2":["6.1.1","6.1.2","8.2","5.35"],"6":["03.11.01","03.12.01"],"8":["8.1.7.5"]}],["09. IT Governance","9.2. IT Risk Management","IT Risk Management Framework",{"1":["DSS06.01","DSS06.02","DSS06.04","MEA04.01","MEA04.02","MEA04.03","MEA04.04","MEA04.05","MEA04.06","APO12.01","EDM03.01","EDM03.02"],"2":["6.1.2","6.1.3","8.3"],"5":["1.4.1"],"6":["03.12.03"],"8":["7.1.9.2","8.1.9.2"]}],["09. IT Governance","9.2. IT Risk Management","IT Risk Reporting",{"1":["APO12.04","EDM03.03"],"2":["6.1.2","6.1.3","9.1"]}],["09. IT Governance","9.2. IT Risk Management","IT Risk Response",{"1":["MEA04.09","APO12.05","APO12.06"],"2":["6.1.1","6.1.2","8.3","9.3"],"6":["03.11.04","03.12.02"]}],["09. IT Governance","9.3. IT Compliance Management","IT Compliance Assessment",{"0":["12.3.4","12.4.2"],"1":["MEA02.02","MEA02.03","MEA03.03","MEA04.07"],"2":["9.2","10.1","5.36","8.34"],"5":["1.5.1","1.5.2","7.1.1"],"6":["03.12.01"],"8":["7.1.9.9","8.1.9.9"]}],["09. IT Governance","9.3. IT Compliance Management","IT Compliance Management Framework",{"0":["12.5.2","12.5.2.1","12.5.3"],"1":["MEA04.08","APO01.03","APO01.09","MEA02.01"],"2":["4.2","5.31"],"5":["8.2.6","8.4.1"]}],["09. IT Governance","9.3. IT Compliance Management","IT Compliance Reporting",{"0":["12.4.2.1"],"1":["MEA02.01","MEA02.04","MEA03.04"],"2":["9.1","9.3"]}],["09. IT Governance","9.3. IT Compliance Management","Non-Conformity and Findings Management",{"0":["12.4.2.1"],"1":["MEA04.09","APO01.09","MEA02.04","MEA03.04"],"2":["9.3","10.1"],"6":["03.11.04","03.12.02"]}],["09. IT Governance","9.4. IT Regulatory Management","IT Regulatory Change Management",{"1":["MEA03.01","MEA03.02"],"2":["5.31"]}]]};

const FW = DB.frameworks;
const FW_ABBR = ["PCI DSS","COBIT 2019","ISO 27001","NIST CSF","NIS 2","TISAX","NIST 800-171","FDA 21 CFR","MLPS"];
const FW_COLORS = ["#3b82f6","#8b5cf6","#059669","#f59e0b","#ef4444","#0ea5e9","#6366f1","#ec4899","#14b8a6"];
const MT_COLORS = {"01. IT Strategy":"#6366f1","02. Information Security":"#ef4444","03. Infrastructure Security":"#f59e0b","04. Data Governance":"#0ea5e9","05. Service Continuity Management":"#059669","06. Systems Development Lifecycle":"#8b5cf6","07. Service Delivery & Operations":"#f97316","08. IT Third Party Management":"#ec4899","09. IT Governance":"#14b8a6"};

function getRows(fwIdxs) {
  const s = new Set(fwIdxs.map(String));
  return DB.table.filter(r => Object.keys(r[3]).some(k => s.has(k)));
}

function exportXLSX(rows, fwIdxs, q) {
  const scr = document.createElement("script");
  scr.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  scr.onload = () => {
    const X = window.XLSX;
    const hdrs = ["#", "Main Theme", "Sub Theme", "Granular Theme", ...fwIdxs.map(i => FW[i])];
    const data = [hdrs, ...rows.map((r, i) => {
      const [main, sub, gran, fm] = r;
      return [i+1, main, sub, gran, ...fwIdxs.map(fi => (fm[String(fi)]||[]).join(", "))];
    })];
    const wb = X.utils.book_new();
    const ws = X.utils.aoa_to_sheet(data);
    ws["!cols"] = [{wch:5},{wch:28},{wch:35},{wch:40},...fwIdxs.map(()=>({wch:28}))];
    X.utils.book_append_sheet(wb, ws, "Compliance Mapping");
    X.writeFile(wb, `compliance_${q.replace(/[^a-z0-9]/gi,"_").slice(0,30)}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };
  document.head.appendChild(scr);
}

// ── Azure OpenAI call ─────────────────────────────────────────────────────────
function buildAzureURL(creds) {
  // Strip trailing slash, then strip any existing /openai/... path to avoid doubling
  let base = creds.endpoint.replace(/\/$/, "");
  base = base.replace(/\/openai.*$/, ""); // remove any /openai/deployments/... suffix
  return `${base}/openai/deployments/${creds.deployment}/chat/completions?api-version=${creds.apiVersion}`;
}

async function testAzureConnection(creds) {
  const url = buildAzureURL(creds);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": creds.apiKey },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Reply with the single word: OK" }],
      max_tokens: 5,
      temperature: 0
    })
  });
  if (!res.ok) {
    const err = await res.text();
    let msg = `HTTP ${res.status}`;
    try { const j = JSON.parse(err); msg = j.error?.message || msg; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "OK";
}

async function callAzureOpenAI(creds, userMsg) {
  const url = buildAzureURL(creds);
  const systemPrompt = `You are a cybersecurity compliance expert. Given a client description, determine which of the following frameworks apply. Return ONLY valid JSON — no other text, no markdown, no explanation.

Available frameworks (use their index numbers):
${FW.map((f,i) => `${i}: ${f}`).join("\n")}

Return exactly this JSON format:
{"frameworks":[0,2,3],"rationale":{"summary":"1-2 sentence summary","details":{"0":"why PCI DSS applies","2":"why ISO 27001 applies"}}}

Selection rules:
- ISO 27001 (2) and COBIT 2019 (1): apply to virtually all organizations as a baseline
- PCI DSS v4.01 (0): card payments, payment processing, cardholder data
- NIS 2 (4): EU/EEA operations, critical infrastructure, essential services
- TISAX (5): automotive industry, vehicle manufacturers, automotive suppliers
- NIST CSF 2.0 (3): US-based organizations, critical infrastructure, federal-adjacent
- NIST SP 800-171 R3 (6): US federal contractors, controlled unclassified info, DoD
- FDA 21 CFR Part-11 (7): pharma, biotech, medical devices, clinical trials
- MLPS (8): organizations operating in China, Chinese market, PRC data residency`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": creds.apiKey
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Client description: "${userMsg}"` }
      ],
      max_tokens: 800,
      temperature: 0.1
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON returned from model");
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed.frameworks)) throw new Error("Invalid response format");
  return parsed;
}

// ── SCREENS ───────────────────────────────────────────────────────────────────

const S = {
  wrap: { minHeight:"100vh", background:"linear-gradient(135deg,#0a0a14 0%,#12122a 60%,#0d1f33 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" },
  card: { background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"1.25rem", padding:"1.75rem", backdropFilter:"blur(20px)" },
  input: { width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"0.6rem", padding:"0.7rem 0.9rem", color:"#f1f5f9", fontSize:"0.92rem", fontFamily:"inherit", outline:"none", boxSizing:"border-box", transition:"border-color .2s" },
  label: { display:"block", color:"#94a3b8", fontSize:"0.75rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"0.45rem" },
  btn: (active) => ({ width:"100%", padding:"0.82rem", background: active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,.05)", border:"none", borderRadius:"0.65rem", color: active ? "#fff" : "#475569", fontSize:"0.95rem", fontWeight:700, cursor: active ? "pointer" : "not-allowed", fontFamily:"inherit", transition:"all .2s", marginTop:"1rem" }),
};

function ConfigScreen({ creds, setCreds, onSave }) {
  const [local, setLocal] = useState(creds);
  const [testStatus, setTestStatus] = useState(null); // null | "testing" | "ok" | "error"
  const [testMsg, setTestMsg] = useState("");
  const allFilled = local.endpoint && local.apiKey && local.deployment && local.apiVersion;
  const set = (k, v) => { setLocal(p => ({...p, [k]: v})); setTestStatus(null); };

  const previewURL = (() => {
    if (!local.endpoint || !local.deployment) return null;
    let base = local.endpoint.replace(/\/$/, "").replace(/\/openai.*$/, "");
    return `${base}/openai/deployments/${local.deployment}/chat/completions?api-version=${local.apiVersion||"..."}`;
  })();

  async function handleTest() {
    setTestStatus("testing"); setTestMsg("");
    try {
      await testAzureConnection(local);
      setTestStatus("ok"); setTestMsg("Connection successful! Your credentials are valid.");
    } catch(e) {
      setTestStatus("error"); setTestMsg(e.message || "Connection failed.");
    }
  }

  function handleSave() {
    setCreds(local); onSave();
  }

  const testColors = { ok: { bg:"rgba(5,150,105,.1)", border:"rgba(5,150,105,.3)", text:"#34d399", icon:"✅" },
    error: { bg:"rgba(239,68,68,.1)", border:"rgba(239,68,68,.3)", text:"#fca5a5", icon:"❌" },
    testing: { bg:"rgba(99,102,241,.1)", border:"rgba(99,102,241,.3)", text:"#a5b4fc", icon:"⏳" } };
  const tc = testStatus ? testColors[testStatus] : null;

  return (
    <div style={S.wrap}>
      <div style={{width:"100%", maxWidth:"580px"}}>
        <div style={{textAlign:"center", marginBottom:"2rem"}}>
          <div style={{display:"inline-flex",gap:"0.6rem",alignItems:"center",background:"rgba(99,102,241,.12)",border:"1px solid rgba(99,102,241,.25)",borderRadius:"2rem",padding:"0.45rem 1.1rem",marginBottom:"1.25rem"}}>
            <span>⚙️</span>
            <span style={{color:"#a5b4fc",fontSize:"0.78rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Azure OpenAI Setup</span>
          </div>
          <h1 style={{fontSize:"2rem",fontWeight:800,color:"#f1f5f9",margin:"0 0 0.75rem",letterSpacing:"-0.02em"}}>
            Connect Your<br/>
            <span style={{background:"linear-gradient(90deg,#818cf8,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Azure OpenAI</span>
          </h1>
          <p style={{color:"#64748b",fontSize:"0.9rem",margin:0,lineHeight:1.65}}>
            Enter your Azure OpenAI credentials, test the connection,<br/>then continue to the compliance tool.
          </p>
        </div>

        <div style={S.card}>
          <div style={{display:"grid",gap:"1rem"}}>
            {/* Endpoint */}
            <div>
              <label style={S.label}>Azure Endpoint</label>
              <input style={S.input} value={local.endpoint} onChange={e=>set("endpoint",e.target.value)}
                placeholder="https://your-resource.openai.azure.com"
                onFocus={e=>e.target.style.borderColor="rgba(129,140,248,.6)"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}/>
              <p style={{color:"#334155",fontSize:"0.72rem",marginTop:"0.3rem"}}>
                Base resource URL only — e.g. <code style={{color:"#475569"}}>https://my-resource.openai.azure.com</code>
              </p>
            </div>
            {/* API Key */}
            <div>
              <label style={S.label}>API Key</label>
              <input style={S.input} type="password" value={local.apiKey} onChange={e=>set("apiKey",e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                onFocus={e=>e.target.style.borderColor="rgba(129,140,248,.6)"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}/>
            </div>
            {/* Deployment + Version */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
              <div>
                <label style={S.label}>Deployment Name</label>
                <input style={S.input} value={local.deployment} onChange={e=>set("deployment",e.target.value)}
                  placeholder="gpt-4o"
                  onFocus={e=>e.target.style.borderColor="rgba(129,140,248,.6)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}/>
                <p style={{color:"#334155",fontSize:"0.72rem",marginTop:"0.3rem"}}>Exact name from Azure AI Studio → Deployments</p>
              </div>
              <div>
                <label style={S.label}>API Version</label>
                <input style={S.input} value={local.apiVersion} onChange={e=>set("apiVersion",e.target.value)}
                  placeholder="2025-01-01-preview"
                  onFocus={e=>e.target.style.borderColor="rgba(129,140,248,.6)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}/>
                <p style={{color:"#334155",fontSize:"0.72rem",marginTop:"0.3rem"}}>e.g. 2025-01-01-preview</p>
              </div>
            </div>
          </div>

          {/* Live URL preview */}
          {previewURL && (
            <div style={{marginTop:"1rem",background:"rgba(15,23,42,0.6)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"0.5rem",padding:"0.65rem 0.85rem"}}>
              <p style={{color:"#334155",fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 0.3rem"}}>Constructed URL</p>
              <code style={{color:"#64748b",fontSize:"0.72rem",wordBreak:"break-all",lineHeight:1.7}}>{previewURL}</code>
            </div>
          )}

          {/* Test result banner */}
          {tc && (
            <div style={{marginTop:"0.9rem",background:tc.bg,border:`1px solid ${tc.border}`,borderRadius:"0.55rem",padding:"0.65rem 0.9rem",display:"flex",alignItems:"center",gap:"0.55rem"}}>
              <span style={{fontSize:"1rem"}}>{tc.icon}</span>
              <span style={{color:tc.text,fontSize:"0.84rem",fontWeight:500}}>{testMsg}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.65rem",marginTop:"1rem"}}>
            <button style={{...S.btn(allFilled && testStatus!=="testing"), background: allFilled && testStatus!=="testing" ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.03)", color: allFilled ? "#94a3b8" : "#334155", border:"1px solid rgba(255,255,255,.1)"}}
              disabled={!allFilled || testStatus==="testing"}
              onClick={handleTest}>
              {testStatus==="testing" ? "Testing…" : "🔌 Test Connection"}
            </button>
            <button style={{...S.btn(allFilled && testStatus==="ok")}}
              disabled={!allFilled || testStatus!=="ok"}
              onClick={handleSave}>
              Save & Continue →
            </button>
          </div>
          {testStatus !== "ok" && allFilled && (
            <p style={{color:"#334155",fontSize:"0.72rem",textAlign:"center",margin:"0.5rem 0 0"}}>Test connection first to verify credentials before continuing</p>
          )}
        </div>

        <div style={{marginTop:"1.5rem",background:"rgba(99,102,241,.06)",border:"1px solid rgba(99,102,241,.15)",borderRadius:"0.75rem",padding:"1rem"}}>
          <p style={{color:"#818cf8",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 0.5rem"}}>💡 Troubleshooting</p>
          <ul style={{color:"#475569",fontSize:"0.76rem",margin:0,paddingLeft:"1.1rem",lineHeight:2}}>
            <li>Endpoint: base URL only, no <code style={{color:"#64748b"}}>/openai</code> or <code style={{color:"#64748b"}}>/deployments</code> suffix</li>
            <li>Deployment: find exact name in Azure AI Studio → Deployments tab</li>
            <li>404 error → wrong deployment name or endpoint has extra path</li>
            <li>401 error → wrong or expired API key</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function QueryScreen({ creds, onOpenConfig, val, setVal, onGo, err }) {
  const EXAMPLES = [
    "EU-based fintech startup processing card payments",
    "US federal contractor building defense software",
    "Automotive parts supplier for BMW and Mercedes",
    "Healthcare SaaS platform storing patient records",
    "Gaming company with in-app purchases, global users",
    "Chinese e-commerce platform with EU operations",
  ];

  return (
    <div style={S.wrap}>
      <div style={{width:"100%",maxWidth:"660px"}}>
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <div style={{display:"flex",justifyContent:"center",gap:"0.5rem",marginBottom:"1.25rem",flexWrap:"wrap"}}>
            <div style={{display:"inline-flex",gap:"0.6rem",alignItems:"center",background:"rgba(99,102,241,.12)",border:"1px solid rgba(99,102,241,.25)",borderRadius:"2rem",padding:"0.45rem 1.1rem"}}>
              <span>🛡️</span>
              <span style={{color:"#a5b4fc",fontSize:"0.78rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Compliance Intelligence</span>
            </div>
            <button onClick={onOpenConfig} style={{display:"inline-flex",gap:"0.4rem",alignItems:"center",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:"2rem",padding:"0.45rem 1rem",color:"#64748b",fontSize:"0.78rem",cursor:"pointer",fontFamily:"inherit"}}>
              ⚙️ Azure Config
            </button>
          </div>
          <h1 style={{fontSize:"clamp(1.8rem,5vw,3rem)",fontWeight:800,color:"#f1f5f9",margin:"0 0 0.9rem",lineHeight:1.1,letterSpacing:"-0.03em"}}>
            Cybersecurity Framework<br/>
            <span style={{background:"linear-gradient(90deg,#818cf8,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Mapping Tool</span>
          </h1>
          <p style={{color:"#94a3b8",fontSize:"0.97rem",margin:0,lineHeight:1.7}}>
            Describe your client. GPT selects applicable frameworks<br/>and maps all {DB.table.length} requirements across {FW.length} standards.
          </p>
        </div>

        <div style={S.card}>
          {/* Azure status indicator */}
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"1rem",padding:"0.5rem 0.75rem",background:"rgba(5,150,105,.08)",border:"1px solid rgba(5,150,105,.2)",borderRadius:"0.5rem"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#34d399",flexShrink:0,display:"inline-block"}}/>
            <span style={{color:"#6ee7b7",fontSize:"0.78rem",fontWeight:600}}>Azure OpenAI connected</span>
            <span style={{color:"#334155",fontSize:"0.75rem",marginLeft:"auto"}}>Deployment: <strong style={{color:"#64748b"}}>{creds.deployment}</strong></span>
          </div>

          <label style={S.label}>Client Description</label>
          <textarea value={val} onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))onGo();}}
            placeholder="e.g. EU-based fintech processing credit card payments, with B2B customers in Germany and France..."
            rows={4}
            style={{...S.input, resize:"vertical", lineHeight:1.65}}
            onFocus={e=>e.target.style.borderColor="rgba(129,140,248,.6)"}
            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}
          />
          {err && <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",borderRadius:"0.6rem",padding:"0.65rem 0.9rem",color:"#fca5a5",fontSize:"0.87rem",marginTop:"0.6rem"}}>⚠️ {err}</div>}
          <button style={S.btn(!!val.trim())} disabled={!val.trim()} onClick={onGo}>
            Analyze Compliance Requirements →
          </button>
          <p style={{color:"#334155",fontSize:"0.72rem",textAlign:"center",margin:"0.6rem 0 0"}}>Ctrl+Enter to submit</p>
        </div>

        <div style={{marginTop:"1.75rem",textAlign:"center"}}>
          <p style={{color:"#334155",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.6rem"}}>Try an example</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.45rem",justifyContent:"center"}}>
            {EXAMPLES.map(ex=>(
              <button key={ex} onClick={()=>setVal(ex)} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"2rem",padding:"0.35rem 0.85rem",color:"#64748b",fontSize:"0.78rem",cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
                onMouseEnter={e=>{e.target.style.background="rgba(129,140,248,.1)";e.target.style.borderColor="rgba(129,140,248,.3)";e.target.style.color="#c7d2fe";}}
                onMouseLeave={e=>{e.target.style.background="rgba(255,255,255,.03)";e.target.style.borderColor="rgba(255,255,255,.07)";e.target.style.color="#64748b";}}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div style={{marginTop:"1.75rem",textAlign:"center"}}>
          <p style={{color:"#1e293b",fontSize:"0.72rem",marginBottom:"0.6rem"}}>Covers 9 major frameworks</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",justifyContent:"center"}}>
            {FW.map((f,i)=>(
              <span key={f} style={{background:`${FW_COLORS[i]}15`,border:`1px solid ${FW_COLORS[i]}35`,borderRadius:"0.35rem",padding:"0.2rem 0.55rem",color:FW_COLORS[i],fontSize:"0.7rem",fontWeight:700}}>{FW_ABBR[i]}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ q }) {
  const [d, setD] = useState(0);
  useState(() => { const t = setInterval(() => setD(x => (x+1)%4), 450); return () => clearInterval(t); });
  useEffect(() => { const t = setInterval(() => setD(x => (x+1)%4), 450); return () => clearInterval(t); }, []);
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a0a14,#12122a,#0d1f33)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{textAlign:"center",color:"#f1f5f9"}}>
        <div style={{width:72,height:72,borderRadius:"50%",border:"3px solid rgba(99,102,241,.15)",borderTop:"3px solid #818cf8",animation:"spin 1s linear infinite",margin:"0 auto 2rem"}}/>
        <h2 style={{fontSize:"1.4rem",fontWeight:700,margin:"0 0 0.5rem"}}>
          Analyzing requirements{"...".slice(0,d+1)}
        </h2>
        <p style={{color:"#475569",margin:"0 0 0.35rem",fontSize:"0.9rem"}}>"{q}"</p>
        <p style={{color:"#1e293b",fontSize:"0.8rem"}}>Calling Azure OpenAI · Mapping {DB.table.length} requirements across {FW.length} frameworks</p>
      </div>
    </div>
  );
}

function ResultsScreen({ q, result, onReset, onConfigOpen }) {
  const [expandedSubs, setExpandedSubs] = useState({});
  const [filterMain, setFilterMain] = useState(null);
  const [search, setSearch] = useState("");

  const selFws = result.frameworks.map(i => ({idx:i, name:FW[i], abbr:FW_ABBR[i], color:FW_COLORS[i]}));
  const allRows = getRows(result.frameworks);

  const filtered = allRows.filter(r => {
    if (filterMain && r[0] !== filterMain) return false;
    if (search) { const s = search.toLowerCase(); return r[0].toLowerCase().includes(s)||r[1].toLowerCase().includes(s)||r[2].toLowerCase().includes(s); }
    return true;
  });

  const grouped = {};
  filtered.forEach(r => {
    if (!grouped[r[0]]) grouped[r[0]] = {};
    if (!grouped[r[0]][r[1]]) grouped[r[0]][r[1]] = [];
    grouped[r[0]][r[1]].push(r);
  });

  const mainCounts = {};
  allRows.forEach(r => { mainCounts[r[0]] = (mainCounts[r[0]]||0)+1; });

  const toggleSub = k => setExpandedSubs(p => ({...p,[k]:!(p[k]!==false?true:false)}));
  const isExp = k => expandedSubs[k] !== false;

  const expandAll = () => {
    const ks = {};
    Object.entries(grouped).forEach(([m,ss]) => Object.keys(ss).forEach(s => {ks[`${m}||${s}`]=true;}));
    setExpandedSubs(ks);
  };
  const collapseAll = () => {
    const ks = {};
    Object.entries(grouped).forEach(([m,ss]) => Object.keys(ss).forEach(s => {ks[`${m}||${s}`]=false;}));
    setExpandedSubs(ks);
  };

  const gridCols = `280px repeat(${selFws.length}, 1fr)`;

  return (
    <div style={{minHeight:"100vh",background:"#0d1117",fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",color:"#f1f5f9",display:"flex",flexDirection:"column"}}>
      {/* Topbar */}
      <div style={{background:"rgba(255,255,255,.03)",borderBottom:"1px solid rgba(255,255,255,.07)",padding:"0.7rem 1.25rem",display:"flex",alignItems:"center",gap:"0.75rem",flexWrap:"wrap",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)"}}>
        <button onClick={onReset} style={{background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:"0.4rem",padding:"0.3rem 0.7rem",color:"#94a3b8",cursor:"pointer",fontSize:"0.8rem",fontFamily:"inherit"}}>← New Query</button>
        <button onClick={onConfigOpen} style={{background:"none",border:"1px solid rgba(255,255,255,.08)",borderRadius:"0.4rem",padding:"0.3rem 0.7rem",color:"#475569",cursor:"pointer",fontSize:"0.78rem",fontFamily:"inherit"}}>⚙️ Config</button>
        <div style={{flex:1,minWidth:"120px"}}>
          <span style={{color:"#475569",fontSize:"0.8rem"}}>Results for: </span>
          <span style={{color:"#c7d2fe",fontWeight:600,fontSize:"0.8rem"}}>"{q}"</span>
        </div>
        <div style={{display:"flex",gap:"0.35rem",flexWrap:"wrap"}}>
          {selFws.map(fw=>(
            <span key={fw.idx} style={{background:`${fw.color}15`,border:`1px solid ${fw.color}45`,borderRadius:"0.3rem",padding:"0.18rem 0.5rem",color:fw.color,fontSize:"0.7rem",fontWeight:700}}>{fw.abbr}</span>
          ))}
        </div>
        <button onClick={()=>exportXLSX(allRows,result.frameworks,q)} style={{background:"linear-gradient(135deg,#059669,#0d9488)",border:"none",borderRadius:"0.45rem",padding:"0.35rem 0.85rem",color:"#fff",cursor:"pointer",fontSize:"0.8rem",fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap"}}>
          ↓ Export Excel
        </button>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden",height:"calc(100vh - 50px)"}}>
        {/* Sidebar */}
        <div style={{width:"235px",flexShrink:0,background:"rgba(255,255,255,.02)",borderRight:"1px solid rgba(255,255,255,.06)",overflowY:"auto",padding:"0.9rem",display:"flex",flexDirection:"column",gap:"0.7rem"}}>
          {result.rationale?.summary && (
            <div style={{background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.18)",borderRadius:"0.7rem",padding:"0.8rem"}}>
              <p style={{color:"#818cf8",fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 0.4rem"}}>GPT Analysis</p>
              <p style={{color:"#cbd5e1",fontSize:"0.79rem",margin:0,lineHeight:1.65}}>{result.rationale.summary}</p>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.4rem"}}>
            <div style={{background:"rgba(255,255,255,.04)",borderRadius:"0.45rem",padding:"0.6rem",textAlign:"center"}}>
              <div style={{fontSize:"1.35rem",fontWeight:800,color:"#818cf8"}}>{allRows.length}</div>
              <div style={{fontSize:"0.65rem",color:"#64748b",marginTop:"0.12rem"}}>Requirements</div>
            </div>
            <div style={{background:"rgba(255,255,255,.04)",borderRadius:"0.45rem",padding:"0.6rem",textAlign:"center"}}>
              <div style={{fontSize:"1.35rem",fontWeight:800,color:"#34d399"}}>{selFws.length}</div>
              <div style={{fontSize:"0.65rem",color:"#64748b",marginTop:"0.12rem"}}>Frameworks</div>
            </div>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search requirements..."
            style={{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:"0.45rem",padding:"0.42rem 0.65rem",color:"#f1f5f9",fontSize:"0.82rem",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          <div>
            <p style={{color:"#334155",fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",margin:"0 0 0.35rem"}}>Filter by Theme</p>
            <button onClick={()=>setFilterMain(null)} style={{width:"100%",textAlign:"left",background:!filterMain?"rgba(99,102,241,.12)":"none",border:!filterMain?"1px solid rgba(99,102,241,.25)":"1px solid transparent",borderRadius:"0.38rem",padding:"0.42rem 0.6rem",color:!filterMain?"#c7d2fe":"#64748b",cursor:"pointer",fontSize:"0.78rem",marginBottom:"0.18rem",fontFamily:"inherit",display:"flex",justifyContent:"space-between"}}>
              <span>All</span><span style={{background:"rgba(255,255,255,.06)",borderRadius:"0.22rem",padding:"0.08rem 0.32rem",fontSize:"0.66rem"}}>{allRows.length}</span>
            </button>
            {Object.keys(grouped).sort().map(main=>{
              const c=MT_COLORS[main]||"#6366f1", act=filterMain===main;
              return (
                <button key={main} onClick={()=>setFilterMain(act?null:main)}
                  style={{width:"100%",textAlign:"left",background:act?`${c}15`:"none",border:act?`1px solid ${c}35`:"1px solid transparent",borderRadius:"0.38rem",padding:"0.38rem 0.6rem",color:act?c:"#64748b",cursor:"pointer",fontSize:"0.74rem",marginBottom:"0.15rem",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"0.35rem",lineHeight:1.3}}
                  onMouseEnter={e=>{if(!act){e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color="#94a3b8";}}}
                  onMouseLeave={e=>{if(!act){e.currentTarget.style.background="none";e.currentTarget.style.color="#64748b";}}}>
                  <span style={{flex:1}}>{main.replace(/^\d+\.\s/,"")}</span>
                  <span style={{background:"rgba(255,255,255,.05)",borderRadius:"0.22rem",padding:"0.08rem 0.3rem",fontSize:"0.65rem",flexShrink:0}}>{mainCounts[main]||0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div style={{flex:1,overflowY:"auto",padding:"0.9rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.65rem"}}>
            <span style={{color:"#64748b",fontSize:"0.8rem"}}>Showing <strong style={{color:"#e2e8f0"}}>{filtered.length}</strong> of {allRows.length} requirements</span>
            <div style={{display:"flex",gap:"0.35rem"}}>
              <button onClick={expandAll} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:"0.38rem",padding:"0.28rem 0.6rem",color:"#94a3b8",cursor:"pointer",fontSize:"0.76rem",fontFamily:"inherit"}}>Expand All</button>
              <button onClick={collapseAll} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:"0.38rem",padding:"0.28rem 0.6rem",color:"#94a3b8",cursor:"pointer",fontSize:"0.76rem",fontFamily:"inherit"}}>Collapse</button>
            </div>
          </div>

          {/* Column headers */}
          <div style={{display:"grid",gridTemplateColumns:gridCols,background:"rgba(255,255,255,.04)",borderRadius:"0.6rem 0.6rem 0 0",border:"1px solid rgba(255,255,255,.08)",overflow:"hidden",position:"sticky",top:0,zIndex:10}}>
            <div style={{padding:"0.6rem 0.9rem",color:"#475569",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",borderRight:"1px solid rgba(255,255,255,.06)"}}>Requirement</div>
            {selFws.map((fw,i)=>(
              <div key={fw.idx} style={{padding:"0.6rem 0.35rem",textAlign:"center",borderRight:i<selFws.length-1?"1px solid rgba(255,255,255,.06)":"none",color:fw.color,fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.04em",lineHeight:1.3}}>{fw.abbr}</div>
            ))}
          </div>

          {Object.entries(grouped).sort(([a],[b])=>a.localeCompare(b)).map(([main,subs])=>{
            const mc=MT_COLORS[main]||"#6366f1";
            return (
              <div key={main}>
                <div style={{background:`${mc}10`,borderLeft:`3px solid ${mc}`,borderRight:"1px solid rgba(255,255,255,.07)",borderBottom:"1px solid rgba(255,255,255,.05)",padding:"0.5rem 0.9rem",display:"flex",alignItems:"center",gap:"0.45rem"}}>
                  <span style={{color:mc,fontWeight:700,fontSize:"0.83rem"}}>{main}</span>
                  <span style={{color:"#334155",fontSize:"0.73rem"}}>({Object.values(subs).reduce((a,b)=>a+b.length,0)})</span>
                </div>
                {Object.entries(subs).sort(([a],[b])=>a.localeCompare(b)).map(([sub,rows])=>{
                  const key=`${main}||${sub}`, exp=isExp(key);
                  return (
                    <div key={sub}>
                      <div onClick={()=>toggleSub(key)} style={{background:"rgba(255,255,255,.015)",borderLeft:`3px solid ${mc}40`,borderRight:"1px solid rgba(255,255,255,.07)",borderBottom:"1px solid rgba(255,255,255,.04)",padding:"0.42rem 0.9rem",display:"flex",alignItems:"center",gap:"0.35rem",cursor:"pointer",userSelect:"none"}}>
                        <span style={{color:"#475569",fontSize:"0.63rem"}}>{exp?"▾":"▸"}</span>
                        <span style={{color:"#94a3b8",fontSize:"0.78rem",fontWeight:600}}>{sub}</span>
                        <span style={{color:"#334155",fontSize:"0.7rem"}}>({rows.length})</span>
                      </div>
                      {exp && rows.map((row,ri)=>{
                        const [,,gran,fm]=row;
                        return (
                          <div key={`${gran}-${ri}`} style={{display:"grid",gridTemplateColumns:gridCols,background:ri%2?"transparent":"rgba(255,255,255,.01)",borderLeft:`3px solid ${mc}18`,borderRight:"1px solid rgba(255,255,255,.07)",borderBottom:"1px solid rgba(255,255,255,.025)"}}>
                            <div style={{padding:"0.48rem 0.8rem 0.48rem 1.35rem",color:"#cbd5e1",fontSize:"0.79rem",borderRight:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",lineHeight:1.45}}>{gran}</div>
                            {selFws.map((fw,i)=>{
                              const secs=fm[String(fw.idx)]||[];
                              return (
                                <div key={fw.idx} style={{padding:"0.38rem 0.28rem",textAlign:"center",borderRight:i<selFws.length-1?"1px solid rgba(255,255,255,.04)":"none",display:"flex",flexWrap:"wrap",gap:"0.15rem",justifyContent:"center",alignItems:"center"}}>
                                  {secs.length>0?secs.map(s=>(
                                    <span key={s} style={{background:`${fw.color}15`,border:`1px solid ${fw.color}30`,borderRadius:"0.22rem",padding:"0.07rem 0.28rem",color:fw.color,fontSize:"0.63rem",fontWeight:600,fontFamily:"'JetBrains Mono','Courier New',monospace",whiteSpace:"nowrap"}}>{s}</span>
                                  )):<span style={{color:"#1e293b",fontSize:"0.68rem"}}>—</span>}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div style={{height:"1px",background:"rgba(255,255,255,.07)"}}/>
          {filtered.length===0&&<div style={{textAlign:"center",padding:"4rem 2rem",color:"#334155"}}>No requirements match your current filters.</div>}
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("config");
  const [creds, setCreds] = useState({ endpoint:"", apiKey:"", deployment:"", apiVersion:"2024-02-01" });
  const [val, setVal] = useState("");
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  async function handleGo() {
    if (!val.trim()) return;
    setQ(val.trim()); setScreen("loading"); setErr(null);
    try {
      const res = await callAzureOpenAI(creds, val.trim());
      setResult(res); setScreen("results");
    } catch(e) {
      setErr(e.message||"Analysis failed. Check your Azure credentials and try again.");
      setScreen("query");
    }
  }

  if (screen==="config") return <ConfigScreen creds={creds} setCreds={setCreds} onSave={()=>setScreen("query")}/>;
  if (screen==="loading") return <LoadingScreen q={q}/>;
  if (screen==="results") return <ResultsScreen q={q} result={result} onReset={()=>{setScreen("query");setResult(null);}} onConfigOpen={()=>setScreen("config")}/>;
  return <QueryScreen creds={creds} onOpenConfig={()=>setScreen("config")} val={val} setVal={setVal} onGo={handleGo} err={err}/>;
}