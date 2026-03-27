/* ====================================
   EUProject Hub — Main Application
   ==================================== */

var appInitialized = false;

// ---- App Initialization ----
document.addEventListener('DOMContentLoaded', function() {
    initFirebase();
    setupAuthListener();
});

window.addEventListener('hashchange', function() {
    if (window.location.hash.startsWith('#page-')) {
        var page = window.location.hash.replace('#page-', '');
        navigateTo(page);
    }
});

// ---- Auth UI ----
function showAuth(mode) {
    document.getElementById('authPage').classList.remove('hidden');
    document.getElementById('appLayout').classList.add('hidden');
    var errorEl = document.getElementById('authError');
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }

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

    document.getElementById('authToggle').onclick = function(e) {
        e.preventDefault();
        showAuth(mode === 'login' ? 'register' : 'login');
    };

    // Login form handler
    document.getElementById('loginForm').onsubmit = function(e) {
        e.preventDefault();
        var form = e.target;
        var email = form.querySelector('input[type="email"]').value;
        var password = form.querySelector('input[type="password"]').value;

        if (!email || !password) {
            showAuthError('Please fill in all fields.');
            return;
        }

        form.classList.add('auth-loading');
        loginWithEmail(email, password).then(function(result) {
            form.classList.remove('auth-loading');
            if (!result.success) {
                showAuthError(result.error);
            } else {
                showToast('Welcome back!', 'success');
            }
        });
    };

    // Register form handler
    document.getElementById('registerForm').onsubmit = function(e) {
        e.preventDefault();
        var form = e.target;
        var inputs = form.querySelectorAll('.form-input');
        var firstName = inputs[0].value;
        var lastName = inputs[1].value;
        var email = inputs[2].value;
        var organization = inputs[3].value;
        var password = inputs[4].value;

        if (!firstName || !lastName || !email || !password) {
            showAuthError('Please fill in all required fields.');
            return;
        }

        if (password.length < 6) {
            showAuthError('Password must be at least 6 characters.');
            return;
        }

        form.classList.add('auth-loading');
        registerWithEmail(email, password, firstName, lastName, organization).then(function(result) {
            form.classList.remove('auth-loading');
            if (!result.success) {
                showAuthError(result.error);
            } else {
                showToast('Account created! Welcome to EUProject Hub.', 'success');
            }
        });
    };
}

// Google login handler
function handleGoogleLogin() {
    var btn = document.getElementById('googleSignIn');
    btn.classList.add('auth-loading');
    loginWithGoogle().then(function(result) {
        btn.classList.remove('auth-loading');
        if (result && !result.success) {
            showAuthError(result.error);
        }
    }).catch(function(err) {
        btn.classList.remove('auth-loading');
        console.error('Google login error:', err);
    });
}

// ---- Show App ----
function showApp() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appLayout').classList.remove('hidden');

    if (!appInitialized) {
        setupSidebar();
        setupProjectSelector();
        setupModal();
        appInitialized = true;
    }

    updateUserUI();

    if (!window.location.hash.startsWith('#page-')) {
        window.location.hash = '#page-dashboard';
    }
    var page = window.location.hash.replace('#page-', '') || 'dashboard';
    navigateTo(page);
}

// ---- Sidebar ----
function setupSidebar() {
    document.querySelectorAll('.sidebar-link').forEach(function(link) {
        link.addEventListener('click', function() {
            var page = link.dataset.page;
            navigateTo(page);
        });
    });
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('sidebarClose').addEventListener('click', function() {
        document.getElementById('sidebar').classList.remove('open');
    });
}

function setupProjectSelector() {
    document.getElementById('projectSelector').addEventListener('change', function(e) {
        AppState.currentProjectId = e.target.value;
        navigateTo(AppState.currentPage);
    });
}

// ---- Modal ----
function setupModal() {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });
}

function openModal(title, bodyHtml, footerHtml, isLarge) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml || '';
    var mc = document.getElementById('modalContainer');
    if (isLarge) mc.classList.add('modal-lg'); else mc.classList.remove('modal-lg');
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ---- Navigation ----
function navigateTo(page) {
    AppState.currentPage = page;
    document.querySelectorAll('.sidebar-link').forEach(function(l) { l.classList.remove('active'); });
    var activeLink = document.querySelector('.sidebar-link[data-page="' + page + '"]');
    if (activeLink) activeLink.classList.add('active');

    var breadcrumb = document.getElementById('breadcrumb');
    var project = getCurrentProject();
    var pageNames = {
        dashboard: 'Dashboard', projects: 'My Projects', overview: 'Project Overview',
        partners: 'Partners', workpackages: 'Work Packages', tasks: 'Tasks',
        documents: 'Documents', budget: 'Budget & Finance', dissemination: 'Dissemination',
        meetings: 'Meetings & TPMs', 'ai-report': 'AI Report Generator', settings: 'Settings'
    };
    var pageName = pageNames[page] || page;

    if (['dashboard', 'projects', 'settings'].includes(page)) {
        breadcrumb.innerHTML = '<a href="#" data-page="dashboard">Home</a><i class="fas fa-chevron-right" style="font-size:10px"></i><span class="current">' + pageName + '</span>';
    } else {
        breadcrumb.innerHTML = '<a href="#" data-page="dashboard">Home</a><i class="fas fa-chevron-right" style="font-size:10px"></i><a href="#" data-page="overview">' + project.name + '</a><i class="fas fa-chevron-right" style="font-size:10px"></i><span class="current">' + pageName + '</span>';
    }
    breadcrumb.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function(e) { e.preventDefault(); navigateTo(a.dataset.page); });
    });

    var content = document.getElementById('pageContent');
    var renderers = {
        dashboard: renderDashboard, projects: renderProjects, overview: renderOverview,
        partners: renderPartners, workpackages: renderWorkPackages, tasks: renderTasks,
        documents: renderDocuments, budget: renderBudget, dissemination: renderDissemination,
        meetings: renderMeetings, 'ai-report': renderAIReport, settings: renderSettings
    };
    var renderer = renderers[page];
    if (renderer) renderer(content);
    else content.innerHTML = '<div class="empty-state"><i class="fas fa-construction"></i><h3>Coming Soon</h3><p>This page is under development.</p></div>';

    document.getElementById('sidebar').classList.remove('open');
}
