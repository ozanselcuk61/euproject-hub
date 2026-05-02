/* ====================================
   EUProject Hub — Data Layer (Firestore)
   MIGRATED: Top-level projects collection with ownerId/members
   ==================================== */

const AppState = {
    currentUser: null,
    currentProjectId: null,
    currentPage: 'dashboard',
};

let Projects = {};
let Partners = {};
let WorkPackages = {};
let Tasks = {};
let Documents = {};
let Meetings = {};
let Dissemination = {};
let ActivityStream = {};
let BudgetTracking = {};

// ---- FIRESTORE REFERENCES (New Structure) ----
// Projects are now at: /projects/{projectId}
// Subcollections at: /projects/{projectId}/partners, /workpackages, /tasks, etc.

function getProjectRef(projectId) {
    return db.collection('projects').doc(projectId);
}

function getSubCollection(projectId, sub) {
    return db.collection('projects').doc(projectId).collection(sub);
}

// ---- LOAD ALL USER DATA ----
function loadUserData() {
    if (!AppState.currentUser) return Promise.resolve();
    var uid = AppState.currentUser.id;
    var email = AppState.currentUser.email;

    Projects = {}; Partners = {}; WorkPackages = {}; Tasks = {};
    Documents = {}; Meetings = {}; Dissemination = {};
    ActivityStream = {}; BudgetTracking = {};

    // Load projects where user is owner OR member
    var ownedQuery = db.collection('projects').where('ownerId', '==', uid).get();
    var memberQuery = db.collection('projects').where('members', 'array-contains', email).get();

    // Also try loading from old structure (migration support)
    var oldQuery = db.collection('users').doc(uid).collection('projects').get();

    return Promise.all([ownedQuery, memberQuery, oldQuery])
        .then(function(results) {
            var ownedSnap = results[0];
            var memberSnap = results[1];
            var oldSnap = results[2];
            var migrationPromises = [];

            // Load owned projects
            ownedSnap.forEach(function(doc) {
                var p = doc.data(); p.id = doc.id;
                Projects[doc.id] = p;
            });

            // Load shared projects (where user is a member)
            memberSnap.forEach(function(doc) {
                if (!Projects[doc.id]) {
                    var p = doc.data(); p.id = doc.id; p._shared = true;
                    Projects[doc.id] = p;
                }
            });

            // Migrate old projects if they exist and new ones don't
            if (!oldSnap.empty && ownedSnap.empty) {
                oldSnap.forEach(function(doc) {
                    if (!Projects[doc.id]) {
                        var p = doc.data(); p.id = doc.id;
                        p.ownerId = uid;
                        p.ownerEmail = email;
                        p.members = [email];
                        Projects[doc.id] = p;
                        // Migrate to new location
                        migrationPromises.push(migrateProject(uid, doc.id, p));
                    }
                });
            }

            if (Object.keys(Projects).length === 0) {
                AppState.currentProjectId = null;
                updateProjectSelector();
                return;
            }

            // Load subcollections for all projects
            var loadPromises = migrationPromises.slice();
            Object.keys(Projects).forEach(function(pid) {
                loadPromises.push(loadSubCollection(pid, 'partners', Partners));
                loadPromises.push(loadSubCollection(pid, 'workpackages', WorkPackages));
                loadPromises.push(loadSubCollection(pid, 'tasks', Tasks));
                loadPromises.push(loadSubCollection(pid, 'meetings', Meetings));
                loadPromises.push(loadDissemination(pid));
                loadPromises.push(loadDocuments(pid));
            });

            return Promise.all(loadPromises).then(function() {
                var projectIds = Object.keys(Projects);
                if (!AppState.currentProjectId || !Projects[AppState.currentProjectId]) {
                    AppState.currentProjectId = projectIds[0] || null;
                }
                updateProjectSelector();
            });
        })
        .catch(function(error) {
            console.error('Error loading user data:', error);
        });
}

// Migrate a project from old structure to new
function migrateProject(uid, projectId, projectData) {
    console.log('Migrating project:', projectId);
    var newRef = db.collection('projects').doc(projectId);

    return newRef.set(projectData, { merge: true }).then(function() {
        // Copy subcollections
        var subs = ['partners', 'workpackages', 'tasks', 'meetings', 'dissemination', 'documents', 'activities'];
        var copyPromises = subs.map(function(sub) {
            return db.collection('users').doc(uid).collection('projects').doc(projectId).collection(sub).get()
                .then(function(snap) {
                    var batch = db.batch();
                    snap.forEach(function(doc) {
                        batch.set(newRef.collection(sub).doc(doc.id), doc.data());
                    });
                    return batch.commit();
                });
        });
        return Promise.all(copyPromises);
    }).catch(function(e) { console.error('Migration error:', e); });
}

function loadSubCollection(projectId, collectionName, targetObj) {
    return getSubCollection(projectId, collectionName).get()
        .then(function(snapshot) {
            if (!targetObj[projectId]) targetObj[projectId] = [];
            snapshot.forEach(function(doc) {
                var item = doc.data(); item._id = doc.id; item.id = item.id || doc.id;
                targetObj[projectId].push(item);
            });
        });
}

function loadDissemination(projectId) {
    return getSubCollection(projectId, 'dissemination').get()
        .then(function(snapshot) {
            var activities = [];
            var summary = { events: 0, publications: 0, socialReach: 0, website_visits: 0 };
            snapshot.forEach(function(doc) {
                var d = doc.data(); d._id = doc.id; activities.push(d);
                if (d.type === 'Event') summary.events++;
                if (d.type === 'Publication') summary.publications++;
                summary.socialReach += (d.reach || 0);
            });
            Dissemination[projectId] = { summary: summary, activities: activities };
        });
}

function loadDocuments(projectId) {
    return getSubCollection(projectId, 'documents').get()
        .then(function(snapshot) {
            var folders = [];
            snapshot.forEach(function(doc) { var d = doc.data(); d._id = doc.id; folders.push(d); });
            Documents[projectId] = { folders: folders };
        });
}

// ---- UPDATE PROJECT SELECTOR ----
function updateProjectSelector() {
    var selector = document.getElementById('projectSelector');
    if (!selector) return;
    selector.innerHTML = '';
    var ids = Object.keys(Projects).filter(function(id) { return Projects[id].status !== 'archived'; });
    var defOpt = document.createElement('option');
    defOpt.value = '';
    defOpt.textContent = ids.length === 0 ? 'No projects yet' : 'Select project...';
    if (!AppState.currentProjectId) defOpt.selected = true;
    selector.appendChild(defOpt);
    ids.forEach(function(id) {
        var p = Projects[id];
        var opt = document.createElement('option');
        opt.value = id;
        var label = p.name + (p.programme ? ' (' + p.programme.split(' ').pop() + ')' : '');
        if (p._shared) label += ' [shared]';
        opt.textContent = label;
        if (id === AppState.currentProjectId) opt.selected = true;
        selector.appendChild(opt);
    });
    updateSidebarBadges();
}

function updateSidebarBadges() {
    var projectCount = Object.keys(Projects).filter(function(id) { return Projects[id].status !== 'archived'; }).length;
    var taskCount = getCurrentTasks().filter(function(t) { return t.status !== 'completed'; }).length;
    var bp = document.getElementById('badgeProjects');
    var bt = document.getElementById('badgeTasks');
    if (bp) bp.textContent = projectCount;
    if (bt) bt.textContent = taskCount;
}

// ---- HELPER FUNCTIONS ----

function getCurrentProject() {
    if (AppState.currentProjectId && Projects[AppState.currentProjectId]) return Projects[AppState.currentProjectId];
    return { id: '', name: 'No Project', programme: '', projectNumber: '', startDate: '', endDate: '', duration: 0, status: '', description: 'Create your first project to get started.', totalBudget: 0, coordinator: '', coordinatorCountry: '', lumpSum: { totalGrant: 0, wpAllocations: {} } };
}
function getCurrentPartners() { return Partners[AppState.currentProjectId] || []; }
function getCurrentWPs() {
    var wps = WorkPackages[AppState.currentProjectId] || [];
    return wps.slice().sort(function(a, b) {
        var numA = parseInt((a.number || '').replace(/[^0-9]/g, '')) || 0;
        var numB = parseInt((b.number || '').replace(/[^0-9]/g, '')) || 0;
        return numA - numB;
    });
}
function getCurrentTasks() { return Tasks[AppState.currentProjectId] || []; }
function getCurrentDocuments() { return Documents[AppState.currentProjectId] || { folders: [] }; }
function getCurrentMeetings() { return Meetings[AppState.currentProjectId] || []; }
function getCurrentDissemination() { return Dissemination[AppState.currentProjectId] || { summary: { events: 0, publications: 0, socialReach: 0, website_visits: 0 }, activities: [] }; }
function getCurrentActivities() { return ActivityStream[AppState.currentProjectId] || []; }
function getCurrentBudget() {
    var wps = getCurrentWPs();
    return { wpStatus: wps.map(function(w) { return { wp: w.number || w.id, allocated: w.budget || 0, completionStatus: w.progress || 0, paymentReleased: w.progress === 100 }; }), partnerTransfers: [] };
}
function getProjectProgress() {
    var wps = getCurrentWPs(); if (wps.length === 0) return 0;
    return Math.round(wps.reduce(function(s, w) { return s + (w.progress || 0); }, 0) / wps.length);
}
function formatCurrency(amount) { return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount || 0); }
function parseDate(dateVal) {
    if (!dateVal) return null;
    if (dateVal.toDate && typeof dateVal.toDate === 'function') return dateVal.toDate();
    if (dateVal.seconds) return new Date(dateVal.seconds * 1000);
    var d = new Date(dateVal); if (isNaN(d.getTime())) return null; return d;
}
function formatDate(dateStr) { var d = parseDate(dateStr); if (!d) return 'N/A'; return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
function getMonthsElapsed(startDate) {
    var start = parseDate(startDate); if (!start) return 0;
    var now = new Date(); if (start > now) return 0;
    return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30)));
}

// ---- SAVE FUNCTIONS ----

function saveProjectToFirestore(projectId, data) {
    if (!AppState.currentUser) return Promise.resolve();
    return db.collection('projects').doc(projectId).set(data, { merge: true })
        .then(function() { return { success: true }; })
        .catch(function(e) { console.error('Save project error:', e); return { success: false }; });
}

function addToSubCollection(projectId, collection, data) {
    if (!AppState.currentUser) return Promise.resolve();
    return db.collection('projects').doc(projectId).collection(collection).add(data)
        .then(function(ref) { return { success: true, id: ref.id }; })
        .catch(function(e) { console.error('Add error:', e); return { success: false }; });
}

function updateInSubCollection(projectId, collection, docId, data) {
    if (!AppState.currentUser) return Promise.resolve();
    return db.collection('projects').doc(projectId).collection(collection).doc(docId).update(data)
        .then(function() { return { success: true }; })
        .catch(function(e) { console.error('Update error:', e); return { success: false }; });
}

function deleteFromSubCollection(projectId, collection, docId) {
    if (!AppState.currentUser) return Promise.resolve();
    return db.collection('projects').doc(projectId).collection(collection).doc(docId).delete()
        .then(function() { return { success: true }; })
        .catch(function(e) { console.error('Delete error:', e); return { success: false }; });
}

function addActivity(projectId, action, target) {
    if (!AppState.currentUser) return;
    var activity = { user: AppState.currentUser.name, initials: AppState.currentUser.initials, action: action, target: target, folder: '', time: 'Just now', timestamp: new Date().toISOString() };
    if (!ActivityStream[projectId]) ActivityStream[projectId] = [];
    ActivityStream[projectId].unshift(activity);
    db.collection('projects').doc(projectId).collection('activities').add(activity).catch(function(e) { console.error(e); });
}
