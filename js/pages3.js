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

    // Calculate totals from detailed entries or partner-level
    var entries = budget.detailedEntries || [];
    var totalPlanned = 0; var totalActual = 0;
    partners.forEach(function(p) {
        totalPlanned += (p.budget || 0);
        totalActual += (p.spent || 0);
    });
    var difference = totalPlanned - totalActual;

    container.innerHTML = '\
        <div class="page-header">\
            <h1>Budget & Finance</h1>\
            <div class="page-header-actions">\
                <button class="btn btn-secondary" onclick="generateTabReport(\'budget\')"><i class="fas fa-robot"></i> AI Report</button>\
                <button class="btn btn-secondary" onclick="openBudgetEntryModal()"><i class="fas fa-edit"></i> Edit Budget Plan</button>\
                <button class="btn btn-secondary" onclick="openTimesheetModal()"><i class="fas fa-clock"></i> Timesheet</button>\
                <button class="btn btn-primary" onclick="openTransferModal()"><i class="fas fa-exchange-alt"></i> Record Transfer</button>\
            </div>\
        </div>\
        <div class="budget-summary">\
            <div class="budget-card"><div class="budget-amount total">' + formatCurrency(project.totalBudget) + '</div><div class="budget-label">Total Grant (Lump Sum)</div></div>\
            <div class="budget-card"><div class="budget-amount spent">' + formatCurrency(totalActual) + '</div><div class="budget-label">Actual Spent (' + (totalPlanned > 0 ? Math.round(totalActual / totalPlanned * 100) : 0) + '%)</div></div>\
            <div class="budget-card"><div class="budget-amount remaining" style="color:' + (difference >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + (difference >= 0 ? '+' : '') + formatCurrency(difference) + '</div><div class="budget-label">Difference (Planned - Actual)</div></div>\
        </div>\
        <div class="tabs" id="budgetTabs">\
            <button class="tab-btn active" onclick="showBudgetTab(\'overview\',this)">Overview</button>\
            <button class="tab-btn" onclick="showBudgetTab(\'detailed\',this)">Detailed per Partner/WP</button>\
            <button class="tab-btn" onclick="showBudgetTab(\'transfers\',this)">Transfers</button>\
        </div>\
        <div id="budgetOverview">' + renderBudgetOverview(partners, wps, budget, project) + '</div>\
        <div id="budgetDetailed" class="hidden">' + renderBudgetDetailed(partners, wps, budget) + '</div>\
        <div id="budgetTransfers" class="hidden">' + renderBudgetTransfers(budget) + '</div>';
}

function showBudgetTab(tab, btn) {
    document.querySelectorAll('#budgetTabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    document.getElementById('budgetOverview').className = tab === 'overview' ? '' : 'hidden';
    document.getElementById('budgetDetailed').className = tab === 'detailed' ? '' : 'hidden';
    document.getElementById('budgetTransfers').className = tab === 'transfers' ? '' : 'hidden';
}

function renderBudgetOverview(partners, wps, budget, project) {
    return '<div class="content-grid-equal mb-6">\
        <div class="card">\
            <div class="card-header"><h2>Budget per Work Package</h2></div>\
            <div class="card-body" style="padding:0">\
                <table class="data-table"><thead><tr><th>WP</th><th>Allocated</th><th>Completion</th><th>Status</th></tr></thead><tbody>' +
                (wps.length > 0 ? wps.map(function(w) {
                    return '<tr><td><span class="wp-number">' + w.number + '</span></td><td style="font-weight:600">' + formatCurrency(w.budget) + '</td><td><div style="display:flex;align-items:center;gap:8px"><div class="progress-bar" style="flex:1"><div class="progress-fill ' + (w.progress === 100 ? 'success' : '') + '" style="width:' + w.progress + '%"></div></div><span style="font-size:12px;font-weight:600">' + w.progress + '%</span></div></td><td>' + (w.progress === 100 ? '<span class="status-badge status-completed">Released</span>' : '<span class="status-badge status-pending">Pending</span>') + '</td></tr>';
                }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--gray-400)">No WPs</td></tr>') +
                '</tbody></table>\
            </div>\
        </div>\
        <div class="card">\
            <div class="card-header"><h2>Budget per Partner</h2></div>\
            <div class="card-body" style="padding:0">\
                <table class="data-table"><thead><tr><th>Partner</th><th>Planned</th><th>Actual</th><th>Difference</th></tr></thead><tbody>' +
                (partners.length > 0 ? partners.map(function(p) {
                    var diff = (p.budget || 0) - (p.spent || 0);
                    var diffColor = diff >= 0 ? 'var(--success)' : 'var(--danger)';
                    return '<tr><td><div style="display:flex;align-items:center;gap:8px"><div class="task-assignee-avatar">' + (p.initials || '?') + '</div><span style="font-weight:500;font-size:13px">' + (p.name.length > 22 ? p.name.substring(0, 22) + '..' : p.name) + '</span></div></td><td style="font-weight:600">' + formatCurrency(p.budget) + '</td><td>' + formatCurrency(p.spent || 0) + '</td><td style="font-weight:700;color:' + diffColor + '">' + (diff >= 0 ? '+' : '') + formatCurrency(diff) + '</td></tr>';
                }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--gray-400)">No partners</td></tr>') +
                '</tbody></table>\
            </div>\
        </div>\
    </div>';
}

function renderBudgetDetailed(partners, wps, budget) {
    if (partners.length === 0 || wps.length === 0) {
        return '<div class="card"><div class="card-body" style="text-align:center;color:var(--gray-400);padding:40px">Add partners and work packages first to create a detailed budget plan.</div></div>';
    }

    var entries = budget.detailedEntries || {};

    var html = '<div class="card"><div class="card-header"><h2>Detailed Budget: Planned vs Actual per Partner per WP</h2></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" style="min-width:800px"><thead><tr><th>Partner</th>';
    wps.forEach(function(w) { html += '<th colspan="2" style="text-align:center;border-bottom:2px solid var(--primary)">' + w.number + '</th>'; });
    html += '<th colspan="2" style="text-align:center;font-weight:700">TOTAL</th></tr><tr><th></th>';
    wps.forEach(function() { html += '<th style="font-size:11px;color:var(--gray-500)">Planned</th><th style="font-size:11px;color:var(--gray-500)">Actual</th>'; });
    html += '<th style="font-size:11px;color:var(--gray-500)">Planned</th><th style="font-size:11px;color:var(--gray-500)">Actual</th></tr></thead><tbody>';

    var wpTotalsPlanned = {}; var wpTotalsActual = {};
    wps.forEach(function(w) { wpTotalsPlanned[w.number] = 0; wpTotalsActual[w.number] = 0; });

    partners.forEach(function(p, pIdx) {
        var rowPlannedTotal = 0; var rowActualTotal = 0;
        html += '<tr><td style="font-weight:500;font-size:13px">' + (p.name.length > 20 ? p.name.substring(0, 20) + '..' : p.name) + '</td>';
        wps.forEach(function(w) {
            var key = p.name + '|' + w.number;
            var planned = (entries[key] && entries[key].planned) || 0;
            var actual = (entries[key] && entries[key].actual) || 0;
            wpTotalsPlanned[w.number] += planned;
            wpTotalsActual[w.number] += actual;
            rowPlannedTotal += planned; rowActualTotal += actual;
            var diff = planned - actual;
            html += '<td style="font-size:12px;text-align:right">' + (planned > 0 ? formatCurrency(planned) : '-') + '</td>';
            html += '<td style="font-size:12px;text-align:right;cursor:pointer;color:var(--primary)" onclick="openActualEntryModal(\'' + key.replace(/'/g, "\\'") + '\',' + planned + ',' + actual + ')" title="Click to enter actual">' + (actual > 0 ? formatCurrency(actual) : '<i class=\'fas fa-edit\' style=\'font-size:10px\'></i>') + '</td>';
        });
        var rowDiff = rowPlannedTotal - rowActualTotal;
        html += '<td style="font-weight:600;font-size:12px;text-align:right">' + formatCurrency(rowPlannedTotal) + '</td>';
        html += '<td style="font-weight:600;font-size:12px;text-align:right;color:' + (rowDiff >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + formatCurrency(rowActualTotal) + '</td></tr>';
    });

    // Totals row
    html += '<tr style="background:var(--gray-50);font-weight:700"><td>TOTAL</td>';
    var grandPlanned = 0; var grandActual = 0;
    wps.forEach(function(w) {
        grandPlanned += wpTotalsPlanned[w.number];
        grandActual += wpTotalsActual[w.number];
        html += '<td style="text-align:right;font-size:12px">' + formatCurrency(wpTotalsPlanned[w.number]) + '</td>';
        html += '<td style="text-align:right;font-size:12px">' + formatCurrency(wpTotalsActual[w.number]) + '</td>';
    });
    html += '<td style="text-align:right;font-size:12px">' + formatCurrency(grandPlanned) + '</td>';
    html += '<td style="text-align:right;font-size:12px;color:' + (grandPlanned - grandActual >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + formatCurrency(grandActual) + '</td></tr>';

    html += '</tbody></table></div><div class="card-footer"><button class="btn btn-secondary btn-sm" onclick="openBudgetEntryModal()"><i class="fas fa-edit"></i> Edit Planned Budget</button></div></div>';
    return html;
}

function renderBudgetTransfers(budget) {
    if (!budget.partnerTransfers || budget.partnerTransfers.length === 0) {
        return '<div class="card"><div class="card-body" style="text-align:center;color:var(--gray-400);padding:40px">No transfers recorded yet.</div></div>';
    }
    return '<div class="card"><div class="card-header"><h2><i class="fas fa-exchange-alt"></i> Partner Transfers</h2></div><div class="card-body" style="padding:0"><table class="data-table"><thead><tr><th>Partner</th><th>Amount</th><th>Date</th><th>Type</th><th>Status</th></tr></thead><tbody>' +
        budget.partnerTransfers.map(function(t) {
            return '<tr><td style="font-weight:500">' + t.partner + '</td><td style="font-weight:600">' + formatCurrency(t.amount) + '</td><td>' + formatDate(t.date) + '</td><td>' + t.type + '</td><td><span class="status-badge status-' + (t.status === 'completed' ? 'completed' : 'pending') + '">' + t.status + '</span></td></tr>';
        }).join('') + '</tbody></table></div></div>';
}

function openBudgetEntryModal() {
    var partners = getCurrentPartners();
    var wps = getCurrentWPs();
    var budget = getCurrentBudget();
    var entries = budget.detailedEntries || {};

    if (partners.length === 0 || wps.length === 0) {
        alert('Please add partners and work packages first.');
        return;
    }

    var rows = '';
    partners.forEach(function(p) {
        wps.forEach(function(w) {
            var key = p.name + '|' + w.number;
            var planned = (entries[key] && entries[key].planned) || 0;
            rows += '<tr><td style="font-size:12px">' + p.name.substring(0, 20) + '</td><td><span class="wp-number">' + w.number + '</span></td><td><input type="number" class="form-input budgetPlannedInput" data-key="' + key + '" value="' + planned + '" style="padding:4px 8px;font-size:12px;width:100px"></td></tr>';
        });
    });

    openModal('Edit Planned Budget', '\
        <p style="color:var(--gray-500);font-size:13px;margin-bottom:16px">Enter the planned budget for each partner per work package as agreed at project start.</p>\
        <div style="max-height:400px;overflow-y:auto"><table class="data-table"><thead><tr><th>Partner</th><th>WP</th><th>Planned (&euro;)</th></tr></thead><tbody>' + rows + '</tbody></table></div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveBudgetPlan()"><i class="fas fa-save"></i> Save Plan</button>', true);
}

function saveBudgetPlan() {
    var pid = AppState.currentProjectId;
    if (!BudgetTracking[pid]) BudgetTracking[pid] = { wpStatus: [], partnerTransfers: [], detailedEntries: {} };
    if (!BudgetTracking[pid].detailedEntries) BudgetTracking[pid].detailedEntries = {};

    document.querySelectorAll('.budgetPlannedInput').forEach(function(input) {
        var key = input.dataset.key;
        var val = parseInt(input.value) || 0;
        if (!BudgetTracking[pid].detailedEntries[key]) BudgetTracking[pid].detailedEntries[key] = {};
        BudgetTracking[pid].detailedEntries[key].planned = val;
    });

    updateProjectField(pid, 'budgetTracking', BudgetTracking[pid]).then(function() {
        closeModal();
        navigateTo('budget');
        showToast('Budget plan saved!', 'success');
    });
}

function openActualEntryModal(key, planned, actual) {
    openModal('Enter Actual Expenditure', '\
        <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px"><strong>' + key.replace('|', '</strong> &rarr; <strong>') + '</strong></p>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Planned</label><input type="text" class="form-input" value="' + formatCurrency(planned) + '" disabled></div>\
            <div class="form-group"><label class="form-label">Actual Spent (&euro;)</label><input type="number" class="form-input" id="aeActual" value="' + actual + '"></div>\
        </div>\
        <div style="padding:12px;background:' + (planned - actual >= 0 ? 'var(--success-light)' : '#fef2f2') + ';border-radius:var(--radius);font-size:13px">\
            Difference: <strong style="color:' + (planned - actual >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + (planned - actual >= 0 ? '+' : '') + formatCurrency(planned - actual) + '</strong>\
        </div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveActualEntry(\'' + key.replace(/'/g, "\\'") + '\')"><i class="fas fa-save"></i> Save</button>');

    // Live update difference
    document.getElementById('aeActual').addEventListener('input', function() {
        var newActual = parseInt(this.value) || 0;
        var diff = planned - newActual;
        var diffEl = this.closest('.modal-body').querySelector('div[style*="padding:12px"]');
        if (diffEl) {
            diffEl.style.background = diff >= 0 ? 'var(--success-light)' : '#fef2f2';
            diffEl.innerHTML = 'Difference: <strong style="color:' + (diff >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + (diff >= 0 ? '+' : '') + formatCurrency(diff) + '</strong>';
        }
    });
}

function saveActualEntry(key) {
    var pid = AppState.currentProjectId;
    var actual = parseInt(document.getElementById('aeActual').value) || 0;
    if (!BudgetTracking[pid]) BudgetTracking[pid] = { wpStatus: [], partnerTransfers: [], detailedEntries: {} };
    if (!BudgetTracking[pid].detailedEntries) BudgetTracking[pid].detailedEntries = {};
    if (!BudgetTracking[pid].detailedEntries[key]) BudgetTracking[pid].detailedEntries[key] = {};
    BudgetTracking[pid].detailedEntries[key].actual = actual;

    updateProjectField(pid, 'budgetTracking', BudgetTracking[pid]).then(function() {
        closeModal();
        navigateTo('budget');
        showToast('Actual expenditure saved!', 'success');
    });
}

function openTimesheetModal() {
    var partners = getCurrentPartners();
    var pid = AppState.currentProjectId;
    var budget = getCurrentBudget();
    var timesheets = budget.timesheets || [];

    var existingRows = timesheets.map(function(ts, idx) {
        return '<tr><td>' + ts.person + '</td><td>' + ts.partner + '</td><td>' + ts.wp + '</td><td>' + ts.hours + 'h</td><td>' + ts.period + '</td><td>' + ts.description + '</td></tr>';
    }).join('');

    openModal('Timesheet', '\
        <p style="color:var(--gray-500);font-size:13px;margin-bottom:16px">Record staff time spent on project activities.</p>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Person Name</label><input type="text" class="form-input" id="tsPerson" placeholder="Full name"></div>\
            <div class="form-group"><label class="form-label">Partner</label><select class="form-select" id="tsPartner">' + partners.map(function(p) { return '<option>' + p.name + '</option>'; }).join('') + '</select></div>\
        </div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Work Package</label><select class="form-select" id="tsWP">' + getCurrentWPs().map(function(w) { return '<option value="' + w.number + '">' + w.number + ' - ' + w.title + '</option>'; }).join('') + '</select></div>\
            <div class="form-group"><label class="form-label">Hours</label><input type="number" class="form-input" id="tsHours" placeholder="40"></div>\
        </div>\
        <div class="form-row">\
            <div class="form-group"><label class="form-label">Period</label><input type="text" class="form-input" id="tsPeriod" placeholder="e.g., March 2026"></div>\
            <div class="form-group"><label class="form-label">Description</label><input type="text" class="form-input" id="tsDesc" placeholder="Activities performed"></div>\
        </div>\
        <button class="btn btn-sm btn-secondary mb-4" onclick="addTimesheetEntry()"><i class="fas fa-plus"></i> Add Entry</button>\
        ' + (timesheets.length > 0 ? '<div style="max-height:250px;overflow-y:auto"><table class="data-table"><thead><tr><th>Person</th><th>Partner</th><th>WP</th><th>Hours</th><th>Period</th><th>Description</th></tr></thead><tbody>' + existingRows + '</tbody></table></div>' : '<p style="color:var(--gray-400);font-size:13px">No timesheet entries yet.</p>') + '\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Close</button>', true);
}

function addTimesheetEntry() {
    var person = document.getElementById('tsPerson').value.trim();
    var partner = document.getElementById('tsPartner').value;
    var wp = document.getElementById('tsWP').value;
    var hours = parseInt(document.getElementById('tsHours').value) || 0;
    var period = document.getElementById('tsPeriod').value.trim();
    var desc = document.getElementById('tsDesc').value.trim();

    if (!person || !hours) { alert('Enter person name and hours.'); return; }

    var pid = AppState.currentProjectId;
    if (!BudgetTracking[pid]) BudgetTracking[pid] = { wpStatus: [], partnerTransfers: [], detailedEntries: {}, timesheets: [] };
    if (!BudgetTracking[pid].timesheets) BudgetTracking[pid].timesheets = [];

    BudgetTracking[pid].timesheets.push({ person: person, partner: partner, wp: wp, hours: hours, period: period, description: desc, createdAt: new Date().toISOString() });

    updateProjectField(pid, 'budgetTracking', BudgetTracking[pid]).then(function() {
        showToast('Timesheet entry added!', 'success');
        openTimesheetModal(); // Refresh
    });
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
                <button class="btn btn-secondary" onclick="generateTabReport(\'dissemination\')"><i class="fas fa-robot"></i> AI Report</button>\
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

// ---- TAB-SPECIFIC AI REPORTS ----
function generateTabReport(tab) {
    var project = getCurrentProject();
    if (!project) return;

    var title = '';
    var content = '';

    if (tab === 'tasks') {
        title = 'Tasks Report: ' + project.name;
        var tasks = getCurrentTasks();
        var pending = tasks.filter(function(t) { return t.status === 'pending'; });
        var inProgress = tasks.filter(function(t) { return t.status === 'in_progress'; });
        var completed = tasks.filter(function(t) { return t.status === 'completed'; });
        var overdue = tasks.filter(function(t) { return t.status !== 'completed' && t.due && new Date(t.due) < new Date(); });

        content = '<h3>Task Status Summary</h3>' +
            '<p>Total tasks: <strong>' + tasks.length + '</strong> | Completed: <strong>' + completed.length + '</strong> | In Progress: <strong>' + inProgress.length + '</strong> | Pending: <strong>' + pending.length + '</strong></p>' +
            (overdue.length > 0 ? '<p style="color:var(--danger)"><strong>Overdue tasks: ' + overdue.length + '</strong></p><ul>' + overdue.map(function(t) { return '<li>' + t.title + ' (assigned to ' + t.assignee + ', due ' + formatDate(t.due) + ')</li>'; }).join('') + '</ul>' : '<p style="color:var(--success)">No overdue tasks.</p>') +
            '<h3>Task Distribution by Work Package</h3><ul>' +
            getCurrentWPs().map(function(wp) {
                var wpTasks = tasks.filter(function(t) { return t.wp === wp.number; });
                return '<li><strong>' + wp.number + '</strong>: ' + wpTasks.length + ' tasks (' + wpTasks.filter(function(t) { return t.status === 'completed'; }).length + ' completed)</li>';
            }).join('') + '</ul>' +
            '<h3>Task Distribution by Assignee</h3><ul>' +
            getCurrentPartners().map(function(p) {
                var pTasks = tasks.filter(function(t) { return t.assignee === p.contact; });
                return pTasks.length > 0 ? '<li><strong>' + p.contact + '</strong> (' + p.name + '): ' + pTasks.length + ' tasks</li>' : '';
            }).filter(Boolean).join('') + '</ul>' +
            '<h3>Completion Rate</h3><p>' + (tasks.length > 0 ? Math.round(completed.length / tasks.length * 100) : 0) + '% of all tasks completed.</p>';
    }

    if (tab === 'budget') {
        title = 'Budget Report: ' + project.name;
        var partners = getCurrentPartners();
        var budget = getCurrentBudget();
        var totalPlanned = partners.reduce(function(s, p) { return s + (p.budget || 0); }, 0);
        var totalActual = partners.reduce(function(s, p) { return s + (p.spent || 0); }, 0);

        content = '<h3>Budget Execution Summary</h3>' +
            '<p>Total Grant: <strong>' + formatCurrency(project.totalBudget) + '</strong> (Lump Sum)</p>' +
            '<p>Total Planned (partner allocations): <strong>' + formatCurrency(totalPlanned) + '</strong></p>' +
            '<p>Total Actual Spent: <strong>' + formatCurrency(totalActual) + '</strong></p>' +
            '<p>Overall utilization: <strong>' + (totalPlanned > 0 ? Math.round(totalActual / totalPlanned * 100) : 0) + '%</strong></p>' +
            '<h3>Per Partner Budget Status</h3><table class="data-table"><thead><tr><th>Partner</th><th>Planned</th><th>Actual</th><th>Difference</th><th>Status</th></tr></thead><tbody>' +
            partners.map(function(p) {
                var diff = (p.budget || 0) - (p.spent || 0);
                return '<tr><td>' + p.name + '</td><td>' + formatCurrency(p.budget) + '</td><td>' + formatCurrency(p.spent || 0) + '</td><td style="color:' + (diff >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + (diff >= 0 ? '+' : '') + formatCurrency(diff) + '</td><td>' + (diff >= 0 ? 'Under budget' : 'Over budget') + '</td></tr>';
            }).join('') + '</tbody></table>' +
            (budget.timesheets && budget.timesheets.length > 0 ? '<h3>Timesheet Summary</h3><p>Total entries: ' + budget.timesheets.length + ' | Total hours: ' + budget.timesheets.reduce(function(s, t) { return s + (t.hours || 0); }, 0) + 'h</p>' : '');
    }

    if (tab === 'dissemination') {
        title = 'Dissemination Report: ' + project.name;
        var diss = getCurrentDissemination();
        var activities = diss.activities || [];

        content = '<h3>Dissemination Summary</h3>' +
            '<p>Total activities: <strong>' + activities.length + '</strong></p>' +
            '<p>Events: <strong>' + (diss.summary.events || 0) + '</strong> | Publications: <strong>' + (diss.summary.publications || 0) + '</strong></p>' +
            '<p>Total social media reach: <strong>' + (diss.summary.socialReach || 0).toLocaleString() + '</strong> | Website visits: <strong>' + (diss.summary.website_visits || 0).toLocaleString() + '</strong></p>' +
            '<h3>Activities by Type</h3><ul>';
        var typeCounts = {};
        activities.forEach(function(a) { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1; });
        Object.keys(typeCounts).forEach(function(type) { content += '<li>' + type + ': ' + typeCounts[type] + '</li>'; });
        content += '</ul>' +
            '<h3>Activities by Partner</h3><ul>';
        var partnerCounts = {};
        activities.forEach(function(a) { partnerCounts[a.partner] = (partnerCounts[a.partner] || 0) + 1; });
        Object.keys(partnerCounts).forEach(function(p) { content += '<li>' + p + ': ' + partnerCounts[p] + ' activities</li>'; });
        content += '</ul>' +
            '<h3>Recent Activities</h3><ul>' + activities.slice(-5).reverse().map(function(a) { return '<li>' + a.title + ' (' + a.type + ', ' + formatDate(a.date) + ')' + (a.link ? ' <a href="' + a.link + '" target="_blank">[link]</a>' : '') + '</li>'; }).join('') + '</ul>';
    }

    openModal(title, '\
        <div class="ai-report-output">\
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:16px">\
                <button class="btn btn-sm btn-ghost" onclick="copyReportToClipboard()"><i class="fas fa-copy"></i> Copy</button>\
            </div>\
            <div id="tabReportContent">' + content + '</div>\
            <hr style="margin:20px 0;border:none;border-top:1px solid var(--gray-200)">\
            <p style="font-size:12px;color:var(--gray-400)"><em>Generated on ' + new Date().toLocaleDateString('en-GB') + ' by EUProject Hub</em></p>\
        </div>\
    ', '<button class="btn btn-secondary" onclick="closeModal()">Close</button>', true);
}

function copyReportToClipboard() {
    var el = document.getElementById('tabReportContent');
    if (!el) return;
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
    showToast('Report copied to clipboard!', 'success');
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
