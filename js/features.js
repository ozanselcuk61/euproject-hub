/* ====================================
   EUProject Hub — Creative Features
   Gantt Chart, Timeline, Templates, Export, Map, Dark Mode
   ==================================== */

// ---- GANTT CHART (with Activities) ----
function renderGanttChart(container) {
    var wps = getCurrentWPs();
    var project = getCurrentProject();
    if (wps.length === 0) { container.innerHTML = '<p class="text-sm text-muted">Add work packages to see Gantt chart.</p>'; return; }

    var duration = project.duration || 24;
    var months = [];
    for (var i = 1; i <= duration; i++) months.push('M' + i);

    var colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6'];

    var html = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;min-width:' + (duration * 36 + 260) + 'px">' +
        '<thead><tr><th style="text-align:left;padding:8px 12px;font-size:12px;color:var(--gray-500);min-width:240px;position:sticky;left:0;background:#fff;z-index:1">Work Package / Activity</th>';
    months.forEach(function(m) {
        html += '<th style="text-align:center;padding:4px;font-size:10px;color:var(--gray-400);min-width:32px">' + m + '</th>';
    });
    html += '</tr></thead><tbody>';

    wps.forEach(function(wp, idx) {
        var startMonth = parseInt((wp.start || 'M1').replace('M', '')) || 1;
        var endMonth = parseInt((wp.end || 'M' + duration).replace('M', '')) || duration;
        var color = colors[idx % colors.length];
        var activities = wp.activities || [];

        // WP row (bold, full color)
        html += '<tr style="background:var(--gray-50)">' +
            '<td style="padding:8px 12px;font-size:13px;font-weight:700;position:sticky;left:0;background:var(--gray-50);z-index:1">' +
            '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + color + ';margin-right:8px"></span>' +
            '<span style="color:' + color + '">' + (wp.number || '') + '</span> ' + wp.title +
            '<span style="font-size:10px;color:var(--gray-400);font-weight:500;margin-left:8px">' + (wp.progress || 0) + '%</span>' +
            (activities.length > 0 ? '<span style="font-size:10px;color:var(--gray-400);font-weight:500;margin-left:4px">· ' + activities.length + ' activities</span>' : '') +
            '</td>';

        for (var m = 1; m <= duration; m++) {
            if (m >= startMonth && m <= endMonth) {
                var isStart = m === startMonth;
                var isEnd = m === endMonth;
                // Show progress fill within the bar
                var barWidth = endMonth - startMonth + 1;
                var progressMonths = Math.round(barWidth * (wp.progress || 0) / 100);
                var isInProgress = (m - startMonth) < progressMonths;

                html += '<td style="padding:2px 0"><div style="height:26px;background:' + color + ';opacity:' + (isInProgress ? '1' : '0.35') + ';' +
                    (isStart ? 'border-radius:4px 0 0 4px;margin-left:2px;' : '') +
                    (isEnd ? 'border-radius:0 4px 4px 0;margin-right:2px;' : '') +
                    'display:flex;align-items:center;justify-content:center">' +
                    (m === Math.floor((startMonth + endMonth) / 2) ? '<span style="font-size:9px;color:#fff;font-weight:700">' + (wp.progress || 0) + '%</span>' : '') +
                    '</div></td>';
            } else {
                html += '<td></td>';
            }
        }
        html += '</tr>';

        // Activity rows (indented, lighter color)
        activities.forEach(function(act, aIdx) {
            var actColor = color + '90';
            // Try to estimate activity timeline within WP range
            var actStart = startMonth;
            var actEnd = endMonth;

            // If activity has a deadline, use it to estimate end month
            if (act.deadline && project.startDate) {
                var projStart = new Date(project.startDate);
                var actDeadline = new Date(act.deadline);
                var monthsDiff = Math.round((actDeadline - projStart) / (1000 * 60 * 60 * 24 * 30));
                if (monthsDiff > 0 && monthsDiff <= duration) {
                    actEnd = Math.min(monthsDiff, endMonth);
                }
            }

            // Distribute activities across WP timeline
            var actSpan = endMonth - startMonth + 1;
            var actSlice = Math.max(1, Math.floor(actSpan / Math.max(activities.length, 1)));
            var estimatedStart = startMonth + (aIdx * actSlice);
            var estimatedEnd = Math.min(estimatedStart + actSlice - 1, endMonth);
            if (act.deadline && project.startDate) {
                estimatedEnd = actEnd;
                estimatedStart = Math.max(startMonth, estimatedEnd - actSlice + 1);
            }

            html += '<tr>' +
                '<td style="padding:4px 12px 4px 36px;font-size:12px;position:sticky;left:0;background:#fff;z-index:1;color:var(--gray-600)">' +
                '<span style="color:' + color + ';font-weight:600;margin-right:4px">A' + (aIdx + 1) + '</span> ' +
                '<span style="' + (act.completed ? 'text-decoration:line-through;opacity:0.5' : '') + '">' + (act.title || '').substring(0, 40) + (act.title && act.title.length > 40 ? '...' : '') + '</span>' +
                (act.completed ? ' <i class="fas fa-check-circle" style="color:var(--success);font-size:10px"></i>' : '') +
                (act.deadline ? '<span style="font-size:10px;color:var(--gray-400);margin-left:6px">' + formatDate(act.deadline) + '</span>' : '') +
                '</td>';

            for (var m = 1; m <= duration; m++) {
                if (m >= estimatedStart && m <= estimatedEnd) {
                    var aIsStart = m === estimatedStart;
                    var aIsEnd = m === estimatedEnd;
                    html += '<td style="padding:2px 0"><div style="height:16px;background:' + color + ';opacity:' + (act.completed ? '0.9' : '0.4') + ';' +
                        (aIsStart ? 'border-radius:3px 0 0 3px;margin-left:4px;' : '') +
                        (aIsEnd ? 'border-radius:0 3px 3px 0;margin-right:4px;' : '') +
                        '"></div></td>';
                } else {
                    html += '<td></td>';
                }
            }
            html += '</tr>';
        });

        // Separator row between WPs
        html += '<tr><td colspan="' + (duration + 1) + '" style="padding:0;height:4px"></td></tr>';
    });

    // Current month indicator
    var elapsed = getMonthsElapsed(project.startDate);
    if (elapsed > 0 && elapsed <= duration) {
        html += '<tr><td style="padding:4px 12px;font-size:11px;color:var(--danger);font-weight:600;position:sticky;left:0;background:#fff"><i class="fas fa-map-pin"></i> Today (M' + elapsed + ')</td>';
        for (var m = 1; m <= duration; m++) {
            html += '<td style="padding:0">' + (m === elapsed ? '<div style="width:2px;height:100%;min-height:20px;background:var(--danger);margin:0 auto"></div>' : '') + '</td>';
        }
        html += '</tr>';
    }

    // Legend
    html += '</tbody></table></div>';
    html += '<div style="display:flex;gap:16px;margin-top:12px;font-size:11px;color:var(--gray-500);flex-wrap:wrap">' +
        '<span><span style="display:inline-block;width:20px;height:10px;background:var(--primary);opacity:1;border-radius:2px;vertical-align:middle;margin-right:4px"></span> Completed progress</span>' +
        '<span><span style="display:inline-block;width:20px;height:10px;background:var(--primary);opacity:0.35;border-radius:2px;vertical-align:middle;margin-right:4px"></span> Remaining</span>' +
        '<span><span style="display:inline-block;width:20px;height:6px;background:var(--primary);opacity:0.4;border-radius:2px;vertical-align:middle;margin-right:4px"></span> Activity</span>' +
        '<span><span style="display:inline-block;width:2px;height:12px;background:var(--danger);vertical-align:middle;margin-right:4px"></span> Today</span>' +
        '</div>';
    container.innerHTML = html;
}

// ---- PROJECT TIMELINE / MILESTONES ----
function renderTimeline(container) {
    var project = getCurrentProject();
    var meetings = getCurrentMeetings();
    var wps = getCurrentWPs();

    var events = [];

    // Add project start/end
    if (project.startDate) events.push({ date: project.startDate, title: 'Project Start', type: 'milestone', icon: 'fa-rocket' });
    if (project.endDate) events.push({ date: project.endDate, title: 'Project End', type: 'milestone', icon: 'fa-flag-checkered' });

    // Add WP milestones
    wps.forEach(function(wp) {
        if (wp.status === 'completed') {
            events.push({ date: project.startDate, title: wp.number + ' completed: ' + wp.title, type: 'wp', icon: 'fa-check-circle' });
        }
    });

    // Add meetings
    meetings.forEach(function(m) {
        events.push({ date: m.date, title: m.title, type: 'meeting', icon: 'fa-calendar', location: m.location || '' });
    });

    // Sort by date
    events.sort(function(a, b) { return new Date(a.date || 0) - new Date(b.date || 0); });

    var typeColors = { milestone: 'var(--primary)', wp: 'var(--success)', meeting: 'var(--warning)' };

    var html = '<div style="position:relative;padding-left:30px">';
    html += '<div style="position:absolute;left:14px;top:0;bottom:0;width:2px;background:var(--gray-200)"></div>';
    events.forEach(function(ev) {
        var color = typeColors[ev.type] || 'var(--gray-400)';
        html += '<div style="position:relative;padding:12px 0 12px 24px;margin-bottom:4px">' +
            '<div style="position:absolute;left:-9px;top:16px;width:20px;height:20px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center">' +
            '<i class="fas ' + ev.icon + '" style="font-size:10px;color:#fff"></i></div>' +
            '<div style="font-size:11px;color:var(--gray-400)">' + formatDate(ev.date) + '</div>' +
            '<div style="font-size:14px;font-weight:600;color:var(--gray-800)">' + ev.title + '</div>' +
            (ev.location ? '<div style="font-size:12px;color:var(--gray-500)"><i class="fas fa-map-marker-alt"></i> ' + ev.location + '</div>' : '') +
            '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

// ---- DEADLINE REMINDERS ----
function checkDeadlineReminders() {
    var allProjects = Object.values(Projects).filter(function(p) { return p.status !== 'archived'; });
    var now = new Date();
    var warnings = [];

    allProjects.forEach(function(p) {
        var tasks = Tasks[p.id] || [];
        tasks.forEach(function(t) {
            if (t.status === 'completed' || !t.due) return;
            var due = new Date(t.due);
            var daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 3 && daysLeft >= 0) {
                warnings.push({ task: t.title, project: p.name, days: daysLeft, type: 'urgent' });
            } else if (daysLeft < 0) {
                warnings.push({ task: t.title, project: p.name, days: daysLeft, type: 'overdue' });
            } else if (daysLeft <= 7) {
                warnings.push({ task: t.title, project: p.name, days: daysLeft, type: 'warning' });
            }
        });
    });

    if (warnings.length > 0) showDeadlinePopup(warnings);
}

function showDeadlinePopup(warnings) {
    var overdue = warnings.filter(function(w) { return w.type === 'overdue'; });
    var urgent = warnings.filter(function(w) { return w.type === 'urgent'; });
    var upcoming = warnings.filter(function(w) { return w.type === 'warning'; });

    var html = '';
    if (overdue.length > 0) {
        html += '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:700;color:var(--danger);margin-bottom:6px">OVERDUE</div>';
        overdue.forEach(function(w) {
            html += '<div style="padding:6px 0;font-size:13px;border-bottom:1px solid var(--gray-100)"><strong>' + w.task + '</strong><br><span style="font-size:11px;color:var(--gray-400)">' + w.project + ' &middot; ' + Math.abs(w.days) + ' days overdue</span></div>';
        });
        html += '</div>';
    }
    if (urgent.length > 0) {
        html += '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:700;color:var(--warning);margin-bottom:6px">DUE SOON (3 days)</div>';
        urgent.forEach(function(w) {
            html += '<div style="padding:6px 0;font-size:13px;border-bottom:1px solid var(--gray-100)"><strong>' + w.task + '</strong><br><span style="font-size:11px;color:var(--gray-400)">' + w.project + ' &middot; ' + w.days + ' days left</span></div>';
        });
        html += '</div>';
    }
    if (upcoming.length > 0) {
        html += '<div><div style="font-size:12px;font-weight:700;color:var(--primary);margin-bottom:6px">UPCOMING (7 days)</div>';
        upcoming.forEach(function(w) {
            html += '<div style="padding:6px 0;font-size:13px;border-bottom:1px solid var(--gray-100)"><strong>' + w.task + '</strong><br><span style="font-size:11px;color:var(--gray-400)">' + w.project + ' &middot; ' + w.days + ' days left</span></div>';
        });
        html += '</div>';
    }

    openModal('Deadline Reminders (' + warnings.length + ')', html,
        '<button class="btn btn-primary" onclick="closeModal()">Got it</button>');
}

// ---- PROJECT TEMPLATES ----
var ProjectTemplates = {
    'ka220-hed': {
        name: 'KA220-HED Template',
        programme: 'Erasmus+ KA220-HED',
        duration: 24,
        totalBudget: 250000,
        workPackages: [
            { number: 'WP1', title: 'Project Management & Coordination', start: 'M1', end: 'M24', budget: 50000, description: 'Overall project coordination, quality assurance, risk management, and administrative management.' },
            { number: 'WP2', title: 'Research & Needs Analysis', start: 'M1', end: 'M8', budget: 40000, description: 'Desk research, stakeholder analysis, needs assessment, and competence framework development.' },
            { number: 'WP3', title: 'Development of Intellectual Outputs', start: 'M6', end: 'M18', budget: 60000, description: 'Development of main project outputs, curricula, toolkits, and educational resources.' },
            { number: 'WP4', title: 'Pilot Testing & Validation', start: 'M14', end: 'M22', budget: 40000, description: 'Pilot implementation, testing, feedback collection, and iterative improvement.' },
            { number: 'WP5', title: 'Dissemination & Exploitation', start: 'M1', end: 'M24', budget: 35000, description: 'Communication plan, website, social media, multiplier events, and sustainability strategy.' },
            { number: 'WP6', title: 'Quality Assurance & Evaluation', start: 'M1', end: 'M24', budget: 25000, description: 'Internal and external evaluation, quality monitoring, and continuous improvement.' }
        ]
    },
    'ka220-vet': {
        name: 'KA220-VET Template',
        programme: 'Erasmus+ KA220-VET',
        duration: 24,
        totalBudget: 250000,
        workPackages: [
            { number: 'WP1', title: 'Project Management', start: 'M1', end: 'M24', budget: 50000, description: 'Coordination, financial management, reporting, and quality assurance.' },
            { number: 'WP2', title: 'State of the Art Analysis', start: 'M1', end: 'M6', budget: 35000, description: 'Research on current VET practices and identification of gaps.' },
            { number: 'WP3', title: 'VET Curriculum Development', start: 'M4', end: 'M16', budget: 65000, description: 'Development of innovative VET training modules and materials.' },
            { number: 'WP4', title: 'Digital Platform Development', start: 'M8', end: 'M18', budget: 40000, description: 'Online learning platform and digital tools development.' },
            { number: 'WP5', title: 'Piloting & Evaluation', start: 'M16', end: 'M22', budget: 35000, description: 'Pilot testing with VET providers and learners, impact assessment.' },
            { number: 'WP6', title: 'Dissemination & Sustainability', start: 'M1', end: 'M24', budget: 25000, description: 'Dissemination activities, multiplier events, exploitation plan.' }
        ]
    },
    'ka210': {
        name: 'KA210 Small-Scale Template',
        programme: 'Erasmus+ KA210-HED',
        duration: 24,
        totalBudget: 60000,
        workPackages: [
            { number: 'WP1', title: 'Project Management', start: 'M1', end: 'M24', budget: 12000, description: 'Coordination and management of project activities.' },
            { number: 'WP2', title: 'Research & Development', start: 'M1', end: 'M16', budget: 25000, description: 'Main research and output development activities.' },
            { number: 'WP3', title: 'Testing & Implementation', start: 'M12', end: 'M22', budget: 13000, description: 'Pilot testing and validation of outputs.' },
            { number: 'WP4', title: 'Dissemination', start: 'M1', end: 'M24', budget: 10000, description: 'Communication and dissemination of results.' }
        ]
    }
};

function openTemplateModal() {
    var html = '<p style="color:var(--gray-600);margin-bottom:20px">Start with a pre-built template. Work packages, budgets, and timelines are pre-configured based on EU best practices.</p>';
    Object.keys(ProjectTemplates).forEach(function(key) {
        var t = ProjectTemplates[key];
        html += '<div style="border:1px solid var(--gray-200);border-radius:var(--radius);padding:16px;margin-bottom:12px;cursor:pointer;transition:all 0.2s" ' +
            'onmouseover="this.style.borderColor=\'var(--primary)\';this.style.background=\'var(--primary-50)\'" ' +
            'onmouseout="this.style.borderColor=\'var(--gray-200)\';this.style.background=\'#fff\'" ' +
            'onclick="applyTemplate(\'' + key + '\')">' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<div><div style="font-size:15px;font-weight:700">' + t.name + '</div>' +
            '<div style="font-size:12px;color:var(--gray-500)">' + t.workPackages.length + ' WPs &middot; ' + t.duration + ' months &middot; ' + formatCurrency(t.totalBudget) + '</div></div>' +
            '<i class="fas fa-arrow-right" style="color:var(--primary)"></i></div></div>';
    });
    openModal('Project Templates', html, '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>', true);
}

function applyTemplate(templateKey) {
    var t = ProjectTemplates[templateKey];
    if (!t) return;
    closeModal();
    // Pre-fill the create project modal with template data
    openNewProjectModal();
    setTimeout(function() {
        var progSel = document.getElementById('npProgramme');
        if (progSel) { for (var i = 0; i < progSel.options.length; i++) { if (progSel.options[i].text === t.programme) { progSel.selectedIndex = i; break; } } }
        var grantSel = document.getElementById('npGrant');
        if (grantSel) grantSel.value = t.totalBudget.toString();
        var durSel = document.getElementById('npDuration');
        if (durSel) durSel.value = t.duration.toString();
        toggleCustomGrant();
        // Store template WPs to apply after project creation
        window._pendingTemplateWPs = t.workPackages;
    }, 200);
}

// ---- DATA EXPORT (CSV) ----
function exportProjectData(format) {
    var project = getCurrentProject();
    var partners = getCurrentPartners();
    var wps = getCurrentWPs();
    var tasks = getCurrentTasks();

    if (format === 'csv' || !format) {
        var csv = '';
        // Project info
        csv += 'PROJECT INFORMATION\n';
        csv += 'Name,' + project.name + '\n';
        csv += 'Programme,' + (project.programme || '') + '\n';
        csv += 'Project Number,' + (project.projectNumber || '') + '\n';
        csv += 'Start Date,' + (project.startDate || '') + '\n';
        csv += 'End Date,' + (project.endDate || '') + '\n';
        csv += 'Duration,' + (project.duration || '') + ' months\n';
        csv += 'Total Budget,' + (project.totalBudget || 0) + '\n\n';

        // Partners
        csv += 'PARTNERS\n';
        csv += 'Name,Country,Role,Contact,Email,Budget\n';
        partners.forEach(function(p) {
            csv += '"' + p.name + '",' + (p.country || '') + ',' + (p.role || '') + ',"' + (p.contact || '') + '",' + (p.email || '') + ',' + (p.budget || 0) + '\n';
        });
        csv += '\n';

        // Work Packages
        csv += 'WORK PACKAGES\n';
        csv += 'Number,Title,Lead,Start,End,Budget,Progress,Status\n';
        wps.forEach(function(wp) {
            csv += (wp.number || '') + ',"' + wp.title + '","' + (wp.lead || '') + '",' + (wp.start || '') + ',' + (wp.end || '') + ',' + (wp.budget || 0) + ',' + (wp.progress || 0) + '%,' + (wp.status || '') + '\n';
        });
        csv += '\n';

        // Tasks
        csv += 'TASKS\n';
        csv += 'Title,Work Package,Assignee,Due Date,Priority,Status\n';
        tasks.forEach(function(t) {
            csv += '"' + t.title + '",' + (t.wp || '') + ',"' + (t.assignee || '') + '",' + (t.due || '') + ',' + (t.priority || '') + ',' + (t.status || '') + '\n';
        });

        // Download
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = (project.name || 'project').replace(/[^a-zA-Z0-9]/g, '_') + '_export.csv';
        link.click();
        showToast('CSV exported!', 'success');
    }
}

function exportProjectJSON() {
    var project = getCurrentProject();
    var data = {
        project: project,
        partners: getCurrentPartners(),
        workPackages: getCurrentWPs(),
        tasks: getCurrentTasks(),
        dissemination: getCurrentDissemination(),
        meetings: getCurrentMeetings()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (project.name || 'project').replace(/[^a-zA-Z0-9]/g, '_') + '_backup.json';
    link.click();
    showToast('JSON backup exported!', 'success');
}

// ---- PARTNER MAP ----
function renderPartnerMap(container) {
    var partners = getCurrentPartners();
    if (partners.length === 0) { container.innerHTML = '<p class="text-sm text-muted">Add partners to see the map.</p>'; return; }

    var countryCoords = {
        'Austria': [47.5, 14.5], 'Belgium': [50.8, 4.3], 'Bulgaria': [42.7, 25.5], 'Croatia': [45.1, 15.2],
        'Cyprus': [35.1, 33.4], 'Czech Republic': [49.8, 15.5], 'Denmark': [56.3, 9.5], 'Estonia': [58.6, 25.0],
        'Finland': [61.9, 25.7], 'France': [46.2, 2.2], 'Germany': [51.2, 10.4], 'Greece': [39.1, 21.8],
        'Hungary': [47.2, 19.5], 'Iceland': [64.1, -18.1], 'Ireland': [53.1, -7.7], 'Italy': [41.9, 12.6],
        'Latvia': [56.9, 24.1], 'Liechtenstein': [47.2, 9.6], 'Lithuania': [55.2, 23.9], 'Luxembourg': [49.8, 6.1],
        'Malta': [35.9, 14.4], 'Netherlands': [52.1, 5.3], 'North Macedonia': [41.5, 21.7], 'Norway': [60.5, 8.5],
        'Poland': [51.9, 19.1], 'Portugal': [39.4, -8.2], 'Romania': [45.9, 25.0], 'Serbia': [44.0, 21.0],
        'Slovakia': [48.7, 19.7], 'Slovenia': [46.2, 14.8], 'Spain': [40.5, -3.7], 'Sweden': [60.1, 18.6],
        'Turkey': [39.0, 35.2]
    };

    var html = '<div style="position:relative;background:var(--primary-50);border-radius:var(--radius-lg);padding:24px;min-height:300px">';
    html += '<div style="font-size:14px;font-weight:700;margin-bottom:16px">Partner Locations</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:12px">';
    partners.forEach(function(p) {
        var flag = p.country ? getCountryFlag(p.country) : '';
        html += '<div style="display:flex;align-items:center;gap:8px;background:#fff;padding:8px 14px;border-radius:50px;box-shadow:var(--shadow-sm)">' +
            '<span style="font-size:18px">' + flag + '</span>' +
            '<div><div style="font-size:13px;font-weight:600">' + p.name + '</div>' +
            '<div style="font-size:11px;color:var(--gray-500)">' + (p.country || '') + ' &middot; ' + (p.role || '') + '</div></div></div>';
    });
    html += '</div>';

    // Country count summary
    var countries = {};
    partners.forEach(function(p) { if (p.country) countries[p.country] = (countries[p.country] || 0) + 1; });
    html += '<div style="margin-top:16px;font-size:13px;color:var(--gray-600)"><strong>' + Object.keys(countries).length + ' countries</strong>: ' +
        Object.keys(countries).map(function(c) { return getCountryFlag(c) + ' ' + c + ' (' + countries[c] + ')'; }).join(' &middot; ') + '</div>';
    html += '</div>';
    container.innerHTML = html;
}

function getCountryFlag(country) {
    var flags = {
        'Austria':'🇦🇹','Belgium':'🇧🇪','Bulgaria':'🇧🇬','Croatia':'🇭🇷','Cyprus':'🇨🇾','Czech Republic':'🇨🇿',
        'Denmark':'🇩🇰','Estonia':'🇪🇪','Finland':'🇫🇮','France':'🇫🇷','Germany':'🇩🇪','Greece':'🇬🇷',
        'Hungary':'🇭🇺','Iceland':'🇮🇸','Ireland':'🇮🇪','Italy':'🇮🇹','Latvia':'🇱🇻','Liechtenstein':'🇱🇮',
        'Lithuania':'🇱🇹','Luxembourg':'🇱🇺','Malta':'🇲🇹','Netherlands':'🇳🇱','North Macedonia':'🇲🇰',
        'Norway':'🇳🇴','Poland':'🇵🇱','Portugal':'🇵🇹','Romania':'🇷🇴','Serbia':'🇷🇸','Slovakia':'🇸🇰',
        'Slovenia':'🇸🇮','Spain':'🇪🇸','Sweden':'🇸🇪','Turkey':'🇹🇷'
    };
    return flags[country] || '🏳️';
}

// ---- DARK MODE ----
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    var isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('euphub_darkmode', isDark ? '1' : '0');
    var icon = document.getElementById('darkModeIcon');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

function initDarkMode() {
    if (localStorage.getItem('euphub_darkmode') === '1') {
        document.body.classList.add('dark-mode');
    }
}
