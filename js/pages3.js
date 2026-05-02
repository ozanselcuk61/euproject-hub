/* ====================================
   EUProject Hub — Page Renderers Part 3
   Budget, Dissemination, Meetings, AI Report, Settings
   ==================================== */

// ---- BUDGET & FINANCE (Redesigned) ----
function renderBudget(container) {
    var project = getCurrentProject();
    var partners = getCurrentPartners();
    var wps = getCurrentWPs();
    var pid = AppState.currentProjectId;
    if (!pid) { container.innerHTML = '<div class="empty-state"><p>Select a project first.</p></div>'; return; }

    var totalBudget = project.totalBudget || 0;
    var wpTotal = wps.reduce(function(s, w) { return s + (w.budget || 0); }, 0);
    var partnerTotal = partners.reduce(function(s, p) { return s + (p.budget || 0); }, 0);
    var totalTransferred = 0;
    var transfers = project.transfers || [];
    transfers.forEach(function(t) { if (t.status === 'completed') totalTransferred += (t.amount || 0); });
    var unallocatedWP = totalBudget - wpTotal;
    var wp1Budget = 0;
    wps.forEach(function(w) { if ((w.number || '').indexOf('1') >= 0 && (w.number || '').indexOf('WP') >= 0) wp1Budget = w.budget || 0; });
    var wp1Pct = totalBudget > 0 ? Math.round(wp1Budget / totalBudget * 100) : 0;

    container.innerHTML =
        '<div class="page-header"><h1>Budget & Finance</h1><div class="page-header-actions">' +
        '<button class="btn btn-secondary" onclick="exportProjectData(\'csv\')"><i class="fas fa-download"></i> Export</button>' +
        '<button class="btn btn-primary" onclick="openTransferModal()"><i class="fas fa-exchange-alt"></i> Record Transfer</button></div></div>' +

        // Summary cards
        '<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">' +
        '<div class="stat-card" style="padding:20px;text-align:center;border-top:3px solid var(--primary)">' +
        '<div style="font-size:28px;font-weight:800;color:var(--primary)">' + formatCurrency(totalBudget) + '</div>' +
        '<div style="font-size:12px;color:var(--gray-500)">Total Grant (Lump Sum)</div></div>' +
        '<div class="stat-card" style="padding:20px;text-align:center;border-top:3px solid var(--success)">' +
        '<div style="font-size:28px;font-weight:800;color:var(--success)">' + formatCurrency(wpTotal) + '</div>' +
        '<div style="font-size:12px;color:var(--gray-500)">Allocated to WPs</div></div>' +
        '<div class="stat-card" style="padding:20px;text-align:center;border-top:3px solid var(--accent)">' +
        '<div style="font-size:28px;font-weight:800;color:var(--accent)">' + formatCurrency(totalTransferred) + '</div>' +
        '<div style="font-size:12px;color:var(--gray-500)">Transferred to Partners</div></div>' +
        '<div class="stat-card" style="padding:20px;text-align:center;border-top:3px solid ' + (unallocatedWP < 0 ? 'var(--danger)' : 'var(--warning)') + '">' +
        '<div style="font-size:28px;font-weight:800;color:' + (unallocatedWP < 0 ? 'var(--danger)' : 'var(--warning)') + '">' + formatCurrency(Math.abs(unallocatedWP)) + '</div>' +
        '<div style="font-size:12px;color:var(--gray-500)">' + (unallocatedWP < 0 ? 'Over-allocated!' : 'Unallocated') + '</div></div></div>' +

        // Warnings
        (wp1Pct > 20 ? '<div style="background:var(--warning-light);border:1px solid var(--warning);border-radius:var(--radius);padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:10px"><i class="fas fa-exclamation-triangle" style="color:var(--warning);font-size:18px"></i><div><strong style="font-size:13px">WP1 Management Budget Warning</strong><br><span style="font-size:12px;color:var(--gray-600)">WP1 is ' + wp1Pct + '% of total budget. EU guidelines recommend max 20% for project management.</span></div></div>' : '') +
        (unallocatedWP < 0 ? '<div style="background:var(--danger-light);border:1px solid var(--danger);border-radius:var(--radius);padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:10px"><i class="fas fa-exclamation-circle" style="color:var(--danger);font-size:18px"></i><div><strong style="font-size:13px">Budget Over-allocated</strong><br><span style="font-size:12px;color:var(--gray-600)">WP budgets exceed total grant by ' + formatCurrency(Math.abs(unallocatedWP)) + '. Please adjust.</span></div></div>' : '') +

        // Visual budget bar
        '<div class="card mb-6"><div class="card-header"><h2><i class="fas fa-chart-bar"></i> Budget Distribution</h2></div><div class="card-body">' +
        '<div style="display:flex;height:40px;border-radius:var(--radius);overflow:hidden;margin-bottom:16px">' +
        (function() {
            var colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6'];
            return wps.map(function(w, i) {
                var pct = totalBudget > 0 ? (w.budget || 0) / totalBudget * 100 : 0;
                return pct > 0 ? '<div style="width:' + pct + '%;background:' + colors[i % colors.length] + ';display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;min-width:20px" title="' + (w.number || '') + ': ' + formatCurrency(w.budget) + ' (' + Math.round(pct) + '%)">' + (pct > 5 ? (w.number || '') : '') + '</div>' : '';
            }).join('');
        })() +
        (unallocatedWP > 0 ? '<div style="width:' + (unallocatedWP / totalBudget * 100) + '%;background:var(--gray-200);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--gray-500)">Unallocated</div>' : '') +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
        (function() {
            var colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6'];
            return wps.map(function(w, i) {
                return '<div style="display:flex;align-items:center;gap:6px;font-size:12px"><span style="width:10px;height:10px;border-radius:2px;background:' + colors[i % colors.length] + '"></span>' + (w.number || '') + ': ' + formatCurrency(w.budget) + ' (' + (totalBudget > 0 ? Math.round((w.budget || 0) / totalBudget * 100) : 0) + '%)</div>';
            }).join('');
        })() +
        '</div></div></div>' +

        // WP Budget table
        '<div class="content-grid-equal mb-6">' +
        '<div class="card"><div class="card-header"><h2><i class="fas fa-cubes"></i> Budget per Work Package</h2></div>' +
        '<div class="card-body" style="padding:0"><table class="data-table">' +
        '<thead><tr><th>WP</th><th>Title</th><th>Allocated</th><th>% of Total</th><th>Completion</th><th>Payment</th></tr></thead><tbody>' +
        (wps.length > 0 ? wps.map(function(w) {
            var pct = totalBudget > 0 ? Math.round((w.budget || 0) / totalBudget * 100) : 0;
            return '<tr><td><span class="wp-number">' + (w.number || '') + '</span></td>' +
            '<td style="font-size:13px">' + w.title + '</td>' +
            '<td style="font-weight:700">' + formatCurrency(w.budget) + '</td>' +
            '<td>' + pct + '%</td>' +
            '<td><div style="display:flex;align-items:center;gap:6px"><div class="progress-bar" style="flex:1;height:6px"><div class="progress-fill ' + (w.progress === 100 ? 'success' : '') + '" style="width:' + (w.progress || 0) + '%"></div></div><span style="font-size:11px;font-weight:600">' + (w.progress || 0) + '%</span></div></td>' +
            '<td>' + (w.progress === 100 ? '<span class="status-badge status-completed">Released</span>' : '<span class="status-badge status-pending">Pending</span>') + '</td></tr>';
        }).join('') : '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--gray-400)">No work packages</td></tr>') +
        '</tbody>' +
        '<tfoot><tr style="background:var(--gray-50);font-weight:700"><td colspan="2">Total</td><td>' + formatCurrency(wpTotal) + '</td><td>' + (totalBudget > 0 ? Math.round(wpTotal / totalBudget * 100) : 0) + '%</td><td colspan="2"></td></tr></tfoot>' +
        '</table></div></div>' +

        // Partner budget table
        '<div class="card"><div class="card-header"><h2><i class="fas fa-users"></i> Budget per Partner</h2></div>' +
        '<div class="card-body" style="padding:0"><table class="data-table">' +
        '<thead><tr><th>Partner</th><th>Allocated</th><th>Transferred</th><th>Remaining</th><th>%</th></tr></thead><tbody>' +
        (partners.length > 0 ? partners.map(function(p) {
            var transferred = 0;
            transfers.forEach(function(t) { if (t.partner === p.name && t.status === 'completed') transferred += (t.amount || 0); });
            var remaining = (p.budget || 0) - transferred;
            var pct = (p.budget || 0) > 0 ? Math.round(transferred / p.budget * 100) : 0;
            return '<tr><td><div style="display:flex;align-items:center;gap:8px"><div class="task-assignee-avatar">' + (p.initials || 'P') + '</div><div><div style="font-weight:600;font-size:13px">' + p.name + '</div><div style="font-size:11px;color:var(--gray-400)">' + (p.country || '') + ' · ' + (p.role || '') + '</div></div></div></td>' +
            '<td style="font-weight:700">' + formatCurrency(p.budget) + '</td>' +
            '<td style="color:var(--success);font-weight:600">' + formatCurrency(transferred) + '</td>' +
            '<td style="color:' + (remaining > 0 ? 'var(--warning)' : 'var(--success)') + ';font-weight:600">' + formatCurrency(remaining) + '</td>' +
            '<td><div style="display:flex;align-items:center;gap:6px"><div class="progress-bar" style="flex:1;height:6px"><div class="progress-fill" style="width:' + pct + '%"></div></div><span style="font-size:11px;font-weight:600">' + pct + '%</span></div></td></tr>';
        }).join('') : '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--gray-400)">No partners</td></tr>') +
        '</tbody>' +
        '<tfoot><tr style="background:var(--gray-50);font-weight:700"><td>Total</td><td>' + formatCurrency(partnerTotal) + '</td><td style="color:var(--success)">' + formatCurrency(totalTransferred) + '</td><td>' + formatCurrency(partnerTotal - totalTransferred) + '</td><td></td></tr></tfoot>' +
        '</table></div></div></div>' +

        // Transfers
        '<div class="card"><div class="card-header"><h2><i class="fas fa-exchange-alt"></i> Transfer History</h2>' +
        '<button class="btn btn-sm btn-primary" onclick="openTransferModal()"><i class="fas fa-plus"></i> New Transfer</button></div>' +
        '<div class="card-body" style="padding:0">' +
        (transfers.length > 0 ? '<table class="data-table"><thead><tr><th>Date</th><th>Partner</th><th>Amount</th><th>Type</th><th>Status</th><th>Notes</th><th></th></tr></thead><tbody>' +
        transfers.map(function(t, i) {
            return '<tr>' +
            '<td>' + formatDate(t.date) + '</td>' +
            '<td style="font-weight:500">' + (t.partner || '') + '</td>' +
            '<td style="font-weight:700;color:var(--primary)">' + formatCurrency(t.amount) + '</td>' +
            '<td><span class="status-badge ' + (t.type === 'Pre-financing' ? 'status-pending' : t.type === 'Final payment' ? 'status-completed' : 'status-active') + '">' + (t.type || '') + '</span></td>' +
            '<td><span class="status-badge status-' + (t.status === 'completed' ? 'completed' : 'pending') + '">' + (t.status || 'pending') + '</span></td>' +
            '<td style="font-size:12px;color:var(--gray-500)">' + (t.notes || '-') + '</td>' +
            '<td style="white-space:nowrap">' +
            '<button class="btn btn-sm btn-ghost" onclick="toggleTransferStatus(' + i + ')"><i class="fas ' + (t.status === 'completed' ? 'fa-undo' : 'fa-check') + '"></i></button>' +
            '<button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteTransfer(' + i + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }).join('') + '</tbody></table>' :
        '<div style="text-align:center;padding:40px;color:var(--gray-400)"><i class="fas fa-exchange-alt" style="font-size:24px;margin-bottom:8px;display:block"></i>No transfers recorded yet.<br>Click "Record Transfer" to add one.</div>') +
        '</div></div>';
}

function openTransferModal() {
    if (!requirePremium("record transfers")) return;
    var partners = getCurrentPartners();
    if (partners.length === 0) { showToast('Add partners first', 'error'); return; }
    openModal('Record Partner Transfer',
        '<div class="form-group"><label class="form-label">Partner *</label><select class="form-select" id="trPartner">' +
        partners.map(function(p) { return '<option>' + p.name + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Amount (€) *</label><input type="number" class="form-input" id="trAmount" placeholder="10000"></div>' +
        '<div class="form-group"><label class="form-label">Transfer Date *</label><input type="date" class="form-input" id="trDate" value="' + new Date().toISOString().split('T')[0] + '"></div></div>' +
        '<div class="form-row"><div class="form-group"><label class="form-label">Type</label><select class="form-select" id="trType">' +
        '<option>Pre-financing</option><option>Interim payment</option><option>Final payment</option></select></div>' +
        '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="trStatus">' +
        '<option value="completed">Completed</option><option value="pending">Pending</option></select></div></div>' +
        '<div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="trNotes" rows="2" placeholder="Bank reference, invoice number..."></textarea></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="handleAddTransfer()"><i class="fas fa-check"></i> Save Transfer</button>');
}

function handleAddTransfer() {
    var amount = parseInt(document.getElementById('trAmount').value);
    if (!amount) { alert('Please enter amount.'); return; }
    var pid = AppState.currentProjectId;
    var project = getCurrentProject();
    var transfer = {
        partner: document.getElementById('trPartner').value,
        amount: amount,
        date: document.getElementById('trDate').value,
        type: document.getElementById('trType').value,
        status: document.getElementById('trStatus').value,
        notes: document.getElementById('trNotes').value.trim()
    };
    if (!project.transfers) project.transfers = [];
    project.transfers.push(transfer);
    saveProjectToFirestore(pid, { transfers: project.transfers }).then(function() {
        addActivity(pid, 'recorded transfer to', transfer.partner + ': ' + formatCurrency(amount));
        showToast('Transfer recorded!', 'success');
        closeModal();
        navigateTo('budget');
    });
}

function toggleTransferStatus(index) {
    var pid = AppState.currentProjectId;
    var project = getCurrentProject();
    if (!project.transfers || !project.transfers[index]) return;
    project.transfers[index].status = project.transfers[index].status === 'completed' ? 'pending' : 'completed';
    saveProjectToFirestore(pid, { transfers: project.transfers }).then(function() {
        navigateTo('budget');
    });
}

function deleteTransfer(index) {
    if (!confirm('Delete this transfer record?')) return;
    var pid = AppState.currentProjectId;
    var project = getCurrentProject();
    if (!project.transfers) return;
    project.transfers.splice(index, 1);
    saveProjectToFirestore(pid, { transfers: project.transfers }).then(function() {
        showToast('Transfer deleted', 'info');
        navigateTo('budget');
    });
}

// ---- DISSEMINATION ----
function renderDissemination(container) {
    const diss = getCurrentDissemination();
    container.innerHTML = `
        <div class="page-header">
            <h1>Dissemination & Communication</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openAddDisseminationModal()"><i class="fas fa-plus"></i> Log Activity</button>
            </div>
        </div>

        <div class="dissemination-stats">
            <div class="diss-stat">
                <div class="diss-stat-value">${diss.summary.events || 0}</div>
                <div class="diss-stat-label">Events</div>
            </div>
            <div class="diss-stat">
                <div class="diss-stat-value">${diss.summary.publications || 0}</div>
                <div class="diss-stat-label">Publications</div>
            </div>
            <div class="diss-stat">
                <div class="diss-stat-value">${(diss.summary.socialReach || 0).toLocaleString()}</div>
                <div class="diss-stat-label">Social Media Reach</div>
            </div>
            <div class="diss-stat">
                <div class="diss-stat-value">${(diss.summary.website_visits || 0).toLocaleString()}</div>
                <div class="diss-stat-label">Website Visits</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h2>Dissemination Activities</h2></div>
            <div class="card-body" style="padding:0">
                <table class="data-table">
                    <thead><tr><th>Date</th><th>Type</th><th>Activity</th><th>Partner</th><th>Reach</th></tr></thead>
                    <tbody>
                        ${(diss.activities || []).map(a => `<tr>
                            <td>${formatDate(a.date)}</td>
                            <td><span class="status-badge ${a.type==='Event'?'status-active':a.type==='Publication'?'status-completed':a.type==='Social Media'?'status-pending':'status-draft'}">${a.type}</span></td>
                            <td style="font-weight:500">${a.title}</td>
                            <td style="font-size:13px">${(a.partner || '').split(' ').slice(-1)[0]}</td>
                            <td style="font-weight:600">${(a.reach || 0).toLocaleString()}</td>
                            <td style="white-space:nowrap">
                                <button class="btn btn-sm btn-ghost" style="padding:2px 6px" onclick="openEditDissActivity('${a._id || ''}')"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-ghost" style="color:var(--danger);padding:2px 6px" onclick="deleteDissActivity('${a._id || ''}')"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function getDissFormHTML(a) {
    var isEdit = !!a;
    a = a || {};
    var partners = getCurrentPartners();
    return '<div class="form-row">' +
        '<div class="form-group"><label class="form-label">Type</label><select class="form-select" id="dissType">' +
        ['Event','Publication','Social Media','Newsletter','Website','Press Release','Multiplier Event'].map(function(t) {
            return '<option' + (a.type === t ? ' selected' : '') + '>' + t + '</option>';
        }).join('') + '</select></div>' +
        '<div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="dissDate" value="' + (a.date || '') + '"></div></div>' +
        '<div class="form-group"><label class="form-label">Title / Description</label><input type="text" class="form-input" id="dissTitle" placeholder="Activity title" value="' + (a.title || '') + '"></div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label class="form-label">Partner</label><select class="form-select" id="dissPartner">' +
        (partners.length > 0 ? partners.map(function(p) { return '<option' + (a.partner === p.name ? ' selected' : '') + '>' + p.name + '</option>'; }).join('') : '<option>N/A</option>') +
        '</select></div>' +
        '<div class="form-group"><label class="form-label">Estimated Reach</label><input type="number" class="form-input" id="dissReach" placeholder="500" value="' + (a.reach || '') + '"></div>';
}

function openAddDisseminationModal() {
    if (!requirePremium("log dissemination")) return;
    openModal('Log Dissemination Activity',
        getDissFormHTML() + '</div>' +
        '<div class="form-group"><label class="form-label">Link (optional)</label><input type="url" class="form-input" id="dissLink" placeholder="https://..."></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddDissActivity()"><i class="fas fa-check"></i> Save Activity</button>');
}

function handleAddDissActivity() {
    var title = document.getElementById('dissTitle').value.trim();
    if (!title) { alert('Please enter activity title.'); return; }
    var pid = AppState.currentProjectId;
    var data = {
        type: document.getElementById('dissType').value,
        date: document.getElementById('dissDate').value,
        title: title,
        partner: document.getElementById('dissPartner').value,
        reach: parseInt(document.getElementById('dissReach').value) || 0,
        link: document.getElementById('dissLink') ? document.getElementById('dissLink').value : ''
    };
    if (!Dissemination[pid]) Dissemination[pid] = { summary: { events: 0, publications: 0, socialReach: 0, website_visits: 0 }, activities: [] };
    addToSubCollection(pid, 'dissemination', data).then(function(result) {
        data._id = result.id;
        Dissemination[pid].activities.push(data);
        if (data.type === 'Event') Dissemination[pid].summary.events++;
        if (data.type === 'Publication') Dissemination[pid].summary.publications++;
        Dissemination[pid].summary.socialReach += data.reach;
        addActivity(pid, 'logged dissemination', data.title);
        showToast('Activity logged!', 'success');
        closeModal();
        navigateTo('dissemination');
    });
}

function openEditDissActivity(docId) {
    var pid = AppState.currentProjectId;
    var diss = getCurrentDissemination();
    var a = (diss.activities || []).find(function(act) { return act._id === docId; });
    if (!a) return;
    openModal('Edit Dissemination Activity',
        getDissFormHTML(a) + '</div>' +
        '<div class="form-group"><label class="form-label">Link (optional)</label><input type="url" class="form-input" id="dissLink" placeholder="https://..." value="' + (a.link || '') + '"></div>',
        '<button class="btn btn-danger" onclick="deleteDissActivity(\'' + docId + '\');closeModal()"><i class="fas fa-trash"></i> Delete</button>' +
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveEditDissActivity(\'' + docId + '\')"><i class="fas fa-save"></i> Save</button>');
}

function saveEditDissActivity(docId) {
    var pid = AppState.currentProjectId;
    var updates = {
        type: document.getElementById('dissType').value,
        date: document.getElementById('dissDate').value,
        title: document.getElementById('dissTitle').value.trim(),
        partner: document.getElementById('dissPartner').value,
        reach: parseInt(document.getElementById('dissReach').value) || 0,
        link: document.getElementById('dissLink') ? document.getElementById('dissLink').value : ''
    };
    var diss = getCurrentDissemination();
    var a = (diss.activities || []).find(function(act) { return act._id === docId; });
    if (a) Object.assign(a, updates);
    updateInSubCollection(pid, 'dissemination', docId, updates).then(function() {
        showToast('Activity updated', 'success');
        closeModal();
        navigateTo('dissemination');
    });
}

function deleteDissActivity(docId) {
    if (!docId || !confirm('Delete this activity?')) return;
    var pid = AppState.currentProjectId;
    deleteFromSubCollection(pid, 'dissemination', docId).then(function() {
        var diss = Dissemination[pid];
        if (diss) diss.activities = diss.activities.filter(function(a) { return a._id !== docId; });
        showToast('Activity deleted', 'info');
        navigateTo('dissemination');
    });
}

// ---- MEETINGS & TPMs ----
function renderMeetings(container) {
    const meetings = getCurrentMeetings();
    container.innerHTML = `
        <div class="page-header">
            <h1>Meetings & TPMs</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openAddMeetingModal()"><i class="fas fa-plus"></i> Plan Meeting</button>
            </div>
        </div>

        <div class="tabs" id="meetingTabs">
            <button class="tab-btn active">All Meetings (${meetings.length})</button>
            <button class="tab-btn">TPMs (${meetings.filter(m=>m.type==='TPM').length})</button>
            <button class="tab-btn">Online (${meetings.filter(m=>m.type==='online').length})</button>
        </div>

        ${meetings.map(m => `
            <div class="meeting-card">
                <div class="meeting-header">
                    <div>
                        <span class="status-badge ${m.status==='completed'?'status-completed':'status-active'}">${m.status}</span>
                        <span class="status-badge ${m.type==='TPM'?'status-pending':'status-draft'}" style="margin-left:4px">${m.type}</span>
                    </div>
                    <div class="meeting-date"><i class="fas fa-calendar"></i> ${formatDate(m.date)}</div>
                </div>
                <h3>${m.title}</h3>
                <div class="meeting-location"><i class="fas fa-map-marker-alt"></i> ${m.location}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
                    <div class="meeting-attendees">
                        ${m.attendees.map(a => `<div class="user-avatar">${a}</div>`).join('')}
                        <span style="font-size:12px;color:var(--gray-400);margin-left:8px">${m.attendees.length} attendees</span>
                    </div>
                    <div style="display:flex;gap:4px">
                        <button class="btn btn-sm btn-ghost" onclick="openMeetingDetail('${m._id || m.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteMeeting('${m._id || ''}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('')}
    `;
}

function deleteMeeting(docId) {
    if (!docId || !confirm('Delete this meeting?')) return;
    var pid = AppState.currentProjectId;
    deleteFromSubCollection(pid, 'meetings', docId).then(function() {
        Meetings[pid] = (Meetings[pid] || []).filter(function(m) { return m._id !== docId; });
        showToast('Meeting deleted', 'info');
        navigateTo('meetings');
    });
}

function openMeetingDetail(meetingId) {
    var m = getCurrentMeetings().find(function(mt) { return (mt._id || mt.id) == meetingId; });
    if (!m) return;
    openModal(m.title, `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Date</strong><br>${formatDate(m.date)}</div>
            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Location</strong><br>${m.location}</div>
            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Type</strong><br>${m.type}</div>
            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Status</strong><br><span class="status-badge status-${m.status==='completed'?'completed':'active'}">${m.status}</span></div>
        </div>
        <h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Agenda</h3>
        <ol style="padding-left:20px;margin-bottom:16px">
            ${m.agenda.map(a => `<li style="padding:4px 0;font-size:14px;color:var(--gray-600)">${a}</li>`).join('')}
        </ol>
        <h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Attendees</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${m.attendees.map(a => `<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--gray-50);border-radius:50px"><div class="user-avatar" style="width:24px;height:24px;font-size:10px">${a}</div><span style="font-size:12px">${a}</span></div>`).join('')}
        </div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`, true);
}

function openAddMeetingModal() {
    openModal('Plan New Meeting', `
        <div class="form-group"><label class="form-label">Meeting Title</label><input type="text" class="form-input" placeholder="e.g., 4th TPM in Helsinki"></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Type</label><select class="form-select"><option>TPM (Transnational)</option><option>Online Meeting</option><option>Workshop</option><option>Multiplier Event</option></select></div>
            <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input"></div>
        </div>
        <div class="form-group"><label class="form-label">Location</label><input type="text" class="form-input" placeholder="City, Country or Online (Zoom)"></div>
        <div class="form-group"><label class="form-label">Agenda Items</label><textarea class="form-textarea" rows="4" placeholder="One item per line..."></textarea></div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="fas fa-check"></i> Create Meeting</button>`);
}

// ---- AI REPORT GENERATOR ----
function renderAIReport(container) {
    const project = getCurrentProject();
    container.innerHTML = `
        <div class="page-header">
            <h1>AI Report Generator</h1>
        </div>
        <div class="ai-report-container">
            <div class="card mb-6">
                <div class="card-header">
                    <h2><i class="fas fa-robot"></i> Generate Final Report</h2>
                </div>
                <div class="card-body">
                    <p style="color:var(--gray-600);margin-bottom:20px">Select which sections to include in your AI-generated final report for <strong>${project.name}</strong>. The AI will analyze your project data to compile a comprehensive report following EU guidelines.</p>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
                        ${[
                            {id:'exec', label:'Executive Summary', icon:'fa-file-alt', checked: true},
                            {id:'wp', label:'Work Package Progress', icon:'fa-cubes', checked: true},
                            {id:'budget', label:'Budget Execution Summary', icon:'fa-euro-sign', checked: true},
                            {id:'partner', label:'Partner Contributions', icon:'fa-users', checked: true},
                            {id:'diss', label:'Dissemination & Impact', icon:'fa-bullhorn', checked: true},
                            {id:'quality', label:'Quality Assurance', icon:'fa-shield-alt', checked: false},
                            {id:'challenges', label:'Challenges & Mitigations', icon:'fa-exclamation-triangle', checked: true},
                            {id:'next', label:'Next Steps & Sustainability', icon:'fa-arrow-right', checked: false}
                        ].map(s => `
                            <label style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--gray-50);border-radius:var(--radius);cursor:pointer;border:1px solid var(--gray-200)">
                                <input type="checkbox" ${s.checked ? 'checked' : ''} style="width:16px;height:16px">
                                <i class="fas ${s.icon}" style="color:var(--primary);width:16px"></i>
                                <span style="font-size:14px;font-weight:500">${s.label}</span>
                            </label>
                        `).join('')}
                    </div>

                    <div class="form-row mb-6">
                        <div class="form-group">
                            <label class="form-label">Report Period</label>
                            <select class="form-select">
                                <option>Full project (${project.startDate} to present)</option>
                                <option>Last 12 months</option>
                                <option>Last 6 months</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Language</label>
                            <select class="form-select">
                                <option>English</option>
                                <option>French</option>
                                <option>German</option>
                                <option>Spanish</option>
                            </select>
                        </div>
                    </div>

                    <div style="display:flex;gap:12px">
                        <button class="btn btn-primary btn-lg" onclick="generateAIReport()"><i class="fas fa-magic"></i> Generate Report</button>
                        <button class="btn btn-secondary btn-lg"><i class="fas fa-history"></i> Previous Reports</button>
                    </div>
                </div>
            </div>
            <div id="aiReportOutput"></div>
        </div>
    `;
}

function generateAIReport() {
    if (!requirePremium("generate AI reports")) return;
    var output = document.getElementById('aiReportOutput');
    var project = getCurrentProject();
    var partners = getCurrentPartners();
    var wps = getCurrentWPs();
    var tasks = getCurrentTasks();
    var diss = getCurrentDissemination();

    // Get selected sections
    var checkboxes = document.querySelectorAll('.ai-report-container input[type="checkbox"]');
    var sectionLabels = ['Executive Summary','Work Package Progress','Budget Execution Summary','Partner Contributions','Dissemination & Impact','Quality Assurance','Challenges & Mitigations','Next Steps & Sustainability'];
    var selectedSections = [];
    checkboxes.forEach(function(cb, i) { if (cb.checked) selectedSections.push(sectionLabels[i]); });

    var langSelect = document.querySelectorAll('.ai-report-container .form-select');
    var language = langSelect.length > 1 ? langSelect[1].value : 'English';

    output.innerHTML = '<div class="card"><div class="card-header" style="background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff">' +
        '<h2 style="color:#fff"><i class="fas fa-robot"></i> AI Report Generator</h2></div>' +
        '<div class="card-body"><div class="ai-generating" id="aiLoading">' +
        '<div class="spinner"></div><h3 style="color:var(--gray-800)">Generating your report with AI...</h3>' +
        '<p style="color:var(--gray-500)">Claude is analyzing your project data and writing the report. This may take 30-60 seconds.</p>' +
        '<div id="aiProgressSteps" style="margin-top:20px;text-align:left;max-width:400px;margin-left:auto;margin-right:auto"></div></div>' +
        '<div id="aiReportContent" class="hidden ai-report-output"></div></div></div>';

    // Show progress animation
    var steps = ['Sending project data to AI...', 'Analyzing work packages...', 'Reviewing partner contributions...', 'Compiling dissemination metrics...', 'Writing report narrative...'];
    var stepIdx = 0;
    var stepsContainer = document.getElementById('aiProgressSteps');
    var stepInterval = setInterval(function() {
        if (stepIdx < steps.length) {
            stepsContainer.innerHTML += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;color:var(--success)"><i class="fas fa-check-circle"></i> ' + steps[stepIdx] + '</div>';
            stepIdx++;
        }
    }, 3000);

    // Prepare project data for the Cloud Function
    var projectData = {
        id: project.id, name: project.name, programme: project.programme,
        projectNumber: project.projectNumber, startDate: project.startDate,
        endDate: project.endDate, duration: project.duration,
        totalBudget: project.totalBudget, coordinator: project.coordinator,
        coordinatorCountry: project.coordinatorCountry, description: project.description,
        partners: partners, workPackages: wps, tasks: tasks, dissemination: diss
    };

    // Call Cloud Function
    var apiUrl = 'https://us-central1-euproject-hub.cloudfunctions.net/generateReport';
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: AppState.currentUser.id,
            projectData: projectData,
            sections: selectedSections,
            language: language
        })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        clearInterval(stepInterval);
        document.getElementById('aiLoading').classList.add('hidden');
        var reportContent = document.getElementById('aiReportContent');
        reportContent.classList.remove('hidden');

        if (data.success && data.content) {
            reportContent.innerHTML = formatAIReport(data.content, project);
            addActivity(project.id, 'generated AI report for', project.name);
            showToast('Report generated successfully!', 'success');
        } else {
            // Fallback to local generation
            reportContent.innerHTML = generateLocalReport(project, partners, wps, diss, tasks);
            showToast('Generated with local engine (Cloud Function unavailable)', 'info');
        }
    })
    .catch(function(error) {
        console.error('AI Report error:', error);
        clearInterval(stepInterval);
        document.getElementById('aiLoading').classList.add('hidden');
        var reportContent = document.getElementById('aiReportContent');
        reportContent.classList.remove('hidden');
        // Fallback to local generation
        reportContent.innerHTML = generateLocalReport(project, partners, wps, diss, tasks);
        showToast('Generated with local engine (Cloud not available yet)', 'info');
    });
}

function formatAIReport(markdownContent, project) {
    // Simple markdown to HTML conversion
    var html = markdownContent
        .replace(/## (.*)/g, '<h3>$1</h3>')
        .replace(/# (.*)/g, '<h2>$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    return '<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:20px">' +
        '<button class="btn btn-sm btn-secondary" onclick="copyReport()"><i class="fas fa-copy"></i> Copy</button>' +
        '<button class="btn btn-sm btn-primary" onclick="exportReportPDF()"><i class="fas fa-file-pdf"></i> Export PDF</button></div>' +
        '<p>' + html + '</p>' +
        '<hr style="margin:24px 0;border:none;border-top:1px solid var(--gray-200)">' +
        '<p style="font-size:12px;color:var(--gray-400)"><em>Generated by EUProject Hub AI (Claude) on ' + new Date().toLocaleDateString('en-GB') + '. Review and edit before submission.</em></p>';
}

function copyReport() {
    var content = document.getElementById('aiReportContent');
    if (content) {
        navigator.clipboard.writeText(content.innerText).then(function() {
            showToast('Report copied to clipboard!', 'success');
        });
    }
}

function generateLocalReport(project, partners, wps, diss, tasks) {
    var progress = getProjectProgress();
    var totalSpent = partners.reduce(function(s, p) { return s + (p.spent || 0); }, 0);
    var countries = []; partners.forEach(function(p) { if (p.country && countries.indexOf(p.country) === -1) countries.push(p.country); });

    return '<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:20px">' +
        '<button class="btn btn-sm btn-secondary" onclick="copyReport()"><i class="fas fa-copy"></i> Copy</button>' +
        '<button class="btn btn-sm btn-primary" onclick="exportReportPDF()"><i class="fas fa-file-pdf"></i> Export PDF</button></div>' +
        '<h3>Final Report: ' + project.name + '</h3>' +
        '<p><em>' + (project.programme || '') + ' | Project No: ' + (project.projectNumber || 'N/A') + '</em></p>' +
        '<h3>1. Executive Summary</h3>' +
        '<p>The ' + project.name + ' project has made significant progress since its launch in ' + formatDate(project.startDate) + '. Overall completion stands at <strong>' + progress + '%</strong>, with ' + wps.filter(function(w) { return w.status === 'completed'; }).length + ' out of ' + wps.length + ' work packages completed.</p>' +
        '<p>The consortium comprises ' + partners.length + ' organizations across ' + countries.length + ' countries, with a total lump-sum grant of ' + formatCurrency(project.totalBudget) + '.</p>' +
        '<h3>2. Work Package Progress</h3>' +
        wps.map(function(wp) {
            return '<p><strong>' + (wp.number || '') + ': ' + wp.title + '</strong> — Progress: ' + (wp.progress || 0) + '%, Lead: ' + (wp.lead || 'N/A') + ', Budget: ' + formatCurrency(wp.budget) + '</p>' +
            '<p>' + (wp.description || '') + '</p>';
        }).join('') +
        '<h3>3. Budget Execution</h3>' +
        '<p>Total grant: ' + formatCurrency(project.totalBudget) + ' (lump-sum model). Utilization: ' + formatCurrency(totalSpent) + ' (' + (project.totalBudget ? Math.round(totalSpent / project.totalBudget * 100) : 0) + '%).</p>' +
        '<h3>4. Partners</h3>' +
        partners.map(function(p) { return '<p><strong>' + p.name + '</strong> (' + (p.country || '') + ', ' + (p.role || 'partner') + ') — Budget: ' + formatCurrency(p.budget) + '</p>'; }).join('') +
        '<h3>5. Dissemination</h3>' +
        '<p>Events: ' + (diss.summary?.events || 0) + ', Publications: ' + (diss.summary?.publications || 0) + ', Social reach: ' + (diss.summary?.socialReach || 0) + '</p>' +
        '<hr style="margin:24px 0;border:none;border-top:1px solid var(--gray-200)">' +
        '<p style="font-size:12px;color:var(--gray-400)"><em>Local report — deploy Cloud Functions for AI-powered reports. Generated on ' + new Date().toLocaleDateString('en-GB') + '.</em></p>';
}

// Old generateReportHTML removed — replaced by generateLocalReport and formatAIReport above

// ---- SETTINGS ----
function renderSettings(container) {
    var user = AppState.currentUser;
    var isPremium = user.plan === 'premium';
    var daysLeft = getTrialDaysRemaining();
    var names = (user.name || '').split(' ');

    container.innerHTML = `
        <div class="page-header"><h1>Settings</h1></div>
        <div class="content-grid">
            <div>
                <div class="card mb-6">
                    <div class="card-header"><h2><i class="fas fa-user"></i> Profile</h2></div>
                    <div class="card-body">
                        <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">
                            <div class="user-avatar large">${user.photoURL ? '<img src="' + user.photoURL + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover">' : user.initials}</div>
                            <div>
                                <div style="font-size:18px;font-weight:700">${user.name}</div>
                                <div style="font-size:14px;color:var(--gray-500)">${user.email}</div>
                                <div style="font-size:13px;color:var(--primary);font-weight:600">${user.role}</div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label class="form-label">First Name</label><input type="text" class="form-input" id="setFirstName" value="${names[0] || ''}"></div>
                            <div class="form-group"><label class="form-label">Last Name</label><input type="text" class="form-input" id="setLastName" value="${names.slice(1).join(' ') || ''}"></div>
                        </div>
                        <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" value="${user.email}" disabled></div>
                        <div class="form-group"><label class="form-label">Organization</label><input type="text" class="form-input" id="setOrg" value="${user.organization || ''}"></div>
                        <div class="form-group"><label class="form-label">Language</label>${typeof getLanguageSelector === 'function' ? getLanguageSelector() : ''}</div>
                        <button class="btn btn-primary" onclick="saveProfile()"><i class="fas fa-save"></i> Save Changes</button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header"><h2><i class="fas fa-bell"></i> Notifications</h2></div>
                    <div class="card-body">
                        ${['Email notifications for task assignments', 'Email notifications for document uploads', 'Email digest (weekly summary)', 'Browser notifications'].map(n => `
                            <label style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100);cursor:pointer">
                                <input type="checkbox" checked style="width:16px;height:16px">
                                <span style="font-size:14px">${n}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div>
                <div class="card mb-6">
                    <div class="card-header"><h2><i class="fas fa-crown"></i> Subscription</h2></div>
                    <div class="card-body" style="text-align:center">
                        ${isPremium ? `
                        <div style="font-size:12px;font-weight:600;color:var(--success);text-transform:uppercase;margin-bottom:8px">Current Plan</div>
                        <div style="font-size:28px;font-weight:800;color:var(--primary);margin-bottom:4px">Premium</div>
                        <div style="font-size:16px;color:var(--gray-600);margin-bottom:16px">€15 / month</div>
                        <div style="padding:12px;background:var(--success-light);border-radius:var(--radius);margin-bottom:16px">
                            <div style="font-size:13px;color:#065f46"><i class="fas fa-check-circle"></i> All features unlocked</div>
                        </div>
                        <button class="btn btn-secondary btn-block" onclick="openCustomerPortal()">Manage Subscription</button>
                        ` : `
                        <div style="font-size:12px;font-weight:600;color:var(--warning);text-transform:uppercase;margin-bottom:8px">Current Plan</div>
                        <div style="font-size:28px;font-weight:800;color:var(--gray-800);margin-bottom:4px">Free Trial</div>
                        <div style="font-size:16px;color:var(--gray-600);margin-bottom:16px">${daysLeft > 0 ? daysLeft + ' days remaining' : 'Trial expired'}</div>
                        <div style="padding:16px;background:${daysLeft > 0 ? 'var(--warning-light)' : 'var(--danger-light)'};border-radius:var(--radius);margin-bottom:16px">
                            <div style="font-size:13px;color:${daysLeft > 0 ? '#92400e' : '#991b1b'}">
                                <i class="fas ${daysLeft > 0 ? 'fa-clock' : 'fa-exclamation-triangle'}"></i>
                                ${daysLeft > 0 ? 'Your trial ends in ' + daysLeft + ' days' : 'Your trial has expired. Upgrade to continue.'}
                            </div>
                        </div>
                        <div style="background:var(--gray-50);border-radius:var(--radius);padding:20px;margin-bottom:16px;text-align:left">
                            <div style="font-size:16px;font-weight:700;margin-bottom:12px;text-align:center">Premium — €15/month</div>
                            <div style="font-size:13px;color:var(--gray-600);line-height:2">
                                <div><i class="fas fa-check" style="color:var(--success);margin-right:8px"></i> Unlimited projects</div>
                                <div><i class="fas fa-check" style="color:var(--success);margin-right:8px"></i> Unlimited partners</div>
                                <div><i class="fas fa-check" style="color:var(--success);margin-right:8px"></i> 25 GB storage</div>
                                <div><i class="fas fa-check" style="color:var(--success);margin-right:8px"></i> Unlimited AI reports</div>
                                <div><i class="fas fa-check" style="color:var(--success);margin-right:8px"></i> PDF & DOCX export</div>
                                <div><i class="fas fa-check" style="color:var(--success);margin-right:8px"></i> Priority support</div>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-block btn-lg" onclick="startCheckout()"><i class="fas fa-credit-card"></i> Upgrade to Premium</button>
                        `}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header"><h2><i class="fas fa-shield-alt"></i> Security</h2></div>
                    <div class="card-body">
                        <button class="btn btn-secondary btn-block mb-4"><i class="fas fa-key"></i> Change Password</button>
                        <button class="btn btn-secondary btn-block mb-4"><i class="fas fa-lock"></i> Two-Factor Auth</button>
                        <hr style="margin:16px 0;border:none;border-top:1px solid var(--gray-200)">
                        <button class="btn btn-danger btn-block" onclick="logoutUser().then(()=>showToast('Logged out','info'))"><i class="fas fa-sign-out-alt"></i> Log Out</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function saveProfile() {
    var firstName = document.getElementById('setFirstName').value.trim();
    var lastName = document.getElementById('setLastName').value.trim();
    var org = document.getElementById('setOrg').value.trim();
    var fullName = firstName + (lastName ? ' ' + lastName : '');

    var uid = AppState.currentUser.id;
    db.collection('users').doc(uid).update({
        firstName: firstName,
        lastName: lastName,
        organization: org
    }).then(function() {
        var firebaseUser = auth.currentUser;
        if (firebaseUser) { firebaseUser.updateProfile({ displayName: fullName }); }
        AppState.currentUser.name = fullName;
        AppState.currentUser.organization = org;
        AppState.currentUser.initials = (firstName[0] || '').toUpperCase() + (lastName[0] || '').toUpperCase();
        updateUserUI();
        showToast('Profile updated!', 'success');
    }).catch(function(e) {
        showToast('Error saving profile: ' + e.message, 'error');
    });
}

function exportReportPDF() {
    var content = document.getElementById('aiReportContent');
    if (!content) { showToast('No report to export', 'error'); return; }
    var project = getCurrentProject();
    var filename = (project.name || 'Report').replace(/[^a-zA-Z0-9]/g, '_') + '_Final_Report.pdf';

    showToast('Generating PDF...', 'info');

    var opt = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Clone content without buttons
    var clone = content.cloneNode(true);
    var buttons = clone.querySelectorAll('.btn');
    buttons.forEach(function(b) { b.remove(); });

    // Add header
    var header = document.createElement('div');
    header.innerHTML = '<div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1e40af">' +
        '<h1 style="font-size:24px;color:#1e40af;margin-bottom:4px">EUProject Hub</h1>' +
        '<p style="font-size:12px;color:#6b7280">Final Report — Generated on ' + new Date().toLocaleDateString('en-GB') + '</p></div>';
    clone.insertBefore(header, clone.firstChild);

    html2pdf().set(opt).from(clone).save().then(function() {
        showToast('PDF exported!', 'success');
    });
}
