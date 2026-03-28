/* ====================================
   EUProject Hub — App State & Helpers
   ==================================== */

const AppState = {
    currentUser: null,
    currentProjectId: null,
    currentPage: 'dashboard'
};

// Live data stores (loaded from Firestore)
const Projects = {};
const Partners = {};
const WorkPackages = {};
const Tasks = {};
const Documents = {};
const Meetings = {};
const Dissemination = {};
const ActivityStream = {};
const BudgetTracking = {};

// Helper functions
function getCurrentProject() {
    return Projects[AppState.currentProjectId] || null;
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
    return BudgetTracking[AppState.currentProjectId] || { wpStatus: [], partnerTransfers: [] };
}

function getProjectProgress() {
    var wps = getCurrentWPs();
    if (wps.length === 0) return 0;
    return Math.round(wps.reduce(function(sum, wp) { return sum + wp.progress; }, 0) / wps.length);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMonthsElapsed(startDate) {
    if (!startDate) return 0;
    var start = new Date(startDate);
    var now = new Date();
    return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30)));
}

function getProjectCount() {
    return Object.keys(Projects).length;
}
