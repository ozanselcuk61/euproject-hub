/* ====================================
   EUProject Hub — Page Renderers Part 2
   Partners, Work Packages, Tasks, Documents
   ==================================== */

// ---- PARTNERS (Redesigned) ----
function renderPartners(container) {
    var partners = getCurrentPartners();
    var pid = AppState.currentProjectId;
    if (!pid) { container.innerHTML = '<div class="empty-state"><p>Select a project first.</p></div>'; return; }

    // Sort: coordinator first, then by name
    var sorted = partners.slice().sort(function(a, b) {
        if (a.role === 'coordinator' && b.role !== 'coordinator') return -1;
        if (b.role === 'coordinator' && a.role !== 'coordinator') return 1;
        return (a.name || '').localeCompare(b.name || '');
    });

    var totalBudget = partners.reduce(function(s, p) { return s + (p.budget || 0); }, 0);
    var countries = [];
    partners.forEach(function(p) { if (p.country && countries.indexOf(p.country) === -1) countries.push(p.country); });

    container.innerHTML =
        '<div class="page-header"><h1>Partners (' + partners.length + ')</h1><div class="page-header-actions">' +
        '<button class="btn btn-secondary" onclick="openInvitePartnerModal()"><i class="fas fa-paper-plane"></i> Invite</button>' +
        '<button class="btn btn-primary" onclick="openAddPartnerModal()"><i class="fas fa-user-plus"></i> Add Partner</button></div></div>' +

        // Summary
        (partners.length > 0 ? '<div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--primary)">' + partners.length + '</div><div style="font-size:11px;color:var(--gray-500)">Organizations</div></div>' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--accent)">' + countries.length + '</div><div style="font-size:11px;color:var(--gray-500)">Countries</div></div>' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--success)">' + formatCurrency(totalBudget) + '</div><div style="font-size:11px;color:var(--gray-500)">Total Partner Budget</div></div></div>' : '') +

        // Partner list
        '<div class="card"><div class="card-body" style="padding:0">' +
        (sorted.length > 0 ? sorted.map(function(p) {
            var isCoord = p.role === 'coordinator';
            var flag = typeof getCountryFlag === 'function' ? getCountryFlag(p.country) : '';
            var pct = (p.budget || 0) > 0 ? Math.round((p.spent || 0) / p.budget * 100) : 0;

            return '<div style="display:flex;align-items:center;gap:16px;padding:16px 20px;border-bottom:1px solid var(--gray-100);' +
            (isCoord ? 'background:linear-gradient(90deg,var(--primary-50),transparent);border-left:4px solid var(--primary)' : '') +
            '" onmouseover="this.style.background=\'' + (isCoord ? 'var(--primary-50)' : 'var(--gray-50)') + '\'" onmouseout="this.style.background=\'' + (isCoord ? 'linear-gradient(90deg,var(--primary-50),transparent)' : '') + '\'">' +

            // Avatar
            '<div style="width:44px;height:44px;border-radius:12px;background:' + (isCoord ? 'linear-gradient(135deg,var(--primary),var(--primary-dark))' : 'linear-gradient(135deg,var(--gray-300),var(--gray-400))') +
            ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;flex-shrink:0">' + (p.initials || 'P') + '</div>' +

            // Info
            '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">' +
            '<span style="font-size:15px;font-weight:700;color:var(--gray-900)">' + p.name + '</span>' +
            (isCoord ? '<span style="background:var(--primary);color:#fff;padding:2px 8px;border-radius:50px;font-size:10px;font-weight:700">COORDINATOR</span>' :
            '<span style="background:var(--gray-100);color:var(--gray-600);padding:2px 8px;border-radius:50px;font-size:10px;font-weight:600">' + (p.role || 'partner').toUpperCase() + '</span>') +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:12px;font-size:12px;color:var(--gray-500)">' +
            '<span>' + flag + ' ' + (p.country || 'N/A') + '</span>' +
            (p.contact ? '<span><i class="fas fa-user" style="margin-right:3px"></i>' + p.contact + '</span>' : '') +
            (p.email ? '<span><i class="fas fa-envelope" style="margin-right:3px"></i>' + p.email + '</span>' : '') +
            '</div></div>' +

            // Budget
            '<div style="text-align:right;flex-shrink:0;min-width:100px">' +
            '<div style="font-size:16px;font-weight:800;color:' + (isCoord ? 'var(--primary)' : 'var(--gray-800)') + '">' + formatCurrency(p.budget) + '</div>' +
            '<div style="display:flex;align-items:center;gap:4px;justify-content:flex-end;margin-top:4px">' +
            '<div class="progress-bar" style="width:60px;height:4px"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
            '<span style="font-size:10px;color:var(--gray-400)">' + pct + '%</span></div></div>' +

            // Actions
            '<div style="display:flex;gap:4px;flex-shrink:0">' +
            '<button class="btn btn-sm btn-ghost" style="padding:6px" onclick="openEditPartnerModal(\'' + (p._id || '') + '\')" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-ghost" style="padding:6px;color:var(--danger)" onclick="deletePartner(\'' + (p._id || '') + '\')" title="Delete"><i class="fas fa-trash"></i></button>' +
            '</div></div>';
        }).join('') : '<div class="empty-state" style="padding:40px"><i class="fas fa-users"></i><h3>No partners yet</h3><p>Add partner organizations to your project.</p></div>') +
        '</div></div>' +

        // Partner map
        (partners.length > 0 ? '<div class="card mt-6"><div class="card-header"><h2><i class="fas fa-map-marked-alt"></i> Partner Countries</h2></div><div class="card-body" id="partnerListMap"></div></div>' : '');

    // Render map
    if (partners.length > 0) {
        setTimeout(function() {
            var mapEl = document.getElementById('partnerListMap');
            if (mapEl && typeof renderPartnerMap === 'function') renderPartnerMap(mapEl);
        }, 50);
    }
}

function openAddPartnerModal() {
    if (!requirePremium("add a partner")) return;
    var countries = ['Austria','Belgium','Bulgaria','Croatia','Cyprus','Czech Republic','Denmark','Estonia','Finland','France','Germany','Greece','Hungary','Iceland','Ireland','Italy','Latvia','Liechtenstein','Lithuania','Luxembourg','Malta','Netherlands','North Macedonia','Norway','Poland','Portugal','Romania','Serbia','Slovakia','Slovenia','Spain','Sweden','Turkey'];
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
    if (!requirePremium("delete a partner")) return;
    if (!docId || !confirm('Remove this partner?')) return;
    var pid = AppState.currentProjectId;
    deleteFromSubCollection(pid, 'partners', docId).then(function() {
        Partners[pid] = Partners[pid].filter(function(p) { return p._id !== docId; });
        showToast('Partner removed', 'info');
        navigateTo('partners');
    });
}

function openEditPartnerModal(docId) {
    if (!requirePremium("edit partner details")) return;
    var pid = AppState.currentProjectId;
    var p = getCurrentPartners().find(function(pr) { return pr._id === docId; });
    if (!p) return;
    var countries = ['Austria','Belgium','Bulgaria','Croatia','Cyprus','Czech Republic','Denmark','Estonia','Finland','France','Germany','Greece','Hungary','Iceland','Ireland','Italy','Latvia','Liechtenstein','Lithuania','Luxembourg','Malta','Netherlands','North Macedonia','Norway','Poland','Portugal','Romania','Serbia','Slovakia','Slovenia','Spain','Sweden','Turkey'];
    openModal('Edit Partner',
        '<div class="form-group"><label class="form-label">Organization Name</label><input type="text" class="form-input" id="epPartName" value="' + (p.name || '') + '"></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Country</label><select class="form-select" id="epPartCountry">' +
        countries.map(function(c) { return '<option' + (p.country === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-group"><label class="form-label">Role</label><select class="form-select" id="epPartRole">' +
        '<option value="partner"' + (p.role === 'partner' ? ' selected' : '') + '>Partner</option>' +
        '<option value="coordinator"' + (p.role === 'coordinator' ? ' selected' : '') + '>Coordinator</option>' +
        '<option value="associated"' + (p.role === 'associated' ? ' selected' : '') + '>Associated Partner</option></select></div></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Contact Person</label><input type="text" class="form-input" id="epPartContact" value="' + (p.contact || '') + '"></div>' +
        '<div class="form-group"><label class="form-label">Contact Email</label><input type="email" class="form-input" id="epPartEmail" value="' + (p.email || '') + '"></div></div>' +
        '<div class="form-group"><label class="form-label">Budget (€)</label><input type="number" class="form-input" id="epPartBudget" value="' + (p.budget || 0) + '"></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveEditPartner(\'' + docId + '\')"><i class="fas fa-save"></i> Save</button>');
}

function saveEditPartner(docId) {
    var pid = AppState.currentProjectId;
    var name = document.getElementById('epPartName').value.trim();
    var updates = {
        name: name,
        country: document.getElementById('epPartCountry').value,
        role: document.getElementById('epPartRole').value,
        contact: document.getElementById('epPartContact').value.trim(),
        email: document.getElementById('epPartEmail').value.trim(),
        budget: parseInt(document.getElementById('epPartBudget').value) || 0,
        initials: name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase()
    };
    var partner = getCurrentPartners().find(function(pr) { return pr._id === docId; });
    if (partner) Object.assign(partner, updates);
    updateInSubCollection(pid, 'partners', docId, updates).then(function() {
        showToast('Partner updated', 'success');
        closeModal();
        navigateTo('partners');
    });
}

// ---- WORK PACKAGES (Redesigned with Activities) ----
var expandedWP = null;

function renderWorkPackages(container) {
    var wps = getCurrentWPs();
    var pid = AppState.currentProjectId;
    var project = getCurrentProject();
    if (!pid) { container.innerHTML = '<div class="empty-state"><p>Select a project first.</p></div>'; return; }

    var totalBudget = wps.reduce(function(s, w) { return s + (w.budget || 0); }, 0);
    var avgProgress = wps.length > 0 ? Math.round(wps.reduce(function(s, w) { return s + (w.progress || 0); }, 0) / wps.length) : 0;

    container.innerHTML =
        '<div class="page-header"><h1>Work Packages</h1><div class="page-header-actions">' +
        '<button class="btn btn-primary" onclick="openAddWPModal()"><i class="fas fa-plus"></i> Add Work Package</button></div></div>' +

        // Summary stats
        (wps.length > 0 ? '<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--primary)">' + wps.length + '</div><div style="font-size:11px;color:var(--gray-500)">Work Packages</div></div>' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--success)">' + avgProgress + '%</div><div style="font-size:11px;color:var(--gray-500)">Avg Progress</div></div>' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--accent)">' + formatCurrency(totalBudget) + '</div><div style="font-size:11px;color:var(--gray-500)">Total WP Budget</div></div>' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--warning)">' + wps.filter(function(w) { return w.status === 'completed'; }).length + '/' + wps.length + '</div><div style="font-size:11px;color:var(--gray-500)">Completed</div></div></div>' : '') +

        '<div id="wpListContainer"></div>';

    renderWPList();
}

function renderWPList() {
    var wps = getCurrentWPs();
    var container = document.getElementById('wpListContainer');
    if (!container) return;

    var colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6'];

    if (wps.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-cubes"></i><h3>No work packages yet</h3><p>Add work packages to organize your project deliverables.</p></div>';
        return;
    }

    container.innerHTML = wps.map(function(wp, idx) {
        var color = colors[idx % colors.length];
        var activities = wp.activities || [];
        var isExpanded = expandedWP === wp._id;
        var completedActivities = activities.filter(function(a) { return a.completed; }).length;

        return '<div class="card mb-6" style="border-left:4px solid ' + color + ';overflow:visible">' +

            // WP Header
            '<div style="padding:20px 24px;cursor:pointer;display:flex;align-items:center;gap:16px" onclick="toggleWPExpand(\'' + (wp._id || '') + '\')">' +
            '<div style="width:48px;height:48px;border-radius:var(--radius);background:' + color + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;flex-shrink:0">' + (wp.number || '').replace('WP', '') + '</div>' +
            '<div style="flex:1">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
            '<span style="font-size:12px;font-weight:700;color:' + color + '">' + (wp.number || '') + '</span>' +
            '<span class="status-badge status-' + (wp.status || 'pending') + '">' + (wp.status || 'pending') + '</span>' +
            '</div>' +
            '<div style="font-size:16px;font-weight:700;color:var(--gray-900)">' + wp.title + '</div>' +
            '<div style="font-size:12px;color:var(--gray-500);margin-top:4px">' +
            '<span><i class="fas fa-user"></i> ' + (wp.lead || 'N/A') + '</span>' +
            '<span style="margin-left:12px"><i class="fas fa-calendar"></i> ' + (wp.start || 'M1') + ' — ' + (wp.end || 'M24') + '</span>' +
            '<span style="margin-left:12px"><i class="fas fa-euro-sign"></i> ' + formatCurrency(wp.budget) + '</span>' +
            '<span style="margin-left:12px"><i class="fas fa-list-check"></i> ' + completedActivities + '/' + activities.length + ' activities</span>' +
            '</div></div>' +

            // Progress + Actions
            '<div style="display:flex;align-items:center;gap:12px;flex-shrink:0">' +
            '<div style="width:80px"><div class="progress-bar" style="height:8px"><div class="progress-fill ' + (wp.progress === 100 ? 'success' : '') + '" style="width:' + (wp.progress || 0) + '%"></div></div>' +
            '<div style="font-size:11px;text-align:center;margin-top:2px;font-weight:600;color:' + color + '">' + (wp.progress || 0) + '%</div></div>' +
            '<button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openEditWPModal(\'' + (wp._id || '') + '\')" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="event.stopPropagation();deleteWP(\'' + (wp._id || '') + '\')" title="Delete"><i class="fas fa-trash"></i></button>' +
            '<i class="fas fa-chevron-' + (isExpanded ? 'up' : 'down') + '" style="color:var(--gray-400)"></i>' +
            '</div></div>' +

            // Expanded content with activities
            (isExpanded ? '<div style="border-top:1px solid var(--gray-200);padding:20px 24px;background:var(--gray-50)">' +

            // Description
            (wp.description ? '<p style="color:var(--gray-600);line-height:1.7;margin-bottom:20px;font-size:14px">' + wp.description + '</p>' : '') +

            // Activities section
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
            '<h3 style="font-size:15px;font-weight:700;color:var(--gray-800)"><i class="fas fa-list-ol" style="color:' + color + '"></i> Activities</h3>' +
            '<button class="btn btn-sm btn-primary" onclick="openAddActivityModal(\'' + (wp._id || '') + '\')"><i class="fas fa-plus"></i> Add Activity</button></div>' +

            (activities.length > 0 ? activities.map(function(act, aIdx) {
                return '<div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);padding:16px;margin-bottom:10px;border-left:3px solid ' + (act.completed ? 'var(--success)' : color) + '">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
                '<div style="flex:1">' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
                '<span style="background:' + color + ';color:#fff;padding:2px 8px;border-radius:50px;font-size:11px;font-weight:700">A' + (aIdx + 1) + '</span>' +
                '<span style="font-size:15px;font-weight:600;color:var(--gray-800);' + (act.completed ? 'text-decoration:line-through;opacity:0.6' : '') + '">' + act.title + '</span>' +
                (act.completed ? '<i class="fas fa-check-circle" style="color:var(--success)"></i>' : '') +
                '</div>' +
                (act.objective ? '<div style="font-size:13px;color:var(--gray-600);margin-bottom:4px"><strong>Objective:</strong> ' + act.objective + '</div>' : '') +
                (act.content ? '<div style="font-size:13px;color:var(--gray-500);margin-bottom:4px">' + act.content + '</div>' : '') +
                '<div style="display:flex;gap:12px;font-size:12px;color:var(--gray-400);margin-top:6px">' +
                (act.responsible ? '<span><i class="fas fa-user"></i> ' + act.responsible + '</span>' : '') +
                (act.deadline ? '<span><i class="fas fa-calendar"></i> ' + formatDate(act.deadline) + '</span>' : '') +
                '</div></div>' +
                '<div style="display:flex;gap:4px;flex-shrink:0">' +
                '<button class="btn btn-sm btn-ghost" onclick="toggleActivityComplete(\'' + (wp._id || '') + '\',' + aIdx + ')" title="' + (act.completed ? 'Mark incomplete' : 'Mark complete') + '"><i class="fas ' + (act.completed ? 'fa-undo' : 'fa-check') + '"></i></button>' +
                '<button class="btn btn-sm btn-ghost" onclick="openEditActivityModal(\'' + (wp._id || '') + '\',' + aIdx + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteActivity(\'' + (wp._id || '') + '\',' + aIdx + ')"><i class="fas fa-trash"></i></button>' +
                '</div></div></div>';
            }).join('') : '<div style="text-align:center;padding:20px;color:var(--gray-400);background:#fff;border-radius:var(--radius);border:1px dashed var(--gray-300)"><i class="fas fa-plus-circle" style="font-size:20px;margin-bottom:8px;display:block"></i>No activities yet. Click "Add Activity" to create one.</div>') +

            '</div>' : '') +
            '</div>';
    }).join('');
}

function toggleWPExpand(wpId) {
    expandedWP = expandedWP === wpId ? null : wpId;
    renderWPList();
}

// ---- WP CRUD ----
function openAddWPModal() {
    if (!requirePremium("add a work package")) return;
    var partners = getCurrentPartners();
    var wps = getCurrentWPs();
    var nextNum = 'WP' + (wps.length + 1);
    var leadOptions = partners.length > 0 ? partners.map(function(p) { return '<option>' + p.name + '</option>'; }).join('') : '<option>No partners added</option>';
    openModal('Add Work Package',
        '<div class="form-row"><div class="form-group"><label class="form-label">WP Number *</label><input type="text" class="form-input" id="awpNum" value="' + nextNum + '"></div>' +
        '<div class="form-group"><label class="form-label">Lead Partner</label><select class="form-select" id="awpLead">' + leadOptions + '</select></div></div>' +
        '<div class="form-group"><label class="form-label">Title *</label><input type="text" class="form-input" id="awpTitle" placeholder="e.g., Research & Needs Analysis"></div>' +
        '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="awpDesc" rows="3" placeholder="Describe the objectives and scope of this work package..."></textarea></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Start (Month)</label><input type="text" class="form-input" id="awpStart" placeholder="M1"></div>' +
        '<div class="form-group"><label class="form-label">End (Month)</label><input type="text" class="form-input" id="awpEnd" placeholder="M24"></div></div>' +
        '<div class="form-group"><label class="form-label">Budget (€)</label><input type="number" class="form-input" id="awpBudget" placeholder="40000"></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddWP()"><i class="fas fa-check"></i> Create WP</button>', true);
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
        status: 'pending', progress: 0, activities: []
    };
    if (!WorkPackages[pid]) WorkPackages[pid] = [];
    addToSubCollection(pid, 'workpackages', data).then(function(result) {
        data._id = result.id;
        WorkPackages[pid].push(data);
        addActivity(pid, 'created work package', number + ': ' + title);
        showToast(number + ' created!', 'success');
        closeModal();
        expandedWP = data._id;
        navigateTo('workpackages');
    });
}

function openEditWPModal(docId) {
    if (!requirePremium("edit work packages")) return;
    var wp = getCurrentWPs().find(function(w) { return w._id === docId; });
    if (!wp) return;
    var partners = getCurrentPartners();
    var leadOptions = partners.length > 0 ? partners.map(function(p) { return '<option' + (wp.lead === p.name ? ' selected' : '') + '>' + p.name + '</option>'; }).join('') : '<option>' + (wp.lead || 'N/A') + '</option>';

    openModal('Edit ' + wp.number + ': ' + wp.title,
        '<div class="form-row"><div class="form-group"><label class="form-label">WP Number</label><input type="text" class="form-input" id="ewpNum" value="' + (wp.number || '') + '"></div>' +
        '<div class="form-group"><label class="form-label">Lead Partner</label><select class="form-select" id="ewpLead">' + leadOptions + '</select></div></div>' +
        '<div class="form-group"><label class="form-label">Title</label><input type="text" class="form-input" id="ewpTitle" value="' + (wp.title || '') + '"></div>' +
        '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="ewpDesc" rows="3">' + (wp.description || '') + '</textarea></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Start</label><input type="text" class="form-input" id="ewpStart" value="' + (wp.start || '') + '"></div>' +
        '<div class="form-group"><label class="form-label">End</label><input type="text" class="form-input" id="ewpEnd" value="' + (wp.end || '') + '"></div></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Budget (€)</label><input type="number" class="form-input" id="ewpBudget" value="' + (wp.budget || 0) + '"></div>' +
        '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="ewpStatus"><option ' + (wp.status === 'pending' ? 'selected' : '') + '>pending</option><option ' + (wp.status === 'active' ? 'selected' : '') + '>active</option><option ' + (wp.status === 'completed' ? 'selected' : '') + '>completed</option></select></div></div>' +
        '<div class="form-group"><label class="form-label">Progress: <strong id="ewpProgVal">' + (wp.progress || 0) + '%</strong></label>' +
        '<input type="range" min="0" max="100" step="5" value="' + (wp.progress || 0) + '" id="ewpProgress" style="width:100%" oninput="document.getElementById(\'ewpProgVal\').textContent=this.value+\'%\'"></div>',
        '<button class="btn btn-danger" onclick="deleteWP(\'' + docId + '\')"><i class="fas fa-trash"></i> Delete</button>' +
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveWPUpdate(\'' + docId + '\')"><i class="fas fa-save"></i> Save</button>', true);
}

function saveWPUpdate(docId) {
    var pid = AppState.currentProjectId;
    var updates = {
        number: document.getElementById('ewpNum').value.trim(),
        title: document.getElementById('ewpTitle').value.trim(),
        lead: document.getElementById('ewpLead').value,
        description: document.getElementById('ewpDesc').value.trim(),
        start: document.getElementById('ewpStart').value.trim(),
        end: document.getElementById('ewpEnd').value.trim(),
        budget: parseInt(document.getElementById('ewpBudget').value) || 0,
        status: document.getElementById('ewpStatus').value,
        progress: parseInt(document.getElementById('ewpProgress').value)
    };
    var wp = getCurrentWPs().find(function(w) { return w._id === docId; });
    if (wp) Object.assign(wp, updates);
    updateInSubCollection(pid, 'workpackages', docId, updates).then(function() {
        showToast('Work package updated', 'success');
        closeModal();
        navigateTo('workpackages');
    });
}

function deleteWP(docId) {
    if (!requirePremium("delete a work package")) return;
    if (!confirm('Delete this work package and all its activities?')) return;
    var pid = AppState.currentProjectId;
    deleteFromSubCollection(pid, 'workpackages', docId).then(function() {
        WorkPackages[pid] = WorkPackages[pid].filter(function(w) { return w._id !== docId; });
        showToast('Work package deleted', 'info');
        closeModal();
        navigateTo('workpackages');
    });
}

// ---- ACTIVITIES within WP ----
function openAddActivityModal(wpId) {
    if (!requirePremium("add activities")) return;
    var wp = getCurrentWPs().find(function(w) { return w._id === wpId; });
    if (!wp) return;
    var activities = wp.activities || [];
    var nextNum = 'A' + (activities.length + 1);
    var partners = getCurrentPartners();
    var respOptions = '<option value="">Select responsible...</option>' + partners.map(function(p) { return '<option>' + (p.contact || p.name) + '</option>'; }).join('');

    openModal('Add Activity to ' + wp.number,
        '<div class="form-row"><div class="form-group"><label class="form-label">Activity Number</label><input type="text" class="form-input" id="actNum" value="' + nextNum + '" readonly></div>' +
        '<div class="form-group"><label class="form-label">Responsible Partner</label><select class="form-select" id="actResp">' + respOptions + '</select></div></div>' +
        '<div class="form-group"><label class="form-label">Activity Title *</label><input type="text" class="form-input" id="actTitle" placeholder="e.g., Desk research on NEETs phenomenon"></div>' +
        '<div class="form-group"><label class="form-label">Objective</label><textarea class="form-textarea" id="actObj" rows="2" placeholder="What is the purpose of this activity?"></textarea></div>' +
        '<div class="form-group"><label class="form-label">Content / Description</label><textarea class="form-textarea" id="actContent" rows="3" placeholder="Detailed description of the activity..."></textarea></div>' +
        '<div class="form-group"><label class="form-label">Deadline</label><input type="date" class="form-input" id="actDeadline"></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="handleAddActivity(\'' + wpId + '\')"><i class="fas fa-check"></i> Add Activity</button>', true);
}

function handleAddActivity(wpId) {
    var title = document.getElementById('actTitle').value.trim();
    if (!title) { alert('Please enter activity title.'); return; }
    var pid = AppState.currentProjectId;
    var wp = getCurrentWPs().find(function(w) { return w._id === wpId; });
    if (!wp) return;

    var activity = {
        number: document.getElementById('actNum').value,
        title: title,
        objective: document.getElementById('actObj').value.trim(),
        content: document.getElementById('actContent').value.trim(),
        responsible: document.getElementById('actResp').value,
        deadline: document.getElementById('actDeadline').value,
        completed: false
    };

    if (!wp.activities) wp.activities = [];
    wp.activities.push(activity);

    updateInSubCollection(pid, 'workpackages', wpId, { activities: wp.activities }).then(function() {
        addActivity(pid, 'added activity to ' + wp.number, activity.title);
        showToast('Activity added!', 'success');
        closeModal();
        expandedWP = wpId;
        renderWPList();
    });
}

function openEditActivityModal(wpId, actIdx) {
    var wp = getCurrentWPs().find(function(w) { return w._id === wpId; });
    if (!wp || !wp.activities || !wp.activities[actIdx]) return;
    var act = wp.activities[actIdx];
    var partners = getCurrentPartners();
    var respOptions = '<option value="">Select responsible...</option>' + partners.map(function(p) { return '<option' + (act.responsible === (p.contact || p.name) ? ' selected' : '') + '>' + (p.contact || p.name) + '</option>'; }).join('');

    openModal('Edit Activity ' + (act.number || 'A' + (actIdx + 1)),
        '<div class="form-group"><label class="form-label">Activity Title</label><input type="text" class="form-input" id="eactTitle" value="' + (act.title || '') + '"></div>' +
        '<div class="form-group"><label class="form-label">Responsible</label><select class="form-select" id="eactResp">' + respOptions + '</select></div>' +
        '<div class="form-group"><label class="form-label">Objective</label><textarea class="form-textarea" id="eactObj" rows="2">' + (act.objective || '') + '</textarea></div>' +
        '<div class="form-group"><label class="form-label">Content / Description</label><textarea class="form-textarea" id="eactContent" rows="3">' + (act.content || '') + '</textarea></div>' +
        '<div class="form-group"><label class="form-label">Deadline</label><input type="date" class="form-input" id="eactDeadline" value="' + (act.deadline || '') + '"></div>',
        '<button class="btn btn-danger" onclick="deleteActivity(\'' + wpId + '\',' + actIdx + ');closeModal()"><i class="fas fa-trash"></i> Delete</button>' +
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveEditActivity(\'' + wpId + '\',' + actIdx + ')"><i class="fas fa-save"></i> Save</button>', true);
}

function saveEditActivity(wpId, actIdx) {
    var pid = AppState.currentProjectId;
    var wp = getCurrentWPs().find(function(w) { return w._id === wpId; });
    if (!wp || !wp.activities || !wp.activities[actIdx]) return;

    wp.activities[actIdx].title = document.getElementById('eactTitle').value.trim();
    wp.activities[actIdx].responsible = document.getElementById('eactResp').value;
    wp.activities[actIdx].objective = document.getElementById('eactObj').value.trim();
    wp.activities[actIdx].content = document.getElementById('eactContent').value.trim();
    wp.activities[actIdx].deadline = document.getElementById('eactDeadline').value;

    updateInSubCollection(pid, 'workpackages', wpId, { activities: wp.activities }).then(function() {
        showToast('Activity updated', 'success');
        closeModal();
        renderWPList();
    });
}

function toggleActivityComplete(wpId, actIdx) {
    var pid = AppState.currentProjectId;
    var wp = getCurrentWPs().find(function(w) { return w._id === wpId; });
    if (!wp || !wp.activities || !wp.activities[actIdx]) return;

    wp.activities[actIdx].completed = !wp.activities[actIdx].completed;
    updateInSubCollection(pid, 'workpackages', wpId, { activities: wp.activities }).then(function() {
        renderWPList();
    });
}

function deleteActivity(wpId, actIdx) {
    if (!confirm('Delete this activity?')) return;
    var pid = AppState.currentProjectId;
    var wp = getCurrentWPs().find(function(w) { return w._id === wpId; });
    if (!wp || !wp.activities) return;

    wp.activities.splice(actIdx, 1);
    updateInSubCollection(pid, 'workpackages', wpId, { activities: wp.activities }).then(function() {
        showToast('Activity deleted', 'info');
        renderWPList();
    });
}
// ---- TASKS (Redesigned) ----
var taskView = 'board';
var taskFilter = { wp: '', assignee: '', priority: '' };

function renderTasks(container) {
    var tasks = getCurrentTasks();
    var pid = AppState.currentProjectId;
    if (!pid) { container.innerHTML = '<div class="empty-state"><p>Select a project first.</p></div>'; return; }

    var total = tasks.length;
    var completedCount = tasks.filter(function(t) { return t.status === 'completed'; }).length;
    var inProgressCount = tasks.filter(function(t) { return t.status === 'in_progress'; }).length;
    var pendingCount = tasks.filter(function(t) { return t.status === 'pending'; }).length;
    var overdueCount = tasks.filter(function(t) { return t.status !== 'completed' && t.due && new Date(t.due) < new Date(); }).length;
    var completionPct = total > 0 ? Math.round(completedCount / total * 100) : 0;

    var filtered = tasks.filter(function(t) {
        if (taskFilter.wp && t.wp !== taskFilter.wp) return false;
        if (taskFilter.assignee && t.assignee !== taskFilter.assignee) return false;
        if (taskFilter.priority && t.priority !== taskFilter.priority) return false;
        return true;
    });

    var wps = getCurrentWPs();
    var assignees = [];
    tasks.forEach(function(t) { if (t.assignee && assignees.indexOf(t.assignee) === -1) assignees.push(t.assignee); });

    container.innerHTML =
        '<div class="page-header"><h1>Tasks</h1><div class="page-header-actions">' +
        '<button class="btn btn-primary" onclick="openAddTaskModal()"><i class="fas fa-plus"></i> Add Task</button></div></div>' +
        '<div class="stats-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px">' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--primary)">' + total + '</div><div style="font-size:11px;color:var(--gray-500)">Total</div></div>' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--warning)">' + pendingCount + '</div><div style="font-size:11px;color:var(--gray-500)">Pending</div></div>' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--accent)">' + inProgressCount + '</div><div style="font-size:11px;color:var(--gray-500)">In Progress</div></div>' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--success)">' + completedCount + '</div><div style="font-size:11px;color:var(--gray-500)">Completed</div></div>' +
        '<div class="stat-card" style="padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:var(--danger)">' + overdueCount + '</div><div style="font-size:11px;color:var(--gray-500)">Overdue</div></div></div>' +
        '<div style="margin-bottom:20px"><div class="progress-label"><span>Completion</span><span>' + completionPct + '%</span></div>' +
        '<div class="progress-bar" style="height:10px"><div class="progress-fill success" style="width:' + completionPct + '%"></div></div></div>' +
        '<div class="card mb-6"><div class="card-body" style="padding:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
        '<span style="font-size:13px;font-weight:600;color:var(--gray-500)"><i class="fas fa-filter"></i> Filter:</span>' +
        '<select class="form-select" style="width:auto;padding:6px 10px;font-size:12px" onchange="taskFilter.wp=this.value;renderTasks(document.getElementById(\'pageContent\'))">' +
        '<option value="">All WPs</option>' + wps.map(function(w) { return '<option value="' + (w.number||'') + '"' + (taskFilter.wp===w.number?' selected':'') + '>' + (w.number||'') + '</option>'; }).join('') + '</select>' +
        '<select class="form-select" style="width:auto;padding:6px 10px;font-size:12px" onchange="taskFilter.assignee=this.value;renderTasks(document.getElementById(\'pageContent\'))">' +
        '<option value="">All Assignees</option>' + assignees.map(function(a) { return '<option' + (taskFilter.assignee===a?' selected':'') + '>' + a + '</option>'; }).join('') + '</select>' +
        '<select class="form-select" style="width:auto;padding:6px 10px;font-size:12px" onchange="taskFilter.priority=this.value;renderTasks(document.getElementById(\'pageContent\'))">' +
        '<option value="">All Priorities</option><option value="high"' + (taskFilter.priority==='high'?' selected':'') + '>High</option><option value="medium"' + (taskFilter.priority==='medium'?' selected':'') + '>Medium</option><option value="low"' + (taskFilter.priority==='low'?' selected':'') + '>Low</option></select>' +
        (taskFilter.wp||taskFilter.assignee||taskFilter.priority ? '<button class="btn btn-sm btn-ghost" onclick="taskFilter={wp:\'\',assignee:\'\',priority:\'\'};renderTasks(document.getElementById(\'pageContent\'))"><i class="fas fa-times"></i> Clear</button>' : '') +
        '<div style="margin-left:auto;display:flex;gap:4px">' +
        '<button class="btn btn-sm ' + (taskView==='board'?'btn-primary':'btn-secondary') + '" onclick="taskView=\'board\';renderTasks(document.getElementById(\'pageContent\'))"><i class="fas fa-columns"></i></button>' +
        '<button class="btn btn-sm ' + (taskView==='list'?'btn-primary':'btn-secondary') + '" onclick="taskView=\'list\';renderTasks(document.getElementById(\'pageContent\'))"><i class="fas fa-list"></i></button>' +
        '<button class="btn btn-sm ' + (taskView==='calendar'?'btn-primary':'btn-secondary') + '" onclick="taskView=\'calendar\';renderTasks(document.getElementById(\'pageContent\'))"><i class="fas fa-calendar"></i></button></div></div></div>' +
        '<div id="taskViewContainer"></div>';
    var vc = document.getElementById('taskViewContainer');
    if (taskView==='board') renderTaskBoard(vc, filtered);
    else if (taskView==='list') renderTaskList(vc, filtered);
    else renderTaskCalendar(vc, filtered);
}

function renderTaskBoard(container, tasks) {
    var p = tasks.filter(function(t){return t.status==='pending';});
    var ip = tasks.filter(function(t){return t.status==='in_progress';});
    var c = tasks.filter(function(t){return t.status==='completed';});
    container.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">' +
        renderTaskColumn('Pending',p,'#f59e0b','fa-clock') +
        renderTaskColumn('In Progress',ip,'#3b82f6','fa-spinner') +
        renderTaskColumn('Completed',c,'#10b981','fa-check-circle') + '</div>';
}

function renderTaskColumn(title, tasks, color, icon) {
    var priorityColors = {high:'#ef4444',medium:'#f59e0b',low:'#10b981'};
    return '<div style="background:var(--gray-50);border-radius:var(--radius-lg);overflow:hidden">' +
    '<div style="background:' + color + ';padding:12px 16px;display:flex;align-items:center;justify-content:space-between">' +
    '<div style="display:flex;align-items:center;gap:8px;color:#fff;font-weight:700;font-size:14px"><i class="fas ' + icon + '"></i> ' + title + '</div>' +
    '<span style="background:rgba(255,255,255,0.3);color:#fff;padding:2px 10px;border-radius:50px;font-size:12px;font-weight:700">' + tasks.length + '</span></div>' +
    '<div style="padding:12px;min-height:100px">' +
    (tasks.length > 0 ? tasks.map(function(t) {
        var isOverdue = t.due && new Date(t.due) < new Date() && t.status !== 'completed';
        return '<div style="background:#fff;border-radius:var(--radius);padding:14px;margin-bottom:10px;border-left:4px solid ' + (priorityColors[t.priority]||'#9ca3af') + ';box-shadow:var(--shadow-sm);cursor:pointer;transition:all 0.15s" ' +
        'onmouseover="this.style.boxShadow=\'var(--shadow-md)\';this.style.transform=\'translateY(-1px)\'" onmouseout="this.style.boxShadow=\'var(--shadow-sm)\';this.style.transform=\'none\'" ' +
        'onclick="openEditTaskModal(\'' + (t._id||'') + '\')">' +
        '<div style="font-size:14px;font-weight:600;color:var(--gray-800);margin-bottom:8px;' + (t.status==='completed'?'text-decoration:line-through;opacity:0.6':'') + '">' + t.title + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">' +
        (t.wp ? '<span style="background:var(--primary-50);color:var(--primary);padding:2px 8px;border-radius:50px;font-size:10px;font-weight:600">' + t.wp + '</span>' : '') +
        '<span style="background:' + (priorityColors[t.priority]||'#eee') + '20;color:' + (priorityColors[t.priority]||'#666') + ';padding:2px 8px;border-radius:50px;font-size:10px;font-weight:600">' + (t.priority||'medium') + '</span>' +
        (isOverdue ? '<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:50px;font-size:10px;font-weight:600"><i class="fas fa-exclamation-triangle"></i> Overdue</span>' : '') + '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
        (t.assignee ? '<div style="display:flex;align-items:center;gap:6px"><div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700">' + (t.assigneeInitials||'?') + '</div><span style="font-size:11px;color:var(--gray-500)">' + t.assignee.split(' ')[0] + '</span></div>' : '<span style="font-size:11px;color:var(--gray-400);font-style:italic">Unassigned</span>') +
        (t.due ? '<span style="font-size:11px;color:' + (isOverdue?'var(--danger)':'var(--gray-400)') + '"><i class="fas fa-calendar-day"></i> ' + formatDate(t.due) + '</span>' : '') + '</div>' +
        '<div style="display:flex;gap:4px;margin-top:10px;border-top:1px solid var(--gray-100);padding-top:8px">' +
        '<button class="btn btn-sm btn-ghost" style="flex:1;padding:4px;font-size:10px;' + (t.status==='pending'?'background:var(--warning-light)':'') + '" onclick="event.stopPropagation();changeTaskStatus(\'' + (t._id||'') + '\',\'pending\')"><i class="fas fa-clock"></i> Todo</button>' +
        '<button class="btn btn-sm btn-ghost" style="flex:1;padding:4px;font-size:10px;' + (t.status==='in_progress'?'background:var(--primary-100)':'') + '" onclick="event.stopPropagation();changeTaskStatus(\'' + (t._id||'') + '\',\'in_progress\')"><i class="fas fa-play"></i> Doing</button>' +
        '<button class="btn btn-sm btn-ghost" style="flex:1;padding:4px;font-size:10px;' + (t.status==='completed'?'background:var(--success-light)':'') + '" onclick="event.stopPropagation();changeTaskStatus(\'' + (t._id||'') + '\',\'completed\')"><i class="fas fa-check"></i> Done</button></div></div>';
    }).join('') : '<div style="text-align:center;padding:30px;color:var(--gray-400)"><i class="fas fa-inbox" style="font-size:24px;margin-bottom:8px;display:block"></i><span style="font-size:13px">No tasks</span></div>') +
    '</div></div>';
}

function renderTaskList(container, tasks) {
    var priorityColors = {high:'#ef4444',medium:'#f59e0b',low:'#10b981'};
    container.innerHTML = '<div class="card"><div class="card-body" style="padding:0"><table class="data-table"><thead><tr><th style="width:30px"></th><th>Task</th><th>WP</th><th>Assignee</th><th>Due</th><th>Priority</th><th>Status</th><th style="width:70px"></th></tr></thead><tbody>' +
    (tasks.length > 0 ? tasks.map(function(t) {
        var isOverdue = t.due && new Date(t.due) < new Date() && t.status !== 'completed';
        return '<tr style="cursor:pointer" onclick="openEditTaskModal(\'' + (t._id||'') + '\')">' +
        '<td><div style="width:12px;height:12px;border-radius:50%;background:' + (priorityColors[t.priority]||'#ccc') + '"></div></td>' +
        '<td style="font-weight:600;' + (t.status==='completed'?'text-decoration:line-through;opacity:0.5':'') + '">' + t.title + '</td>' +
        '<td>' + (t.wp?'<span class="wp-number">'+t.wp+'</span>':'-') + '</td>' +
        '<td>' + (t.assignee?t.assignee.split(' ')[0]:'<span style="color:var(--gray-400)">-</span>') + '</td>' +
        '<td style="' + (isOverdue?'color:var(--danger);font-weight:600':'') + '">' + (t.due?formatDate(t.due):'-') + '</td>' +
        '<td><span style="background:' + (priorityColors[t.priority]||'#eee') + '20;color:' + (priorityColors[t.priority]||'#666') + ';padding:3px 10px;border-radius:50px;font-size:11px;font-weight:600">' + (t.priority||'-') + '</span></td>' +
        '<td><span class="status-badge status-' + (t.status==='in_progress'?'active':t.status==='completed'?'completed':'pending') + '">' + (t.status||'').replace('_',' ') + '</span></td>' +
        '<td onclick="event.stopPropagation()"><button class="btn btn-sm btn-ghost" onclick="openEditTaskModal(\'' + (t._id||'') + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteTask(\'' + (t._id||'') + '\')"><i class="fas fa-trash"></i></button></td></tr>';
    }).join('') : '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--gray-400)">No tasks</td></tr>') +
    '</tbody></table></div></div>';
}

function renderTaskCalendar(container, tasks) {
    var now = new Date();
    var year = now.getFullYear(), month = now.getMonth();
    var firstDay = new Date(year,month,1).getDay();
    var daysInMonth = new Date(year,month+1,0).getDate();
    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var tasksByDate = {};
    tasks.forEach(function(t) {
        if (!t.due) return;
        var d = new Date(t.due);
        if (d.getMonth()===month && d.getFullYear()===year) {
            var day = d.getDate();
            if (!tasksByDate[day]) tasksByDate[day] = [];
            tasksByDate[day].push(t);
        }
    });
    var priorityColors = {high:'#ef4444',medium:'#f59e0b',low:'#10b981'};
    var html = '<div class="card"><div class="card-header"><h2>' + monthNames[month] + ' ' + year + '</h2></div>' +
    '<div class="card-body" style="padding:8px"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center">' +
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(function(d){return '<div style="padding:8px;font-size:11px;font-weight:700;color:var(--gray-400)">'+d+'</div>';}).join('');
    for (var i=0;i<firstDay;i++) html += '<div></div>';
    for (var d=1;d<=daysInMonth;d++) {
        var isToday = d===now.getDate()&&month===now.getMonth();
        var dayTasks = tasksByDate[d]||[];
        html += '<div style="padding:4px;min-height:60px;border:1px solid var(--gray-100);border-radius:var(--radius-sm);' + (isToday?'background:var(--primary-50);border-color:var(--primary)':'') + '">' +
        '<div style="font-size:12px;font-weight:' + (isToday?'800;color:var(--primary)':'500;color:var(--gray-600)') + ';margin-bottom:2px">' + d + '</div>';
        dayTasks.forEach(function(t) {
            html += '<div style="font-size:9px;padding:2px 4px;margin-bottom:1px;border-radius:3px;background:' + (priorityColors[t.priority]||'#eee') + '20;color:' + (priorityColors[t.priority]||'#666') + ';cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="openEditTaskModal(\'' + (t._id||'') + '\')" title="' + t.title + '">' + t.title + '</div>';
        });
        html += '</div>';
    }
    html += '</div></div></div>';
    container.innerHTML = html;
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
    if (!requirePremium("upload files")) return;
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
    if (!requirePremium("create folders")) return;
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
