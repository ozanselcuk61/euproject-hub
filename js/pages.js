/* ====================================
   EUProject Hub — Page Renderers Part 1
   Dashboard, Projects, Overview
   ==================================== */

// ---- DASHBOARD ----
function renderDashboard(container) {
    var project = getCurrentProject();
    var partners = getCurrentPartners();
    var tasks = getCurrentTasks();
    var activities = getCurrentActivities();
    var progress = getProjectProgress();
    var totalSpent = partners.reduce(function(s, p) { return s + (p.spent || 0); }, 0);
    var openTasks = tasks.filter(function(t) { return t.status !== 'completed'; }).length;
    var projectCount = Object.keys(Projects).length;

    if (projectCount === 0) {
        container.innerHTML = '<div class="page-header"><h1>Dashboard</h1></div>' +
            '<div class="empty-state"><i class="fas fa-rocket"></i><h3>Welcome to EUProject Hub!</h3><p>Create your first project to get started.</p>' +
            '<button class="btn btn-primary btn-lg" onclick="openNewProjectModal()"><i class="fas fa-plus"></i> Create Your First Project</button></div>';
        return;
    }

    container.innerHTML =
        '<div class="page-header"><h1>Dashboard</h1><div class="page-header-actions">' +
        '<button class="btn btn-primary" onclick="openNewProjectModal()"><i class="fas fa-plus"></i> New Project</button></div></div>' +

        '<div class="stats-grid">' +
        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Active Projects</span>' +
        '<div class="stat-card-icon" style="background:var(--primary-50);color:var(--primary)"><i class="fas fa-project-diagram"></i></div></div>' +
        '<div class="stat-card-value">' + projectCount + '</div></div>' +

        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Overall Progress</span>' +
        '<div class="stat-card-icon" style="background:var(--success-light);color:var(--success)"><i class="fas fa-chart-line"></i></div></div>' +
        '<div class="stat-card-value">' + progress + '%</div>' +
        '<div class="progress-bar mt-4"><div class="progress-fill" style="width:' + progress + '%"></div></div></div>' +

        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Open Tasks</span>' +
        '<div class="stat-card-icon" style="background:var(--warning-light);color:var(--warning)"><i class="fas fa-tasks"></i></div></div>' +
        '<div class="stat-card-value">' + openTasks + '</div></div>' +

        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Total Budget</span>' +
        '<div class="stat-card-icon" style="background:var(--purple-light);color:var(--purple)"><i class="fas fa-euro-sign"></i></div></div>' +
        '<div class="stat-card-value">' + formatCurrency(project.totalBudget) + '</div></div>' +
        '</div>' +

        '<div class="content-grid"><div>' +
        '<div class="card mb-6"><div class="card-header"><h2><i class="fas fa-cubes"></i> Work Package Progress</h2>' +
        '<button class="btn btn-sm btn-ghost" onclick="navigateTo(\'workpackages\')">Manage WPs</button></div><div class="card-body">' +
        (getCurrentWPs().length > 0 ? getCurrentWPs().map(function(wp) {
            return '<div style="margin-bottom:16px"><div class="progress-label"><span>' + (wp.number || '') + ': ' + wp.title + '</span><span>' + (wp.progress || 0) + '%</span></div>' +
            '<div class="progress-bar"><div class="progress-fill ' + (wp.progress === 100 ? 'success' : '') + '" style="width:' + (wp.progress || 0) + '%"></div></div></div>';
        }).join('') : '<p class="text-sm text-muted">No work packages yet. <a href="#" onclick="navigateTo(\'workpackages\');return false">Add one</a></p>') +
        '</div></div></div>' +

        '<div>' +
        '<div class="card mb-6"><div class="card-header"><h2><i class="fas fa-clipboard-check"></i> My Tasks</h2>' +
        '<button class="btn btn-sm btn-ghost" onclick="navigateTo(\'tasks\')">All Tasks</button></div>' +
        '<div class="card-body" style="padding:0"><div class="task-list">' +
        (tasks.filter(function(t) { return t.status !== 'completed'; }).length > 0 ?
        tasks.filter(function(t) { return t.status !== 'completed'; }).slice(0, 5).map(function(t) {
            return '<div class="task-item"><div class="task-checkbox" onclick="toggleTask(\'' + (t._id || '') + '\')"></div>' +
            '<div class="task-info"><div class="task-title">' + t.title + '</div>' +
            '<div class="task-due">' + (t.wp ? '<span class="wp-number" style="font-size:10px">' + t.wp + '</span> ' : '') + 'Due: ' + formatDate(t.due) + '</div></div></div>';
        }).join('') : '<div class="empty-state" style="padding:30px"><p>No open tasks</p></div>') +
        '</div></div></div>' +

        '<div class="card"><div class="card-header"><h2><i class="fas fa-users"></i> Partners</h2>' +
        '<button class="btn btn-sm btn-ghost" onclick="navigateTo(\'partners\')">View All</button></div><div class="card-body">' +
        (partners.length > 0 ? partners.slice(0, 4).map(function(p) {
            return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--gray-100)">' +
            '<div class="user-avatar" style="width:36px;height:36px;font-size:12px">' + (p.initials || 'P') + '</div>' +
            '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + p.name + '</div>' +
            '<div style="font-size:11px;color:var(--gray-400)">' + (p.country || '') + '</div></div>' +
            '<span class="partner-role ' + (p.role === 'coordinator' ? 'role-coordinator' : 'role-partner') + '">' + (p.role || 'partner') + '</span></div>';
        }).join('') : '<p class="text-sm text-muted">No partners yet. <a href="#" onclick="navigateTo(\'partners\');return false">Add one</a></p>') +
        '</div></div></div></div>';
}

function toggleTask(taskId) {
    if (!taskId || !AppState.currentProjectId) return;
    var tasks = getCurrentTasks();
    var task = tasks.find(function(t) { return t._id === taskId; });
    if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        updateInSubCollection(AppState.currentProjectId, 'tasks', taskId, { status: task.status });
        navigateTo(AppState.currentPage);
    }
}

// ---- MY PROJECTS ----
function renderProjects(container) {
    var projectList = Object.values(Projects);
    var active = projectList.filter(function(p) { return p.status !== 'archived'; });
    var archived = projectList.filter(function(p) { return p.status === 'archived'; });

    container.innerHTML =
        '<div class="page-header"><h1>My Projects</h1><div class="page-header-actions">' +
        '<button class="btn btn-primary" onclick="openNewProjectModal()"><i class="fas fa-plus"></i> Create Project</button></div></div>' +

        '<div class="tabs" id="projectTabs">' +
        '<button class="tab-btn active" onclick="showProjectTab(\'active\')">Current Projects (' + active.length + ')</button>' +
        '<button class="tab-btn" onclick="showProjectTab(\'archived\')">Archived (' + archived.length + ')</button></div>' +

        '<div id="activeProjects"><div class="wp-grid">' +
        (active.length > 0 ? active.map(function(p) {
            var wps = WorkPackages[p.id] || [];
            var prog = wps.length > 0 ? Math.round(wps.reduce(function(s, w) { return s + (w.progress || 0); }, 0) / wps.length) : 0;
            var pCount = (Partners[p.id] || []).length;
            return '<div class="wp-card" onclick="AppState.currentProjectId=\'' + p.id + '\';document.getElementById(\'projectSelector\').value=\'' + p.id + '\';navigateTo(\'overview\')">' +
            '<div class="wp-card-header"><span class="wp-number">' + (p.programme || 'EU Project') + '</span>' +
            '<span class="status-badge status-active">Active</span></div>' +
            '<h3>' + p.name + '</h3><p>' + (p.description || '').substring(0, 120) + '</p>' +
            '<div style="margin:12px 0"><div class="progress-label"><span>Progress</span><span>' + prog + '%</span></div>' +
            '<div class="progress-bar"><div class="progress-fill" style="width:' + prog + '%"></div></div></div>' +
            '<div class="wp-meta"><span><i class="fas fa-users"></i> ' + pCount + ' partners</span>' +
            '<span><i class="fas fa-euro-sign"></i> ' + formatCurrency(p.totalBudget) + '</span>' +
            '<span><i class="fas fa-clock"></i> ' + (p.duration || 24) + ' months</span></div>' +
            '<div style="margin-top:12px;text-align:right"><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();archiveProject(\'' + p.id + '\')"><i class="fas fa-archive"></i> Archive</button></div></div>';
        }).join('') : '<div class="empty-state"><i class="fas fa-folder-open"></i><h3>No projects yet</h3><p>Create your first EU project to get started.</p>' +
        '<button class="btn btn-primary" onclick="openNewProjectModal()"><i class="fas fa-plus"></i> Create Project</button></div>') +
        '</div></div>' +

        '<div id="archivedProjects" class="hidden"><div class="wp-grid">' +
        (archived.length > 0 ? archived.map(function(p) {
            return '<div class="wp-card"><div class="wp-card-header"><span class="wp-number">' + (p.programme || '') + '</span>' +
            '<span class="status-badge status-draft">Archived</span></div>' +
            '<h3>' + p.name + '</h3><p>' + (p.description || '').substring(0, 80) + '</p>' +
            '<button class="btn btn-sm btn-ghost mt-4" onclick="unarchiveProject(\'' + p.id + '\')"><i class="fas fa-undo"></i> Restore</button></div>';
        }).join('') : '<div class="empty-state"><p>No archived projects</p></div>') +
        '</div></div>';
}

function showProjectTab(tab) {
    document.querySelectorAll('#projectTabs .tab-btn').forEach(function(b, i) {
        b.classList.toggle('active', (tab === 'active' && i === 0) || (tab === 'archived' && i === 1));
    });
    document.getElementById('activeProjects').classList.toggle('hidden', tab !== 'active');
    document.getElementById('archivedProjects').classList.toggle('hidden', tab !== 'archived');
}

function archiveProject(pid) {
    if (!confirm('Archive this project?')) return;
    Projects[pid].status = 'archived';
    saveProjectToFirestore(pid, { status: 'archived' }).then(function() {
        showToast('Project archived', 'info');
        navigateTo('projects');
    });
}

function unarchiveProject(pid) {
    Projects[pid].status = 'active';
    saveProjectToFirestore(pid, { status: 'active' }).then(function() {
        showToast('Project restored', 'success');
        navigateTo('projects');
    });
}

// ---- CREATE PROJECT ----
function openNewProjectModal() {
    openModal('Create New Project',
        '<div class="form-group"><label class="form-label">Project Name *</label>' +
        '<input type="text" class="form-input" id="npName" placeholder="e.g., DigiSkills4EU"></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Programme</label>' +
        '<select class="form-select" id="npProgramme"><option>Erasmus+ KA220-HED</option><option>Erasmus+ KA220-VET</option><option>Erasmus+ KA220-SCH</option><option>Erasmus+ KA220-ADU</option><option>Erasmus+ KA220-YOU</option></select></div>' +
        '<div class="form-group"><label class="form-label">Grant Amount (Lump Sum)</label>' +
        '<select class="form-select" id="npGrant"><option value="120000">€120,000</option><option value="250000" selected>€250,000</option><option value="400000">€400,000</option></select></div></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Start Date</label>' +
        '<input type="date" class="form-input" id="npStart"></div>' +
        '<div class="form-group"><label class="form-label">Duration (months)</label>' +
        '<select class="form-select" id="npDuration"><option>12</option><option selected>24</option><option>36</option></select></div></div>' +
        '<div class="form-group"><label class="form-label">Project Number</label>' +
        '<input type="text" class="form-input" id="npNumber" placeholder="e.g., 2025-1-PL01-KA220-HED-000123456"></div>' +
        '<div class="form-group"><label class="form-label">Description</label>' +
        '<textarea class="form-textarea" id="npDesc" rows="3" placeholder="Brief project description..."></textarea></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="handleCreateProject()"><i class="fas fa-check"></i> Create Project</button>', true);
}

function handleCreateProject() {
    var name = document.getElementById('npName').value.trim();
    if (!name) { alert('Please enter a project name.'); return; }

    var programme = document.getElementById('npProgramme').value;
    var totalBudget = parseInt(document.getElementById('npGrant').value);
    var startDate = document.getElementById('npStart').value || new Date().toISOString().split('T')[0];
    var duration = parseInt(document.getElementById('npDuration').value);
    var projectNumber = document.getElementById('npNumber').value.trim();
    var description = document.getElementById('npDesc').value.trim();

    var endDate = '';
    if (startDate) {
        var end = new Date(startDate);
        end.setMonth(end.getMonth() + duration);
        endDate = end.toISOString().split('T')[0];
    }

    var id = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12) + '_' + Date.now().toString(36);

    var projectData = {
        id: id, name: name, programme: programme, projectNumber: projectNumber || 'TBD',
        startDate: startDate, endDate: endDate, duration: duration, status: 'active',
        description: description || 'New EU project.', totalBudget: totalBudget,
        coordinator: AppState.currentUser.organization || AppState.currentUser.name,
        coordinatorCountry: '', lumpSum: { totalGrant: totalBudget, wpAllocations: {} },
        createdAt: new Date().toISOString()
    };

    Projects[id] = projectData;
    Partners[id] = [];
    WorkPackages[id] = [];
    Tasks[id] = [];
    Documents[id] = { folders: [] };
    Meetings[id] = [];
    Dissemination[id] = { summary: { events: 0, publications: 0, socialReach: 0, website_visits: 0 }, activities: [] };
    ActivityStream[id] = [];

    saveProjectToFirestore(id, projectData).then(function() {
        showToast('Project "' + name + '" created!', 'success');
    });

    AppState.currentProjectId = id;
    updateProjectSelector();
    closeModal();
    navigateTo('overview');
}

// ---- PROJECT OVERVIEW ----
function renderOverview(container) {
    var p = getCurrentProject();
    if (!p.id) { container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><h3>No project selected</h3><p>Create or select a project first.</p></div>'; return; }
    var partners = getCurrentPartners();
    var wps = getCurrentWPs();
    var progress = getProjectProgress();
    var elapsed = getMonthsElapsed(p.startDate);
    var totalSpent = partners.reduce(function(s, pr) { return s + (pr.spent || 0); }, 0);

    container.innerHTML =
        '<div class="page-header"><h1>' + p.name + '</h1><div class="page-header-actions">' +
        '<button class="btn btn-secondary" onclick="openEditProjectModal()"><i class="fas fa-edit"></i> Edit</button>' +
        '<button class="btn btn-primary" onclick="navigateTo(\'ai-report\')"><i class="fas fa-robot"></i> Generate Report</button></div></div>' +

        '<div class="stats-grid">' +
        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Programme</span></div>' +
        '<div class="stat-card-value" style="font-size:18px">' + (p.programme || 'N/A') + '</div>' +
        '<div class="stat-card-change">' + (p.projectNumber || '') + '</div></div>' +
        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Duration</span></div>' +
        '<div class="stat-card-value">' + elapsed + '/' + (p.duration || 0) + '</div><div class="stat-card-change">months elapsed</div></div>' +
        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Progress</span></div>' +
        '<div class="stat-card-value">' + progress + '%</div>' +
        '<div class="progress-bar mt-4"><div class="progress-fill" style="width:' + progress + '%"></div></div></div>' +
        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Total Grant</span></div>' +
        '<div class="stat-card-value" style="color:var(--primary)">' + formatCurrency(p.totalBudget) + '</div></div></div>' +

        '<div class="content-grid"><div>' +
        '<div class="card mb-6"><div class="card-header"><h2>Project Description</h2></div><div class="card-body">' +
        '<p style="line-height:1.8;color:var(--gray-600)">' + (p.description || '') + '</p>' +
        '<div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        '<div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Start Date</strong><br>' + formatDate(p.startDate) + '</div>' +
        '<div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">End Date</strong><br>' + formatDate(p.endDate) + '</div>' +
        '<div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Coordinator</strong><br>' + (p.coordinator || 'N/A') + '</div>' +
        '<div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Country</strong><br>' + (p.coordinatorCountry || 'N/A') + '</div></div></div></div>' +

        '<div class="card"><div class="card-header"><h2>Work Packages (' + wps.length + ')</h2><button class="btn btn-sm btn-ghost" onclick="navigateTo(\'workpackages\')">View All</button></div>' +
        '<div class="card-body" style="padding:0">' +
        (wps.length > 0 ? '<table class="data-table"><thead><tr><th>WP</th><th>Title</th><th>Lead</th><th>Progress</th></tr></thead><tbody>' +
        wps.map(function(wp) {
            return '<tr><td><span class="wp-number">' + (wp.number || '') + '</span></td>' +
            '<td style="font-weight:500">' + wp.title + '</td>' +
            '<td style="font-size:13px">' + (wp.lead || '') + '</td>' +
            '<td style="width:120px"><div class="progress-bar"><div class="progress-fill ' + (wp.progress === 100 ? 'success' : '') + '" style="width:' + (wp.progress || 0) + '%"></div></div></td></tr>';
        }).join('') + '</tbody></table>' : '<div class="empty-state" style="padding:30px"><p>No work packages. <a href="#" onclick="navigateTo(\'workpackages\');return false">Add one</a></p></div>') +
        '</div></div></div>' +

        '<div>' +
        '<div class="card mb-6"><div class="card-header"><h2>Partners (' + partners.length + ')</h2></div><div class="card-body">' +
        (partners.length > 0 ? partners.map(function(pr) {
            return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100)">' +
            '<div class="partner-avatar" style="width:40px;height:40px;font-size:14px">' + (pr.initials || 'P') + '</div>' +
            '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + pr.name + '</div>' +
            '<div style="font-size:11px;color:var(--gray-400)">' + (pr.country || '') + '</div></div>' +
            '<span class="partner-role ' + (pr.role === 'coordinator' ? 'role-coordinator' : 'role-partner') + '">' + (pr.role || 'partner') + '</span></div>';
        }).join('') : '<p class="text-sm text-muted">No partners added yet.</p>') +
        '</div></div>' +

        '<div class="card"><div class="card-header"><h2>Quick Actions</h2></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">' +
        '<button class="btn btn-secondary btn-block" onclick="navigateTo(\'partners\')" style="justify-content:flex-start"><i class="fas fa-user-plus"></i> Add Partner</button>' +
        '<button class="btn btn-secondary btn-block" onclick="navigateTo(\'workpackages\')" style="justify-content:flex-start"><i class="fas fa-cubes"></i> Add Work Package</button>' +
        '<button class="btn btn-secondary btn-block" onclick="navigateTo(\'tasks\')" style="justify-content:flex-start"><i class="fas fa-plus"></i> Add Task</button>' +
        '<button class="btn btn-secondary btn-block" onclick="navigateTo(\'documents\')" style="justify-content:flex-start"><i class="fas fa-upload"></i> Upload Document</button>' +
        '<button class="btn btn-primary btn-block" onclick="navigateTo(\'ai-report\')" style="justify-content:flex-start"><i class="fas fa-robot"></i> Generate AI Report</button></div></div></div></div>';
}

function openEditProjectModal() {
    var p = getCurrentProject();
    openModal('Edit Project',
        '<div class="form-group"><label class="form-label">Project Name</label><input type="text" class="form-input" id="epName" value="' + (p.name || '') + '"></div>' +
        '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="epDesc" rows="3">' + (p.description || '') + '</textarea></div>' +
        '<div class="form-group"><label class="form-label">Coordinator</label><input type="text" class="form-input" id="epCoord" value="' + (p.coordinator || '') + '"></div>' +
        '<div class="form-group"><label class="form-label">Country</label><input type="text" class="form-input" id="epCountry" value="' + (p.coordinatorCountry || '') + '"></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveEditProject()"><i class="fas fa-save"></i> Save</button>');
}

function saveEditProject() {
    var pid = AppState.currentProjectId;
    var updates = {
        name: document.getElementById('epName').value.trim(),
        description: document.getElementById('epDesc').value.trim(),
        coordinator: document.getElementById('epCoord').value.trim(),
        coordinatorCountry: document.getElementById('epCountry').value.trim()
    };
    Object.assign(Projects[pid], updates);
    saveProjectToFirestore(pid, updates).then(function() {
        showToast('Project updated', 'success');
        updateProjectSelector();
        closeModal();
        navigateTo('overview');
    });
}
