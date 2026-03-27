/* ====================================
   EUProject Hub — Page Renderers
   ==================================== */

// ---- DASHBOARD ----
function renderDashboard(container) {
    const project = getCurrentProject();
    const partners = getCurrentPartners();
    const tasks = getCurrentTasks();
    const activities = getCurrentActivities();
    const progress = getProjectProgress();
    const totalSpent = partners.reduce((s, p) => s + p.spent, 0);
    const openTasks = tasks.filter(t => t.status !== 'completed').length;

    container.innerHTML = `
        <div class="page-header">
            <h1>Dashboard</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="navigateTo('overview')"><i class="fas fa-plus"></i> New Project</button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Active Projects</span>
                    <div class="stat-card-icon" style="background:var(--primary-50);color:var(--primary)"><i class="fas fa-project-diagram"></i></div>
                </div>
                <div class="stat-card-value">2</div>
                <div class="stat-card-change positive"><i class="fas fa-arrow-up"></i> All on track</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Overall Progress</span>
                    <div class="stat-card-icon" style="background:var(--success-light);color:var(--success)"><i class="fas fa-chart-line"></i></div>
                </div>
                <div class="stat-card-value">${progress}%</div>
                <div class="progress-bar mt-4"><div class="progress-fill" style="width:${progress}%"></div></div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Open Tasks</span>
                    <div class="stat-card-icon" style="background:var(--warning-light);color:var(--warning)"><i class="fas fa-tasks"></i></div>
                </div>
                <div class="stat-card-value">${openTasks}</div>
                <div class="stat-card-change">${tasks.filter(t=>t.priority==='high'&&t.status!=='completed').length} high priority</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Budget Utilized</span>
                    <div class="stat-card-icon" style="background:var(--purple-light);color:var(--purple)"><i class="fas fa-euro-sign"></i></div>
                </div>
                <div class="stat-card-value">${formatCurrency(totalSpent)}</div>
                <div class="stat-card-change">of ${formatCurrency(project.totalBudget)}</div>
            </div>
        </div>

        <div class="content-grid">
            <div>
                <div class="card mb-6">
                    <div class="card-header">
                        <h2><i class="fas fa-stream"></i> Activity Stream</h2>
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo('overview')">View All</button>
                    </div>
                    <div class="card-body">
                        <div class="activity-feed">
                            ${activities.slice(0, 6).map(a => `
                                <div class="activity-item">
                                    <div class="activity-avatar">${a.initials}</div>
                                    <div class="activity-content">
                                        <div class="activity-text"><strong>${a.user}</strong> ${a.action} <strong>${a.target}</strong>${a.folder ? ` in ${a.folder}` : ''}</div>
                                        <div class="activity-time">${a.time}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-cubes"></i> Work Package Progress</h2>
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo('workpackages')">Manage WPs</button>
                    </div>
                    <div class="card-body">
                        ${getCurrentWPs().map(wp => `
                            <div style="margin-bottom:16px">
                                <div class="progress-label">
                                    <span>${wp.number}: ${wp.title}</span>
                                    <span>${wp.progress}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${wp.progress === 100 ? 'success' : wp.progress < 20 ? 'warning' : ''}" style="width:${wp.progress}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div>
                <div class="card mb-6">
                    <div class="card-header">
                        <h2><i class="fas fa-clipboard-check"></i> My Tasks</h2>
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo('tasks')">All Tasks</button>
                    </div>
                    <div class="card-body" style="padding:0">
                        <div class="task-list">
                            ${tasks.filter(t => t.status !== 'completed').slice(0, 5).map(t => `
                                <div class="task-item">
                                    <div class="task-checkbox" onclick="this.classList.toggle('checked');this.innerHTML=this.classList.contains('checked')?'<i class=\\'fas fa-check\\'></i>':''"></div>
                                    <div class="task-info">
                                        <div class="task-title">${t.title}</div>
                                        <div class="task-due"><span class="wp-number" style="font-size:10px">${t.wp}</span> Due: ${formatDate(t.due)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="card mb-6">
                    <div class="card-header">
                        <h2><i class="fas fa-users"></i> Partners</h2>
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo('partners')">View All</button>
                    </div>
                    <div class="card-body">
                        ${partners.slice(0, 4).map(p => `
                            <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
                                <div class="user-avatar" style="width:36px;height:36px;font-size:12px">${p.initials}</div>
                                <div style="flex:1">
                                    <div style="font-size:13px;font-weight:600;color:var(--gray-800)">${p.name}</div>
                                    <div style="font-size:11px;color:var(--gray-400)">${p.country} &middot; ${p.contact}</div>
                                </div>
                                <span class="partner-role ${p.role === 'coordinator' ? 'role-coordinator' : 'role-partner'}">${p.role}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-calendar"></i> Upcoming</h2>
                    </div>
                    <div class="card-body">
                        ${getCurrentMeetings().filter(m => m.status === 'upcoming').map(m => `
                            <div style="padding:8px 0;border-bottom:1px solid var(--gray-100)">
                                <div style="font-size:14px;font-weight:600;color:var(--gray-800)">${m.title}</div>
                                <div style="font-size:12px;color:var(--gray-500);margin-top:4px"><i class="fas fa-map-marker-alt"></i> ${m.location}</div>
                                <div style="font-size:12px;color:var(--gray-400);margin-top:2px"><i class="fas fa-clock"></i> ${formatDate(m.date)}</div>
                            </div>
                        `).join('') || '<p class="text-sm text-muted">No upcoming meetings</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ---- MY PROJECTS ----
function renderProjects(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>My Projects</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openNewProjectModal()"><i class="fas fa-plus"></i> Create Project</button>
            </div>
        </div>
        <div class="tabs">
            <button class="tab-btn active">Current Projects (2)</button>
            <button class="tab-btn">Archived (0)</button>
        </div>
        <div class="wp-grid">
            ${Object.values(Projects).map(p => `
                <div class="wp-card" onclick="AppState.currentProjectId='${p.id}';document.getElementById('projectSelector').value='${p.id}';navigateTo('overview')">
                    <div class="wp-card-header">
                        <span class="wp-number">${p.programme}</span>
                        <span class="status-badge status-active">Active</span>
                    </div>
                    <h3>${p.name}</h3>
                    <p>${p.description.substring(0, 120)}...</p>
                    <div style="margin:12px 0">
                        <div class="progress-label"><span>Progress</span><span>${Math.round((WorkPackages[p.id] || []).reduce((s,w)=>s+w.progress,0) / (WorkPackages[p.id] || [1]).length)}%</span></div>
                        <div class="progress-bar"><div class="progress-fill" style="width:${Math.round((WorkPackages[p.id] || []).reduce((s,w)=>s+w.progress,0) / (WorkPackages[p.id] || [1]).length)}%"></div></div>
                    </div>
                    <div class="wp-meta">
                        <span><i class="fas fa-users"></i> ${(Partners[p.id]||[]).length} partners</span>
                        <span><i class="fas fa-euro-sign"></i> ${formatCurrency(p.totalBudget)}</span>
                        <span><i class="fas fa-clock"></i> ${p.duration} months</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function openNewProjectModal() {
    openModal('Create New Project', `
        <div class="form-group">
            <label class="form-label">Project Name</label>
            <input type="text" class="form-input" placeholder="e.g., DigiSkills4EU">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Programme</label>
                <select class="form-select">
                    <option>Erasmus+ KA220-HED</option>
                    <option>Erasmus+ KA220-VET</option>
                    <option>Erasmus+ KA220-SCH</option>
                    <option>Erasmus+ KA220-ADU</option>
                    <option>Erasmus+ KA220-YOU</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Grant Amount (Lump Sum)</label>
                <select class="form-select">
                    <option>€120,000</option>
                    <option selected>€250,000</option>
                    <option>€400,000</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-input">
            </div>
            <div class="form-group">
                <label class="form-label">Duration (months)</label>
                <select class="form-select">
                    <option>12</option>
                    <option selected>24</option>
                    <option>36</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Project Number</label>
            <input type="text" class="form-input" placeholder="e.g., 2025-1-PL01-KA220-HED-000123456">
        </div>
        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" rows="3" placeholder="Brief project description..."></textarea>
        </div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal();navigateTo('projects')"><i class="fas fa-check"></i> Create Project</button>`, true);
}

// ---- PROJECT OVERVIEW ----
function renderOverview(container) {
    const p = getCurrentProject();
    const partners = getCurrentPartners();
    const wps = getCurrentWPs();
    const progress = getProjectProgress();
    const elapsed = getMonthsElapsed(p.startDate);
    const totalSpent = partners.reduce((s, pr) => s + pr.spent, 0);

    container.innerHTML = `
        <div class="page-header">
            <h1>${p.name}</h1>
            <div class="page-header-actions">
                <button class="btn btn-secondary"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-primary" onclick="navigateTo('ai-report')"><i class="fas fa-robot"></i> Generate Report</button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header"><span class="stat-card-label">Programme</span></div>
                <div class="stat-card-value" style="font-size:18px">${p.programme}</div>
                <div class="stat-card-change">${p.projectNumber}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header"><span class="stat-card-label">Duration</span></div>
                <div class="stat-card-value">${elapsed}/${p.duration}</div>
                <div class="stat-card-change">months elapsed</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header"><span class="stat-card-label">Progress</span></div>
                <div class="stat-card-value">${progress}%</div>
                <div class="progress-bar mt-4"><div class="progress-fill" style="width:${progress}%"></div></div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header"><span class="stat-card-label">Total Grant</span></div>
                <div class="stat-card-value" style="color:var(--primary)">${formatCurrency(p.totalBudget)}</div>
                <div class="stat-card-change">${formatCurrency(totalSpent)} spent (${Math.round(totalSpent/p.totalBudget*100)}%)</div>
            </div>
        </div>

        <div class="content-grid">
            <div>
                <div class="card mb-6">
                    <div class="card-header"><h2>Project Description</h2></div>
                    <div class="card-body"><p style="line-height:1.8;color:var(--gray-600)">${p.description}</p>
                        <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
                            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Start Date</strong><br>${formatDate(p.startDate)}</div>
                            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">End Date</strong><br>${formatDate(p.endDate)}</div>
                            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Coordinator</strong><br>${p.coordinator}</div>
                            <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius)"><strong style="font-size:12px;color:var(--gray-500)">Country</strong><br>${p.coordinatorCountry}</div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><h2>Work Packages</h2><button class="btn btn-sm btn-ghost" onclick="navigateTo('workpackages')">View All</button></div>
                    <div class="card-body" style="padding:0">
                        <table class="data-table">
                            <thead><tr><th>WP</th><th>Title</th><th>Lead</th><th>Status</th><th>Progress</th></tr></thead>
                            <tbody>
                                ${wps.map(wp => `<tr>
                                    <td><span class="wp-number">${wp.number}</span></td>
                                    <td style="font-weight:500">${wp.title}</td>
                                    <td style="font-size:13px">${wp.lead.split(' ').slice(-1)[0]}</td>
                                    <td><span class="status-badge status-${wp.status}">${wp.status}</span></td>
                                    <td style="width:120px"><div class="progress-bar"><div class="progress-fill ${wp.progress===100?'success':''}" style="width:${wp.progress}%"></div></div></td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div>
                <div class="card mb-6">
                    <div class="card-header"><h2>Partners (${partners.length})</h2></div>
                    <div class="card-body">
                        ${partners.map(pr => `
                            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100)">
                                <div class="partner-avatar" style="width:40px;height:40px;font-size:14px">${pr.initials}</div>
                                <div style="flex:1">
                                    <div style="font-size:13px;font-weight:600">${pr.name}</div>
                                    <div style="font-size:11px;color:var(--gray-400)">${pr.country}</div>
                                </div>
                                <span class="partner-role ${pr.role==='coordinator'?'role-coordinator':'role-partner'}">${pr.role}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><h2>Quick Actions</h2></div>
                    <div class="card-body" style="display:flex;flex-direction:column;gap:8px">
                        <button class="btn btn-secondary btn-block" onclick="navigateTo('tasks')" style="justify-content:flex-start"><i class="fas fa-plus"></i> Add Task</button>
                        <button class="btn btn-secondary btn-block" onclick="navigateTo('documents')" style="justify-content:flex-start"><i class="fas fa-upload"></i> Upload Document</button>
                        <button class="btn btn-secondary btn-block" onclick="navigateTo('dissemination')" style="justify-content:flex-start"><i class="fas fa-bullhorn"></i> Log Dissemination</button>
                        <button class="btn btn-secondary btn-block" onclick="navigateTo('meetings')" style="justify-content:flex-start"><i class="fas fa-calendar-plus"></i> Plan Meeting</button>
                        <button class="btn btn-primary btn-block" onclick="navigateTo('ai-report')" style="justify-content:flex-start"><i class="fas fa-robot"></i> Generate AI Report</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
