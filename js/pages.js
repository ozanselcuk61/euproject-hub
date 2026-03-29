/* ====================================
   EUProject Hub — Page Renderers
   ==================================== */

// ---- DASHBOARD ----
function renderDashboard(container) {
    var projectCount = getProjectCount();

    if (projectCount === 0) {
        container.innerHTML = '\
        <div class="page-header">\
            <h1>Dashboard</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-primary" onclick="openNewProjectModal()"><i class="fas fa-plus"></i> New Project</button>\
            </div>\
        </div>\
        <div class="empty-state" style="padding:80px 20px;text-align:center">\
            <i class="fas fa-project-diagram" style="font-size:64px;color:var(--gray-300);margin-bottom:24px"></i>\
            <h3 style="font-size:24px;margin-bottom:12px">Welcome to EUProject Hub!</h3>\
            <p style="color:var(--gray-500);margin-bottom:24px;max-width:500px;margin-left:auto;margin-right:auto">Create your first EU project to start managing partners, work packages, budgets, and more.</p>\
            <button class="btn btn-primary btn-lg" onclick="openNewProjectModal()"><i class="fas fa-plus"></i> Create Your First Project</button>\
        </div>';
        return;
    }

    var project = getCurrentProject();
    if (!project) {
        container.innerHTML = '<div class="empty-state"><p>Select a project from the sidebar.</p></div>';
        return;
    }

    var partners = getCurrentPartners();
    var tasks = getCurrentTasks();
    var activities = getCurrentActivities();
    var progress = getProjectProgress();
    var totalSpent = partners.reduce(function(s, p) { return s + (p.spent || 0); }, 0);
    var openTasks = tasks.filter(function(t) { return t.status !== 'completed'; }).length;
    var highPrioTasks = tasks.filter(function(t) { return t.priority === 'high' && t.status !== 'completed'; }).length;

    container.innerHTML = '\
        <div class="page-header">\
            <h1>Dashboard</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-primary" onclick="openNewProjectModal()"><i class="fas fa-plus"></i> New Project</button>\
            </div>\
        </div>\
        <div class="stats-grid">\
            <div class="stat-card">\
                <div class="stat-card-header">\
                    <span class="stat-card-label">Active Projects</span>\
                    <div class="stat-card-icon" style="background:var(--primary-50);color:var(--primary)"><i class="fas fa-project-diagram"></i></div>\
                </div>\
                <div class="stat-card-value">' + projectCount + '</div>\
                <div class="stat-card-change positive"><i class="fas fa-arrow-up"></i> All on track</div>\
            </div>\
            <div class="stat-card">\
                <div class="stat-card-header">\
                    <span class="stat-card-label">Overall Progress</span>\
                    <div class="stat-card-icon" style="background:var(--success-light);color:var(--success)"><i class="fas fa-chart-line"></i></div>\
                </div>\
                <div class="stat-card-value">' + progress + '%</div>\
                <div class="progress-bar mt-4"><div class="progress-fill" style="width:' + progress + '%"></div></div>\
            </div>\
            <div class="stat-card">\
                <div class="stat-card-header">\
                    <span class="stat-card-label">Open Tasks</span>\
                    <div class="stat-card-icon" style="background:var(--warning-light);color:var(--warning)"><i class="fas fa-tasks"></i></div>\
                </div>\
                <div class="stat-card-value">' + openTasks + '</div>\
                <div class="stat-card-change">' + highPrioTasks + ' high priority</div>\
            </div>\
            <div class="stat-card">\
                <div class="stat-card-header">\
                    <span class="stat-card-label">Budget Utilized</span>\
                    <div class="stat-card-icon" style="background:var(--purple-light);color:var(--purple)"><i class="fas fa-euro-sign"></i></div>\
                </div>\
                <div class="stat-card-value">' + formatCurrency(totalSpent) + '</div>\
                <div class="stat-card-change">of ' + formatCurrency(project.totalBudget) + '</div>\
            </div>\
        </div>\
        <div class="content-grid">\
            <div>\
                <div class="card mb-6">\
                    <div class="card-header">\
                        <h2><i class="fas fa-stream"></i> Activity Stream</h2>\
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo(\'overview\')">View All</button>\
                    </div>\
                    <div class="card-body">\
                        <div class="activity-feed" id="dashActivityFeed"></div>\
                    </div>\
                </div>\
                <div class="card">\
                    <div class="card-header">\
                        <h2><i class="fas fa-cubes"></i> Work Package Progress</h2>\
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo(\'workpackages\')">Manage WPs</button>\
                    </div>\
                    <div class="card-body" id="dashWPProgress"></div>\
                </div>\
            </div>\
            <div>\
                <div class="card mb-6">\
                    <div class="card-header">\
                        <h2><i class="fas fa-clipboard-check"></i> My Tasks</h2>\
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo(\'tasks\')">All Tasks</button>\
                    </div>\
                    <div class="card-body" style="padding:0">\
                        <div class="task-list" id="dashTaskList"></div>\
                    </div>\
                </div>\
                <div class="card mb-6">\
                    <div class="card-header">\
                        <h2><i class="fas fa-users"></i> Partners</h2>\
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo(\'partners\')">View All</button>\
                    </div>\
                    <div class="card-body" id="dashPartnerList"></div>\
                </div>\
                <div class="card">\
                    <div class="card-header">\
                        <h2><i class="fas fa-calendar"></i> Upcoming</h2>\
                    </div>\
                    <div class="card-body" id="dashUpcoming"></div>\
                </div>\
            </div>\
        </div>';

    // Populate activity feed
    var feedEl = document.getElementById('dashActivityFeed');
    if (activities.length > 0) {
        feedEl.innerHTML = activities.slice(0, 6).map(function(a) {
            return '<div class="activity-item"><div class="activity-avatar">' + (a.initials || '?') + '</div><div class="activity-content"><div class="activity-text"><strong>' + a.user + '</strong> ' + a.action + ' <strong>' + a.target + '</strong>' + (a.folder ? ' in ' + a.folder : '') + '</div><div class="activity-time">' + a.time + '</div></div></div>';
        }).join('');
    } else {
        feedEl.innerHTML = '<p class="text-sm text-muted" style="color:var(--gray-400);font-size:13px">No recent activity. Start by adding partners and work packages.</p>';
    }

    // WP Progress
    var wpEl = document.getElementById('dashWPProgress');
    var wps = getCurrentWPs();
    if (wps.length > 0) {
        wpEl.innerHTML = wps.map(function(wp) {
            return '<div style="margin-bottom:16px"><div class="progress-label"><span>' + wp.number + ': ' + wp.title + '</span><span>' + wp.progress + '%</span></div><div class="progress-bar"><div class="progress-fill ' + (wp.progress === 100 ? 'success' : wp.progress < 20 ? 'warning' : '') + '" style="width:' + wp.progress + '%"></div></div></div>';
        }).join('');
    } else {
        wpEl.innerHTML = '<p class="text-sm text-muted" style="color:var(--gray-400);font-size:13px">No work packages yet. <a href="#" onclick="navigateTo(\'workpackages\');return false" style="color:var(--primary)">Add one</a></p>';
    }

    // Tasks
    var taskEl = document.getElementById('dashTaskList');
    var openTasksList = tasks.filter(function(t) { return t.status !== 'completed'; }).slice(0, 5);
    if (openTasksList.length > 0) {
        taskEl.innerHTML = openTasksList.map(function(t) {
            return '<div class="task-item"><div class="task-checkbox"></div><div class="task-info"><div class="task-title">' + t.title + '</div><div class="task-due"><span class="wp-number" style="font-size:10px">' + t.wp + '</span> Due: ' + formatDate(t.due) + '</div></div></div>';
        }).join('');
    } else {
        taskEl.innerHTML = '<div style="padding:16px"><p class="text-sm text-muted" style="color:var(--gray-400);font-size:13px">No open tasks.</p></div>';
    }

    // Partners
    var partnerEl = document.getElementById('dashPartnerList');
    if (partners.length > 0) {
        partnerEl.innerHTML = partners.slice(0, 4).map(function(p) {
            return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--gray-100)"><div class="user-avatar" style="width:36px;height:36px;font-size:12px">' + (p.initials || '?') + '</div><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--gray-800)">' + p.name + '</div><div style="font-size:11px;color:var(--gray-400)">' + p.country + ' &middot; ' + p.contact + '</div></div><span class="partner-role ' + (p.role === 'coordinator' ? 'role-coordinator' : 'role-partner') + '">' + p.role + '</span></div>';
        }).join('');
    } else {
        partnerEl.innerHTML = '<p class="text-sm text-muted" style="color:var(--gray-400);font-size:13px">No partners yet. <a href="#" onclick="navigateTo(\'partners\');return false" style="color:var(--primary)">Add one</a></p>';
    }

    // Upcoming meetings
    var upcomingEl = document.getElementById('dashUpcoming');
    var upcomingMeetings = getCurrentMeetings().filter(function(m) { return m.status === 'upcoming'; });
    if (upcomingMeetings.length > 0) {
        upcomingEl.innerHTML = upcomingMeetings.map(function(m) {
            return '<div style="padding:8px 0;border-bottom:1px solid var(--gray-100)"><div style="font-size:14px;font-weight:600;color:var(--gray-800)">' + m.title + '</div><div style="font-size:12px;color:var(--gray-500);margin-top:4px"><i class="fas fa-map-marker-alt"></i> ' + m.location + '</div><div style="font-size:12px;color:var(--gray-400);margin-top:2px"><i class="fas fa-clock"></i> ' + formatDate(m.date) + '</div></div>';
        }).join('');
    } else {
        upcomingEl.innerHTML = '<p class="text-sm text-muted" style="color:var(--gray-400);font-size:13px">No upcoming meetings</p>';
    }
}

// ---- MY PROJECTS ----
function renderProjects(container) {
    var projectIds = Object.keys(Projects);
    var activeProjects = projectIds.filter(function(id) { return Projects[id].status !== 'archived'; });
    var archivedProjects = projectIds.filter(function(id) { return Projects[id].status === 'archived'; });

    container.innerHTML = '\
        <div class="page-header">\
            <h1>My Projects</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-primary" onclick="openNewProjectModal()"><i class="fas fa-plus"></i> Create Project</button>\
            </div>\
        </div>\
        <div class="tabs" id="projectTabs">\
            <button class="tab-btn active" onclick="showProjectTab(\'active\',this)">Current Projects (' + activeProjects.length + ')</button>\
            <button class="tab-btn" onclick="showProjectTab(\'archived\',this)">Archived (' + archivedProjects.length + ')</button>\
        </div>\
        <div class="wp-grid" id="projectGridActive"></div>\
        <div class="wp-grid hidden" id="projectGridArchived"></div>';

    renderProjectGrid('projectGridActive', activeProjects, false);
    renderProjectGrid('projectGridArchived', archivedProjects, true);
}

function showProjectTab(tab, btn) {
    document.querySelectorAll('#projectTabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    document.getElementById('projectGridActive').className = 'wp-grid' + (tab === 'active' ? '' : ' hidden');
    document.getElementById('projectGridArchived').className = 'wp-grid' + (tab === 'archived' ? '' : ' hidden');
}

function renderProjectGrid(containerId, projectIds, isArchived) {
    var grid = document.getElementById(containerId);
    if (projectIds.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:60px 20px;text-align:center"><i class="fas fa-folder-open" style="font-size:48px;color:var(--gray-300);margin-bottom:16px"></i><h3>' + (isArchived ? 'No archived projects' : 'No projects yet') + '</h3><p style="color:var(--gray-500)">' + (isArchived ? 'Archived projects will appear here.' : 'Create your first project to get started.') + '</p></div>';
        return;
    }

    grid.innerHTML = projectIds.map(function(id) {
        var p = Projects[id];
        var wps = WorkPackages[id] || [];
        var ptnrs = Partners[id] || [];
        var prog = wps.length > 0 ? Math.round(wps.reduce(function(s, w) { return s + w.progress; }, 0) / wps.length) : 0;
        var statusClass = p.status === 'archived' ? 'status-draft' : p.status === 'completed' ? 'status-completed' : 'status-active';
        var websiteHtml = p.website ? '<div style="margin-top:8px;font-size:12px"><a href="' + p.website + '" target="_blank" onclick="event.stopPropagation()" style="color:var(--primary)"><i class="fas fa-globe"></i> ' + p.website.replace(/^https?:\/\//, '').replace(/\/$/, '') + '</a></div>' : '';
        return '<div class="wp-card">\
            <div class="wp-card-header" onclick="AppState.currentProjectId=\'' + id + '\';document.getElementById(\'projectSelector\').value=\'' + id + '\';updateSidebarBadges();navigateTo(\'overview\')" style="cursor:pointer">\
                <span class="wp-number">' + (p.programme || 'EU Project') + '</span>\
                <span class="status-badge ' + statusClass + '">' + (p.status || 'active') + '</span>\
            </div>\
            <div onclick="AppState.currentProjectId=\'' + id + '\';document.getElementById(\'projectSelector\').value=\'' + id + '\';updateSidebarBadges();navigateTo(\'overview\')" style="cursor:pointer">\
                <h3>' + p.name + '</h3>\
                <p>' + (p.description || '').substring(0, 120) + (p.description && p.description.length > 120 ? '...' : '') + '</p>\
                ' + websiteHtml + '\
                <div style="margin:12px 0">\
                    <div class="progress-label"><span>Progress</span><span>' + prog + '%</span></div>\
                    <div class="progress-bar"><div class="progress-fill" style="width:' + prog + '%"></div></div>\
                </div>\
                <div class="wp-meta">\
                    <span><i class="fas fa-users"></i> ' + ptnrs.length + ' partners</span>\
                    <span><i class="fas fa-euro-sign"></i> ' + formatCurrency(p.totalBudget) + '</span>\
                    <span><i class="fas fa-clock"></i> ' + (p.duration || 0) + ' months</span>\
                </div>\
            </div>\
            <div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--gray-200)">\
                ' + (isArchived ? '<button class="btn btn-sm btn-secondary" style="flex:1" onclick="event.stopPropagation();restoreProject(\'' + id + '\')"><i class="fas fa-undo"></i> Restore</button>' : '') + '\
                <button class="btn btn-sm btn-danger" style="flex:1" onclick="event.stopPropagation();deleteProject(\'' + id + '\')"><i class="fas fa-trash"></i> Delete</button>\
            </div>\
        </div>';
    }).join('');
}

function archiveProject(projectId) {
    if (!confirm('Archive this project? You can restore it later.')) return;
    Projects[projectId].status = 'archived';
    updateProjectField(projectId, 'status', 'archived').then(function() {
        refreshProjectSelector();
        updateSidebarBadges();
        navigateTo('projects');
        showToast('Project archived.', 'info');
    });
}

function restoreProject(projectId) {
    Projects[projectId].status = 'active';
    updateProjectField(projectId, 'status', 'active').then(function() {
        refreshProjectSelector();
        updateSidebarBadges();
        navigateTo('projects');
        showToast('Project restored!', 'success');
    });
}

function deleteProject(projectId) {
    var p = Projects[projectId];
    if (!confirm('Permanently delete "' + p.name + '"? This cannot be undone.')) return;
    if (!confirm('Are you sure? All project data (partners, WPs, tasks, documents) will be lost.')) return;

    db.collection('projects').doc(projectId).delete().then(function() {
        delete Projects[projectId];
        delete Partners[projectId];
        delete WorkPackages[projectId];
        delete Tasks[projectId];
        delete Documents[projectId];
        delete Meetings[projectId];
        delete Dissemination[projectId];
        delete ActivityStream[projectId];
        delete BudgetTracking[projectId];

        if (AppState.currentProjectId === projectId) {
            var remaining = Object.keys(Projects);
            AppState.currentProjectId = remaining.length > 0 ? remaining[0] : null;
        }

        refreshProjectSelector();
        updateSidebarBadges();
        navigateTo('projects');
        showToast('Project deleted.', 'info');
    }).catch(function(error) {
        showToast('Error deleting project: ' + error.message, 'error');
    });
}

function openNewProjectModal() {
    openModal('Create New Project', '\
        <div class="form-group">\
            <label class="form-label">Project Name</label>\
            <input type="text" class="form-input" id="npName" placeholder="e.g., DigiSkills4EU">\
        </div>\
        <div class="form-row">\
            <div class="form-group">\
                <label class="form-label">Programme</label>\
                <select class="form-select" id="npProgramme">\
                    <option>Erasmus+ KA220-HED</option>\
                    <option>Erasmus+ KA220-VET</option>\
                    <option>Erasmus+ KA220-SCH</option>\
                    <option>Erasmus+ KA220-ADU</option>\
                    <option>Erasmus+ KA220-YOU</option>\
                </select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">Grant Amount (Lump Sum)</label>\
                <select class="form-select" id="npGrant">\
                    <option value="120000">€120,000</option>\
                    <option value="250000" selected>€250,000</option>\
                    <option value="400000">€400,000</option>\
                </select>\
            </div>\
        </div>\
        <div class="form-row">\
            <div class="form-group">\
                <label class="form-label">Start Date</label>\
                <input type="date" class="form-input" id="npStartDate">\
            </div>\
            <div class="form-group">\
                <label class="form-label">Duration (months)</label>\
                <select class="form-select" id="npDuration">\
                    <option>12</option>\
                    <option selected>24</option>\
                    <option>36</option>\
                </select>\
            </div>\
        </div>\
        <div class="form-group">\
            <label class="form-label">Project Number</label>\
            <input type="text" class="form-input" id="npNumber" placeholder="e.g., 2025-1-PL01-KA220-HED-000123456">\
        </div>\
        <div class="form-group">\
            <label class="form-label">Coordinator Organization</label>\
            <input type="text" class="form-input" id="npCoordinator" placeholder="e.g., University of Warsaw">\
        </div>\
        <div class="form-group">\
            <label class="form-label">Coordinator Country</label>\
            <input type="text" class="form-input" id="npCountry" placeholder="e.g., Poland">\
        </div>\
        <div class="form-group">\
            <label class="form-label">Description</label>\
            <textarea class="form-textarea" rows="3" id="npDesc" placeholder="Brief project description..."></textarea>\
        </div>\
        <div class="form-group">\
            <label class="form-label">Project Website</label>\
            <input type="url" class="form-input" id="npWebsite" placeholder="https://...">\
        </div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleCreateProject()"><i class="fas fa-check"></i> Create Project</button>', true);
}

function handleCreateProject() {
    var name = document.getElementById('npName').value.trim();
    var programme = document.getElementById('npProgramme').value;
    var totalBudget = parseInt(document.getElementById('npGrant').value);
    var startDate = document.getElementById('npStartDate').value;
    var duration = parseInt(document.getElementById('npDuration').value);
    var projectNumber = document.getElementById('npNumber').value.trim();
    var coordinator = document.getElementById('npCoordinator').value.trim();
    var coordinatorCountry = document.getElementById('npCountry').value.trim();
    var description = document.getElementById('npDesc').value.trim();
    var website = document.getElementById('npWebsite').value.trim();

    if (!name) { alert('Please enter a project name.'); return; }

    var endDate = '';
    if (startDate) {
        var end = new Date(startDate);
        end.setMonth(end.getMonth() + duration);
        endDate = end.toISOString().split('T')[0];
    }

    var projectData = {
        name: name,
        programme: programme,
        projectNumber: projectNumber || 'TBD',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate,
        duration: duration,
        status: 'active',
        description: description || 'New EU project.',
        totalBudget: totalBudget,
        coordinator: coordinator || (AppState.currentUser ? AppState.currentUser.organization || AppState.currentUser.name : ''),
        coordinatorCountry: coordinatorCountry,
        website: website,
        lumpSum: { totalGrant: totalBudget, wpAllocations: {} },
        partners: [],
        workPackages: [],
        tasks: [],
        documents: { folders: [] },
        meetings: [],
        dissemination: { summary: { events: 0, publications: 0, socialReach: 0, website_visits: 0 }, activities: [] },
        activityStream: [],
        budgetTracking: { wpStatus: [], partnerTransfers: [] }
    };

    // Disable button
    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...'; }

    saveProject(projectData).then(function(result) {
        if (result.success) {
            var id = result.id;
            // Add to local state
            Projects[id] = {
                id: id,
                firestoreId: id,
                name: name,
                programme: programme,
                projectNumber: projectData.projectNumber,
                startDate: projectData.startDate,
                endDate: endDate,
                duration: duration,
                status: 'active',
                description: projectData.description,
                totalBudget: totalBudget,
                coordinator: projectData.coordinator,
                coordinatorCountry: coordinatorCountry,
                website: website,
                lumpSum: projectData.lumpSum
            };
            Partners[id] = [];
            WorkPackages[id] = [];
            Tasks[id] = [];
            Documents[id] = { folders: [] };
            Meetings[id] = [];
            Dissemination[id] = projectData.dissemination;
            ActivityStream[id] = [];
            BudgetTracking[id] = { wpStatus: [], partnerTransfers: [] };

            AppState.currentProjectId = id;
            refreshProjectSelector();
            updateSidebarBadges();
            closeModal();
            navigateTo('overview');
            showToast('Project "' + name + '" created!', 'success');
        } else {
            showToast('Error: ' + (result.error || 'Could not create project'), 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Create Project'; }
        }
    });
}

// ---- PROJECT OVERVIEW ----
function renderOverview(container) {
    var p = getCurrentProject();
    if (!p) { container.innerHTML = '<div class="empty-state"><p>No project selected.</p></div>'; return; }
    var partners = getCurrentPartners();
    var wps = getCurrentWPs();
    var progress = getProjectProgress();
    var elapsed = getMonthsElapsed(p.startDate);
    var totalSpent = partners.reduce(function(s, pr) { return s + (pr.spent || 0); }, 0);

    container.innerHTML = '\
        <div class="page-header">\
            <h1>' + p.name + '</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-secondary" onclick="openEditProjectModal()"><i class="fas fa-edit"></i> Edit</button>\
                <button class="btn btn-primary" onclick="navigateTo(\'ai-report\')"><i class="fas fa-robot"></i> Generate Report</button>\
            </div>\
        </div>\
        <div class="stats-grid">\
            <div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Programme</span></div><div class="stat-card-value" style="font-size:18px">' + p.programme + '</div><div class="stat-card-change">' + p.projectNumber + '</div></div>\
            <div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Duration</span></div><div class="stat-card-value">' + elapsed + '/' + p.duration + '</div><div class="stat-card-change">months elapsed</div></div>\
            <div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Progress</span></div><div class="stat-card-value">' + progress + '%</div><div class="progress-bar mt-4"><div class="progress-fill" style="width:' + progress + '%"></div></div></div>\
            <div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Total Grant</span></div><div class="stat-card-value" style="color:var(--primary)">' + formatCurrency(p.totalBudget) + '</div><div class="stat-card-change">' + formatCurrency(totalSpent) + ' spent (' + (p.totalBudget > 0 ? Math.round(totalSpent / p.totalBudget * 100) : 0) + '%)</div></div>\
        </div>\
        <div class="content-grid">\
            <div>\
                <div class="card mb-6">\
                    <div class="card-header"><h2>Project Description</h2></div>\
                    <div class="card-body"><p style="line-height:1.8;color:var(--gray-600)">' + p.description + '</p>\
                        <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px">\
                            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Start Date</strong><br>' + formatDate(p.startDate) + '</div>\
                            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">End Date</strong><br>' + formatDate(p.endDate) + '</div>\
                            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Coordinator</strong><br>' + p.coordinator + '</div>\
                            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Country</strong><br>' + p.coordinatorCountry + '</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="card">\
                    <div class="card-header"><h2>Work Packages</h2><button class="btn btn-sm btn-ghost" onclick="navigateTo(\'workpackages\')">View All</button></div>\
                    <div class="card-body" style="padding:0" id="overviewWPTable"></div>\
                </div>\
            </div>\
            <div>\
                <div class="card mb-6">\
                    <div class="card-header"><h2>Partners (' + partners.length + ')</h2></div>\
                    <div class="card-body" id="overviewPartnerList"></div>\
                </div>\
                <div class="card">\
                    <div class="card-header"><h2>Quick Actions</h2></div>\
                    <div class="card-body" style="display:flex;flex-direction:column;gap:8px">\
                        <button class="btn btn-secondary btn-block" onclick="navigateTo(\'tasks\')" style="justify-content:flex-start"><i class="fas fa-plus"></i> Add Task</button>\
                        <button class="btn btn-secondary btn-block" onclick="navigateTo(\'documents\')" style="justify-content:flex-start"><i class="fas fa-upload"></i> Upload Document</button>\
                        <button class="btn btn-secondary btn-block" onclick="navigateTo(\'dissemination\')" style="justify-content:flex-start"><i class="fas fa-bullhorn"></i> Log Dissemination</button>\
                        <button class="btn btn-secondary btn-block" onclick="navigateTo(\'meetings\')" style="justify-content:flex-start"><i class="fas fa-calendar-plus"></i> Plan Meeting</button>\
                        <button class="btn btn-primary btn-block" onclick="navigateTo(\'ai-report\')" style="justify-content:flex-start"><i class="fas fa-robot"></i> Generate AI Report</button>\
                    </div>\
                </div>\
            </div>\
        </div>';

    // WP table
    var wpTableEl = document.getElementById('overviewWPTable');
    if (wps.length > 0) {
        wpTableEl.innerHTML = '<table class="data-table"><thead><tr><th>WP</th><th>Title</th><th>Lead</th><th>Status</th><th>Progress</th></tr></thead><tbody>' +
            wps.map(function(wp) {
                return '<tr><td><span class="wp-number">' + wp.number + '</span></td><td style="font-weight:500">' + wp.title + '</td><td style="font-size:13px">' + (wp.lead || '').split(' ').slice(-1)[0] + '</td><td><span class="status-badge status-' + wp.status + '">' + wp.status + '</span></td><td style="width:120px"><div class="progress-bar"><div class="progress-fill ' + (wp.progress === 100 ? 'success' : '') + '" style="width:' + wp.progress + '%"></div></div></td></tr>';
            }).join('') + '</tbody></table>';
    } else {
        wpTableEl.innerHTML = '<div style="padding:20px"><p style="color:var(--gray-400);font-size:13px">No work packages yet.</p></div>';
    }

    // Partner list
    var partnerListEl = document.getElementById('overviewPartnerList');
    if (partners.length > 0) {
        partnerListEl.innerHTML = partners.map(function(pr) {
            return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100)"><div class="partner-avatar" style="width:40px;height:40px;font-size:14px">' + (pr.initials || '?') + '</div><div style="flex:1"><div style="font-size:13px;font-weight:600">' + pr.name + '</div><div style="font-size:11px;color:var(--gray-400)">' + pr.country + '</div></div><span class="partner-role ' + (pr.role === 'coordinator' ? 'role-coordinator' : 'role-partner') + '">' + pr.role + '</span></div>';
        }).join('');
    } else {
        partnerListEl.innerHTML = '<p style="color:var(--gray-400);font-size:13px">No partners added yet. <a href="#" onclick="navigateTo(\'partners\');return false" style="color:var(--primary)">Add partners</a></p>';
    }
}

// ---- EDIT PROJECT ----
function openEditProjectModal() {
    var p = getCurrentProject();
    if (!p) return;

    var programmeOptions = ['Erasmus+ KA220-HED', 'Erasmus+ KA220-VET', 'Erasmus+ KA220-SCH', 'Erasmus+ KA220-ADU', 'Erasmus+ KA220-YOU'];
    var programmeSelect = programmeOptions.map(function(opt) {
        return '<option' + (opt === p.programme ? ' selected' : '') + '>' + opt + '</option>';
    }).join('');

    var grantOptions = [
        { value: 120000, label: '\u20ac120,000' },
        { value: 250000, label: '\u20ac250,000' },
        { value: 400000, label: '\u20ac400,000' }
    ];
    var grantSelect = grantOptions.map(function(opt) {
        return '<option value="' + opt.value + '"' + (opt.value === p.totalBudget ? ' selected' : '') + '>' + opt.label + '</option>';
    }).join('');
    // Add custom option if budget doesn't match presets
    var isCustomBudget = !grantOptions.some(function(o) { return o.value === p.totalBudget; });
    if (isCustomBudget && p.totalBudget) {
        grantSelect += '<option value="' + p.totalBudget + '" selected>\u20ac' + p.totalBudget.toLocaleString() + ' (custom)</option>';
    }

    var durationOptions = [12, 24, 36].map(function(d) {
        return '<option' + (d === p.duration ? ' selected' : '') + '>' + d + '</option>';
    }).join('');

    var statusOptions = ['active', 'completed'].map(function(s) {
        return '<option value="' + s + '"' + (s === p.status ? ' selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
    }).join('');

    openModal('Edit Project', '\
        <div class="form-group">\
            <label class="form-label">Project Name</label>\
            <input type="text" class="form-input" id="epName" value="' + (p.name || '').replace(/"/g, '&quot;') + '">\
        </div>\
        <div class="form-row">\
            <div class="form-group">\
                <label class="form-label">Programme</label>\
                <select class="form-select" id="epProgramme">' + programmeSelect + '</select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">Grant Amount (Lump Sum)</label>\
                <select class="form-select" id="epGrant">' + grantSelect + '</select>\
            </div>\
        </div>\
        <div class="form-row">\
            <div class="form-group">\
                <label class="form-label">Start Date</label>\
                <input type="date" class="form-input" id="epStartDate" value="' + (p.startDate || '') + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">End Date</label>\
                <input type="date" class="form-input" id="epEndDate" value="' + (p.endDate || '') + '">\
            </div>\
        </div>\
        <div class="form-row">\
            <div class="form-group">\
                <label class="form-label">Duration (months)</label>\
                <select class="form-select" id="epDuration">' + durationOptions + '</select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">Status</label>\
                <select class="form-select" id="epStatus">' + statusOptions + '</select>\
            </div>\
        </div>\
        <div class="form-group">\
            <label class="form-label">Project Number</label>\
            <input type="text" class="form-input" id="epNumber" value="' + (p.projectNumber || '').replace(/"/g, '&quot;') + '">\
        </div>\
        <div class="form-row">\
            <div class="form-group">\
                <label class="form-label">Coordinator Organization</label>\
                <input type="text" class="form-input" id="epCoordinator" value="' + (p.coordinator || '').replace(/"/g, '&quot;') + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">Coordinator Country</label>\
                <input type="text" class="form-input" id="epCountry" value="' + (p.coordinatorCountry || '').replace(/"/g, '&quot;') + '">\
            </div>\
        </div>\
        <div class="form-group">\
            <label class="form-label">Description</label>\
            <textarea class="form-textarea" rows="3" id="epDesc">' + (p.description || '') + '</textarea>\
        </div>\
        <div class="form-group">\
            <label class="form-label">Project Website</label>\
            <input type="url" class="form-input" id="epWebsite" value="' + (p.website || '').replace(/"/g, '&quot;') + '" placeholder="https://...">\
        </div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleEditProject()"><i class="fas fa-save"></i> Save Changes</button>', true);
}

function handleEditProject() {
    var pid = AppState.currentProjectId;
    var p = Projects[pid];
    if (!p) return;

    var name = document.getElementById('epName').value.trim();
    var programme = document.getElementById('epProgramme').value;
    var totalBudget = parseInt(document.getElementById('epGrant').value);
    var startDate = document.getElementById('epStartDate').value;
    var endDate = document.getElementById('epEndDate').value;
    var duration = parseInt(document.getElementById('epDuration').value);
    var status = document.getElementById('epStatus').value;
    var projectNumber = document.getElementById('epNumber').value.trim();
    var coordinator = document.getElementById('epCoordinator').value.trim();
    var coordinatorCountry = document.getElementById('epCountry').value.trim();
    var description = document.getElementById('epDesc').value.trim();
    var website = document.getElementById('epWebsite').value.trim();

    // Auto-archive if status changed to completed
    if (status === 'completed') status = 'archived';

    if (!name) { alert('Project name is required.'); return; }

    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    // Build update object
    var updates = {
        name: name,
        programme: programme,
        totalBudget: totalBudget,
        startDate: startDate,
        endDate: endDate,
        duration: duration,
        status: status,
        projectNumber: projectNumber,
        coordinator: coordinator,
        coordinatorCountry: coordinatorCountry,
        description: description,
        website: website,
        'lumpSum.totalGrant': totalBudget,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('projects').doc(pid).update(updates)
        .then(function() {
            // Update local state
            p.name = name;
            p.programme = programme;
            p.totalBudget = totalBudget;
            p.startDate = startDate;
            p.endDate = endDate;
            p.duration = duration;
            p.status = status;
            p.projectNumber = projectNumber;
            p.coordinator = coordinator;
            p.coordinatorCountry = coordinatorCountry;
            p.description = description;
            p.website = website;
            p.lumpSum = p.lumpSum || {};
            p.lumpSum.totalGrant = totalBudget;

            refreshProjectSelector();
            closeModal();
            if (status === 'archived') {
                navigateTo('projects');
                showToast('Project marked as completed and archived.', 'success');
            } else {
                navigateTo('overview');
                showToast('Project updated!', 'success');
            }
        })
        .catch(function(error) {
            showToast('Error: ' + error.message, 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save Changes'; }
        });
}
