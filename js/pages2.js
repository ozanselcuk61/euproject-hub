/* ====================================
   EUProject Hub — Page Renderers Part 2
   ==================================== */

// ---- PARTNERS ----
function renderPartners(container) {
    const partners = getCurrentPartners();
    const project = getCurrentProject();
    container.innerHTML = `
        <div class="page-header">
            <h1>Partners</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openAddPartnerModal()"><i class="fas fa-user-plus"></i> Add Partner</button>
            </div>
        </div>
        <div class="partner-grid">
            ${partners.map(p => `
                <div class="partner-card">
                    <div class="partner-avatar">${p.initials}</div>
                    <h3>${p.name}</h3>
                    <div class="partner-country"><i class="fas fa-map-marker-alt"></i> ${p.country}</div>
                    <span class="partner-role ${p.role === 'coordinator' ? 'role-coordinator' : 'role-partner'}">${p.role}</span>
                    <div style="margin-top:16px;text-align:left;padding:12px;background:var(--gray-50);border-radius:var(--radius)">
                        <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px">Contact Person</div>
                        <div style="font-size:14px;font-weight:600">${p.contact}</div>
                        <div style="font-size:12px;color:var(--primary)">${p.email}</div>
                    </div>
                    <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:center">
                        <div style="padding:8px;background:var(--primary-50);border-radius:var(--radius)">
                            <div style="font-size:16px;font-weight:800;color:var(--primary)">${formatCurrency(p.budget)}</div>
                            <div style="font-size:10px;color:var(--gray-500)">Budget</div>
                        </div>
                        <div style="padding:8px;background:var(--success-light);border-radius:var(--radius)">
                            <div style="font-size:16px;font-weight:800;color:var(--success)">${Math.round(p.spent/p.budget*100)}%</div>
                            <div style="font-size:10px;color:var(--gray-500)">Utilized</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function openAddPartnerModal() {
    openModal('Add Partner Organization', `
        <div class="form-group"><label class="form-label">Organization Name</label><input type="text" class="form-input" placeholder="e.g., University of Helsinki"></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Country</label><select class="form-select"><option>Select country...</option><option>Austria</option><option>Belgium</option><option>Bulgaria</option><option>Croatia</option><option>Cyprus</option><option>Czech Republic</option><option>Denmark</option><option>Estonia</option><option>Finland</option><option>France</option><option>Germany</option><option>Greece</option><option>Hungary</option><option>Ireland</option><option>Italy</option><option>Latvia</option><option>Lithuania</option><option>Luxembourg</option><option>Malta</option><option>Netherlands</option><option>Poland</option><option>Portugal</option><option>Romania</option><option>Slovakia</option><option>Slovenia</option><option>Spain</option><option>Sweden</option><option>Turkey</option></select></div>
            <div class="form-group"><label class="form-label">Role</label><select class="form-select"><option>Partner</option><option>Associated Partner</option></select></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Contact Person</label><input type="text" class="form-input" placeholder="Full name"></div>
            <div class="form-group"><label class="form-label">Contact Email</label><input type="email" class="form-input" placeholder="email@university.edu"></div>
        </div>
        <div class="form-group"><label class="form-label">Budget Allocation (€)</label><input type="number" class="form-input" placeholder="50000"></div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="fas fa-check"></i> Add Partner</button>`);
}

// ---- WORK PACKAGES ----
function renderWorkPackages(container) {
    const wps = getCurrentWPs();
    container.innerHTML = `
        <div class="page-header">
            <h1>Work Packages</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openAddWPModal()"><i class="fas fa-plus"></i> Add Work Package</button>
            </div>
        </div>
        <div class="wp-grid">
            ${wps.map(wp => `
                <div class="wp-card" onclick="openWPDetail('${wp.id}')">
                    <div class="wp-card-header">
                        <span class="wp-number">${wp.number}</span>
                        <span class="status-badge status-${wp.status}">${wp.status}</span>
                    </div>
                    <h3>${wp.title}</h3>
                    <p>${wp.description.substring(0, 100)}...</p>
                    <div style="margin:12px 0">
                        <div class="progress-label"><span>Progress</span><span>${wp.progress}%</span></div>
                        <div class="progress-bar"><div class="progress-fill ${wp.progress===100?'success':''}" style="width:${wp.progress}%"></div></div>
                    </div>
                    <div class="wp-meta">
                        <span><i class="fas fa-user"></i> ${wp.lead.split(' ').slice(-1)[0]}</span>
                        <span><i class="fas fa-calendar"></i> ${wp.start}-${wp.end}</span>
                        <span><i class="fas fa-euro-sign"></i> ${formatCurrency(wp.budget)}</span>
                    </div>
                    <div style="margin-top:12px">
                        <div style="font-size:11px;font-weight:600;color:var(--gray-500);margin-bottom:6px">DELIVERABLES</div>
                        ${wp.deliverables.map(d => `<div style="font-size:12px;color:var(--gray-600);padding:3px 0"><i class="fas fa-file-alt" style="color:var(--gray-400);margin-right:6px"></i>${d}</div>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function openWPDetail(wpId) {
    const wp = getCurrentWPs().find(w => w.id === wpId);
    if (!wp) return;
    const tasks = getCurrentTasks().filter(t => t.wp === wp.number);
    openModal(wp.number + ': ' + wp.title, `
        <div style="margin-bottom:16px"><span class="status-badge status-${wp.status}">${wp.status}</span> <span style="margin-left:8px;font-size:13px;color:var(--gray-500)">Lead: ${wp.lead}</span></div>
        <p style="color:var(--gray-600);line-height:1.7;margin-bottom:20px">${wp.description}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
            <div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:20px;font-weight:800;color:var(--primary)">${wp.progress}%</div><div style="font-size:11px;color:var(--gray-500)">Complete</div></div>
            <div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:20px;font-weight:800">${formatCurrency(wp.budget)}</div><div style="font-size:11px;color:var(--gray-500)">Budget</div></div>
            <div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius)"><div style="font-size:20px;font-weight:800">${wp.start}-${wp.end}</div><div style="font-size:11px;color:var(--gray-500)">Timeline</div></div>
        </div>
        <h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Deliverables</h3>
        ${wp.deliverables.map((d, i) => `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
            <div class="task-checkbox ${wp.progress===100||i<Math.floor(wp.deliverables.length*wp.progress/100)?'checked':''}"><i class="fas fa-check"></i></div>
            <span style="font-size:13px">${d}</span>
        </div>`).join('')}
        ${tasks.length > 0 ? `<h3 style="font-size:14px;font-weight:700;margin:20px 0 12px">Related Tasks</h3>
        ${tasks.map(t => `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;font-size:13px;border-bottom:1px solid var(--gray-100)">
            <span class="status-badge status-${t.status === 'in_progress' ? 'active' : t.status === 'completed' ? 'completed' : 'pending'}">${t.status.replace('_', ' ')}</span>
            <span>${t.title}</span>
        </div>`).join('')}` : ''}
    `, `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`, true);
}

function openAddWPModal() {
    openModal('Add Work Package', `
        <div class="form-row">
            <div class="form-group"><label class="form-label">WP Number</label><input type="text" class="form-input" placeholder="e.g., WP7"></div>
            <div class="form-group"><label class="form-label">Lead Partner</label><select class="form-select">${getCurrentPartners().map(p => `<option>${p.name}</option>`).join('')}</select></div>
        </div>
        <div class="form-group"><label class="form-label">Title</label><input type="text" class="form-input" placeholder="Work package title"></div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" rows="3"></textarea></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Start (Month)</label><input type="text" class="form-input" placeholder="M1"></div>
            <div class="form-group"><label class="form-label">End (Month)</label><input type="text" class="form-input" placeholder="M24"></div>
        </div>
        <div class="form-group"><label class="form-label">Budget (€)</label><input type="number" class="form-input" placeholder="40000"></div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="fas fa-check"></i> Create WP</button>`);
}

// ---- TASKS ----
function renderTasks(container) {
    const tasks = getCurrentTasks();
    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const completed = tasks.filter(t => t.status === 'completed');

    container.innerHTML = `
        <div class="page-header">
            <h1>Tasks</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openAddTaskModal()"><i class="fas fa-plus"></i> Add Task</button>
            </div>
        </div>
        <div class="tabs" id="taskTabs">
            <button class="tab-btn active" onclick="showTaskView('board')">Board View</button>
            <button class="tab-btn" onclick="showTaskView('list')">List View</button>
        </div>
        <div id="taskBoard" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
            <div class="card">
                <div class="card-header" style="background:var(--warning-light)"><h2 style="font-size:14px">Pending (${pending.length})</h2></div>
                <div class="card-body" style="padding:12px">
                    ${pending.map(t => renderTaskCard(t)).join('')}
                </div>
            </div>
            <div class="card">
                <div class="card-header" style="background:var(--primary-100)"><h2 style="font-size:14px">In Progress (${inProgress.length})</h2></div>
                <div class="card-body" style="padding:12px">
                    ${inProgress.map(t => renderTaskCard(t)).join('')}
                </div>
            </div>
            <div class="card">
                <div class="card-header" style="background:var(--success-light)"><h2 style="font-size:14px">Completed (${completed.length})</h2></div>
                <div class="card-body" style="padding:12px">
                    ${completed.map(t => renderTaskCard(t)).join('')}
                </div>
            </div>
        </div>
        <div id="taskList" class="card hidden">
            <div class="card-body" style="padding:0">
                <table class="data-table">
                    <thead><tr><th>Task</th><th>WP</th><th>Assignee</th><th>Due Date</th><th>Priority</th><th>Status</th></tr></thead>
                    <tbody>
                        ${tasks.map(t => `<tr>
                            <td style="font-weight:500">${t.title}</td>
                            <td><span class="wp-number">${t.wp}</span></td>
                            <td><div class="task-assignee"><div class="task-assignee-avatar">${t.assigneeInitials}</div>${t.assignee.split(' ')[0]}</div></td>
                            <td>${formatDate(t.due)}</td>
                            <td><span class="status-badge ${t.priority==='high'?'status-overdue':t.priority==='medium'?'status-pending':'status-draft'}">${t.priority}</span></td>
                            <td><span class="status-badge status-${t.status==='in_progress'?'active':t.status==='completed'?'completed':'pending'}">${t.status.replace('_',' ')}</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderTaskCard(t) {
    return `<div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);padding:14px;margin-bottom:10px;${t.priority==='high'?'border-left:3px solid var(--danger)':''}">
        <div style="font-size:13px;font-weight:600;color:var(--gray-800);margin-bottom:6px">${t.title}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="wp-number" style="font-size:10px">${t.wp}</span>
            <div style="display:flex;align-items:center;gap:6px">
                <div class="task-assignee-avatar">${t.assigneeInitials}</div>
                <span style="font-size:11px;color:var(--gray-400)">${formatDate(t.due)}</span>
            </div>
        </div>
    </div>`;
}

function showTaskView(view) {
    document.querySelectorAll('#taskTabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (view === 'board') {
        event.target.classList.add('active');
        document.getElementById('taskBoard').classList.remove('hidden');
        document.getElementById('taskList').classList.add('hidden');
    } else {
        event.target.classList.add('active');
        document.getElementById('taskBoard').classList.add('hidden');
        document.getElementById('taskList').classList.remove('hidden');
    }
}

function openAddTaskModal() {
    openModal('Add New Task', `
        <div class="form-group"><label class="form-label">Task Title</label><input type="text" class="form-input" placeholder="What needs to be done?"></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Work Package</label><select class="form-select">${getCurrentWPs().map(w => `<option>${w.number} - ${w.title}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label">Assignee</label><select class="form-select">${getCurrentPartners().map(p => `<option>${p.contact}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-input"></div>
            <div class="form-group"><label class="form-label">Priority</label><select class="form-select"><option>Low</option><option selected>Medium</option><option>High</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" rows="2"></textarea></div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="fas fa-check"></i> Create Task</button>`);
}

// ---- DOCUMENTS ----
function renderDocuments(container) {
    const docs = getCurrentDocuments();
    let currentFolder = null;

    container.innerHTML = `
        <div class="page-header">
            <h1>Documents</h1>
            <div class="page-header-actions">
                <button class="btn btn-secondary" onclick="openModal('Create Folder','<div class=\\'form-group\\'><label class=\\'form-label\\'>Folder Name</label><input type=\\'text\\' class=\\'form-input\\' placeholder=\\'New folder name\\'></div>','<button class=\\'btn btn-secondary\\' onclick=\\'closeModal()\\'>Cancel</button><button class=\\'btn btn-primary\\' onclick=\\'closeModal()\\'>Create</button>')"><i class="fas fa-folder-plus"></i> New Folder</button>
                <button class="btn btn-primary"><i class="fas fa-upload"></i> Upload File</button>
            </div>
        </div>
        <div id="docBreadcrumb" style="margin-bottom:20px;font-size:14px">
            <a href="#" onclick="renderDocFolders()" style="font-weight:600"><i class="fas fa-home"></i> All Files</a>
        </div>
        <div id="docContent">
            <div class="file-grid">
                ${docs.folders.map(f => `
                    <div class="file-card" onclick="renderDocFiles('${f.id}')">
                        <div class="file-icon folder"><i class="fas fa-folder"></i></div>
                        <div class="file-name">${f.name}</div>
                        <div class="file-meta">${f.files.length} files</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    window.renderDocFolders = () => {
        document.getElementById('docBreadcrumb').innerHTML = '<a href="#" onclick="renderDocFolders()" style="font-weight:600"><i class="fas fa-home"></i> All Files</a>';
        document.getElementById('docContent').innerHTML = `<div class="file-grid">${docs.folders.map(f => `
            <div class="file-card" onclick="renderDocFiles('${f.id}')">
                <div class="file-icon folder"><i class="fas fa-folder"></i></div>
                <div class="file-name">${f.name}</div>
                <div class="file-meta">${f.files.length} files</div>
            </div>
        `).join('')}</div>`;
    };

    window.renderDocFiles = (folderId) => {
        const folder = docs.folders.find(f => f.id === folderId);
        if (!folder) return;
        const iconMap = { pdf: 'fa-file-pdf', doc: 'fa-file-word', xls: 'fa-file-excel', img: 'fa-file-image', generic: 'fa-file-archive' };
        document.getElementById('docBreadcrumb').innerHTML = `<a href="#" onclick="renderDocFolders()"><i class="fas fa-home"></i> All Files</a> <i class="fas fa-chevron-right" style="font-size:10px;margin:0 8px;color:var(--gray-400)"></i> <span style="font-weight:600">${folder.name}</span>`;
        document.getElementById('docContent').innerHTML = `<div class="file-grid">${folder.files.map(f => `
            <div class="file-card">
                <div class="file-icon ${f.type}"><i class="fas ${iconMap[f.type] || 'fa-file'}"></i></div>
                <div class="file-name">${f.name}</div>
                <div class="file-meta">${f.size} &middot; ${f.uploaded}</div>
                <div style="font-size:10px;color:var(--gray-400);margin-top:2px">${f.by}</div>
            </div>
        `).join('')}</div>`;
    };
}
