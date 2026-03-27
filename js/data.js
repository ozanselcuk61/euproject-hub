/* ====================================
   EUProject Hub — Mock Data & State
   ==================================== */

const AppState = {
    currentUser: {
        id: 1,
        name: 'Ozan Selcuk',
        email: 'ozan.selcuk@university.edu',
        initials: 'OS',
        role: 'Coordinator',
        trialEnd: '2026-04-25',
        plan: 'premium'
    },
    currentProjectId: 'buildres',
    currentPage: 'dashboard'
};

const Projects = {
    buildres: {
        id: 'buildres',
        name: 'BuildRes',
        programme: 'Erasmus+ KA220',
        projectNumber: '2025-1-PL01-KA220-HED-000123456',
        startDate: '2025-02-01',
        endDate: '2027-01-31',
        duration: 24,
        status: 'active',
        description: 'Building Resilience in Higher Education Through Innovative Curriculum Development for Sustainable Construction Practices.',
        totalBudget: 250000,
        coordinator: 'University of Warsaw',
        coordinatorCountry: 'Poland',
        lumpSum: {
            totalGrant: 250000,
            wpAllocations: {
                'WP1': 40000,
                'WP2': 55000,
                'WP3': 50000,
                'WP4': 45000,
                'WP5': 35000,
                'WP6': 25000
            }
        }
    },
    yourein: {
        id: 'yourein',
        name: "You'ReIn",
        programme: 'Erasmus+ KA220',
        projectNumber: '2024-1-TR01-KA220-VET-000098765',
        startDate: '2024-11-01',
        endDate: '2026-10-31',
        duration: 24,
        status: 'active',
        description: 'Youth Resilience and Inclusion — Empowering young people through VET pathways for social inclusion and active citizenship.',
        totalBudget: 400000,
        coordinator: 'Ankara University',
        coordinatorCountry: 'Turkey',
        lumpSum: {
            totalGrant: 400000,
            wpAllocations: {
                'WP1': 60000,
                'WP2': 80000,
                'WP3': 75000,
                'WP4': 70000,
                'WP5': 65000,
                'WP6': 50000
            }
        }
    }
};

const Partners = {
    buildres: [
        { id: 1, name: 'University of Warsaw', country: 'Poland', code: 'PL', role: 'coordinator', initials: 'UW', contact: 'Margaret Miklosz', email: 'margaret@uw.edu.pl', budget: 75000, spent: 28500 },
        { id: 2, name: 'Università di Bologna', country: 'Italy', code: 'IT', role: 'partner', initials: 'UB', contact: 'Paolo Santini', email: 'paolo@unibo.it', budget: 50000, spent: 18200 },
        { id: 3, name: 'Cyprus Chamber of Commerce', country: 'Cyprus', code: 'CY', role: 'partner', initials: 'CC', contact: 'Marina Aristodemou', email: 'marina@ccifc.org.cy', budget: 40000, spent: 15800 },
        { id: 4, name: 'University of Thessaly', country: 'Greece', code: 'GR', role: 'partner', initials: 'UT', contact: 'Aggeliki Dareiou', email: 'aggeliki@uth.gr', budget: 45000, spent: 12300 },
        { id: 5, name: 'West University of Timisoara', country: 'Romania', code: 'RO', role: 'partner', initials: 'WT', contact: 'Alexandru Raul Petrescu', email: 'alexandru@uvt.ro', budget: 40000, spent: 10200 }
    ],
    yourein: [
        { id: 1, name: 'Ankara University', country: 'Turkey', code: 'TR', role: 'coordinator', initials: 'AU', contact: 'Mehmet Yilmaz', email: 'mehmet@ankara.edu.tr', budget: 100000, spent: 45000 },
        { id: 2, name: 'University of Lisbon', country: 'Portugal', code: 'PT', role: 'partner', initials: 'UL', contact: 'Ana Silva', email: 'ana@ul.pt', budget: 80000, spent: 35200 },
        { id: 3, name: 'KU Leuven', country: 'Belgium', code: 'BE', role: 'partner', initials: 'KL', contact: 'Jan De Vries', email: 'jan@kuleuven.be', budget: 75000, spent: 28000 },
        { id: 4, name: 'Swedish Institute', country: 'Sweden', code: 'SE', role: 'partner', initials: 'SI', contact: 'Anna Lindström', email: 'anna@si.se', budget: 70000, spent: 22500 },
        { id: 5, name: 'Dublin City University', country: 'Ireland', code: 'IE', role: 'partner', initials: 'DC', contact: 'Sean Murphy', email: 'sean@dcu.ie', budget: 75000, spent: 19800 }
    ]
};

const WorkPackages = {
    buildres: [
        { id: 'WP1', number: 'WP1', title: 'Project Management & Coordination', lead: 'University of Warsaw', start: 'M1', end: 'M24', status: 'active', progress: 55, description: 'Overall project coordination, quality assurance, and administrative management across all partner organizations.', deliverables: ['D1.1 Project Management Handbook', 'D1.2 Quality Assurance Plan', 'D1.3 Interim Progress Report', 'D1.4 Final Progress Report'], budget: 40000 },
        { id: 'WP2', number: 'WP2', title: 'Research & Needs Analysis', lead: 'Università di Bologna', start: 'M1', end: 'M8', status: 'completed', progress: 100, description: 'Comprehensive desk research and field analysis of current sustainable construction curricula across partner countries.', deliverables: ['D2.1 Comparative Research Report', 'D2.2 Stakeholder Needs Analysis', 'D2.3 Competence Framework Draft'], budget: 55000 },
        { id: 'WP3', number: 'WP3', title: 'Curriculum Development', lead: 'University of Thessaly', start: 'M6', end: 'M18', status: 'active', progress: 40, description: 'Development of innovative curriculum modules for sustainable construction practices in higher education.', deliverables: ['D3.1 Curriculum Design Document', 'D3.2 Learning Materials Package', 'D3.3 Digital Resource Library'], budget: 50000 },
        { id: 'WP4', number: 'WP4', title: 'Pilot Testing & Validation', lead: 'West University of Timisoara', start: 'M14', end: 'M22', status: 'pending', progress: 0, description: 'Pilot implementation of developed curriculum in partner institutions with student and faculty feedback collection.', deliverables: ['D4.1 Pilot Implementation Plan', 'D4.2 Testing Results Report', 'D4.3 Validated Curriculum Package'], budget: 45000 },
        { id: 'WP5', number: 'WP5', title: 'Dissemination & Exploitation', lead: 'Cyprus Chamber of Commerce', start: 'M1', end: 'M24', status: 'active', progress: 35, description: 'Communication, dissemination of project results, and exploitation strategy for long-term sustainability.', deliverables: ['D5.1 Dissemination Plan', 'D5.2 Project Website', 'D5.3 Final Conference Proceedings'], budget: 35000 },
        { id: 'WP6', number: 'WP6', title: 'Sustainability & Quality', lead: 'University of Warsaw', start: 'M1', end: 'M24', status: 'active', progress: 30, description: 'Quality assurance mechanisms and sustainability planning for post-project continuation of results.', deliverables: ['D6.1 Quality Monitoring Reports', 'D6.2 Sustainability Plan', 'D6.3 Policy Recommendations'], budget: 25000 }
    ],
    yourein: [
        { id: 'WP1', number: 'WP1', title: 'Project Management', lead: 'Ankara University', start: 'M1', end: 'M24', status: 'active', progress: 65, description: 'Coordination and management of project activities.', deliverables: ['D1.1 Management Plan', 'D1.2 Progress Reports'], budget: 60000 },
        { id: 'WP2', number: 'WP2', title: 'Youth Inclusion Research', lead: 'University of Lisbon', start: 'M1', end: 'M10', status: 'completed', progress: 100, description: 'Research on youth inclusion barriers and VET pathways.', deliverables: ['D2.1 Research Report', 'D2.2 Best Practices Guide'], budget: 80000 },
        { id: 'WP3', number: 'WP3', title: 'VET Toolkit Development', lead: 'KU Leuven', start: 'M6', end: 'M18', status: 'active', progress: 50, description: 'Development of VET inclusion toolkit and training materials.', deliverables: ['D3.1 VET Toolkit', 'D3.2 Training Manual'], budget: 75000 },
        { id: 'WP4', number: 'WP4', title: 'Pilot Training', lead: 'Dublin City University', start: 'M12', end: 'M20', status: 'active', progress: 20, description: 'Pilot training sessions with youth workers and VET providers.', deliverables: ['D4.1 Pilot Report', 'D4.2 Impact Assessment'], budget: 70000 },
        { id: 'WP5', number: 'WP5', title: 'Dissemination', lead: 'Swedish Institute', start: 'M1', end: 'M24', status: 'active', progress: 40, description: 'Dissemination and communication of project outcomes.', deliverables: ['D5.1 Dissemination Plan', 'D5.2 Multiplier Events Report'], budget: 65000 },
        { id: 'WP6', number: 'WP6', title: 'Quality & Evaluation', lead: 'Ankara University', start: 'M1', end: 'M24', status: 'active', progress: 35, description: 'Internal and external quality assurance and evaluation.', deliverables: ['D6.1 Evaluation Framework', 'D6.2 Final Evaluation Report'], budget: 50000 }
    ]
};

const Tasks = {
    buildres: [
        { id: 1, title: 'Finalize D3.1 Curriculum Design Document', wp: 'WP3', assignee: 'Aggeliki Dareiou', assigneeInitials: 'AD', due: '2026-04-15', status: 'in_progress', priority: 'high' },
        { id: 2, title: 'Upload dissemination evidence for M14', wp: 'WP5', assignee: 'Marina Aristodemou', assigneeInitials: 'MA', due: '2026-03-30', status: 'in_progress', priority: 'medium' },
        { id: 3, title: 'Prepare TPM3 agenda and logistics', wp: 'WP1', assignee: 'Margaret Miklosz', assigneeInitials: 'MM', due: '2026-04-01', status: 'completed', priority: 'high' },
        { id: 4, title: 'Review pilot implementation plan draft', wp: 'WP4', assignee: 'Alexandru Raul Petrescu', assigneeInitials: 'AP', due: '2026-04-20', status: 'pending', priority: 'medium' },
        { id: 5, title: 'Collect partner feedback on learning materials', wp: 'WP3', assignee: 'Paolo Santini', assigneeInitials: 'PS', due: '2026-04-10', status: 'in_progress', priority: 'medium' },
        { id: 6, title: 'Update project website with new resources', wp: 'WP5', assignee: 'Marina Aristodemou', assigneeInitials: 'MA', due: '2026-03-28', status: 'completed', priority: 'low' },
        { id: 7, title: 'Submit interim financial report', wp: 'WP1', assignee: 'Margaret Miklosz', assigneeInitials: 'MM', due: '2026-05-01', status: 'pending', priority: 'high' },
        { id: 8, title: 'Quality monitoring report for Q1 2026', wp: 'WP6', assignee: 'Margaret Miklosz', assigneeInitials: 'MM', due: '2026-04-05', status: 'in_progress', priority: 'medium' }
    ],
    yourein: [
        { id: 1, title: 'Complete VET toolkit draft', wp: 'WP3', assignee: 'Jan De Vries', assigneeInitials: 'JD', due: '2026-04-20', status: 'in_progress', priority: 'high' },
        { id: 2, title: 'Schedule pilot training sessions', wp: 'WP4', assignee: 'Sean Murphy', assigneeInitials: 'SM', due: '2026-04-15', status: 'pending', priority: 'high' },
        { id: 3, title: 'Organize multiplier event in Ankara', wp: 'WP5', assignee: 'Mehmet Yilmaz', assigneeInitials: 'MY', due: '2026-05-10', status: 'pending', priority: 'medium' }
    ]
};

const Documents = {
    buildres: {
        folders: [
            { id: 'general', name: 'General Information', type: 'folder', files: [
                { id: 'f1', name: 'Grant Agreement.pdf', type: 'pdf', size: '2.4 MB', uploaded: '2025-02-15', by: 'Margaret Miklosz' },
                { id: 'f2', name: 'Partnership Agreement.pdf', type: 'pdf', size: '1.8 MB', uploaded: '2025-02-20', by: 'Margaret Miklosz' },
                { id: 'f3', name: 'Project Description.docx', type: 'doc', size: '890 KB', uploaded: '2025-02-10', by: 'Margaret Miklosz' }
            ]},
            { id: 'kickoff', name: 'Kick-Off Meeting, Paphos 2.4.2025', type: 'folder', files: [
                { id: 'f4', name: 'KOM Agenda.pdf', type: 'pdf', size: '340 KB', uploaded: '2025-03-28', by: 'Margaret Miklosz' },
                { id: 'f5', name: 'KOM Minutes.docx', type: 'doc', size: '520 KB', uploaded: '2025-04-10', by: 'Margaret Miklosz' },
                { id: 'f6', name: 'KOM Photos.zip', type: 'generic', size: '45 MB', uploaded: '2025-04-12', by: 'Marina Aristodemou' },
                { id: 'f7', name: 'Attendance Sheet.pdf', type: 'pdf', size: '180 KB', uploaded: '2025-04-05', by: 'Margaret Miklosz' }
            ]},
            { id: 'tpm2', name: '2nd TPM in Goussainville 11.09.2025', type: 'folder', files: [
                { id: 'f8', name: 'TPM2 Agenda.pdf', type: 'pdf', size: '290 KB', uploaded: '2025-09-01', by: 'Paolo Santini' },
                { id: 'f9', name: 'TPM2 Minutes.docx', type: 'doc', size: '680 KB', uploaded: '2025-09-18', by: 'Margaret Miklosz' }
            ]},
            { id: 'tpm3', name: '3rd TPM in Timisoara', type: 'folder', files: [
                { id: 'f10', name: 'TPM3 Draft Agenda.docx', type: 'doc', size: '220 KB', uploaded: '2026-03-20', by: 'Alexandru Raul Petrescu' }
            ]},
            { id: 'wp1', name: 'WP1 - Management', type: 'folder', files: [
                { id: 'f11', name: 'Project Management Handbook.pdf', type: 'pdf', size: '1.2 MB', uploaded: '2025-03-15', by: 'Margaret Miklosz' },
                { id: 'f12', name: 'Quality Assurance Plan.pdf', type: 'pdf', size: '780 KB', uploaded: '2025-04-20', by: 'Margaret Miklosz' }
            ]},
            { id: 'wp2', name: 'WP2 - Research', type: 'folder', files: [
                { id: 'f13', name: 'Comparative Research Report.pdf', type: 'pdf', size: '3.5 MB', uploaded: '2025-08-30', by: 'Paolo Santini' },
                { id: 'f14', name: 'Stakeholder Survey Results.xlsx', type: 'xls', size: '1.1 MB', uploaded: '2025-07-15', by: 'Aggeliki Dareiou' },
                { id: 'f15', name: 'Needs Analysis Summary.docx', type: 'doc', size: '920 KB', uploaded: '2025-09-10', by: 'Paolo Santini' }
            ]},
            { id: 'wp3', name: 'WP3 - Curriculum', type: 'folder', files: [
                { id: 'f16', name: 'Curriculum Design Draft v2.docx', type: 'doc', size: '2.1 MB', uploaded: '2026-02-28', by: 'Aggeliki Dareiou' }
            ]},
            { id: 'dissemination', name: 'Dissemination', type: 'folder', files: [
                { id: 'f17', name: 'CCIFC_page views.png', type: 'img', size: '340 KB', uploaded: '2026-03-26', by: 'Marina Aristodemou' },
                { id: 'f18', name: 'CCIFC_NEWSLETTER FB.png', type: 'img', size: '520 KB', uploaded: '2026-03-26', by: 'Marina Aristodemou' },
                { id: 'f19', name: 'UTH_Evidence_06.10.png', type: 'img', size: '280 KB', uploaded: '2026-03-26', by: 'Aggeliki Dareiou' },
                { id: 'f20', name: 'UTH_Evidence_30.09.png', type: 'img', size: '310 KB', uploaded: '2026-03-26', by: 'Aggeliki Dareiou' }
            ]}
        ]
    },
    yourein: {
        folders: [
            { id: 'general', name: 'General Information', type: 'folder', files: [
                { id: 'f1', name: 'Grant Agreement.pdf', type: 'pdf', size: '2.8 MB', uploaded: '2024-11-10', by: 'Mehmet Yilmaz' }
            ]},
            { id: 'wp2', name: 'WP2 - Research', type: 'folder', files: [
                { id: 'f2', name: 'Youth Inclusion Research Report.pdf', type: 'pdf', size: '4.2 MB', uploaded: '2025-08-15', by: 'Ana Silva' }
            ]}
        ]
    }
};

const Meetings = {
    buildres: [
        { id: 1, title: 'Kick-Off Meeting', location: 'Paphos, Cyprus', date: '2025-04-02', type: 'TPM', status: 'completed', attendees: ['MM', 'PS', 'MA', 'AD', 'AP'], agenda: ['Project overview', 'Work plan discussion', 'Role distribution', 'Communication plan'] },
        { id: 2, title: '2nd Transnational Project Meeting', location: 'Goussainville, France', date: '2025-09-11', type: 'TPM', status: 'completed', attendees: ['MM', 'PS', 'MA', 'AD', 'AP'], agenda: ['WP2 results review', 'WP3 kick-off', 'Budget review', 'Next steps'] },
        { id: 3, title: '3rd Transnational Project Meeting', location: 'Timisoara, Romania', date: '2026-04-15', type: 'TPM', status: 'upcoming', attendees: ['MM', 'PS', 'MA', 'AD', 'AP'], agenda: ['WP3 progress review', 'WP4 planning', 'Mid-term review preparation', 'Dissemination update'] },
        { id: 4, title: 'Online Coordination Meeting', location: 'Online (Zoom)', date: '2026-03-15', type: 'online', status: 'completed', attendees: ['MM', 'PS', 'MA'], agenda: ['Monthly update', 'Task review'] }
    ],
    yourein: [
        { id: 1, title: 'Kick-Off Meeting', location: 'Ankara, Turkey', date: '2024-12-10', type: 'TPM', status: 'completed', attendees: ['MY', 'AS', 'JD', 'AL', 'SM'], agenda: ['Project launch', 'Roles assignment'] },
        { id: 2, title: '2nd TPM', location: 'Lisbon, Portugal', date: '2025-06-20', type: 'TPM', status: 'completed', attendees: ['MY', 'AS', 'JD', 'AL', 'SM'], agenda: ['WP2 review', 'WP3 start'] }
    ]
};

const Dissemination = {
    buildres: {
        summary: { events: 12, publications: 8, socialReach: 15400, website_visits: 4250 },
        activities: [
            { id: 1, type: 'Social Media', title: 'Project launch announcement on LinkedIn', date: '2025-03-01', reach: 1200, partner: 'University of Warsaw' },
            { id: 2, type: 'Event', title: 'Presentation at EDEN Conference 2025', date: '2025-06-15', reach: 350, partner: 'Università di Bologna' },
            { id: 3, type: 'Publication', title: 'Article in Journal of Sustainable Education', date: '2025-08-20', reach: 800, partner: 'University of Thessaly' },
            { id: 4, type: 'Newsletter', title: 'CCIFC Newsletter - BuildRes Feature', date: '2026-01-15', reach: 2500, partner: 'Cyprus Chamber of Commerce' },
            { id: 5, type: 'Social Media', title: 'Facebook campaign - Sustainable Construction', date: '2026-02-10', reach: 3200, partner: 'Cyprus Chamber of Commerce' },
            { id: 6, type: 'Event', title: 'Workshop at UTH Open Day', date: '2025-10-05', reach: 180, partner: 'University of Thessaly' },
            { id: 7, type: 'Website', title: 'Project website launch', date: '2025-04-01', reach: 4250, partner: 'University of Warsaw' },
            { id: 8, type: 'Social Media', title: 'Instagram posts - TPM2 highlights', date: '2025-09-15', reach: 890, partner: 'West University of Timisoara' }
        ]
    },
    yourein: {
        summary: { events: 8, publications: 5, socialReach: 22000, website_visits: 6100 },
        activities: [
            { id: 1, type: 'Event', title: 'Youth inclusion workshop in Ankara', date: '2025-03-20', reach: 200, partner: 'Ankara University' },
            { id: 2, type: 'Social Media', title: 'Twitter campaign #YouReIn', date: '2025-05-10', reach: 5600, partner: 'Swedish Institute' }
        ]
    }
};

const ActivityStream = {
    buildres: [
        { id: 1, user: 'Marina Aristodemou', initials: 'MA', action: 'uploaded a file', target: 'CCIFC_page views.png', folder: 'Dissemination', time: '2 hours ago' },
        { id: 2, user: 'Marina Aristodemou', initials: 'MA', action: 'uploaded files', target: 'CCIFC_NEWSLETTER FB.png, CCIFC_newsletter Insta.png', folder: 'Dissemination', time: '2 hours ago' },
        { id: 3, user: 'Aggeliki Dareiou', initials: 'AD', action: 'uploaded a file', target: 'UTH_Evidence_06.10.png', folder: 'Dissemination', time: '3 hours ago' },
        { id: 4, user: 'Aggeliki Dareiou', initials: 'AD', action: 'uploaded a file', target: 'UTH_Evidence_30.09.png', folder: 'Dissemination', time: '3 hours ago' },
        { id: 5, user: 'Margaret Miklosz', initials: 'MM', action: 'completed task', target: 'Prepare TPM3 agenda and logistics', folder: '', time: '5 hours ago' },
        { id: 6, user: 'Alexandru Raul Petrescu', initials: 'AP', action: 'uploaded a file', target: 'TPM3 Draft Agenda.docx', folder: '3rd TPM in Timisoara', time: '1 day ago' },
        { id: 7, user: 'Paolo Santini', initials: 'PS', action: 'commented on', target: 'Curriculum Design Draft v2', folder: '', time: '2 days ago' },
        { id: 8, user: 'Aggeliki Dareiou', initials: 'AD', action: 'updated deliverable status', target: 'D3.1 Curriculum Design Document', folder: '', time: '3 days ago' }
    ],
    yourein: [
        { id: 1, user: 'Jan De Vries', initials: 'JD', action: 'uploaded a file', target: 'VET Toolkit Draft v1.docx', folder: 'WP3', time: '1 day ago' },
        { id: 2, user: 'Mehmet Yilmaz', initials: 'MY', action: 'created task', target: 'Organize multiplier event in Ankara', folder: '', time: '2 days ago' }
    ]
};

// Lump-sum budget tracking per WP and partner
const BudgetTracking = {
    buildres: {
        wpStatus: [
            { wp: 'WP1', allocated: 40000, completionStatus: 55, paymentReleased: false },
            { wp: 'WP2', allocated: 55000, completionStatus: 100, paymentReleased: true },
            { wp: 'WP3', allocated: 50000, completionStatus: 40, paymentReleased: false },
            { wp: 'WP4', allocated: 45000, completionStatus: 0, paymentReleased: false },
            { wp: 'WP5', allocated: 35000, completionStatus: 35, paymentReleased: false },
            { wp: 'WP6', allocated: 25000, completionStatus: 30, paymentReleased: false }
        ],
        partnerTransfers: [
            { partner: 'Università di Bologna', amount: 15000, date: '2025-06-15', status: 'completed', type: 'Pre-financing' },
            { partner: 'Cyprus Chamber of Commerce', amount: 12000, date: '2025-06-15', status: 'completed', type: 'Pre-financing' },
            { partner: 'University of Thessaly', amount: 13500, date: '2025-06-15', status: 'completed', type: 'Pre-financing' },
            { partner: 'West University of Timisoara', amount: 12000, date: '2025-06-15', status: 'completed', type: 'Pre-financing' },
            { partner: 'Università di Bologna', amount: 10000, date: '2026-01-20', status: 'completed', type: 'Interim payment' },
            { partner: 'University of Thessaly', amount: 8000, date: '2026-02-10', status: 'pending', type: 'Interim payment' }
        ]
    }
};

// Helper functions
function getCurrentProject() {
    return Projects[AppState.currentProjectId];
}

function getCurrentPartners() {
    return Partners[AppState.currentProjectId] || [];
}

function getCurrentWPs() {
    return WorkPackages[AppState.currentProjectId] || [];
}

function getCurrentTasks() {
    return Tasks[AppState.currentProjectId] || [];
}

function getCurrentDocuments() {
    return Documents[AppState.currentProjectId] || { folders: [] };
}

function getCurrentMeetings() {
    return Meetings[AppState.currentProjectId] || [];
}

function getCurrentDissemination() {
    return Dissemination[AppState.currentProjectId] || { summary: {}, activities: [] };
}

function getCurrentActivities() {
    return ActivityStream[AppState.currentProjectId] || [];
}

function getCurrentBudget() {
    return BudgetTracking[AppState.currentProjectId] || { wpStatus: [], partnerTransfers: [] };
}

function getProjectProgress() {
    const wps = getCurrentWPs();
    if (wps.length === 0) return 0;
    return Math.round(wps.reduce((sum, wp) => sum + wp.progress, 0) / wps.length);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMonthsElapsed(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30));
}
