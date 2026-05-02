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
        '<button class="btn btn-secondary" onclick="openInvitePartnerModal()"><i class="fas fa-paper-plane"></i> Invite</button>' +
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
        if (typeof notifyPartnerAdded === 'function') notifyPartnerAdded(data, getCurrentProject());
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
        // Send email notification to assignee
        if (typeof notifyTaskAssigned === 'function' && data.assignee) {
            var partner = getCurrentPartners().find(function(p) { return p.contact === data.assignee || p.name === data.assignee; });
            if (partner && partner.email) notifyTaskAssigned(data, partner.email, getCurrentProject());
        }
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
var currentFolderId = null;

function renderDocuments(container) {
    var docs = getCurrentDocuments();
    var pid = AppState.currentProjectId;
    if (!pid) { container.innerHTML = '<div class="empty-state"><p>Select a project first.</p></div>'; return; }

    container.innerHTML =
        '<div class="page-header"><h1>Documents</h1><div class="page-header-actions">' +
        '<button class="btn btn-secondary" onclick="openCreateFolderModal()"><i class="fas fa-folder-plus"></i> New Folder</button>' +
        '<button class="btn btn-primary" onclick="openUploadModal()"><i class="fas fa-upload"></i> Upload File</button></div></div>' +
        '<div id="docBreadcrumb" style="margin-bottom:20px;font-size:14px"><a href="#" onclick="showDocRoot();return false" style="font-weight:600"><i class="fas fa-home"></i> All Files</a></div>' +
        '<div id="docContent"></div>';

    currentFolderId = null;
    renderDocContent();
}

function renderDocContent() {
    var docs = getCurrentDocuments();
    var contentEl = document.getElementById('docContent');
    if (!contentEl) return;

    if (!currentFolderId) {
        // Show folders
        document.getElementById('docBreadcrumb').innerHTML = '<a href="#" onclick="showDocRoot();return false" style="font-weight:600"><i class="fas fa-home"></i> All Files</a>';
        contentEl.innerHTML = '<div class="file-grid">' +
            (docs.folders.length > 0 ? docs.folders.map(function(f) {
                return '<div class="file-card" onclick="openFolder(\'' + (f._id || f.id || '') + '\')">' +
                '<div class="file-icon folder"><i class="fas fa-folder"></i></div>' +
                '<div class="file-name">' + f.name + '</div>' +
                '<div class="file-meta">' + ((f.files || []).length) + ' files</div></div>';
            }).join('') : '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-folder-open"></i><h3>No folders yet</h3><p>Create a folder to start organizing documents.</p></div>') +
            '</div>';
    } else {
        // Show files in folder
        var folder = docs.folders.find(function(f) { return (f._id || f.id) === currentFolderId; });
        if (!folder) { currentFolderId = null; renderDocContent(); return; }
        var iconMap = { pdf: 'fa-file-pdf', doc: 'fa-file-word', docx: 'fa-file-word', xls: 'fa-file-excel', xlsx: 'fa-file-excel', img: 'fa-file-image', png: 'fa-file-image', jpg: 'fa-file-image', jpeg: 'fa-file-image', zip: 'fa-file-archive', generic: 'fa-file' };

        document.getElementById('docBreadcrumb').innerHTML = '<a href="#" onclick="showDocRoot();return false"><i class="fas fa-home"></i> All Files</a>' +
            ' <i class="fas fa-chevron-right" style="font-size:10px;margin:0 8px;color:var(--gray-400)"></i> <span style="font-weight:600">' + folder.name + '</span>';

        var filesHtml = '<div class="card"><div class="card-header"><h2>' + folder.name + ' (' + (folder.files || []).length + ' files)</h2>' +
            '<button class="btn btn-sm btn-primary" onclick="openUploadModal()"><i class="fas fa-upload"></i> Upload</button></div>';

        if ((folder.files || []).length > 0) {
            filesHtml += '<div class="card-body" style="padding:0">';
            folder.files.forEach(function(f) {
                var ext = (f.name || '').split('.').pop().toLowerCase();
                var icon = iconMap[ext] || iconMap[f.type] || 'fa-file';
                var typeClass = ['pdf'].indexOf(ext) >= 0 ? 'pdf' : ['doc','docx'].indexOf(ext) >= 0 ? 'doc' : ['xls','xlsx'].indexOf(ext) >= 0 ? 'xls' : ['png','jpg','jpeg','gif'].indexOf(ext) >= 0 ? 'img' : 'generic';
                filesHtml += '<div class="file-item-row">' +
                    '<div class="file-icon ' + typeClass + '" style="font-size:20px;width:36px;text-align:center"><i class="fas ' + icon + '"></i></div>' +
                    '<div style="flex:1"><div style="font-size:14px;font-weight:600">' + f.name + '</div>' +
                    '<div style="font-size:12px;color:var(--gray-400)">' + (f.size || '') + ' &middot; ' + (f.uploaded || '') + ' &middot; ' + (f.by || '') + '</div></div>' +
                    (f.url ? '<a href="' + f.url + '" target="_blank" class="btn btn-sm btn-ghost"><i class="fas fa-download"></i></a>' : '') +
                    '<button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteFile(\'' + currentFolderId + '\',\'' + (f.id || '') + '\')"><i class="fas fa-trash"></i></button></div>';
            });
            filesHtml += '</div>';
        } else {
            filesHtml += '<div class="card-body"><div class="drop-zone" id="dropZone">' +
                '<i class="fas fa-cloud-upload-alt"></i><br>' +
                '<strong>Drag & drop files here</strong><br>' +
                '<span style="font-size:13px;color:var(--gray-400)">or click Upload button above</span></div></div>';
        }
        filesHtml += '</div>';
        contentEl.innerHTML = filesHtml;

        // Setup drag and drop
        setupDropZone();
    }
}

function showDocRoot() { currentFolderId = null; renderDocContent(); }
function openFolder(folderId) { currentFolderId = folderId; renderDocContent(); }

function setupDropZone() {
    var zone = document.getElementById('dropZone');
    if (!zone) return;
    zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', function() { zone.classList.remove('dragover'); });
    zone.addEventListener('drop', function(e) {
        e.preventDefault(); zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
    });
    zone.addEventListener('click', function() {
        var input = document.createElement('input'); input.type = 'file'; input.multiple = true;
        input.onchange = function() { if (input.files.length > 0) uploadFiles(input.files); };
        input.click();
    });
}

function openUploadModal() {
    var docs = getCurrentDocuments();
    var folderOptions = docs.folders.map(function(f) {
        return '<option value="' + (f._id || f.id) + '" ' + (currentFolderId === (f._id || f.id) ? 'selected' : '') + '>' + f.name + '</option>';
    }).join('');

    if (docs.folders.length === 0) {
        showToast('Create a folder first', 'error');
        openCreateFolderModal();
        return;
    }

    openModal('Upload Files',
        '<div class="form-group"><label class="form-label">Destination Folder</label>' +
        '<select class="form-select" id="uploadFolder">' + folderOptions + '</select></div>' +
        '<div class="drop-zone" id="modalDropZone" style="margin-bottom:16px">' +
        '<i class="fas fa-cloud-upload-alt"></i><br><strong>Click here to select files</strong><br>' +
        '<span style="font-size:13px;color:var(--gray-400)">PDF, DOCX, XLSX, images, ZIP — max 50MB each</span></div>' +
        '<div id="uploadFileList"></div>' +
        '<div id="uploadProgressArea"></div>' +
        '<input type="file" id="fileInput" multiple style="display:none">',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" id="uploadBtn" onclick="startUpload()" disabled><i class="fas fa-upload"></i> Upload</button>');

    // Setup modal drop zone with retry
    function setupModalDropZone() {
        var mZone = document.getElementById('modalDropZone');
        var fInput = document.getElementById('fileInput');
        if (!mZone || !fInput) {
            setTimeout(setupModalDropZone, 200);
            return;
        }

        mZone.onclick = function(e) {
            e.preventDefault();
            fInput.value = '';
            fInput.click();
        };
        mZone.ondragover = function(e) { e.preventDefault(); mZone.classList.add('dragover'); };
        mZone.ondragleave = function() { mZone.classList.remove('dragover'); };
        mZone.ondrop = function(e) {
            e.preventDefault(); mZone.classList.remove('dragover');
            handleFileSelection(e.dataTransfer.files);
        };
        fInput.onchange = function() {
            if (fInput.files.length > 0) handleFileSelection(fInput.files);
        };
    }
    setTimeout(setupModalDropZone, 50);
}

var selectedFiles = [];

function handleFileSelection(files) {
    selectedFiles = Array.from(files);
    var listEl = document.getElementById('uploadFileList');
    var btn = document.getElementById('uploadBtn');
    if (!listEl) return;

    listEl.innerHTML = selectedFiles.map(function(f, i) {
        var sizeMB = (f.size / 1024 / 1024).toFixed(2);
        return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray-100)">' +
            '<i class="fas fa-file" style="color:var(--gray-400)"></i>' +
            '<span style="flex:1;font-size:13px">' + f.name + '</span>' +
            '<span style="font-size:12px;color:var(--gray-400)">' + sizeMB + ' MB</span></div>';
    }).join('');

    if (btn) btn.disabled = selectedFiles.length === 0;
}

function startUpload() {
    if (selectedFiles.length === 0) { showToast('No files selected', 'error'); return; }
    var folderSelect = document.getElementById('uploadFolder');
    var folderId = folderSelect ? folderSelect.value : currentFolderId;
    if (!folderId) { showToast('Select a folder', 'error'); return; }
    var pid = AppState.currentProjectId;
    var uid = AppState.currentUser.id;
    var progressArea = document.getElementById('uploadProgressArea');
    var btn = document.getElementById('uploadBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...'; }

    var uploads = selectedFiles.map(function(file, idx) {
        var path = 'users/' + uid + '/projects/' + pid + '/' + folderId + '/' + Date.now() + '_' + file.name;
        var ref = storage.ref(path);

        return new Promise(function(resolve, reject) {
            var uploadTask = ref.put(file);

            uploadTask.on('state_changed',
                function(snapshot) {
                    var pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    if (progressArea) {
                        var pBar = document.getElementById('prog_' + idx);
                        if (!pBar) {
                            progressArea.innerHTML += '<div style="margin-top:8px"><div style="font-size:12px;margin-bottom:4px">' + file.name + '</div>' +
                                '<div class="progress-bar"><div class="progress-fill" id="prog_' + idx + '" style="width:' + pct + '%"></div></div></div>';
                        } else {
                            pBar.style.width = pct + '%';
                        }
                    }
                },
                function(error) { reject(error); },
                function() {
                    uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
                        resolve({
                            id: Date.now().toString(36) + idx,
                            name: file.name,
                            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                            type: file.name.split('.').pop().toLowerCase(),
                            url: url,
                            path: path,
                            uploaded: new Date().toISOString().split('T')[0],
                            by: AppState.currentUser.name
                        });
                    });
                }
            );
        });
    });

    Promise.all(uploads).then(function(fileRecords) {
        // Update folder in Firestore
        var docs = getCurrentDocuments();
        var folder = docs.folders.find(function(f) { return (f._id || f.id) === folderId; });
        if (folder) {
            if (!folder.files) folder.files = [];
            fileRecords.forEach(function(fr) { folder.files.push(fr); });

            // Save to Firestore
            updateInSubCollection(pid, 'documents', folder._id, { files: folder.files });
        }

        addActivity(pid, 'uploaded ' + fileRecords.length + ' file(s) to', folder ? folder.name : 'documents');
        showToast(fileRecords.length + ' file(s) uploaded!', 'success');
        selectedFiles = [];
        closeModal();
        currentFolderId = folderId;
        navigateTo('documents');
    }).catch(function(err) {
        console.error('Upload error:', err);
        showToast('Upload failed: ' + err.message, 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload"></i> Upload'; }
    });
}

function uploadFiles(files) {
    if (!currentFolderId) {
        showToast('Open a folder first', 'error');
        return;
    }
    selectedFiles = Array.from(files);
    var folderId = currentFolderId;
    document.getElementById('docContent').innerHTML += '<div id="quickUploadProgress" style="margin-top:16px"></div>';

    // Reuse startUpload logic inline
    var pid = AppState.currentProjectId;
    var uid = AppState.currentUser.id;

    var uploads = selectedFiles.map(function(file) {
        var path = 'users/' + uid + '/projects/' + pid + '/' + folderId + '/' + Date.now() + '_' + file.name;
        var ref = storage.ref(path);
        return ref.put(file).then(function(snapshot) {
            return snapshot.ref.getDownloadURL().then(function(url) {
                return { id: Date.now().toString(36), name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB', type: file.name.split('.').pop().toLowerCase(), url: url, path: path, uploaded: new Date().toISOString().split('T')[0], by: AppState.currentUser.name };
            });
        });
    });

    Promise.all(uploads).then(function(fileRecords) {
        var docs = getCurrentDocuments();
        var folder = docs.folders.find(function(f) { return (f._id || f.id) === folderId; });
        if (folder) {
            if (!folder.files) folder.files = [];
            fileRecords.forEach(function(fr) { folder.files.push(fr); });
            updateInSubCollection(pid, 'documents', folder._id, { files: folder.files });
        }
        addActivity(pid, 'uploaded ' + fileRecords.length + ' file(s) to', folder ? folder.name : 'documents');
        showToast(fileRecords.length + ' file(s) uploaded!', 'success');
        selectedFiles = [];
        renderDocContent();
    }).catch(function(err) {
        showToast('Upload failed: ' + err.message, 'error');
    });
}

function deleteFile(folderId, fileId) {
    if (!confirm('Delete this file?')) return;
    var pid = AppState.currentProjectId;
    var docs = getCurrentDocuments();
    var folder = docs.folders.find(function(f) { return (f._id || f.id) === folderId; });
    if (!folder) return;

    var file = (folder.files || []).find(function(f) { return f.id === fileId; });

    // Delete from Storage
    if (file && file.path) {
        storage.ref(file.path).delete().catch(function(e) { console.error('Storage delete error:', e); });
    }

    // Remove from folder
    folder.files = (folder.files || []).filter(function(f) { return f.id !== fileId; });
    updateInSubCollection(pid, 'documents', folder._id, { files: folder.files }).then(function() {
        showToast('File deleted', 'info');
        renderDocContent();
    });
}

function openCreateFolderModal() {
    openModal('Create Folder',
        '<div class="form-group"><label class="form-label">Folder Name *</label><input type="text" class="form-input" id="cfName" placeholder="e.g., WP1 - Research"></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleCreateFolder()"><i class="fas fa-check"></i> Create</button>');
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
        addActivity(pid, 'created folder', name);
        showToast('Folder "' + name + '" created!', 'success');
        closeModal();
        navigateTo('documents');
    });
}
