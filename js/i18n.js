/* ====================================
   EUProject Hub — Multi-language Support
   ==================================== */

var AppLanguage = localStorage.getItem('euphub_lang') || 'en';

var Translations = {
    en: {
        dashboard: 'Dashboard', myProjects: 'My Projects', overview: 'Overview', partners: 'Partners',
        workPackages: 'Work Packages', tasks: 'Tasks', documents: 'Documents', budgetFinance: 'Budget & Finance',
        dissemination: 'Dissemination', meetingsTPMs: 'Meetings & TPMs', aiReport: 'AI Report Generator',
        settings: 'Settings', newProject: 'New Project', createProject: 'Create Project', edit: 'Edit',
        delete: 'Delete', save: 'Save', cancel: 'Cancel', addPartner: 'Add Partner', addWP: 'Add Work Package',
        addTask: 'Add Task', upload: 'Upload', search: 'Search...', logout: 'Log Out', welcome: 'Welcome Back',
        startTrial: 'Start Your Free Trial', noProjects: 'No projects yet', createFirst: 'Create your first project to get started.',
        activeProjects: 'Active Projects', overallProgress: 'Overall Progress', openTasks: 'Open Tasks',
        totalBudget: 'Total Budget', projectName: 'Project Name', programme: 'Programme', grantAmount: 'Grant Amount',
        startDate: 'Start Date', duration: 'Duration', description: 'Description', coordinator: 'Coordinator',
        country: 'Country', progress: 'Progress', status: 'Status', priority: 'Priority', dueDate: 'Due Date',
        currentProject: 'Current Project', tools: 'Tools', main: 'Main', selectProject: 'Select project...'
    },
    tr: {
        dashboard: 'Pano', myProjects: 'Projelerim', overview: 'Genel Bakış', partners: 'Ortaklar',
        workPackages: 'İş Paketleri', tasks: 'Görevler', documents: 'Belgeler', budgetFinance: 'Bütçe & Finans',
        dissemination: 'Yaygınlaştırma', meetingsTPMs: 'Toplantılar', aiReport: 'AI Rapor Üretici',
        settings: 'Ayarlar', newProject: 'Yeni Proje', createProject: 'Proje Oluştur', edit: 'Düzenle',
        delete: 'Sil', save: 'Kaydet', cancel: 'İptal', addPartner: 'Ortak Ekle', addWP: 'İş Paketi Ekle',
        addTask: 'Görev Ekle', upload: 'Yükle', search: 'Ara...', logout: 'Çıkış', welcome: 'Tekrar Hoşgeldiniz',
        startTrial: 'Ücretsiz Denemeye Başla', noProjects: 'Henüz proje yok', createFirst: 'Başlamak için ilk projenizi oluşturun.',
        activeProjects: 'Aktif Projeler', overallProgress: 'Genel İlerleme', openTasks: 'Açık Görevler',
        totalBudget: 'Toplam Bütçe', projectName: 'Proje Adı', programme: 'Program', grantAmount: 'Hibe Tutarı',
        startDate: 'Başlangıç Tarihi', duration: 'Süre', description: 'Açıklama', coordinator: 'Koordinatör',
        country: 'Ülke', progress: 'İlerleme', status: 'Durum', priority: 'Öncelik', dueDate: 'Bitiş Tarihi',
        currentProject: 'Mevcut Proje', tools: 'Araçlar', main: 'Ana Menü', selectProject: 'Proje seç...'
    },
    de: {
        dashboard: 'Dashboard', myProjects: 'Meine Projekte', overview: 'Übersicht', partners: 'Partner',
        workPackages: 'Arbeitspakete', tasks: 'Aufgaben', documents: 'Dokumente', budgetFinance: 'Budget & Finanzen',
        dissemination: 'Verbreitung', meetingsTPMs: 'Meetings & TPMs', aiReport: 'KI-Berichtsgenerator',
        settings: 'Einstellungen', newProject: 'Neues Projekt', createProject: 'Projekt erstellen', edit: 'Bearbeiten',
        delete: 'Löschen', save: 'Speichern', cancel: 'Abbrechen', addPartner: 'Partner hinzufügen', addWP: 'Arbeitspaket hinzufügen',
        addTask: 'Aufgabe hinzufügen', upload: 'Hochladen', search: 'Suchen...', logout: 'Abmelden', welcome: 'Willkommen zurück',
        startTrial: 'Kostenlose Testversion starten', noProjects: 'Noch keine Projekte', createFirst: 'Erstellen Sie Ihr erstes Projekt.',
        activeProjects: 'Aktive Projekte', overallProgress: 'Gesamtfortschritt', openTasks: 'Offene Aufgaben',
        totalBudget: 'Gesamtbudget', projectName: 'Projektname', programme: 'Programm', grantAmount: 'Fördersumme',
        startDate: 'Startdatum', duration: 'Dauer', description: 'Beschreibung', coordinator: 'Koordinator',
        country: 'Land', progress: 'Fortschritt', status: 'Status', priority: 'Priorität', dueDate: 'Fälligkeitsdatum',
        currentProject: 'Aktuelles Projekt', tools: 'Werkzeuge', main: 'Haupt', selectProject: 'Projekt wählen...'
    },
    fr: {
        dashboard: 'Tableau de bord', myProjects: 'Mes Projets', overview: 'Aperçu', partners: 'Partenaires',
        workPackages: 'Lots de travail', tasks: 'Tâches', documents: 'Documents', budgetFinance: 'Budget & Finances',
        dissemination: 'Dissémination', meetingsTPMs: 'Réunions & RPT', aiReport: 'Générateur IA de rapports',
        settings: 'Paramètres', newProject: 'Nouveau projet', createProject: 'Créer un projet', edit: 'Modifier',
        delete: 'Supprimer', save: 'Enregistrer', cancel: 'Annuler', addPartner: 'Ajouter partenaire', addWP: 'Ajouter lot de travail',
        addTask: 'Ajouter tâche', upload: 'Télécharger', search: 'Rechercher...', logout: 'Déconnexion', welcome: 'Content de vous revoir',
        startTrial: 'Essai gratuit', noProjects: 'Aucun projet', createFirst: 'Créez votre premier projet.',
        activeProjects: 'Projets actifs', overallProgress: 'Progression globale', openTasks: 'Tâches ouvertes',
        totalBudget: 'Budget total', projectName: 'Nom du projet', programme: 'Programme', grantAmount: 'Montant de la subvention',
        startDate: 'Date de début', duration: 'Durée', description: 'Description', coordinator: 'Coordinateur',
        country: 'Pays', progress: 'Progression', status: 'Statut', priority: 'Priorité', dueDate: 'Date limite',
        currentProject: 'Projet actuel', tools: 'Outils', main: 'Principal', selectProject: 'Choisir projet...'
    },
    es: {
        dashboard: 'Panel', myProjects: 'Mis Proyectos', overview: 'Resumen', partners: 'Socios',
        workPackages: 'Paquetes de trabajo', tasks: 'Tareas', documents: 'Documentos', budgetFinance: 'Presupuesto y Finanzas',
        dissemination: 'Difusión', meetingsTPMs: 'Reuniones', aiReport: 'Generador IA de informes',
        settings: 'Configuración', newProject: 'Nuevo proyecto', createProject: 'Crear proyecto', edit: 'Editar',
        delete: 'Eliminar', save: 'Guardar', cancel: 'Cancelar', addPartner: 'Añadir socio', addWP: 'Añadir paquete',
        addTask: 'Añadir tarea', upload: 'Subir', search: 'Buscar...', logout: 'Cerrar sesión', welcome: 'Bienvenido de nuevo',
        startTrial: 'Prueba gratuita', noProjects: 'Sin proyectos', createFirst: 'Cree su primer proyecto.',
        activeProjects: 'Proyectos activos', overallProgress: 'Progreso general', openTasks: 'Tareas abiertas',
        totalBudget: 'Presupuesto total', projectName: 'Nombre del proyecto', programme: 'Programa', grantAmount: 'Importe de la subvención',
        startDate: 'Fecha de inicio', duration: 'Duración', description: 'Descripción', coordinator: 'Coordinador',
        country: 'País', progress: 'Progreso', status: 'Estado', priority: 'Prioridad', dueDate: 'Fecha límite',
        currentProject: 'Proyecto actual', tools: 'Herramientas', main: 'Principal', selectProject: 'Seleccionar proyecto...'
    }
};

function t(key) {
    return (Translations[AppLanguage] && Translations[AppLanguage][key]) || (Translations.en[key]) || key;
}

function setLanguage(lang) {
    AppLanguage = lang;
    localStorage.setItem('euphub_lang', lang);
    updateSidebarLabels();
    navigateTo(AppState.currentPage);
}

function updateSidebarLabels() {
    var labels = {
        'dashboard': t('dashboard'), 'projects': t('myProjects'), 'overview': t('overview'),
        'partners': t('partners'), 'workpackages': t('workPackages'), 'tasks': t('tasks'),
        'documents': t('documents'), 'budget': t('budgetFinance'), 'dissemination': t('dissemination'),
        'meetings': t('meetingsTPMs'), 'ai-report': t('aiReport'), 'settings': t('settings')
    };
    document.querySelectorAll('.sidebar-link').forEach(function(link) {
        var page = link.dataset.page;
        if (labels[page]) {
            var icon = link.querySelector('i');
            var badge = link.querySelector('.badge');
            link.textContent = '';
            if (icon) link.appendChild(icon);
            link.appendChild(document.createTextNode(' ' + labels[page]));
            if (badge) link.appendChild(badge);
        }
    });

    // Update section titles
    var sectionTitles = document.querySelectorAll('.sidebar-section-title');
    if (sectionTitles[0]) sectionTitles[0].textContent = t('main');
    if (sectionTitles[1]) sectionTitles[1].textContent = t('currentProject');
    if (sectionTitles[2]) sectionTitles[2].textContent = t('tools');

    // Update search
    var searchInput = document.querySelector('.topbar-search input');
    if (searchInput) searchInput.placeholder = t('search');
}

function getLanguageSelector() {
    var langs = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' }
    ];
    return '<select class="form-select" onchange="setLanguage(this.value)" style="width:auto">' +
        langs.map(function(l) {
            return '<option value="' + l.code + '"' + (AppLanguage === l.code ? ' selected' : '') + '>' + l.flag + ' ' + l.name + '</option>';
        }).join('') + '</select>';
}
