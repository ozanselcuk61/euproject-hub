/* ====================================
   EUProject Hub — Page Renderers Part 2
   Partners, Work Packages, Tasks, Documents
   ==================================== */

// ---- PARTNERS ----
function renderPartners(container) {
    var partners = getCurrentPartners();
    container.innerHTML = '\
        <div class="page-header">\
            <h1>Partners</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-primary" onclick="openAddPartnerModal()"><i class="fas fa-user-plus"></i> Add Partner</button>\
            </div>\
        </div>\
        <div class="partner-grid" id="partnerGrid"></div>';

    var grid = document.getElementById('partnerGrid');
    if (partners.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:60px 20px;text-align:center"><i class="fas fa-users" style="font-size:48px;color:var(--gray-300);margin-bottom:16px"></i><h3>No partners yet</h3><p style="color:var(--gray-500)">Add partner organizations to your project.</p></div>';
        return;
    }

    grid.innerHTML = partners.map(function(p, idx) {
        var utilization = p.budget > 0 ? Math.round((p.spent || 0) / p.budget * 100) : 0;
        return '<div class="partner-card">\
            <div class="partner-avatar">' + (p.initials || '?') + '</div>\
            <h3>' + p.name + '</h3>\
            <div class="partner-country"><i class="fas fa-map-marker-alt"></i> ' + p.country + '</div>\
            <span class="partner-role ' + (p.role === 'coordinator' ? 'role-coordinator' : 'role-partner') + '">' + p.role + '</span>\
            <div style="margin-top:16px;text-align:left;padding:12px;background:var(--gray-50);border-radius:var(--radius)">\
                <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px">Contact Person</div>\
                <div style="font-size:14px;font-weight:600">' + p.contact + '</div>\
                <div style="font-size:12px;color:var(--primary)">' + p.email + '</div>\
            </div>\
            <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:center">\
                <div style="padding:8px;background:var(--primary-50);border-radius:var(--radius)">\
                    <div style="font-size:16px;font-weight:800;color:var(--primary)">' + formatCurrency(p.budget) + '</div>\
                    <div style="font-size:10px;color:var(--gray-500)">Budget</div>\
                </div>\
                <div style="padding:8px;background:var(--success-light);border-radius:var(--radius)">\
                    <div style="font-size:16px;font-weight:800;color:var(--success)">' + utilization + '%</div>\
                    <div style="font-size:10px;color:var(--gray-500)">Utilized</div>\
                </div>\
            </div>\
            <div style="display:flex;gap:6px;margin-top:12px">\
                ' + (p.email && !p.invited ? '<button class="btn btn-sm btn-secondary" style="flex:1" onclick="event.stopPropagation();invitePartner(' + idx + ')"><i class="fas fa-envelope"></i> Invite</button>' : '') + '\
                ' + (p.invited ? '<span style="flex:1;text-align:center;font-size:11px;color:var(--success);padding:6px"><i class="fas fa-check-circle"></i> Invited</span>' : '') + '\
                <button class="btn btn-sm btn-danger" style="flex:1" onclick="event.stopPropagation();deletePartner(' + idx + ')"><i class="fas fa-trash"></i> Remove</button>\
            </div>\
        </div>';
    }).join('');
}

function invitePartner(idx) {
    var pid = AppState.currentProjectId;
    var p = Partners[pid][idx];
    var project = getCurrentProject();
    if (!p || !p.email) { alert('No email address for this partner.'); return; }

    if (!confirm('Send project access invitation to ' + p.email + '?\n\nThey will be able to access this project after registering.')) return;

    // Add email to project memberEmails for access control
    var memberEmails = project.memberEmails || [];
    if (memberEmails.indexOf(p.email) === -1) {
        memberEmails.push(p.email);
    }

    // Mark partner as invited
    p.invited = true;
    p.invitedAt = new Date().toISOString();

    // Save invitation record + update partner + update memberEmails
    Promise.all([
        invitePartnerToProject(pid, p.email, p.contact || p.name, project.name),
        updateProjectField(pid, 'partners', Partners[pid]),
        updateProjectField(pid, 'memberEmails', memberEmails)
    ]).then(function(results) {
        project.memberEmails = memberEmails;
        navigateTo('partners');
        showToast('Invitation sent to ' + p.email + '! They can now register and access this project.', 'success');
    }).catch(function() {
        showToast('Error sending invitation.', 'error');
    });
}

function openAddPartnerModal() {
    openModal('Add Partner Organization', '\
        <div class="form-group"><label class="form-label">Organization Name</label><input type="text" class="form-input" id="apName" placeholder="e.g., University of Helsinki"></div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Country</label><select class="form-select" id="apCountry"><option value="">Select country...</option><option>Austria</option><option>Belgium</option><option>Bulgaria</option><option>Croatia</option><option>Cyprus</option><option>Czech Republic</option><option>Denmark</option><option>Estonia</option><option>Finland</option><option>France</option><option>Germany</option><option>Greece</option><option>Hungary</option><option>Ireland</option><option>Italy</option><option>Latvia</option><option>Lithuania</option><option>Luxembourg</option><option>Malta</option><option>Netherlands</option><option>Poland</option><option>Portugal</option><option>Romania</option><option>Slovakia</option><option>Slovenia</option><option>Spain</option><option>Sweden</option><option>Turkey</option></select></div>\
            <div class="form-group"><label class="form-label">Role</label><select class="form-select" id="apRole"><option value="partner">Partner</option><option value="coordinator">Coordinator</option><option value="associated">Associated Partner</option></select></div>\
        </div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Contact Person</label><input type="text" class="form-input" id="apContact" placeholder="Full name"></div>\
            <div class="form-group"><label class="form-label">Contact Email</label><input type="email" class="form-input" id="apEmail" placeholder="email@university.edu"></div>\
        </div>\
        <div class="form-group"><label class="form-label">Budget Allocation (&euro;)</label><input type="number" class="form-input" id="apBudget" placeholder="50000"></div>\
        <div style="padding:10px;background:var(--primary-50);border-radius:var(--radius);font-size:12px;color:var(--primary-700)">\
            <i class="fas fa-info-circle"></i> After adding, you can invite this partner via email. They will be able to register and access only this project.\
        </div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddPartner()"><i class="fas fa-check"></i> Add Partner</button>');
}

function handleAddPartner() {
    var name = document.getElementById('apName').value.trim();
    var country = document.getElementById('apCountry').value;
    var role = document.getElementById('apRole').value;
    var contact = document.getElementById('apContact').value.trim();
    var email = document.getElementById('apEmail').value.trim();
    var budget = parseInt(document.getElementById('apBudget').value) || 0;

    if (!name) { alert('Please enter organization name.'); return; }
    if (!country) { alert('Please select a country.'); return; }

    var words = name.split(' ');
    var initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();

    var partner = {
        id: Date.now(),
        name: name,
        country: country,
        code: country.substring(0, 2).toUpperCase(),
        role: role,
        initials: initials,
        contact: contact || 'TBD',
        email: email || '',
        budget: budget,
        spent: 0
    };

    var pid = AppState.currentProjectId;
    if (!Partners[pid]) Partners[pid] = [];
    Partners[pid].push(partner);

    // Save to Firestore
    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    updateProjectField(pid, 'partners', Partners[pid]).then(function(result) {
        if (result.success) {
            closeModal();
            navigateTo('partners');
            showToast('Partner "' + name + '" added!', 'success');
            updateSidebarBadges();
        } else {
            Partners[pid].pop();
            showToast('Error saving partner.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Add Partner'; }
        }
    });
}

function deletePartner(index) {
    if (!confirm('Remove this partner?')) return;
    var pid = AppState.currentProjectId;
    var removed = Partners[pid].splice(index, 1);
    updateProjectField(pid, 'partners', Partners[pid]).then(function(result) {
        if (result.success) {
            navigateTo('partners');
            showToast('Partner removed.', 'info');
        } else {
            Partners[pid].splice(index, 0, removed[0]);
            showToast('Error removing partner.', 'error');
        }
    });
}

// ---- WORK PACKAGES ----
function renderWorkPackages(container) {
    var wps = getCurrentWPs();
    container.innerHTML = '\
        <div class="page-header">\
            <h1>Work Packages</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-primary" onclick="openAddWPModal()"><i class="fas fa-plus"></i> Add Work Package</button>\
            </div>\
        </div>\
        <div class="wp-grid" id="wpGrid"></div>';

    var grid = document.getElementById('wpGrid');
    if (wps.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:60px 20px;text-align:center"><i class="fas fa-cubes" style="font-size:48px;color:var(--gray-300);margin-bottom:16px"></i><h3>No work packages yet</h3><p style="color:var(--gray-500)">Add work packages to organize your project activities.</p></div>';
        return;
    }

    grid.innerHTML = wps.map(function(wp) {
        var responsibleNames = (wp.responsiblePartners || []).join(', ') || 'None assigned';
        return '<div class="wp-card" onclick="openWPDetail(\'' + wp.id + '\')">\
            <div class="wp-card-header">\
                <span class="wp-number">' + wp.number + '</span>\
                <span class="status-badge status-' + wp.status + '">' + wp.status + '</span>\
            </div>\
            <h3>' + wp.title + '</h3>\
            <p>' + (wp.description || '').substring(0, 100) + (wp.description && wp.description.length > 100 ? '...' : '') + '</p>\
            <div style="margin:12px 0">\
                <div class="progress-label"><span>Progress</span><span>' + wp.progress + '%</span></div>\
                <div class="progress-bar"><div class="progress-fill ' + (wp.progress === 100 ? 'success' : '') + '" style="width:' + wp.progress + '%"></div></div>\
            </div>\
            <div style="font-size:12px;color:var(--gray-600);margin-bottom:4px"><strong>Lead:</strong> ' + (wp.lead || 'N/A') + '</div>\
            <div style="font-size:11px;color:var(--gray-500);margin-bottom:8px"><strong>Responsible:</strong> ' + responsibleNames + '</div>\
            <div class="wp-meta">\
                <span><i class="fas fa-calendar"></i> ' + wp.start + '-' + wp.end + '</span>\
                <span><i class="fas fa-euro-sign"></i> ' + formatCurrency(wp.budget) + '</span>\
            </div>\
            ' + (wp.deliverables && wp.deliverables.length > 0 ? '<div style="margin-top:12px"><div style="font-size:11px;font-weight:600;color:var(--gray-500);margin-bottom:6px">DELIVERABLES (' + wp.deliverables.filter(function(d) { return d.completed; }).length + '/' + wp.deliverables.length + ')</div>' + wp.deliverables.map(function(d) { var name = typeof d === 'string' ? d : d.name; var done = typeof d === 'object' && d.completed; return '<div style="font-size:12px;color:var(--gray-600);padding:3px 0;' + (done ? 'text-decoration:line-through;opacity:0.6' : '') + '"><i class="fas ' + (done ? 'fa-check-circle' : 'fa-circle') + '" style="color:' + (done ? 'var(--success)' : 'var(--gray-300)') + ';margin-right:6px"></i>' + name + '</div>'; }).join('') + '</div>' : '') + '\
        </div>';
    }).join('');
}

function openWPDetail(wpId) {
    var wps = getCurrentWPs();
    var wpIdx = wps.findIndex(function(w) { return w.id === wpId; });
    var wp = wps[wpIdx];
    if (!wp) return;
    var tasks = getCurrentTasks().filter(function(t) { return t.wp === wp.number; });
    var responsibleNames = (wp.responsiblePartners || []).join(', ') || 'None';

    var deliverableHtml = '';
    if (wp.deliverables && wp.deliverables.length > 0) {
        deliverableHtml = '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Deliverables</h3>' +
            wp.deliverables.map(function(d, i) {
                var name = typeof d === 'string' ? d : d.name;
                var done = typeof d === 'object' && d.completed;
                return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--gray-100);cursor:pointer" onclick="toggleDeliverable(\'' + wpId + '\',' + i + ')">\
                    <div class="task-checkbox ' + (done ? 'checked' : '') + '">' + (done ? '<i class="fas fa-check"></i>' : '') + '</div>\
                    <span style="font-size:13px;' + (done ? 'text-decoration:line-through;opacity:0.6' : '') + '">' + name + '</span>\
                </div>';
            }).join('');
    }

    openModal(wp.number + ': ' + wp.title, '\
        <div style="margin-bottom:16px">\
            <span class="status-badge status-' + wp.status + '">' + wp.status + '</span>\
            <select style="margin-left:8px;padding:4px 8px;border:1px solid var(--gray-300);border-radius:4px;font-size:12px" onchange="changeWPStatus(\'' + wpId + '\',this.value)">\
                <option value="pending"' + (wp.status === 'pending' ? ' selected' : '') + '>Pending</option>\
                <option value="active"' + (wp.status === 'active' ? ' selected' : '') + '>Active</option>\
                <option value="completed"' + (wp.status === 'completed' ? ' selected' : '') + '>Completed</option>\
            </select>\
        </div>\
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;font-size:13px">\
            <div style="padding:8px;background:var(--gray-50);border-radius:var(--radius)"><strong>Lead:</strong> ' + wp.lead + '</div>\
            <div style="padding:8px;background:var(--gray-50);border-radius:var(--radius)"><strong>Responsible:</strong> ' + responsibleNames + '</div>\
        </div>\
        <p style="color:var(--gray-600);line-height:1.7;margin-bottom:20px">' + wp.description + '</p>\
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">\
            <div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:20px;font-weight:800;color:var(--primary)">' + wp.progress + '%</div><div style="font-size:11px;color:var(--gray-500)">Complete</div></div>\
            <div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:20px;font-weight:800">' + formatCurrency(wp.budget) + '</div><div style="font-size:11px;color:var(--gray-500)">Budget</div></div>\
            <div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:20px;font-weight:800">' + wp.start + '-' + wp.end + '</div><div style="font-size:11px;color:var(--gray-500)">Timeline</div></div>\
        </div>\
        ' + deliverableHtml + '\
        ' + (tasks.length > 0 ? '<h3 style="font-size:14px;font-weight:700;margin:20px 0 12px">Related Tasks</h3>' + tasks.map(function(t) {
            var statusClass = t.status === 'in_progress' ? 'active' : t.status === 'completed' ? 'completed' : 'pending';
            return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;font-size:13px;border-bottom:1px solid var(--gray-100)"><span class="status-badge status-' + statusClass + '">' + t.status.replace('_', ' ') + '</span><span>' + t.title + '</span></div>';
        }).join('') : '') + '\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Close</button><button class="btn btn-danger btn-sm" style="margin-right:auto" onclick="deleteWP(\'' + wpId + '\')"><i class="fas fa-trash"></i> Delete WP</button>', true);
}

function toggleDeliverable(wpId, deliverableIdx) {
    var pid = AppState.currentProjectId;
    var wps = WorkPackages[pid];
    var wp = wps.find(function(w) { return w.id === wpId; });
    if (!wp || !wp.deliverables[deliverableIdx]) return;

    var d = wp.deliverables[deliverableIdx];
    if (typeof d === 'string') {
        wp.deliverables[deliverableIdx] = { name: d, completed: true };
    } else {
        d.completed = !d.completed;
    }

    // Auto-calculate progress from deliverables
    var totalDel = wp.deliverables.length;
    var doneDel = wp.deliverables.filter(function(dd) { return typeof dd === 'object' && dd.completed; }).length;
    wp.progress = totalDel > 0 ? Math.round(doneDel / totalDel * 100) : 0;
    if (wp.progress === 100) wp.status = 'completed';
    else if (wp.progress > 0) wp.status = 'active';

    updateProjectField(pid, 'workPackages', wps).then(function() {
        openWPDetail(wpId);
    });
}

function changeWPStatus(wpId, newStatus) {
    var pid = AppState.currentProjectId;
    var wps = WorkPackages[pid];
    var wp = wps.find(function(w) { return w.id === wpId; });
    if (!wp) return;
    wp.status = newStatus;
    if (newStatus === 'completed') wp.progress = 100;
    updateProjectField(pid, 'workPackages', wps).then(function() {
        showToast('WP status updated.', 'success');
    });
}

function deleteWP(wpId) {
    if (!confirm('Delete this work package?')) return;
    var pid = AppState.currentProjectId;
    WorkPackages[pid] = WorkPackages[pid].filter(function(w) { return w.id !== wpId; });
    updateProjectField(pid, 'workPackages', WorkPackages[pid]).then(function() {
        closeModal();
        navigateTo('workpackages');
        showToast('Work package deleted.', 'info');
    });
}

function openAddWPModal() {
    var partners = getCurrentPartners();
    var partnerOptions = partners.length > 0 ? partners.map(function(p) { return '<option>' + p.name + '</option>'; }).join('') : '<option>No partners yet</option>';
    var partnerCheckboxes = partners.map(function(p) {
        return '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer"><input type="checkbox" class="awpResponsible" value="' + p.name + '"> ' + p.name + '</label>';
    }).join('');

    openModal('Add Work Package', '\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">WP Number</label><input type="text" class="form-input" id="awpNumber" placeholder="e.g., WP1"></div>\
            <div class="form-group"><label class="form-label">WP Lead</label><select class="form-select" id="awpLead">' + partnerOptions + '</select></div>\
        </div>\
        <div class="form-group"><label class="form-label">Responsible Partners</label><div style="max-height:120px;overflow-y:auto;padding:8px;border:1px solid var(--gray-200);border-radius:var(--radius)">' + (partnerCheckboxes || '<span style="color:var(--gray-400)">Add partners first</span>') + '</div></div>\
        <div class="form-group"><label class="form-label">Title</label><input type="text" class="form-input" id="awpTitle" placeholder="Work package title"></div>\
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" rows="3" id="awpDesc"></textarea></div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Start (Month)</label><input type="text" class="form-input" id="awpStart" placeholder="M1"></div>\
            <div class="form-group"><label class="form-label">End (Month)</label><input type="text" class="form-input" id="awpEnd" placeholder="M24"></div>\
        </div>\
        <div class="form-group"><label class="form-label">Budget (&euro;)</label><input type="number" class="form-input" id="awpBudget" placeholder="40000"></div>\
        <div class="form-group"><label class="form-label">Deliverables (one per line)</label><textarea class="form-textarea" rows="3" id="awpDeliverables" placeholder="D1.1 Management Handbook\nD1.2 Quality Plan"></textarea></div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddWP()"><i class="fas fa-check"></i> Create WP</button>');
}

function handleAddWP() {
    var number = document.getElementById('awpNumber').value.trim();
    var lead = document.getElementById('awpLead').value;
    var title = document.getElementById('awpTitle').value.trim();
    var desc = document.getElementById('awpDesc').value.trim();
    var start = document.getElementById('awpStart').value.trim();
    var end = document.getElementById('awpEnd').value.trim();
    var budget = parseInt(document.getElementById('awpBudget').value) || 0;
    var deliverablesText = document.getElementById('awpDeliverables').value.trim();
    var deliverables = deliverablesText ? deliverablesText.split('\n').filter(function(d) { return d.trim(); }).map(function(d) { return { name: d.trim(), completed: false }; }) : [];

    var responsiblePartners = [];
    document.querySelectorAll('.awpResponsible:checked').forEach(function(cb) {
        responsiblePartners.push(cb.value);
    });

    if (!number || !title) { alert('Please enter WP number and title.'); return; }

    var wp = {
        id: number,
        number: number,
        title: title,
        lead: lead,
        responsiblePartners: responsiblePartners,
        start: start || 'M1',
        end: end || 'M24',
        status: 'pending',
        progress: 0,
        description: desc,
        deliverables: deliverables,
        budget: budget
    };

    var pid = AppState.currentProjectId;
    if (!WorkPackages[pid]) WorkPackages[pid] = [];
    WorkPackages[pid].push(wp);

    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    updateProjectField(pid, 'workPackages', WorkPackages[pid]).then(function(result) {
        if (result.success) {
            closeModal();
            navigateTo('workpackages');
            showToast('Work Package "' + number + '" created!', 'success');
        } else {
            WorkPackages[pid].pop();
            showToast('Error saving work package.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Create WP'; }
        }
    });
}

// ---- TASKS ----
function getRemainingDays(dueDate) {
    if (!dueDate) return null;
    var now = new Date(); now.setHours(0,0,0,0);
    var due = new Date(dueDate); due.setHours(0,0,0,0);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

function getRemainingLabel(dueDate) {
    var days = getRemainingDays(dueDate);
    if (days === null) return '';
    if (days < 0) return '<span style="color:var(--danger);font-weight:600">' + Math.abs(days) + 'd overdue</span>';
    if (days === 0) return '<span style="color:var(--warning);font-weight:600">Due today</span>';
    if (days <= 3) return '<span style="color:var(--warning);font-weight:600">' + days + 'd left</span>';
    return '<span style="color:var(--gray-500)">' + days + 'd left</span>';
}

function renderTasks(container) {
    var tasks = getCurrentTasks();
    var pending = tasks.filter(function(t) { return t.status === 'pending'; });
    var inProgress = tasks.filter(function(t) { return t.status === 'in_progress'; });
    var completed = tasks.filter(function(t) { return t.status === 'completed'; });

    container.innerHTML = '\
        <div class="page-header">\
            <h1>Tasks</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-secondary" onclick="generateTabReport(\'tasks\')"><i class="fas fa-robot"></i> AI Report</button>\
                <button class="btn btn-primary" onclick="openAddTaskModal()"><i class="fas fa-plus"></i> Add Task</button>\
            </div>\
        </div>\
        <div class="tabs" id="taskTabs">\
            <button class="tab-btn active" onclick="showTaskView(\'board\',this)">Board View</button>\
            <button class="tab-btn" onclick="showTaskView(\'list\',this)">List View</button>\
        </div>\
        <div id="taskBoard" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">\
            <div class="card"><div class="card-header" style="background:var(--warning-light)"><h2 style="font-size:14px">Pending (' + pending.length + ')</h2></div><div class="card-body" style="padding:12px">' +
                (pending.length > 0 ? pending.map(function(t) { return renderTaskCard(t); }).join('') : '<p style="color:var(--gray-400);font-size:13px">No pending tasks</p>') +
            '</div></div>\
            <div class="card"><div class="card-header" style="background:var(--primary-100)"><h2 style="font-size:14px">In Progress (' + inProgress.length + ')</h2></div><div class="card-body" style="padding:12px">' +
                (inProgress.length > 0 ? inProgress.map(function(t) { return renderTaskCard(t); }).join('') : '<p style="color:var(--gray-400);font-size:13px">No tasks in progress</p>') +
            '</div></div>\
            <div class="card"><div class="card-header" style="background:var(--success-light)"><h2 style="font-size:14px">Completed (' + completed.length + ')</h2></div><div class="card-body" style="padding:12px">' +
                (completed.length > 0 ? completed.map(function(t) { return renderTaskCard(t); }).join('') : '<p style="color:var(--gray-400);font-size:13px">No completed tasks</p>') +
            '</div></div>\
        </div>\
        <div id="taskList" class="card hidden">\
            <div class="card-body" style="padding:0">\
                <table class="data-table"><thead><tr><th>Task</th><th>WP</th><th>Assignee</th><th>Due Date</th><th>Remaining</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>\
                <tbody>' +
                    tasks.map(function(t, idx) {
                        var statusClass = t.status === 'in_progress' ? 'active' : t.status === 'completed' ? 'completed' : 'pending';
                        return '<tr><td style="font-weight:500">' + t.title + '</td><td><span class="wp-number">' + t.wp + '</span></td><td><div class="task-assignee"><div class="task-assignee-avatar">' + (t.assigneeInitials || '?') + '</div>' + (t.assignee || '').split(' ')[0] + '</div></td><td>' + formatDate(t.due) + '</td><td style="font-size:12px">' + getRemainingLabel(t.due) + '</td><td><span class="status-badge ' + (t.priority === 'high' ? 'status-overdue' : t.priority === 'medium' ? 'status-pending' : 'status-draft') + '">' + t.priority + '</span></td><td><span class="status-badge status-' + statusClass + '">' + t.status.replace('_', ' ') + '</span></td><td style="white-space:nowrap"><button class="btn btn-sm btn-ghost" onclick="openEditTaskModal(' + idx + ')" title="Edit"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-ghost" onclick="cycleTaskStatus(' + idx + ')" title="Change status"><i class="fas fa-arrow-right"></i></button><button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteTask(' + idx + ')" title="Delete"><i class="fas fa-trash"></i></button></td></tr>';
                    }).join('') +
                '</tbody></table>\
            </div>\
        </div>';
}

function renderTaskCard(t) {
    var idx = getCurrentTasks().indexOf(t);
    var remaining = getRemainingLabel(t.due);
    return '<div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);padding:14px;margin-bottom:10px;cursor:pointer;' + (t.priority === 'high' ? 'border-left:3px solid var(--danger)' : '') + '" onclick="openEditTaskModal(' + idx + ')">\
        <div style="font-size:13px;font-weight:600;color:var(--gray-800);margin-bottom:6px">' + t.title + '</div>\
        <div style="display:flex;justify-content:space-between;align-items:center">\
            <span class="wp-number" style="font-size:10px">' + t.wp + '</span>\
            <div style="display:flex;align-items:center;gap:6px">\
                <div class="task-assignee-avatar">' + (t.assigneeInitials || '?') + '</div>\
                <span style="font-size:11px;color:var(--gray-400)">' + formatDate(t.due) + '</span>\
            </div>\
        </div>\
        ' + (remaining ? '<div style="margin-top:6px;font-size:11px">' + remaining + '</div>' : '') + '\
    </div>';
}

function showTaskView(view, btn) {
    document.querySelectorAll('#taskTabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    if (view === 'board') {
        document.getElementById('taskBoard').classList.remove('hidden');
        document.getElementById('taskList').classList.add('hidden');
    } else {
        document.getElementById('taskBoard').classList.add('hidden');
        document.getElementById('taskList').classList.remove('hidden');
    }
}

function cycleTaskStatus(idx) {
    var pid = AppState.currentProjectId;
    var tasks = Tasks[pid];
    if (!tasks || !tasks[idx]) return;
    var statusCycle = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' };
    tasks[idx].status = statusCycle[tasks[idx].status] || 'pending';
    updateProjectField(pid, 'tasks', tasks).then(function() {
        navigateTo('tasks');
        updateSidebarBadges();
    });
}

function deleteTask(idx) {
    if (!confirm('Delete this task?')) return;
    var pid = AppState.currentProjectId;
    Tasks[pid].splice(idx, 1);
    updateProjectField(pid, 'tasks', Tasks[pid]).then(function() {
        navigateTo('tasks');
        updateSidebarBadges();
        showToast('Task deleted.', 'info');
    });
}

function openAddTaskModal() {
    var wps = getCurrentWPs();
    var partners = getCurrentPartners();
    var wpOptions = wps.length > 0 ? wps.map(function(w) { return '<option value="' + w.number + '">' + w.number + ' - ' + w.title + '</option>'; }).join('') : '<option value="">No WPs yet</option>';
    var assigneeOptions = partners.length > 0 ? partners.map(function(p) { return '<option value="' + p.contact + '">' + p.contact + ' (' + p.name + ')</option>'; }).join('') : '<option value="">No partners yet</option>';

    openModal('Add New Task', '\
        <div class="form-group"><label class="form-label">Task Title</label><input type="text" class="form-input" id="atTitle" placeholder="What needs to be done?"></div>\
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" rows="2" id="atDesc" placeholder="Task details..."></textarea></div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Work Package</label><select class="form-select" id="atWP">' + wpOptions + '</select></div>\
            <div class="form-group"><label class="form-label">Assignee</label><select class="form-select" id="atAssignee">' + assigneeOptions + '</select></div>\
        </div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-input" id="atDue"></div>\
            <div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="atPriority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select></div>\
        </div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddTask()"><i class="fas fa-check"></i> Create Task</button>');
}

function handleAddTask() {
    var title = document.getElementById('atTitle').value.trim();
    var desc = document.getElementById('atDesc').value.trim();
    var wp = document.getElementById('atWP').value;
    var assignee = document.getElementById('atAssignee').value;
    var due = document.getElementById('atDue').value;
    var priority = document.getElementById('atPriority').value;

    if (!title) { alert('Please enter a task title.'); return; }

    var assigneeNames = assignee ? assignee.split(' ') : ['?'];
    var initials = assigneeNames.length >= 2 ? (assigneeNames[0][0] + assigneeNames[1][0]).toUpperCase() : (assigneeNames[0][0] || '?').toUpperCase();

    var task = {
        id: Date.now(),
        title: title,
        description: desc,
        wp: wp || '',
        assignee: assignee || 'Unassigned',
        assigneeInitials: initials,
        due: due || '',
        status: 'pending',
        priority: priority,
        createdAt: new Date().toISOString()
    };

    var pid = AppState.currentProjectId;
    if (!Tasks[pid]) Tasks[pid] = [];
    Tasks[pid].push(task);

    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    updateProjectField(pid, 'tasks', Tasks[pid]).then(function(result) {
        if (result.success) {
            closeModal();
            navigateTo('tasks');
            showToast('Task created!', 'success');
            updateSidebarBadges();
        } else {
            Tasks[pid].pop();
            showToast('Error saving task.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Create Task'; }
        }
    });
}

function openEditTaskModal(idx) {
    var pid = AppState.currentProjectId;
    var t = Tasks[pid][idx];
    if (!t) return;

    var wps = getCurrentWPs();
    var partners = getCurrentPartners();
    var wpOptions = wps.length > 0 ? wps.map(function(w) { return '<option value="' + w.number + '"' + (w.number === t.wp ? ' selected' : '') + '>' + w.number + ' - ' + w.title + '</option>'; }).join('') : '<option value="">No WPs</option>';
    var assigneeOptions = partners.length > 0 ? partners.map(function(p) { return '<option value="' + p.contact + '"' + (p.contact === t.assignee ? ' selected' : '') + '>' + p.contact + ' (' + p.name + ')</option>'; }).join('') : '<option value="">No partners</option>';
    var statusOptions = '<option value="pending"' + (t.status === 'pending' ? ' selected' : '') + '>Pending</option><option value="in_progress"' + (t.status === 'in_progress' ? ' selected' : '') + '>In Progress</option><option value="completed"' + (t.status === 'completed' ? ' selected' : '') + '>Completed</option>';
    var priorityOptions = '<option value="low"' + (t.priority === 'low' ? ' selected' : '') + '>Low</option><option value="medium"' + (t.priority === 'medium' ? ' selected' : '') + '>Medium</option><option value="high"' + (t.priority === 'high' ? ' selected' : '') + '>High</option>';
    var remaining = getRemainingLabel(t.due);

    openModal('Edit Task', '\
        ' + (remaining ? '<div style="margin-bottom:16px;padding:8px 12px;background:var(--gray-50);border-radius:var(--radius);font-size:13px"><i class="fas fa-clock"></i> ' + remaining + '</div>' : '') + '\
        <div class="form-group"><label class="form-label">Task Title</label><input type="text" class="form-input" id="etTitle" value="' + (t.title || '').replace(/"/g, '&quot;') + '"></div>\
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" rows="2" id="etDesc">' + (t.description || '') + '</textarea></div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Work Package</label><select class="form-select" id="etWP">' + wpOptions + '</select></div>\
            <div class="form-group"><label class="form-label">Assignee</label><select class="form-select" id="etAssignee">' + assigneeOptions + '</select></div>\
        </div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-input" id="etDue" value="' + (t.due || '') + '"></div>\
            <div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="etPriority">' + priorityOptions + '</select></div>\
        </div>\
        <div class="form-group"><label class="form-label">Status</label><select class="form-select" id="etStatus">' + statusOptions + '</select></div>\
    ', '<button class="btn btn-danger btn-sm" style="margin-right:auto" onclick="deleteTask(' + idx + ')"><i class="fas fa-trash"></i> Delete</button><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleEditTask(' + idx + ')"><i class="fas fa-save"></i> Save Changes</button>');
}

function handleEditTask(idx) {
    var pid = AppState.currentProjectId;
    var t = Tasks[pid][idx];
    if (!t) return;

    t.title = document.getElementById('etTitle').value.trim();
    t.description = document.getElementById('etDesc').value.trim();
    t.wp = document.getElementById('etWP').value;
    t.assignee = document.getElementById('etAssignee').value;
    t.due = document.getElementById('etDue').value;
    t.priority = document.getElementById('etPriority').value;
    t.status = document.getElementById('etStatus').value;

    var assigneeNames = t.assignee ? t.assignee.split(' ') : ['?'];
    t.assigneeInitials = assigneeNames.length >= 2 ? (assigneeNames[0][0] + assigneeNames[1][0]).toUpperCase() : (assigneeNames[0][0] || '?').toUpperCase();

    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    updateProjectField(pid, 'tasks', Tasks[pid]).then(function(result) {
        if (result.success) {
            closeModal();
            navigateTo('tasks');
            updateSidebarBadges();
            showToast('Task updated!', 'success');
        } else {
            showToast('Error saving.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save Changes'; }
        }
    });
}

// ---- DOCUMENTS ----
// Navigation path: array of folder IDs representing current location
var docNavPath = [];

function getFileType(filename) {
    var ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].indexOf(ext) !== -1) return 'pdf';
    if (['doc', 'docx'].indexOf(ext) !== -1) return 'doc';
    if (['xls', 'xlsx', 'csv'].indexOf(ext) !== -1) return 'xls';
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].indexOf(ext) !== -1) return 'img';
    if (['zip', 'rar', '7z'].indexOf(ext) !== -1) return 'generic';
    return 'other';
}

// Get folder by navigating the path
function getFolderByPath(docs, path) {
    var folders = docs.folders;
    var folder = null;
    for (var i = 0; i < path.length; i++) {
        folder = folders.find(function(f) { return f.id === path[i]; });
        if (!folder) return null;
        folders = folder.subfolders || [];
    }
    return folder;
}

// Get the folders array at current navigation level
function getFoldersAtPath(docs, path) {
    if (path.length === 0) return docs.folders;
    var parent = getFolderByPath(docs, path);
    if (!parent) return [];
    if (!parent.subfolders) parent.subfolders = [];
    return parent.subfolders;
}

function renderDocuments(container) {
    docNavPath = [];
    container.innerHTML = '\
        <div class="page-header">\
            <h1>Documents</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-secondary" onclick="openCreateFolderModal()"><i class="fas fa-folder-plus"></i> New Folder</button>\
            </div>\
        </div>\
        <div style="margin-bottom:12px;padding:10px 14px;background:var(--gray-50);border-radius:var(--radius);font-size:12px;color:var(--gray-500)"><i class="fas fa-info-circle"></i> Max file size: 10 MB per file. Supported: PDF, Word, Excel, Images, ZIP</div>\
        <div id="docBreadcrumb" style="margin-bottom:20px;font-size:14px"></div>\
        <div id="docContent"></div>';
    renderDocView();
}

function renderDocView() {
    var pid = AppState.currentProjectId;
    var docs = Documents[pid] || { folders: [] };
    var iconMap = { pdf: 'fa-file-pdf', doc: 'fa-file-word', xls: 'fa-file-excel', img: 'fa-file-image', generic: 'fa-file-archive', other: 'fa-file' };

    // Build breadcrumb
    var breadcrumb = '<a href="#" onclick="docNavPath=[];renderDocView();return false" style="font-weight:600"><i class="fas fa-home"></i> All Files</a>';
    var pathSoFar = [];
    for (var i = 0; i < docNavPath.length; i++) {
        var pathFolder = getFolderByPath(docs, docNavPath.slice(0, i + 1));
        if (!pathFolder) break;
        pathSoFar.push(docNavPath[i]);
        var pathCopy = JSON.stringify(pathSoFar);
        if (i < docNavPath.length - 1) {
            breadcrumb += ' <i class="fas fa-chevron-right" style="font-size:10px;margin:0 8px;color:var(--gray-400)"></i> <a href="#" onclick="docNavPath=' + pathCopy + ';renderDocView();return false">' + pathFolder.name + '</a>';
        } else {
            breadcrumb += ' <i class="fas fa-chevron-right" style="font-size:10px;margin:0 8px;color:var(--gray-400)"></i> <span style="font-weight:600">' + pathFolder.name + '</span>';
        }
    }
    document.getElementById('docBreadcrumb').innerHTML = breadcrumb;

    var content = document.getElementById('docContent');

    if (docNavPath.length === 0) {
        // Root level - show top-level folders only
        var rootFolders = docs.folders || [];
        if (rootFolders.length === 0) {
            content.innerHTML = '<div class="empty-state" style="padding:60px 20px;text-align:center"><i class="fas fa-folder-open" style="font-size:48px;color:var(--gray-300);margin-bottom:16px"></i><h3>No folders yet</h3><p style="color:var(--gray-500)">Create a folder to organize your project documents.</p></div>';
        } else {
            content.innerHTML = '<div class="file-grid">' + rootFolders.map(function(f) {
                var subCount = (f.subfolders || []).length;
                var fileCount = (f.files || []).length;
                var meta = [];
                if (subCount > 0) meta.push(subCount + ' folder' + (subCount > 1 ? 's' : ''));
                if (fileCount > 0) meta.push(fileCount + ' file' + (fileCount > 1 ? 's' : ''));
                return '<div class="file-card" onclick="docNavPath=[\'' + f.id + '\'];renderDocView()"><div class="file-icon folder"><i class="fas fa-folder"></i></div><div class="file-name">' + f.name + '</div><div class="file-meta">' + (meta.join(', ') || 'Empty') + '</div></div>';
            }).join('') + '</div>';
        }
    } else {
        // Inside a folder - show subfolders + files + upload
        var currentFolder = getFolderByPath(docs, docNavPath);
        if (!currentFolder) { docNavPath = []; renderDocView(); return; }
        var subfolders = currentFolder.subfolders || [];
        var files = currentFolder.files || [];

        var html = '<div style="margin-bottom:16px;display:flex;gap:8px">' +
            '<button class="btn btn-secondary" onclick="openCreateFolderModal()"><i class="fas fa-folder-plus"></i> New Subfolder</button>' +
            '<button class="btn btn-primary" onclick="triggerFileUpload()"><i class="fas fa-upload"></i> Upload File</button>' +
            '<input type="file" id="fileUploadInput" style="display:none" multiple onchange="handleFileUpload(this.files)">' +
            '</div>';

        if (subfolders.length === 0 && files.length === 0) {
            html += '<div class="empty-state" style="padding:40px 20px;text-align:center;border:2px dashed var(--gray-200);border-radius:var(--radius)"><i class="fas fa-cloud-upload-alt" style="font-size:36px;color:var(--gray-300);margin-bottom:12px"></i><p style="color:var(--gray-400)">This folder is empty. Add subfolders or upload files.</p></div>';
        } else {
            html += '<div class="file-grid">';
            // Subfolders first
            subfolders.forEach(function(sf) {
                var sfSubCount = (sf.subfolders || []).length;
                var sfFileCount = (sf.files || []).length;
                var sfMeta = [];
                if (sfSubCount > 0) sfMeta.push(sfSubCount + ' folder' + (sfSubCount > 1 ? 's' : ''));
                if (sfFileCount > 0) sfMeta.push(sfFileCount + ' file' + (sfFileCount > 1 ? 's' : ''));
                html += '<div class="file-card" onclick="docNavPath.push(\'' + sf.id + '\');renderDocView()"><div class="file-icon folder"><i class="fas fa-folder"></i></div><div class="file-name">' + sf.name + '</div><div class="file-meta">' + (sfMeta.join(', ') || 'Empty') + '</div></div>';
            });
            // Then files
            files.forEach(function(f, fIdx) {
                html += '<div class="file-card" style="position:relative">' +
                    (f.url ? '<a href="' + f.url + '" target="_blank" style="text-decoration:none;color:inherit">' : '') +
                    '<div class="file-icon ' + f.type + '"><i class="fas ' + (iconMap[f.type] || 'fa-file') + '"></i></div><div class="file-name">' + f.name + '</div><div class="file-meta">' + f.size + ' &middot; ' + f.uploaded + '</div><div style="font-size:10px;color:var(--gray-400);margin-top:2px">' + (f.by || '') + '</div>' +
                    (f.url ? '</a>' : '') +
                    '<button class="btn btn-sm btn-ghost" style="position:absolute;top:4px;right:4px;color:var(--danger);padding:2px 6px" onclick="event.stopPropagation();deleteDocFile(' + fIdx + ')" title="Delete"><i class="fas fa-trash"></i></button></div>';
            });
            html += '</div>';
        }
        content.innerHTML = html;
    }
}

function triggerFileUpload() {
    document.getElementById('fileUploadInput').click();
}

function handleFileUpload(files) {
    if (!files || files.length === 0) return;
    var pid = AppState.currentProjectId;
    var docs = Documents[pid];
    var folder = getFolderByPath(docs, docNavPath);
    if (!folder) return;
    if (!folder.files) folder.files = [];

    var uploadPromises = [];
    var storageFolderId = docNavPath.join('_');
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.size > 10 * 1024 * 1024) {
            showToast(file.name + ' is too large (max 10MB).', 'error');
            continue;
        }
        var existingIdx = folder.files.findIndex(function(f) { return f.name === file.name; });
        if (existingIdx !== -1) {
            if (!confirm(file.name + ' already exists. Replace with new version?')) continue;
            if (folder.files[existingIdx].storagePath) deleteStorageFile(folder.files[existingIdx].storagePath);
            folder.files.splice(existingIdx, 1);
        }
        uploadPromises.push(uploadFile(pid, storageFolderId, file));
    }

    if (uploadPromises.length === 0) return;
    showToast('Uploading ' + uploadPromises.length + ' file(s)...', 'info');

    Promise.all(uploadPromises).then(function(results) {
        var successCount = 0;
        results.forEach(function(result) {
            if (result.success) {
                folder.files.push({
                    id: 'f' + Date.now() + Math.random().toString(36).substr(2, 4),
                    name: result.name, type: getFileType(result.name), size: result.size,
                    uploaded: new Date().toISOString().split('T')[0],
                    by: AppState.currentUser ? AppState.currentUser.name : 'Unknown',
                    url: result.url, storagePath: result.path
                });
                successCount++;
            } else {
                showToast('Failed: ' + result.error, 'error');
            }
        });
        if (successCount > 0) {
            updateProjectField(pid, 'documents', docs).then(function() {
                renderDocView();
                showToast(successCount + ' file(s) uploaded!', 'success');
            });
        }
    });
}

function deleteDocFile(fileIdx) {
    if (!confirm('Delete this file?')) return;
    var pid = AppState.currentProjectId;
    var folder = getFolderByPath(Documents[pid], docNavPath);
    if (!folder) return;
    var file = folder.files[fileIdx];
    if (file && file.storagePath) deleteStorageFile(file.storagePath);
    folder.files.splice(fileIdx, 1);
    updateProjectField(pid, 'documents', Documents[pid]).then(function() {
        renderDocView();
        showToast('File deleted.', 'info');
    });
}

function openCreateFolderModal() {
    openModal('Create Folder', '\
        <div class="form-group"><label class="form-label">Folder Name</label><input type="text" class="form-input" id="cfName" placeholder="e.g., WP1 or 1.1 Monitoring"></div>\
        ' + (docNavPath.length > 0 ? '<p style="font-size:12px;color:var(--gray-500)"><i class="fas fa-info-circle"></i> This will be created as a subfolder inside the current folder.</p>' : '') + '\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleCreateFolder()"><i class="fas fa-check"></i> Create</button>');
}

function handleCreateFolder() {
    var name = document.getElementById('cfName').value.trim();
    if (!name) { alert('Please enter a folder name.'); return; }

    var pid = AppState.currentProjectId;
    if (!Documents[pid]) Documents[pid] = { folders: [] };

    var folderId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30) + '-' + Date.now().toString().slice(-4);
    var newFolder = { id: folderId, name: name, type: 'folder', files: [], subfolders: [] };

    if (docNavPath.length === 0) {
        // Add to root
        Documents[pid].folders.push(newFolder);
    } else {
        // Add as subfolder
        var parentFolder = getFolderByPath(Documents[pid], docNavPath);
        if (!parentFolder) { alert('Parent folder not found.'); return; }
        if (!parentFolder.subfolders) parentFolder.subfolders = [];
        parentFolder.subfolders.push(newFolder);
    }

    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    updateProjectField(pid, 'documents', Documents[pid]).then(function(result) {
        if (result.success) {
            closeModal();
            renderDocView();
            showToast('Folder "' + name + '" created!', 'success');
        } else {
            showToast('Error creating folder.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Create'; }
        }
    });
}
