/* ====================================
   EUProject Hub — Page Renderers Part 3
   Budget, Dissemination, Meetings, AI Report, Settings
   ==================================== */

// ---- BUDGET & FINANCE ----
function renderBudget(container) {
    var project = getCurrentProject();
    if (!project) { container.innerHTML = '<div class="empty-state"><p>No project selected.</p></div>'; return; }
    var partners = getCurrentPartners();
    var wps = getCurrentWPs();
    var budget = getCurrentBudget();
    var totalSpent = partners.reduce(function(s, p) { return s + (p.spent || 0); }, 0);
    var remaining = project.totalBudget - totalSpent;

    var wpRows = (budget.wpStatus && budget.wpStatus.length > 0 ? budget.wpStatus : wps.map(function(w) { return { wp: w.number, allocated: w.budget, completionStatus: w.progress, paymentReleased: w.progress === 100 }; }));

    container.innerHTML = '\
        <div class="page-header">\
            <h1>Budget & Finance</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-primary" onclick="openTransferModal()"><i class="fas fa-exchange-alt"></i> Record Transfer</button>\
            </div>\
        </div>\
        <div class="budget-summary">\
            <div class="budget-card"><div class="budget-amount total">' + formatCurrency(project.totalBudget) + '</div><div class="budget-label">Total Grant (Lump Sum)</div></div>\
            <div class="budget-card"><div class="budget-amount spent">' + formatCurrency(totalSpent) + '</div><div class="budget-label">Total Utilized (' + (project.totalBudget > 0 ? Math.round(totalSpent / project.totalBudget * 100) : 0) + '%)</div></div>\
            <div class="budget-card"><div class="budget-amount remaining">' + formatCurrency(remaining) + '</div><div class="budget-label">Remaining</div></div>\
        </div>\
        <div class="content-grid-equal mb-6">\
            <div class="card">\
                <div class="card-header"><h2>Budget per Work Package</h2></div>\
                <div class="card-body" style="padding:0">\
                    <table class="data-table"><thead><tr><th>Work Package</th><th>Allocated</th><th>Completion</th><th>Payment</th></tr></thead><tbody>' +
                    (wpRows.length > 0 ? wpRows.map(function(ws) {
                        return '<tr><td><span class="wp-number">' + ws.wp + '</span></td><td style="font-weight:600">' + formatCurrency(ws.allocated) + '</td><td><div style="display:flex;align-items:center;gap:8px"><div class="progress-bar" style="flex:1"><div class="progress-fill ' + (ws.completionStatus === 100 ? 'success' : '') + '" style="width:' + ws.completionStatus + '%"></div></div><span style="font-size:12px;font-weight:600">' + ws.completionStatus + '%</span></div></td><td>' + (ws.paymentReleased ? '<span class="status-badge status-completed">Released</span>' : '<span class="status-badge status-pending">Pending</span>') + '</td></tr>';
                    }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--gray-400)">No work packages yet</td></tr>') +
                    '</tbody></table>\
                </div>\
                <div class="card-footer"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600"><span>Total</span><span>' + formatCurrency(project.totalBudget) + '</span></div></div>\
            </div>\
            <div class="card">\
                <div class="card-header"><h2>Budget per Partner</h2></div>\
                <div class="card-body" style="padding:0">\
                    <table class="data-table"><thead><tr><th>Partner</th><th>Allocated</th><th>Spent</th><th>Utilization</th></tr></thead><tbody>' +
                    (partners.length > 0 ? partners.map(function(p) {
                        var util = p.budget > 0 ? Math.round((p.spent || 0) / p.budget * 100) : 0;
                        return '<tr><td><div style="display:flex;align-items:center;gap:8px"><div class="task-assignee-avatar">' + (p.initials || '?') + '</div><span style="font-weight:500;font-size:13px">' + (p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name) + '</span></div></td><td style="font-weight:600">' + formatCurrency(p.budget) + '</td><td>' + formatCurrency(p.spent || 0) + '</td><td><div style="display:flex;align-items:center;gap:8px"><div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:' + util + '%"></div></div><span style="font-size:12px;font-weight:600">' + util + '%</span></div></td></tr>';
                    }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--gray-400)">No partners yet</td></tr>') +
                    '</tbody></table>\
                </div>\
            </div>\
        </div>' +
        (budget.partnerTransfers && budget.partnerTransfers.length > 0 ? '\
        <div class="card">\
            <div class="card-header"><h2><i class="fas fa-exchange-alt"></i> Partner Transfers</h2></div>\
            <div class="card-body" style="padding:0">\
                <table class="data-table"><thead><tr><th>Partner</th><th>Amount</th><th>Date</th><th>Type</th><th>Status</th></tr></thead><tbody>' +
                budget.partnerTransfers.map(function(t) {
                    return '<tr><td style="font-weight:500">' + t.partner + '</td><td style="font-weight:600">' + formatCurrency(t.amount) + '</td><td>' + formatDate(t.date) + '</td><td>' + t.type + '</td><td><span class="status-badge status-' + (t.status === 'completed' ? 'completed' : 'pending') + '">' + t.status + '</span></td></tr>';
                }).join('') +
                '</tbody></table>\
            </div>\
        </div>' : '');
}

function openTransferModal() {
    var partners = getCurrentPartners();
    var partnerOptions = partners.filter(function(p) { return p.role !== 'coordinator'; }).map(function(p) { return '<option>' + p.name + '</option>'; }).join('');
    if (!partnerOptions) partnerOptions = '<option>No partners available</option>';

    openModal('Record Partner Transfer', '\
        <div class="form-group"><label class="form-label">Partner</label><select class="form-select" id="rtPartner">' + partnerOptions + '</select></div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Amount (&euro;)</label><input type="number" class="form-input" id="rtAmount" placeholder="10000"></div>\
            <div class="form-group"><label class="form-label">Transfer Date</label><input type="date" class="form-input" id="rtDate"></div>\
        </div>\
        <div class="form-group"><label class="form-label">Type</label><select class="form-select" id="rtType"><option>Pre-financing</option><option>Interim payment</option><option>Final payment</option></select></div>\
        <div class="form-group"><label class="form-label">Status</label><select class="form-select" id="rtStatus"><option value="completed">Completed</option><option value="pending">Pending</option></select></div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleRecordTransfer()"><i class="fas fa-check"></i> Record Transfer</button>');
}

function handleRecordTransfer() {
    var partner = document.getElementById('rtPartner').value;
    var amount = parseInt(document.getElementById('rtAmount').value) || 0;
    var date = document.getElementById('rtDate').value;
    var type = document.getElementById('rtType').value;
    var status = document.getElementById('rtStatus').value;

    if (!amount) { alert('Please enter an amount.'); return; }

    var pid = AppState.currentProjectId;
    if (!BudgetTracking[pid]) BudgetTracking[pid] = { wpStatus: [], partnerTransfers: [] };
    if (!BudgetTracking[pid].partnerTransfers) BudgetTracking[pid].partnerTransfers = [];

    BudgetTracking[pid].partnerTransfers.push({
        partner: partner,
        amount: amount,
        date: date || new Date().toISOString().split('T')[0],
        status: status,
        type: type
    });

    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    updateProjectField(pid, 'budgetTracking', BudgetTracking[pid]).then(function(result) {
        if (result.success) {
            closeModal();
            navigateTo('budget');
            showToast('Transfer recorded!', 'success');
        } else {
            BudgetTracking[pid].partnerTransfers.pop();
            showToast('Error saving transfer.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Record Transfer'; }
        }
    });
}

// ---- DISSEMINATION ----
function renderDissemination(container) {
    var diss = getCurrentDissemination();
    container.innerHTML = '\
        <div class="page-header">\
            <h1>Dissemination & Communication</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-primary" onclick="openAddDisseminationModal()"><i class="fas fa-plus"></i> Log Activity</button>\
            </div>\
        </div>\
        <div class="dissemination-stats">\
            <div class="diss-stat"><div class="diss-stat-value">' + (diss.summary.events || 0) + '</div><div class="diss-stat-label">Events</div></div>\
            <div class="diss-stat"><div class="diss-stat-value">' + (diss.summary.publications || 0) + '</div><div class="diss-stat-label">Publications</div></div>\
            <div class="diss-stat"><div class="diss-stat-value">' + (diss.summary.socialReach || 0).toLocaleString() + '</div><div class="diss-stat-label">Social Media Reach</div></div>\
            <div class="diss-stat"><div class="diss-stat-value">' + (diss.summary.website_visits || 0).toLocaleString() + '</div><div class="diss-stat-label">Website Visits</div></div>\
        </div>\
        <div class="card">\
            <div class="card-header"><h2>Dissemination Activities</h2></div>\
            <div class="card-body" style="padding:0">' +
            (diss.activities && diss.activities.length > 0 ? '\
                <table class="data-table"><thead><tr><th>Date</th><th>Type</th><th>Activity</th><th>Partner</th><th>Reach</th><th>Link</th></tr></thead><tbody>' +
                diss.activities.map(function(a) {
                    var typeClass = a.type === 'Event' ? 'status-active' : a.type === 'Publication' ? 'status-completed' : a.type === 'Social Media' ? 'status-pending' : 'status-draft';
                    var linkHtml = a.link ? '<a href="' + a.link + '" target="_blank" style="color:var(--primary)"><i class="fas fa-external-link-alt"></i></a>' : '';
                    return '<tr><td>' + formatDate(a.date) + '</td><td><span class="status-badge ' + typeClass + '">' + a.type + '</span></td><td style="font-weight:500">' + a.title + '</td><td style="font-size:13px">' + (a.partner || '').split(' ').slice(-1)[0] + '</td><td style="font-weight:600">' + (a.reach || 0).toLocaleString() + '</td><td>' + linkHtml + '</td></tr>';
                }).join('') +
                '</tbody></table>' : '<div style="padding:40px;text-align:center;color:var(--gray-400)">No dissemination activities yet. Log your first activity!</div>') +
            '</div>\
        </div>';
}

function openAddDisseminationModal() {
    var partners = getCurrentPartners();
    var partnerOptions = partners.map(function(p) { return '<option>' + p.name + '</option>'; }).join('');
    if (!partnerOptions) partnerOptions = '<option>No partners</option>';

    openModal('Log Dissemination Activity', '\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Type</label><select class="form-select" id="adType"><option>Event</option><option>Publication</option><option>Social Media</option><option>Newsletter</option><option>Website</option><option>Press Release</option><option>Multiplier Event</option></select></div>\
            <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="adDate"></div>\
        </div>\
        <div class="form-group"><label class="form-label">Title / Description</label><input type="text" class="form-input" id="adTitle" placeholder="Activity title"></div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Partner</label><select class="form-select" id="adPartner">' + partnerOptions + '</select></div>\
            <div class="form-group"><label class="form-label">Estimated Reach</label><input type="number" class="form-input" id="adReach" placeholder="500"></div>\
        </div>\
        <div class="form-group"><label class="form-label">Link (optional)</label><input type="url" class="form-input" id="adLink" placeholder="https://..."></div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddDissemination()"><i class="fas fa-check"></i> Save Activity</button>');
}

function handleAddDissemination() {
    var type = document.getElementById('adType').value;
    var date = document.getElementById('adDate').value;
    var title = document.getElementById('adTitle').value.trim();
    var partner = document.getElementById('adPartner').value;
    var reach = parseInt(document.getElementById('adReach').value) || 0;
    var link = document.getElementById('adLink').value.trim();

    if (!title) { alert('Please enter a title.'); return; }

    var pid = AppState.currentProjectId;
    if (!Dissemination[pid]) Dissemination[pid] = { summary: { events: 0, publications: 0, socialReach: 0, website_visits: 0 }, activities: [] };

    Dissemination[pid].activities.push({
        id: Date.now(),
        type: type,
        title: title,
        date: date || new Date().toISOString().split('T')[0],
        reach: reach,
        partner: partner,
        link: link
    });

    // Update summary
    if (type === 'Event' || type === 'Multiplier Event') Dissemination[pid].summary.events++;
    if (type === 'Publication') Dissemination[pid].summary.publications++;
    if (type === 'Social Media') Dissemination[pid].summary.socialReach += reach;
    if (type === 'Website') Dissemination[pid].summary.website_visits += reach;

    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    updateProjectField(pid, 'dissemination', Dissemination[pid]).then(function(result) {
        if (result.success) {
            closeModal();
            navigateTo('dissemination');
            showToast('Activity logged!', 'success');
        } else {
            Dissemination[pid].activities.pop();
            showToast('Error saving activity.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Save Activity'; }
        }
    });
}

// ---- MEETINGS & TPMs ----
function renderMeetings(container) {
    var meetings = getCurrentMeetings();
    container.innerHTML = '\
        <div class="page-header">\
            <h1>Meetings & TPMs</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-primary" onclick="openAddMeetingModal()"><i class="fas fa-plus"></i> Plan Meeting</button>\
            </div>\
        </div>\
        <div class="tabs" id="meetingTabs">\
            <button class="tab-btn active">All Meetings (' + meetings.length + ')</button>\
            <button class="tab-btn">TPMs (' + meetings.filter(function(m) { return m.type === 'TPM'; }).length + ')</button>\
            <button class="tab-btn">Online (' + meetings.filter(function(m) { return m.type === 'online'; }).length + ')</button>\
        </div>\
        <div id="meetingList"></div>';

    var list = document.getElementById('meetingList');
    if (meetings.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding:60px 20px;text-align:center"><i class="fas fa-calendar-alt" style="font-size:48px;color:var(--gray-300);margin-bottom:16px"></i><h3>No meetings yet</h3><p style="color:var(--gray-500)">Plan your first meeting or TPM.</p></div>';
        return;
    }

    list.innerHTML = meetings.map(function(m, idx) {
        var hasMinutes = m.minutes && m.minutes.trim().length > 0;
        var photoCount = (m.photos || []).length;
        return '<div class="meeting-card" style="cursor:pointer" onclick="openMeetingDetail(' + idx + ')">\
            <div class="meeting-header">\
                <div>\
                    <span class="status-badge ' + (m.status === 'completed' ? 'status-completed' : 'status-active') + '">' + m.status + '</span>\
                    <span class="status-badge ' + (m.type === 'TPM' ? 'status-pending' : 'status-draft') + '" style="margin-left:4px">' + m.type + '</span>\
                </div>\
                <div class="meeting-date"><i class="fas fa-calendar"></i> ' + formatDate(m.date) + '</div>\
            </div>\
            <h3>' + m.title + '</h3>\
            <div class="meeting-location"><i class="fas fa-map-marker-alt"></i> ' + m.location + '</div>\
            <div style="margin-top:8px;display:flex;gap:12px;font-size:12px;color:var(--gray-500)">\
                ' + (m.agenda && m.agenda.length > 0 ? '<span><i class="fas fa-list"></i> ' + m.agenda.length + ' agenda items</span>' : '') + '\
                ' + (hasMinutes ? '<span style="color:var(--success)"><i class="fas fa-file-alt"></i> Minutes</span>' : '') + '\
                ' + (photoCount > 0 ? '<span style="color:var(--primary)"><i class="fas fa-camera"></i> ' + photoCount + ' photos</span>' : '') + '\
            </div>\
        </div>';
    }).join('');
}

function openMeetingDetail(idx) {
    var pid = AppState.currentProjectId;
    var m = Meetings[pid][idx];
    if (!m) return;
    var photoHtml = '';
    if (m.photos && m.photos.length > 0) {
        photoHtml = '<h3 style="font-size:14px;font-weight:700;margin:20px 0 12px">Photos (' + m.photos.length + ')</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px">' +
            m.photos.map(function(p) {
                return '<a href="' + p.url + '" target="_blank"><img src="' + p.url + '" style="width:100%;height:80px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--gray-200)" alt="' + p.name + '"></a>';
            }).join('') + '</div>';
    }

    openModal(m.title, '\
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">\
            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Date</strong><br>' + formatDate(m.date) + '</div>\
            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Location</strong><br>' + m.location + '</div>\
            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Type</strong><br>' + m.type + '</div>\
            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Status</strong><br><span class="status-badge status-' + (m.status === 'completed' ? 'completed' : 'active') + '">' + m.status + '</span></div>\
        </div>\
        ' + (m.agenda && m.agenda.length > 0 ? '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Agenda</h3><ol style="padding-left:20px;margin-bottom:16px">' + m.agenda.map(function(a) { return '<li style="padding:4px 0;font-size:14px;color:var(--gray-600)">' + a + '</li>'; }).join('') + '</ol>' : '') + '\
        <h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Meeting Minutes</h3>\
        <textarea class="form-textarea" rows="5" id="mmMinutes" placeholder="Enter meeting minutes here... These are important for the final report." style="margin-bottom:12px">' + (m.minutes || '') + '</textarea>\
        <button class="btn btn-sm btn-secondary" onclick="saveMeetingMinutes(' + idx + ')"><i class="fas fa-save"></i> Save Minutes</button>\
        ' + photoHtml + '\
        <div style="margin-top:16px">\
            <h3 style="font-size:14px;font-weight:700;margin-bottom:8px">Upload Photos</h3>\
            <input type="file" id="meetingPhotoInput" accept="image/*" multiple onchange="handleMeetingPhotoUpload(' + idx + ',this.files)">\
        </div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Close</button><button class="btn btn-danger btn-sm" style="margin-right:auto" onclick="deleteMeeting(' + idx + ')"><i class="fas fa-trash"></i> Delete</button>', true);
}

function saveMeetingMinutes(idx) {
    var pid = AppState.currentProjectId;
    var m = Meetings[pid][idx];
    if (!m) return;
    m.minutes = document.getElementById('mmMinutes').value;
    updateProjectField(pid, 'meetings', Meetings[pid]).then(function() {
        showToast('Minutes saved!', 'success');
    });
}

function handleMeetingPhotoUpload(meetingIdx, files) {
    if (!files || files.length === 0) return;
    var pid = AppState.currentProjectId;
    var m = Meetings[pid][meetingIdx];
    if (!m) return;
    if (!m.photos) m.photos = [];

    var uploadPromises = [];
    for (var i = 0; i < files.length; i++) {
        if (files[i].size > 10 * 1024 * 1024) {
            showToast(files[i].name + ' too large (max 10MB)', 'error');
            continue;
        }
        uploadPromises.push(uploadFile(pid, 'meeting_' + m.id, files[i]));
    }
    if (uploadPromises.length === 0) return;
    showToast('Uploading photos...', 'info');

    Promise.all(uploadPromises).then(function(results) {
        results.forEach(function(r) {
            if (r.success) {
                m.photos.push({ name: r.name, url: r.url, path: r.path });
            }
        });
        updateProjectField(pid, 'meetings', Meetings[pid]).then(function() {
            openMeetingDetail(meetingIdx);
            showToast('Photos uploaded!', 'success');
        });
    });
}

function deleteMeeting(idx) {
    if (!confirm('Delete this meeting?')) return;
    var pid = AppState.currentProjectId;
    Meetings[pid].splice(idx, 1);
    updateProjectField(pid, 'meetings', Meetings[pid]).then(function() {
        closeModal();
        navigateTo('meetings');
        showToast('Meeting deleted.', 'info');
    });
}

function openAddMeetingModal() {
    openModal('Plan New Meeting', '\
        <div class="form-group"><label class="form-label">Meeting Title</label><input type="text" class="form-input" id="amTitle" placeholder="e.g., 4th TPM in Helsinki"></div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Type</label><select class="form-select" id="amType"><option value="TPM">TPM (Transnational)</option><option value="online">Online Meeting</option><option value="workshop">Workshop</option><option value="multiplier">Multiplier Event</option></select></div>\
            <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="amDate"></div>\
        </div>\
        <div class="form-group"><label class="form-label">Location</label><input type="text" class="form-input" id="amLocation" placeholder="City, Country or Online (Zoom)"></div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Status</label><select class="form-select" id="amStatus"><option value="upcoming">Upcoming</option><option value="completed">Completed</option></select></div>\
        </div>\
        <div class="form-group"><label class="form-label">Agenda Items (one per line)</label><textarea class="form-textarea" rows="4" id="amAgenda" placeholder="One item per line..."></textarea></div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="handleAddMeeting()"><i class="fas fa-check"></i> Create Meeting</button>');
}

function handleAddMeeting() {
    var title = document.getElementById('amTitle').value.trim();
    var type = document.getElementById('amType').value;
    var date = document.getElementById('amDate').value;
    var location = document.getElementById('amLocation').value.trim();
    var status = document.getElementById('amStatus').value;
    var agendaText = document.getElementById('amAgenda').value.trim();
    var agenda = agendaText ? agendaText.split('\n').filter(function(a) { return a.trim(); }) : [];

    if (!title) { alert('Please enter a meeting title.'); return; }

    var pid = AppState.currentProjectId;
    if (!Meetings[pid]) Meetings[pid] = [];

    Meetings[pid].push({
        id: Date.now(),
        title: title,
        location: location || 'TBD',
        date: date || '',
        type: type,
        status: status,
        attendees: [],
        agenda: agenda,
        minutes: '',
        photos: []
    });

    var btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    updateProjectField(pid, 'meetings', Meetings[pid]).then(function(result) {
        if (result.success) {
            closeModal();
            navigateTo('meetings');
            showToast('Meeting planned!', 'success');
        } else {
            Meetings[pid].pop();
            showToast('Error saving meeting.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Create Meeting'; }
        }
    });
}

// ---- AI REPORT GENERATOR ----
function renderAIReport(container) {
    var project = getCurrentProject();
    if (!project) { container.innerHTML = '<div class="empty-state"><p>No project selected.</p></div>'; return; }

    container.innerHTML = '\
        <div class="page-header">\
            <h1>AI Report Generator</h1>\
        </div>\
        <div class="ai-report-container">\
            <div class="card mb-6">\
                <div class="card-header">\
                    <h2><i class="fas fa-robot"></i> Generate Final Report</h2>\
                </div>\
                <div class="card-body">\
                    <p style="color:var(--gray-600);margin-bottom:20px">Select which sections to include in your AI-generated final report for <strong>' + project.name + '</strong>. The AI will analyze your project data to compile a comprehensive report following EU guidelines.</p>\
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">' +
                        [
                            {id:'exec', label:'Executive Summary', icon:'fa-file-alt', checked: true},
                            {id:'wp', label:'Work Package Progress', icon:'fa-cubes', checked: true},
                            {id:'budget', label:'Budget Execution Summary', icon:'fa-euro-sign', checked: true},
                            {id:'partner', label:'Partner Contributions', icon:'fa-users', checked: true},
                            {id:'diss', label:'Dissemination & Impact', icon:'fa-bullhorn', checked: true},
                            {id:'quality', label:'Quality Assurance', icon:'fa-shield-alt', checked: false},
                            {id:'challenges', label:'Challenges & Mitigations', icon:'fa-exclamation-triangle', checked: true},
                            {id:'next', label:'Next Steps & Sustainability', icon:'fa-arrow-right', checked: false}
                        ].map(function(s) {
                            return '<label style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--gray-50);border-radius:var(--radius);cursor:pointer;border:1px solid var(--gray-200)"><input type="checkbox" ' + (s.checked ? 'checked' : '') + ' style="width:16px;height:16px"><i class="fas ' + s.icon + '" style="color:var(--primary);width:16px"></i><span style="font-size:14px;font-weight:500">' + s.label + '</span></label>';
                        }).join('') +
                    '</div>\
                    <div class="form-row mb-6">\
                        <div class="form-group"><label class="form-label">Report Period</label><select class="form-select"><option>Full project (' + project.startDate + ' to present)</option><option>Last 12 months</option><option>Last 6 months</option></select></div>\
                        <div class="form-group"><label class="form-label">Language</label><select class="form-select"><option>English</option><option>French</option><option>German</option><option>Spanish</option></select></div>\
                    </div>\
                    <div style="display:flex;gap:12px">\
                        <button class="btn btn-primary btn-lg" onclick="generateAIReport()"><i class="fas fa-magic"></i> Generate Report</button>\
                    </div>\
                </div>\
            </div>\
            <div id="aiReportOutput"></div>\
        </div>';
}

function generateAIReport() {
    var output = document.getElementById('aiReportOutput');
    var project = getCurrentProject();
    var partners = getCurrentPartners();
    var wps = getCurrentWPs();
    var diss = getCurrentDissemination();
    var totalSpent = partners.reduce(function(s, p) { return s + (p.spent || 0); }, 0);
    var progress = getProjectProgress();

    output.innerHTML = '\
        <div class="card">\
            <div class="card-header" style="background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff">\
                <h2 style="color:#fff"><i class="fas fa-robot"></i> AI Report Generator</h2>\
            </div>\
            <div class="card-body">\
                <div class="ai-generating" id="aiLoading">\
                    <div class="spinner"></div>\
                    <h3 style="color:var(--gray-800)">Generating your report...</h3>\
                    <p style="color:var(--gray-500)">Analyzing project data, compiling work package outputs, and generating narrative...</p>\
                    <div id="aiProgressSteps" style="margin-top:20px;text-align:left;max-width:400px;margin-left:auto;margin-right:auto"></div>\
                </div>\
                <div id="aiReportContent" class="hidden ai-report-output"></div>\
            </div>\
        </div>';

    var steps = ['Analyzing project structure...', 'Compiling WP deliverables...', 'Reviewing budget execution...', 'Processing dissemination data...', 'Generating narrative...', 'Formatting report...'];
    var stepIdx = 0;
    var stepsContainer = document.getElementById('aiProgressSteps');

    var stepInterval = setInterval(function() {
        if (stepIdx < steps.length) {
            stepsContainer.innerHTML += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;color:var(--success)"><i class="fas fa-check-circle"></i> ' + steps[stepIdx] + '</div>';
            stepIdx++;
        } else {
            clearInterval(stepInterval);
            document.getElementById('aiLoading').classList.add('hidden');
            var reportContent = document.getElementById('aiReportContent');
            reportContent.classList.remove('hidden');
            reportContent.innerHTML = generateReportHTML(project, partners, wps, diss, totalSpent, progress);
        }
    }, 800);
}

function generateReportHTML(project, partners, wps, diss, totalSpent, progress) {
    var countriesSet = {};
    partners.forEach(function(p) { countriesSet[p.country] = true; });
    var countryCount = Object.keys(countriesSet).length;

    var html = '\
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:20px">\
            <button class="btn btn-sm btn-secondary"><i class="fas fa-file-pdf"></i> Export PDF</button>\
            <button class="btn btn-sm btn-secondary"><i class="fas fa-file-word"></i> Export DOCX</button>\
            <button class="btn btn-sm btn-ghost"><i class="fas fa-copy"></i> Copy</button>\
        </div>\
        <h3>Final Report: ' + project.name + '</h3>\
        <p><em>' + project.programme + ' | Project No: ' + project.projectNumber + '</em></p>\
        <p><em>Report Period: ' + formatDate(project.startDate) + ' - Present</em></p>\
        <h3>1. Executive Summary</h3>\
        <p>The ' + project.name + ' project has made significant progress toward its objectives since its launch in ' + formatDate(project.startDate) + '. As of the current reporting period, overall project completion stands at <strong>' + progress + '%</strong>, with ' + wps.filter(function(w) { return w.status === 'completed'; }).length + ' out of ' + wps.length + ' work packages fully completed.</p>\
        <p>The project consortium, comprising ' + partners.length + ' partner organizations across ' + countryCount + ' countries, has maintained effective collaboration throughout the implementation period. Total budget utilization has reached ' + formatCurrency(totalSpent) + ' out of the ' + formatCurrency(project.totalBudget) + ' lump-sum grant (' + (project.totalBudget > 0 ? Math.round(totalSpent / project.totalBudget * 100) : 0) + '%).</p>';

    if (wps.length > 0) {
        html += '<h3>2. Work Package Progress</h3>';
        wps.forEach(function(wp) {
            html += '<p><strong>' + wp.number + ': ' + wp.title + '</strong> (Lead: ' + wp.lead + ')</p>\
                <p>Status: <strong>' + wp.status + '</strong> | Progress: <strong>' + wp.progress + '%</strong> | Budget: ' + formatCurrency(wp.budget) + '</p>\
                <p>' + wp.description + '</p>';
            if (wp.deliverables && wp.deliverables.length > 0) {
                html += '<ul>' + wp.deliverables.map(function(d) {
                    return '<li>' + d + ' ' + (wp.progress === 100 ? '(Completed)' : wp.progress > 50 ? '(In Progress)' : '(Planned)') + '</li>';
                }).join('') + '</ul>';
            }
        });
    }

    html += '<h3>3. Budget Execution Summary</h3>\
        <p>The project operates under the EU lump-sum funding model with a total grant of <strong>' + formatCurrency(project.totalBudget) + '</strong>.</p>';
    if (partners.length > 0) {
        html += '<ul>' + partners.map(function(p) {
            return '<li><strong>' + p.name + '</strong> (' + p.country + '): Allocated ' + formatCurrency(p.budget) + ', Utilized ' + formatCurrency(p.spent || 0) + ' (' + (p.budget > 0 ? Math.round((p.spent || 0) / p.budget * 100) : 0) + '%)</li>';
        }).join('') + '</ul>';
    }
    html += '<p>Total project expenditure to date: <strong>' + formatCurrency(totalSpent) + '</strong> (' + (project.totalBudget > 0 ? Math.round(totalSpent / project.totalBudget * 100) : 0) + '% of total grant).</p>';

    if (partners.length > 0) {
        html += '<h3>4. Partner Contributions</h3>';
        partners.forEach(function(p) {
            html += '<p><strong>' + p.name + '</strong> (' + p.country + ', ' + p.role + '): ' + p.contact + ' has been actively contributing to assigned work packages with a budget utilization rate of ' + (p.budget > 0 ? Math.round((p.spent || 0) / p.budget * 100) : 0) + '%.</p>';
        });
    }

    html += '<h3>5. Dissemination & Impact</h3>\
        <p>The project has conducted <strong>' + (diss.summary.events || 0) + ' dissemination events</strong> and produced <strong>' + (diss.summary.publications || 0) + ' publications</strong>. Social media activities have reached an estimated audience of <strong>' + (diss.summary.socialReach || 0).toLocaleString() + ' people</strong>, while the project website has attracted <strong>' + (diss.summary.website_visits || 0).toLocaleString() + ' visits</strong>.</p>';

    if (diss.activities && diss.activities.length > 0) {
        html += '<p>Key dissemination activities include:</p><ul>' + diss.activities.slice(0, 5).map(function(a) {
            return '<li>' + a.title + ' (' + a.type + ', ' + formatDate(a.date) + ') — Reach: ' + (a.reach || 0).toLocaleString() + '</li>';
        }).join('') + '</ul>';
    }

    html += '<h3>6. Challenges & Mitigations</h3>\
        <p>The consortium has encountered typical challenges associated with transnational project management. These challenges have been effectively mitigated through regular coordination meetings, clear communication protocols, and flexible timeline adjustments where necessary.</p>\
        <hr style="margin:24px 0;border:none;border-top:1px solid var(--gray-200)">\
        <p style="font-size:12px;color:var(--gray-400)"><em>This report was generated by EUProject Hub AI Assistant on ' + new Date().toLocaleDateString('en-GB') + '. Please review and edit as needed before submission.</em></p>';

    return html;
}

// ---- SETTINGS ----
function renderSettings(container) {
    var user = AppState.currentUser || {};
    var names = (user.name || 'User').split(' ');
    var firstName = names[0] || '';
    var lastName = names.slice(1).join(' ') || '';

    container.innerHTML = '\
        <div class="page-header"><h1>Settings</h1></div>\
        <div class="content-grid">\
            <div>\
                <div class="card mb-6">\
                    <div class="card-header"><h2><i class="fas fa-user"></i> Profile</h2></div>\
                    <div class="card-body">\
                        <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">\
                            <div class="user-avatar large">' + (user.initials || '?') + '</div>\
                            <div>\
                                <div style="font-size:18px;font-weight:700">' + (user.name || 'User') + '</div>\
                                <div style="font-size:14px;color:var(--gray-500)">' + (user.email || '') + '</div>\
                                <div style="font-size:13px;color:var(--primary);font-weight:600">' + (user.role || 'Coordinator') + '</div>\
                            </div>\
                        </div>\
                        <div class="form-row">\
                            <div class="form-group"><label class="form-label">First Name</label><input type="text" class="form-input" value="' + firstName + '"></div>\
                            <div class="form-group"><label class="form-label">Last Name</label><input type="text" class="form-input" value="' + lastName + '"></div>\
                        </div>\
                        <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" value="' + (user.email || '') + '" disabled></div>\
                        <div class="form-group"><label class="form-label">Organization</label><input type="text" class="form-input" value="' + (user.organization || '') + '"></div>\
                    </div>\
                </div>\
                <div class="card">\
                    <div class="card-header"><h2><i class="fas fa-bell"></i> Notifications</h2></div>\
                    <div class="card-body">' +
                        ['Email notifications for task assignments', 'Email notifications for document uploads', 'Email digest (weekly summary)', 'Browser notifications'].map(function(n) {
                            return '<label style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100);cursor:pointer"><input type="checkbox" checked style="width:16px;height:16px"><span style="font-size:14px">' + n + '</span></label>';
                        }).join('') +
                    '</div>\
                </div>\
            </div>\
            <div>\
                <div class="card mb-6">\
                    <div class="card-header"><h2><i class="fas fa-crown"></i> Subscription</h2></div>\
                    <div class="card-body" style="text-align:center">\
                        <div style="font-size:12px;font-weight:600;color:var(--success);text-transform:uppercase;margin-bottom:8px">Current Plan</div>\
                        <div style="font-size:28px;font-weight:800;color:var(--primary);margin-bottom:4px">' + ((user.plan || 'trial') === 'trial' ? 'Free Trial' : 'Premium') + '</div>\
                        <div style="padding:12px;background:var(--success-light);border-radius:var(--radius);margin:16px 0">\
                            <div style="font-size:13px;color:#065f46"><i class="fas fa-check-circle"></i> All features unlocked</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="card">\
                    <div class="card-header"><h2><i class="fas fa-shield-alt"></i> Security</h2></div>\
                    <div class="card-body">\
                        <button class="btn btn-secondary btn-block mb-4"><i class="fas fa-key"></i> Change Password</button>\
                        <hr style="margin:16px 0;border:none;border-top:1px solid var(--gray-200)">\
                        <button class="btn btn-danger btn-block" onclick="logoutUser().then(function(){showToast(\'Logged out\',\'info\')})"><i class="fas fa-sign-out-alt"></i> Log Out</button>\
                    </div>\
                </div>\
            </div>\
        </div>';
}
