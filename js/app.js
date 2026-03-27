/* ====================================
   EUProject Hub — Main Application
   ==================================== */

// ---- App Initialization ----
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    if (hash === '#register') {
        showAuth('register');
    } else if (hash === '#login' || !hash || hash === '#') {
        showAuth('login');
    } else {
        showApp();
    }
});

window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#page-')) {
        const page = window.location.hash.replace('#page-', '');
        navigateTo(page);
    }
});

// ---- Auth ----
function showAuth(mode) {
    document.getElementById('authPage').classList.remove('hidden');
    document.getElementById('appLayout').classList.add('hidden');
    if (mode === 'register') {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('authTitle').textContent = 'Start Your Free Trial';
        document.getElementById('authSubtitle').textContent = '30 days free. No credit card required.';
        document.getElementById('authToggleText').textContent = 'Already have an account? ';
        document.getElementById('authToggle').textContent = 'Log in';
    } else {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('authTitle').textContent = 'Welcome Back';
        document.getElementById('authSubtitle').textContent = 'Log in to manage your EU projects';
        document.getElementById('authToggleText').textContent = "Don't have an account? ";
        document.getElementById('authToggle').textContent = 'Sign up free';
    }

    document.getElementById('authToggle').onclick = (e) => {
        e.preventDefault();
        showAuth(mode === 'login' ? 'register' : 'login');
    };

    document.getElementById('loginForm').onsubmit = (e) => { e.preventDefault(); showApp(); };
    document.getElementById('registerForm').onsubmit = (e) => { e.preventDefault(); showApp(); };
}

function showApp() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appLayout').classList.remove('hidden');
    window.location.hash = '#page-dashboard';
    setupSidebar();
    setupProjectSelector();
    setupModal();
    navigateTo('dashboard');
}

// ---- Sidebar ----
function setupSidebar() {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('sidebarClose').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });
}

function setupProjectSelector() {
    document.getElementById('projectSelector').addEventListener('change', (e) => {
        AppState.currentProjectId = e.target.value;
        navigateTo(AppState.currentPage);
    });
}

// ---- Modal ----
function setupModal() {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });
}

function openModal(title, bodyHtml, footerHtml, isLarge) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml || '';
    const mc = document.getElementById('modalContainer');
    if (isLarge) mc.classList.add('modal-lg'); else mc.classList.remove('modal-lg');
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ---- Navigation ----
function navigateTo(page) {
    AppState.currentPage = page;
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    const breadcrumb = document.getElementById('breadcrumb');
    const project = getCurrentProject();
    const pageNames = {
        dashboard: 'Dashboard', projects: 'My Projects', overview: 'Project Overview',
        partners: 'Partners', workpackages: 'Work Packages', tasks: 'Tasks',
        documents: 'Documents', budget: 'Budget & Finance', dissemination: 'Dissemination',
        meetings: 'Meetings & TPMs', 'ai-report': 'AI Report Generator', settings: 'Settings'
    };
    const pageName = pageNames[page] || page;

    if (['dashboard', 'projects', 'settings'].includes(page)) {
        breadcrumb.innerHTML = `<a href="#" data-page="dashboard">Home</a><i class="fas fa-chevron-right" style="font-size:10px"></i><span class="current">${pageName}</span>`;
    } else {
        breadcrumb.innerHTML = `<a href="#" data-page="dashboard">Home</a><i class="fas fa-chevron-right" style="font-size:10px"></i><a href="#" data-page="overview">${project.name}</a><i class="fas fa-chevron-right" style="font-size:10px"></i><span class="current">${pageName}</span>`;
    }
    breadcrumb.querySelectorAll('a').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); navigateTo(a.dataset.page); }));

    const content = document.getElementById('pageContent');
    const renderers = {
        dashboard: renderDashboard, projects: renderProjects, overview: renderOverview,
        partners: renderPartners, workpackages: renderWorkPackages, tasks: renderTasks,
        documents: renderDocuments, budget: renderBudget, dissemination: renderDissemination,
        meetings: renderMeetings, 'ai-report': renderAIReport, settings: renderSettings
    };
    const renderer = renderers[page];
    if (renderer) renderer(content);
    else content.innerHTML = `<div class="empty-state"><i class="fas fa-construction"></i><h3>Coming Soon</h3><p>This page is under development.</p></div>`;

    document.getElementById('sidebar').classList.remove('open');
}
