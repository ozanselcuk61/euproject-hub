/* ====================================
   EUProject Hub — Page Renderers Part 3
   Budget, Dissemination, Meetings, AI Report, Settings
   ==================================== */

// ---- BUDGET & FINANCE ----
function renderBudget(container) {
    const project = getCurrentProject();
    const partners = getCurrentPartners();
    const wps = getCurrentWPs();
    const budget = getCurrentBudget();
    const totalSpent = partners.reduce((s, p) => s + p.spent, 0);
    const remaining = project.totalBudget - totalSpent;

    container.innerHTML = `
        <div class="page-header">
            <h1>Budget & Finance</h1>
            <div class="page-header-actions">
                <button class="btn btn-secondary"><i class="fas fa-download"></i> Export</button>
                <button class="btn btn-primary" onclick="openTransferModal()"><i class="fas fa-exchange-alt"></i> Record Transfer</button>
            </div>
        </div>

        <div class="budget-summary">
            <div class="budget-card">
                <div class="budget-amount total">${formatCurrency(project.totalBudget)}</div>
                <div class="budget-label">Total Grant (Lump Sum)</div>
            </div>
            <div class="budget-card">
                <div class="budget-amount spent">${formatCurrency(totalSpent)}</div>
                <div class="budget-label">Total Utilized (${Math.round(totalSpent/project.totalBudget*100)}%)</div>
            </div>
            <div class="budget-card">
                <div class="budget-amount remaining">${formatCurrency(remaining)}</div>
                <div class="budget-label">Remaining</div>
            </div>
        </div>

        <div class="content-grid-equal mb-6">
            <div class="card">
                <div class="card-header"><h2>Budget per Work Package</h2></div>
                <div class="card-body" style="padding:0">
                    <table class="data-table">
                        <thead><tr><th>Work Package</th><th>Allocated</th><th>Completion</th><th>Payment</th></tr></thead>
                        <tbody>
                            ${(budget.wpStatus.length > 0 ? budget.wpStatus : wps.map(w => ({wp: w.number, allocated: w.budget, completionStatus: w.progress, paymentReleased: w.progress === 100}))).map(ws => `<tr>
                                <td><span class="wp-number">${ws.wp}</span></td>
                                <td style="font-weight:600">${formatCurrency(ws.allocated)}</td>
                                <td>
                                    <div style="display:flex;align-items:center;gap:8px">
                                        <div class="progress-bar" style="flex:1"><div class="progress-fill ${ws.completionStatus===100?'success':''}" style="width:${ws.completionStatus}%"></div></div>
                                        <span style="font-size:12px;font-weight:600">${ws.completionStatus}%</span>
                                    </div>
                                </td>
                                <td>${ws.paymentReleased ? '<span class="status-badge status-completed">Released</span>' : '<span class="status-badge status-pending">Pending</span>'}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="card-footer">
                    <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600">
                        <span>Total</span>
                        <span>${formatCurrency(project.totalBudget)}</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2>Budget per Partner</h2></div>
                <div class="card-body" style="padding:0">
                    <table class="data-table">
                        <thead><tr><th>Partner</th><th>Allocated</th><th>Spent</th><th>Utilization</th></tr></thead>
                        <tbody>
                            ${partners.map(p => `<tr>
                                <td>
                                    <div style="display:flex;align-items:center;gap:8px">
                                        <div class="task-assignee-avatar">${p.initials}</div>
                                        <span style="font-weight:500;font-size:13px">${p.name.length > 25 ? p.name.substring(0,25)+'...' : p.name}</span>
                                    </div>
                                </td>
                                <td style="font-weight:600">${formatCurrency(p.budget)}</td>
                                <td>${formatCurrency(p.spent)}</td>
                                <td>
                                    <div style="display:flex;align-items:center;gap:8px">
                                        <div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:${Math.round(p.spent/p.budget*100)}%"></div></div>
                                        <span style="font-size:12px;font-weight:600">${Math.round(p.spent/p.budget*100)}%</span>
                                    </div>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        ${budget.partnerTransfers && budget.partnerTransfers.length > 0 ? `
        <div class="card">
            <div class="card-header"><h2><i class="fas fa-exchange-alt"></i> Partner Transfers</h2></div>
            <div class="card-body" style="padding:0">
                <table class="data-table">
                    <thead><tr><th>Partner</th><th>Amount</th><th>Date</th><th>Type</th><th>Status</th></tr></thead>
                    <tbody>
                        ${budget.partnerTransfers.map(t => `<tr>
                            <td style="font-weight:500">${t.partner}</td>
                            <td style="font-weight:600">${formatCurrency(t.amount)}</td>
                            <td>${formatDate(t.date)}</td>
                            <td>${t.type}</td>
                            <td><span class="status-badge status-${t.status === 'completed' ? 'completed' : 'pending'}">${t.status}</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>` : ''}
    `;
}

function openTransferModal() {
    openModal('Record Partner Transfer', `
        <div class="form-group"><label class="form-label">Partner</label><select class="form-select">${getCurrentPartners().filter(p=>p.role!=='coordinator').map(p => `<option>${p.name}</option>`).join('')}</select></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Amount (€)</label><input type="number" class="form-input" placeholder="10000"></div>
            <div class="form-group"><label class="form-label">Transfer Date</label><input type="date" class="form-input"></div>
        </div>
        <div class="form-group"><label class="form-label">Type</label><select class="form-select"><option>Pre-financing</option><option>Interim payment</option><option>Final payment</option></select></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" rows="2" placeholder="Optional notes..."></textarea></div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="fas fa-check"></i> Record Transfer</button>`);
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
                            <td style="font-size:13px">${a.partner.split(' ').slice(-1)[0]}</td>
                            <td style="font-weight:600">${a.reach.toLocaleString()}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openAddDisseminationModal() {
    openModal('Log Dissemination Activity', `
        <div class="form-row">
            <div class="form-group"><label class="form-label">Type</label><select class="form-select"><option>Event</option><option>Publication</option><option>Social Media</option><option>Newsletter</option><option>Website</option><option>Press Release</option><option>Multiplier Event</option></select></div>
            <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input"></div>
        </div>
        <div class="form-group"><label class="form-label">Title / Description</label><input type="text" class="form-input" placeholder="Activity title"></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Partner</label><select class="form-select">${getCurrentPartners().map(p => `<option>${p.name}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label">Estimated Reach</label><input type="number" class="form-input" placeholder="500"></div>
        </div>
        <div class="form-group"><label class="form-label">Link (optional)</label><input type="url" class="form-input" placeholder="https://..."></div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="fas fa-check"></i> Save Activity</button>`);
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
                    <button class="btn btn-sm btn-ghost" onclick="openMeetingDetail(${m.id})"><i class="fas fa-eye"></i> Details</button>
                </div>
            </div>
        `).join('')}
    `;
}

function openMeetingDetail(meetingId) {
    const m = getCurrentMeetings().find(mt => mt.id === meetingId);
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
        '<button class="btn btn-sm btn-primary" onclick="window.print()"><i class="fas fa-file-pdf"></i> Print / Save PDF</button></div>' +
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
        '<button class="btn btn-sm btn-primary" onclick="window.print()"><i class="fas fa-file-pdf"></i> Print / Save PDF</button></div>' +
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
