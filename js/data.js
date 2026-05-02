/* ====================================
   EUProject Hub — Data Layer (Firestore)
   All data persisted in Firebase Firestore
   ==================================== */

const AppState = {
    currentUser: null,
    currentProjectId: null,
    currentPage: 'dashboard',
    projects: {},
    partners: {},
    workPackages: {},
    tasks: {},
    documents: {},
    meetings: {},
    dissemination: {},
    activityStream: {},
    budgetTracking: {}
};

// Aliases for backward compatibility with page renderers
let Projects = {};
let Partners = {};
let WorkPackages = {};
let Tasks = {};
let Documents = {};
let Meetings = {};
let Dissemination = {};
let ActivityStream = {};
let BudgetTracking = {};

// ---- FIRESTORE CRUD ----

function getProjectRef(projectId) {
    return db.collection('users').doc(AppState.currentUser.id).collection('projects').doc(projectId);
}

function getSubCollection(projectId, sub) {
    return getProjectRef(projectId).collection(sub);
}

// ---- LOAD ALL USER DATA ----
function loadUserData() {
    if (!AppState.currentUser) return Promise.resolve();
    var uid = AppState.currentUser.id;

    return db.collection('users').doc(uid).collection('projects').get()
        .then(function(snapshot) {
            Projects = {};
            Partners = {};
            WorkPackages = {};
            Tasks = {};
            Documents = {};
            Meetings = {};
            Dissemination = {};
            ActivityStream = {};
            BudgetTracking = {};

            if (snapshot.empty) {
                AppState.currentProjectId = null;
                updateProjectSelector();
                return;
            }

            var loadPromises = [];

            snapshot.forEach(function(doc) {
                var p = doc.data();
                p.id = doc.id;
                Projects[doc.id] = p;

                // Load subcollections
                loadPromises.push(loadSubCollection(doc.id, 'partners', Partners));
                loadPromises.push(loadSubCollection(doc.id, 'workpackages', WorkPackages));
                loadPromises.push(loadSubCollection(doc.id, 'tasks', Tasks));
                loadPromises.push(loadSubCollection(doc.id, 'meetings', Meetings));
                loadPromises.push(loadDissemination(doc.id));
                loadPromises.push(loadDocuments(doc.id));
            });

            return Promise.all(loadPromises).then(function() {
                // Set current project
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

function loadSubCollection(projectId, collectionName, targetObj) {
    return getSubCollection(projectId, collectionName).get()
        .then(function(snapshot) {
            if (!targetObj[projectId]) targetObj[projectId] = [];
            snapshot.forEach(function(doc) {
                var item = doc.data();
                item._id = doc.id;
                item.id = item.id || doc.id;
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
                var d = doc.data();
                d._id = doc.id;
                activities.push(d);
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
            snapshot.forEach(function(doc) {
                var d = doc.data();
                d._id = doc.id;
                folders.push(d);
            });
            Documents[projectId] = { folders: folders };
        });
}

// ---- UPDATE PROJECT SELECTOR ----
function updateProjectSelector() {
    var selector = document.getElementById('projectSelector');
    if (!selector) return;
    selector.innerHTML = '';
    var ids = Object.keys(Projects).filter(function(id) { return Projects[id].status !== 'archived'; });
    // Default option
    var defOpt = document.createElement('option');
    defOpt.value = '';
    defOpt.textContent = ids.length === 0 ? 'No projects yet' : 'Select project...';
    if (!AppState.currentProjectId) defOpt.selected = true;
    selector.appendChild(defOpt);
    // Project options
    ids.forEach(function(id) {
        var p = Projects[id];
        var opt = document.createElement('option');
        opt.value = id;
        opt.textContent = p.name + (p.programme ? ' (' + p.programme.split(' ').pop() + ')' : '');
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

// ---- HELPER FUNCTIONS (used by page renderers) ----

function getCurrentProject() {
    if (AppState.currentProjectId && Projects[AppState.currentProjectId]) {
        return Projects[AppState.currentProjectId];
    }
    // Return empty project placeholder
    return { id: '', name: 'No Project', programme: '', projectNumber: '', startDate: '', endDate: '', duration: 0, status: '', description: 'Create your first project to get started.', totalBudget: 0, coordinator: '', coordinatorCountry: '', lumpSum: { totalGrant: 0, wpAllocations: {} } };
}

function getCurrentPartners() {
    return Partners[AppState.currentProjectId] || [];
}

function getCurrentWPs() {
    return WorkPackages[AppState.currentProjectId] || [];
}

function getCurrentTasks() {
    return Tasks[AppState.currentProjectId] || [];
}

function getCurrentDocuments() {
    return Documents[AppState.currentProjectId] || { folders: [] };
}

function getCurrentMeetings() {
    return Meetings[AppState.currentProjectId] || [];
}

function getCurrentDissemination() {
    return Dissemination[AppState.currentProjectId] || { summary: { events: 0, publications: 0, socialReach: 0, website_visits: 0 }, activities: [] };
}

function getCurrentActivities() {
    return ActivityStream[AppState.currentProjectId] || [];
}

function getCurrentBudget() {
    // Build from WP data
    var wps = getCurrentWPs();
    return {
        wpStatus: wps.map(function(w) {
            return { wp: w.number || w.id, allocated: w.budget || 0, completionStatus: w.progress || 0, paymentReleased: w.progress === 100 };
        }),
        partnerTransfers: []
    };
}

function getProjectProgress() {
    var wps = getCurrentWPs();
    if (wps.length === 0) return 0;
    return Math.round(wps.reduce(function(s, w) { return s + (w.progress || 0); }, 0) / wps.length);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMonthsElapsed(startDate) {
    if (!startDate) return 0;
    var start = new Date(startDate);
    var now = new Date();
    return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30)));
}

// ---- SAVE FUNCTIONS ----

function saveProjectToFirestore(projectId, data) {
    if (!AppState.currentUser) return Promise.resolve();
    return getProjectRef(projectId).set(data, { merge: true })
        .then(function() { return { success: true }; })
        .catch(function(e) { console.error('Save project error:', e); return { success: false }; });
}

function addToSubCollection(projectId, collection, data) {
    if (!AppState.currentUser) return Promise.resolve();
    return getSubCollection(projectId, collection).add(data)
        .then(function(ref) { return { success: true, id: ref.id }; })
        .catch(function(e) { console.error('Add error:', e); return { success: false }; });
}

function updateInSubCollection(projectId, collection, docId, data) {
    if (!AppState.currentUser) return Promise.resolve();
    return getSubCollection(projectId, collection).doc(docId).update(data)
        .then(function() { return { success: true }; })
        .catch(function(e) { console.error('Update error:', e); return { success: false }; });
}

function deleteFromSubCollection(projectId, collection, docId) {
    if (!AppState.currentUser) return Promise.resolve();
    return getSubCollection(projectId, collection).doc(docId).delete()
        .then(function() { return { success: true }; })
        .catch(function(e) { console.error('Delete error:', e); return { success: false }; });
}

function addActivity(projectId, action, target) {
    if (!AppState.currentUser) return;
    var activity = {
        user: AppState.currentUser.name,
        initials: AppState.currentUser.initials,
        action: action,
        target: target,
        folder: '',
        time: 'Just now',
        timestamp: new Date().toISOString()
    };
    if (!ActivityStream[projectId]) ActivityStream[projectId] = [];
    ActivityStream[projectId].unshift(activity);
    // Also save to Firestore
    getSubCollection(projectId, 'activities').add(activity).catch(function(e) { console.error(e); });
}
