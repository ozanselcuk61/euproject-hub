/* ====================================
   EUProject Hub — Page Renderers Part 2
   Partners, Work Packages, Tasks, Documents
   ==================================== */

// ---- PARTNERS ----
function renderPartners(container) {
    var partners = getCurrentPartners();
    var pid = AppState.currentProjectId;
    if (!pid) { container.innerHTML = '<div class="empty-state"><p>Select a project first.</p></div>'; return; }

    container.innerHTML =
        '<div class="page-header"><h1>Partners</h1><div class="page-header-actions">' +
        '<button class="btn btn-primary" onclick="openAddPartnerModal()"><i class="fas fa-user-plus"></i> Add Partner</button></div></div>' +
        '<div class="partner-grid">' +
        (partners.length > 0 ? partners.map(function(p) {
            return '<div class="partner-card">' +
            '<div class="partner-avatar">' + (p.initials || 'P') + '</div>' +
            '<h3>' + p.name + '</h3>' +
            '<div class="partner-country"><i class="fas fa-map-marker-alt"></i> ' + (p.country || 'N/A') + '</div>' +
            '<span class="partner-role ' + (p.role === 'coordinator' ? 'role-coordinator' : 'role-partner') + '">' + (p.role || 'partner') + '</span>' +
            '<div style="margin-top:16px;text-align:left;padding:12px;background:var(--gray-50);border-radius:var(--radius)">' +
            '<div style="font-size:12px;color:var(--gray-500);margin-bottom:4px">Contact Person</div>' +
            '<div style="font-size:14px;font-weight:600">' + (p.contact || 'N/A') + '</div>' +
            '<div style="font-size:12px;color:var(--primary)">' + (p.email || '') + '</div></div>' +
            '<div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:center">' +
            '<div style="padding:8px;background:var(--primary-50);border-radius:var(--radius)">' +
            '<div style="font-size:16px;font-weight:800;color:var(--primary)">' + formatCurrency(p.budget) + '</div>' +
            '<div style="font-size:10px;color:var(--gray-500)">Budget</div></div>' +
            '<div style="padding:8px;background:var(--success-light);border-radius:var(--radius)">' +
            '<div style="font-size:16px;font-weight:800;color:var(--success)">' + (p.budget ? Math.round((p.spent || 0) / p.budget * 100) : 0) + '%</div>' +
            '<div style="font-size:10px;color:var(--gray-500)">Utilized</div></div></div>' +
            '<button class="btn btn-sm btn-ghost mt-4" onclick="deletePartner(\'' + (p._id || '') + '\')"><i class="fas fa-trash"></i> Remove</button></div>';
        }).join('') : '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-users"></i><h3>No partners yet</h3><p>Add partner organizations to your project.</p></div>') +
        '</div>';
}

function openAddPartnerModal() {
    var countries = ['Austria','Belgium','Bulgaria','Croatia','Cyprus','Czech Republic','Denmark','Estonia','Finland','France','Germany','Greece','Hungary','Ireland','Italy','Latvia','Lithuania','Luxembourg','Malta','Netherlands','Poland','Portugal','Romania','Slovakia','Slovenia','Spain','Sweden','Turkey'];
    openModal('Add Partner Organization',
        '<div class="form-group"><label class="form-label">Organization Name *</label><input type="text" class="form-input" id="apName" placeholder="e.g., University of Helsinki"></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Country</label><select class="form-select" id="apCountry"><option>Select country...</option>' +
        countries.map(function(c) { return '<option>' + c + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-group"><label class="form-label">Role</label><select class="form-select" id="apRole"><option value="partner">Partner</option><option value="coordinator">Coordinator</option><option value="associated">Associated Partner</option></select></div></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Contact Person</label><input type="text" class="form-input" id="apContact" placeholder="Full name"></div>' +
        '<div class="form-group"><label class="form-label">Contact Email</label><input type="email" class="form-input" id="apEmail" placeholder="email@university.edu"></div></div>' +
        '<div class="form-group"><label class="form-label">Budget Allocation (€)</label><input type="number" class="form-input" id="apBudget" placeholder="50000"></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddPartner()"><i class="fas fa-check"></i> Add Partner</button>');
}

function handleAddPartner() {
    var name = document.getElementById('apName').value.trim();
    if (!name) { alert('Please enter organization name.'); return; }
    var pid = AppState.currentProjectId;
    var data = {
        name: name,
        country: document.getElementById('apCountry').value,
        role: document.getElementById('apRole').value,
        contact: document.getElementById('apContact').value.trim(),
        email: document.getElementById('apEmail').value.trim(),
        budget: parseInt(document.getElementById('apBudget').value) || 0,
        spent: 0,
        initials: name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase()
    };
    if (!Partners[pid]) Partners[pid] = [];
    addToSubCollection(pid, 'partners', data).then(function(result) {
        data._id = result.id;
        data.id = result.id;
        Partners[pid].push(data);
        addActivity(pid, 'added partner', name);
        showToast('Partner "' + name + '" added!', 'success');
        closeModal();
        navigateTo('partners');
    });
}

function deletePartner(docId) {
    if (!docId || !confirm('Remove this partner?')) return;
    var pid = AppState.currentProjectId;
    deleteFromSubCollection(pid, 'partners', docId).then(function() {
        Partners[pid] = Partners[pid].filter(function(p) { return p._id !== docId; });
        showToast('Partner removed', 'info');
        navigateTo('partners');
    });
}

// ---- WORK PACKAGES ----
function renderWorkPackages(container) {
    var wps = getCurrentWPs();
    var pid = AppState.currentProjectId;
    if (!pid) { container.innerHTML = '<div class="empty-state"><p>Select a project first.</p></div>'; return; }

    container.innerHTML =
        '<div class="page-header"><h1>Work Packages</h1><div class="page-header-actions">' +
        '<button class="btn btn-primary" onclick="openAddWPModal()"><i class="fas fa-plus"></i> Add Work Package</button></div></div>' +
        '<div class="wp-grid">' +
        (wps.length > 0 ? wps.map(function(wp) {
            return '<div class="wp-card" onclick="openWPDetail(\'' + (wp._id || '') + '\')">' +
            '<div class="wp-card-header"><span class="wp-number">' + (wp.number || '') + '</span>' +
            '<span class="status-badge status-' + (wp.status || 'pending') + '">' + (wp.status || 'pending') + '</span></div>' +
            '<h3>' + wp.title + '</h3><p>' + (wp.description || '').substring(0, 100) + '</p>' +
            '<div style="margin:12px 0"><div class="progress-label"><span>Progress</span><span>' + (wp.progress || 0) + '%</span></div>' +
            '<div class="progress-bar"><div class="progress-fill ' + (wp.progress === 100 ? 'success' : '') + '" style="width:' + (wp.progress || 0) + '%"></div></div></div>' +
            '<div class="wp-meta"><span><i class="fas fa-user"></i> ' + (wp.lead || 'N/A') + '</span>' +
            '<span><i class="fas fa-calendar"></i> ' + (wp.start || '') + '-' + (wp.end || '') + '</span>' +
            '<span><i class="fas fa-euro-sign"></i> ' + formatCurrency(wp.budget) + '</span></div></div>';
        }).join('') : '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-cubes"></i><h3>No work packages yet</h3><p>Add work packages to organize your project deliverables.</p></div>') +
        '</div>';
}

function openAddWPModal() {
    var partners = getCurrentPartners();
    var leadOptions = partners.length > 0 ? partners.map(function(p) { return '<option>' + p.name + '</option>'; }).join('') : '<option>No partners added</option>';
    openModal('Add Work Package',
        '<div class="form-row"><div class="form-group"><label class="form-label">WP Number *</label><input type="text" class="form-input" id="awpNum" placeholder="e.g., WP1"></div>' +
        '<div class="form-group"><label class="form-label">Lead Partner</label><select class="form-select" id="awpLead">' + leadOptions + '</select></div></div>' +
        '<div class="form-group"><label class="form-label">Title *</label><input type="text" class="form-input" id="awpTitle" placeholder="Work package title"></div>' +
        '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="awpDesc" rows="3"></textarea></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Start (Month)</label><input type="text" class="form-input" id="awpStart" placeholder="M1"></div>' +
        '<div class="form-group"><label class="form-label">End (Month)</label><input type="text" class="form-input" id="awpEnd" placeholder="M24"></div></div>' +
        '<div class="form-group"><label class="form-label">Budget (€)</label><input type="number" class="form-input" id="awpBudget" placeholder="40000"></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddWP()"><i class="fas fa-check"></i> Create WP</button>');
}

function handleAddWP() {
    var title = document.getElementById('awpTitle').value.trim();
    var number = document.getElementById('awpNum').value.trim();
    if (!title || !number) { alert('Please enter WP number and title.'); return; }
    var pid = AppState.currentProjectId;
    var data = {
        number: number, title: title, id: number,
        lead: document.getElementById('awpLead').value,
        description: document.getElementById('awpDesc').value.trim(),
        start: document.getElementById('awpStart').value.trim() || 'M1',
        end: document.getElementById('awpEnd').value.trim() || 'M24',
        budget: parseInt(document.getElementById('awpBudget').value) || 0,
        status: 'pending', progress: 0, deliverables: []
    };
    if (!WorkPackages[pid]) WorkPackages[pid] = [];
    addToSubCollection(pid, 'workpackages', data).then(function(result) {
        data._id = result.id;
        WorkPackages[pid].push(data);
        addActivity(pid, 'created work package', number + ': ' + title);
        showToast('Work package "' + number + '" created!', 'success');
        closeModal();
        navigateTo('workpackages');
    });
}

function openWPDetail(docId) {
    var wp = getCurrentWPs().find(function(w) { return w._id === docId; });
    if (!wp) return;
    openModal(wp.number + ': ' + wp.title,
        '<div style="margin-bottom:16px"><span class="status-badge status-' + (wp.status || 'pending') + '">' + (wp.status || 'pending') + '</span>' +
        ' <span style="margin-left:8px;font-size:13px;color:var(--gray-500)">Lead: ' + (wp.lead || 'N/A') + '</span></div>' +
        '<p style="color:var(--gray-600);line-height:1.7;margin-bottom:20px">' + (wp.description || 'No description.') + '</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">' +
        '<div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:20px;font-weight:800;color:var(--primary)">' + (wp.progress || 0) + '%</div><div style="font-size:11px;color:var(--gray-500)">Complete</div></div>' +
        '<div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:20px;font-weight:800">' + formatCurrency(wp.budget) + '</div><div style="font-size:11px;color:var(--gray-500)">Budget</div></div>' +
        '<div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:20px;font-weight:800">' + (wp.start || '') + '-' + (wp.end || '') + '</div><div style="font-size:11px;color:var(--gray-500)">Timeline</div></div></div>' +
        '<div class="form-group"><label class="form-label">Update Progress (%)</label><input type="range" min="0" max="100" step="5" value="' + (wp.progress || 0) + '" id="wpProgress" style="width:100%" oninput="document.getElementById(\'wpProgVal\').textContent=this.value+\'%\'"> <span id="wpProgVal">' + (wp.progress || 0) + '%</span></div>' +
        '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="wpStatus"><option ' + (wp.status === 'pending' ? 'selected' : '') + '>pending</option><option ' + (wp.status === 'active' ? 'selected' : '') + '>active</option><option ' + (wp.status === 'completed' ? 'selected' : '') + '>completed</option></select></div>',
        '<button class="btn btn-danger" onclick="deleteWP(\'' + docId + '\')"><i class="fas fa-trash"></i> Delete</button>' +
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveWPUpdate(\'' + docId + '\')"><i class="fas fa-save"></i> Save</button>', true);
}

function saveWPUpdate(docId) {
    var pid = AppState.currentProjectId;
    var progress = parseInt(document.getElementById('wpProgress').value);
    var status = document.getElementById('wpStatus').value;
    var wp = getCurrentWPs().find(function(w) { return w._id === docId; });
    if (wp) { wp.progress = progress; wp.status = status; }
    updateInSubCollection(pid, 'workpackages', docId, { progress: progress, status: status }).then(function() {
        showToast('Work package updated', 'success');
        closeModal();
        navigateTo('workpackages');
    });
}

function deleteWP(docId) {
    if (!confirm('Delete this work package?')) return;
    var pid = AppState.currentProjectId;
    deleteFromSubCollection(pid, 'workpackages', docId).then(function() {
        WorkPackages[pid] = WorkPackages[pid].filter(function(w) { return w._id !== docId; });
        showToast('Work package deleted', 'info');
        closeModal();
        navigateTo('workpackages');
    });
}

// ---- TASKS ----
function renderTasks(container) {
    var tasks = getCurrentTasks();
    var pid = AppState.currentProjectId;
    if (!pid) { container.innerHTML = '<div class="empty-state"><p>Select a project first.</p></div>'; return; }
    var pending = tasks.filter(function(t) { return t.status === 'pending'; });
    var inProgress = tasks.filter(function(t) { return t.status === 'in_progress'; });
    var completed = tasks.filter(function(t) { return t.status === 'completed'; });

    container.innerHTML =
        '<div class="page-header"><h1>Tasks</h1><div class="page-header-actions">' +
        '<button class="btn btn-primary" onclick="openAddTaskModal()"><i class="fas fa-plus"></i> Add Task</button></div></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">' +
        renderTaskColumn('Pending', pending, 'var(--warning-light)') +
        renderTaskColumn('In Progress', inProgress, 'var(--primary-100)') +
        renderTaskColumn('Completed', completed, 'var(--success-light)') +
        '</div>';
}

function renderTaskColumn(title, tasks, color) {
    return '<div class="card"><div class="card-header" style="background:' + color + '"><h2 style="font-size:14px">' + title + ' (' + tasks.length + ')</h2></div>' +
    '<div class="card-body" style="padding:12px">' +
    (tasks.length > 0 ? tasks.map(function(t) {
        return '<div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);padding:14px;margin-bottom:10px;' + (t.priority === 'high' ? 'border-left:3px solid var(--danger)' : '') + '">' +
        '<div style="font-size:13px;font-weight:600;color:var(--gray-800);margin-bottom:6px">' + t.title + '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<span class="wp-number" style="font-size:10px">' + (t.wp || '') + '</span>' +
        '<span style="font-size:11px;color:var(--gray-400)">' + formatDate(t.due) + '</span></div>' +
        '<div style="margin-top:8px;display:flex;gap:4px">' +
        '<button class="btn btn-sm btn-ghost" style="padding:2px 6px;font-size:10px" onclick="changeTaskStatus(\'' + (t._id || '') + '\',\'pending\')">P</button>' +
        '<button class="btn btn-sm btn-ghost" style="padding:2px 6px;font-size:10px" onclick="changeTaskStatus(\'' + (t._id || '') + '\',\'in_progress\')">IP</button>' +
        '<button class="btn btn-sm btn-ghost" style="padding:2px 6px;font-size:10px" onclick="changeTaskStatus(\'' + (t._id || '') + '\',\'completed\')">D</button>' +
        '<button class="btn btn-sm btn-ghost" style="padding:2px 6px;font-size:10px;color:var(--danger)" onclick="deleteTask(\'' + (t._id || '') + '\')"><i class="fas fa-trash"></i></button></div></div>';
    }).join('') : '<p class="text-sm text-muted" style="text-align:center;padding:20px">No tasks</p>') +
    '</div></div>';
}

function openAddTaskModal() {
    var wps = getCurrentWPs();
    var partners = getCurrentPartners();
    openModal('Add New Task',
        '<div class="form-group"><label class="form-label">Task Title *</label><input type="text" class="form-input" id="atTitle" placeholder="What needs to be done?"></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Work Package</label><select class="form-select" id="atWP"><option value="">None</option>' +
        wps.map(function(w) { return '<option value="' + (w.number || '') + '">' + (w.number || '') + ' - ' + w.title + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-group"><label class="form-label">Assignee</label><select class="form-select" id="atAssignee"><option value="">Unassigned</option>' +
        partners.map(function(p) { return '<option>' + (p.contact || p.name) + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-input" id="atDue"></div>' +
        '<div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="atPriority"><option>low</option><option selected>medium</option><option>high</option></select></div></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddTask()"><i class="fas fa-check"></i> Create Task</button>');
}

function handleAddTask() {
    var title = document.getElementById('atTitle').value.trim();
    if (!title) { alert('Please enter task title.'); return; }
    var pid = AppState.currentProjectId;
    var assignee = document.getElementById('atAssignee').value;
    var data = {
        title: title,
        wp: document.getElementById('atWP').value,
        assignee: assignee,
        assigneeInitials: assignee ? assignee.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase() : '',
        due: document.getElementById('atDue').value,
        priority: document.getElementById('atPriority').value,
        status: 'pending'
    };
    if (!Tasks[pid]) Tasks[pid] = [];
    addToSubCollection(pid, 'tasks', data).then(function(result) {
        data._id = result.id;
        Tasks[pid].push(data);
        addActivity(pid, 'created task', title);
        showToast('Task created!', 'success');
        closeModal();
        navigateTo('tasks');
    });
}

function changeTaskStatus(docId, newStatus) {
    var pid = AppState.currentProjectId;
    var task = getCurrentTasks().find(function(t) { return t._id === docId; });
    if (task) {
        task.status = newStatus;
        updateInSubCollection(pid, 'tasks', docId, { status: newStatus });
        navigateTo('tasks');
    }
}

function deleteTask(docId) {
    if (!confirm('Delete this task?')) return;
    var pid = AppState.currentProjectId;
    deleteFromSubCollection(pid, 'tasks', docId).then(function() {
        Tasks[pid] = Tasks[pid].filter(function(t) { return t._id !== docId; });
        navigateTo('tasks');
    });
}

// ---- DOCUMENTS ----
function renderDocuments(container) {
    var docs = getCurrentDocuments();
    var pid = AppState.currentProjectId;
    if (!pid) { container.innerHTML = '<div class="empty-state"><p>Select a project first.</p></div>'; return; }

    container.innerHTML =
        '<div class="page-header"><h1>Documents</h1><div class="page-header-actions">' +
        '<button class="btn btn-secondary" onclick="openCreateFolderModal()"><i class="fas fa-folder-plus"></i> New Folder</button>' +
        '<button class="btn btn-primary"><i class="fas fa-upload"></i> Upload File</button></div></div>' +
        '<div id="docBreadcrumb" style="margin-bottom:20px;font-size:14px"><a href="#" onclick="renderDocFolders();return false" style="font-weight:600"><i class="fas fa-home"></i> All Files</a></div>' +
        '<div id="docContent"><div class="file-grid">' +
        (docs.folders.length > 0 ? docs.folders.map(function(f) {
            return '<div class="file-card" onclick="renderDocFiles(\'' + (f._id || f.id || '') + '\')">' +
            '<div class="file-icon folder"><i class="fas fa-folder"></i></div>' +
            '<div class="file-name">' + f.name + '</div>' +
            '<div class="file-meta">' + ((f.files || []).length) + ' files</div></div>';
        }).join('') : '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-folder-open"></i><h3>No folders yet</h3><p>Create folders to organize your documents.</p></div>') +
        '</div></div>';

    window.renderDocFolders = function() { navigateTo('documents'); };
    window.renderDocFiles = function(folderId) {
        var folder = docs.folders.find(function(f) { return (f._id || f.id) === folderId; });
        if (!folder) return;
        var iconMap = { pdf: 'fa-file-pdf', doc: 'fa-file-word', xls: 'fa-file-excel', img: 'fa-file-image', generic: 'fa-file-archive' };
        document.getElementById('docBreadcrumb').innerHTML = '<a href="#" onclick="renderDocFolders();return false"><i class="fas fa-home"></i> All Files</a> <i class="fas fa-chevron-right" style="font-size:10px;margin:0 8px;color:var(--gray-400)"></i> <span style="font-weight:600">' + folder.name + '</span>';
        document.getElementById('docContent').innerHTML = '<div class="file-grid">' +
        ((folder.files || []).length > 0 ? folder.files.map(function(f) {
            return '<div class="file-card"><div class="file-icon ' + (f.type || 'generic') + '"><i class="fas ' + (iconMap[f.type] || 'fa-file') + '"></i></div>' +
            '<div class="file-name">' + f.name + '</div><div class="file-meta">' + (f.size || '') + ' &middot; ' + (f.uploaded || '') + '</div></div>';
        }).join('') : '<div class="empty-state" style="grid-column:1/-1"><p>No files in this folder yet.</p></div>') + '</div>';
    };
}

function openCreateFolderModal() {
    openModal('Create Folder',
        '<div class="form-group"><label class="form-label">Folder Name *</label><input type="text" class="form-input" id="cfName" placeholder="New folder name"></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleCreateFolder()">Create</button>');
}

function handleCreateFolder() {
    var name = document.getElementById('cfName').value.trim();
    if (!name) { alert('Please enter folder name.'); return; }
    var pid = AppState.currentProjectId;
    var data = { name: name, id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'), files: [] };
    if (!Documents[pid]) Documents[pid] = { folders: [] };
    addToSubCollection(pid, 'documents', data).then(function(result) {
        data._id = result.id;
        Documents[pid].folders.push(data);
        showToast('Folder "' + name + '" created!', 'success');
        closeModal();
        navigateTo('documents');
    });
}
