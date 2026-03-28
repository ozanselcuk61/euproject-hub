/* ====================================
   EUProject Hub — Firebase Configuration & CRUD
   ==================================== */

var auth;
var db;

function initFirebase() {
    var firebaseConfig = {
        apiKey: "AIzaSyAZL5Sh6dsEl4P5A6wWt1rV8Shjvj3AWa0",
        authDomain: "euproject-hub.firebaseapp.com",
        projectId: "euproject-hub",
        storageBucket: "euproject-hub.firebasestorage.app",
        messagingSenderId: "868705275733",
        appId: "1:868705275733:web:04580dd1019f79eca8e9dc",
        measurementId: "G-PRL057ZYDW"
    };

    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();

    auth.getRedirectResult().then(function(result) {
        if (result.user) {
            handlePostLogin(result.user);
        }
    }).catch(function(error) {
        console.error('Redirect error:', error);
        if (error.code !== 'auth/credential-already-in-use') {
            showAuthError(error.message);
        }
    });
}

// ---- AUTH FUNCTIONS ----

function registerWithEmail(email, password, firstName, lastName, organization) {
    return auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            var user = userCredential.user;
            return user.updateProfile({
                displayName: firstName + ' ' + lastName
            }).then(function() {
                return db.collection('users').doc(user.uid).set({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    organization: organization,
                    role: 'coordinator',
                    plan: 'trial',
                    trialStart: new Date().toISOString(),
                    trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }).then(function() {
                return { success: true, user: user };
            });
        })
        .catch(function(error) {
            return { success: false, error: error.message };
        });
}

function loginWithEmail(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            return { success: true, user: userCredential.user };
        })
        .catch(function(error) {
            return { success: false, error: error.message };
        });
}

function loginWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider)
        .then(function(result) {
            return handlePostLogin(result.user).then(function() {
                return { success: true, user: result.user };
            });
        })
        .catch(function(error) {
            if (error.code === 'auth/popup-blocked' ||
                error.code === 'auth/popup-closed-by-user' ||
                error.code === 'auth/cancelled-popup-request') {
                return auth.signInWithRedirect(provider);
            }
            return { success: false, error: error.message };
        });
}

function handlePostLogin(user) {
    if (!user) return Promise.resolve();
    return db.collection('users').doc(user.uid).get()
        .then(function(doc) {
            if (!doc.exists) {
                var names = (user.displayName || 'User').split(' ');
                return db.collection('users').doc(user.uid).set({
                    firstName: names[0] || '',
                    lastName: names.slice(1).join(' ') || '',
                    email: user.email,
                    organization: '',
                    role: 'coordinator',
                    plan: 'trial',
                    trialStart: new Date().toISOString(),
                    trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        })
        .catch(function(error) {
            console.error('Post login error:', error);
        });
}

function logoutUser() {
    return auth.signOut()
        .then(function() {
            // Clear all local data
            appInitialized = false;
            AppState.currentUser = null;
            AppState.currentProjectId = null;
            Object.keys(Projects).forEach(function(k) { delete Projects[k]; });
            Object.keys(Partners).forEach(function(k) { delete Partners[k]; });
            Object.keys(WorkPackages).forEach(function(k) { delete WorkPackages[k]; });
            Object.keys(Tasks).forEach(function(k) { delete Tasks[k]; });
            Object.keys(Documents).forEach(function(k) { delete Documents[k]; });
            Object.keys(Meetings).forEach(function(k) { delete Meetings[k]; });
            Object.keys(Dissemination).forEach(function(k) { delete Dissemination[k]; });
            Object.keys(ActivityStream).forEach(function(k) { delete ActivityStream[k]; });
            Object.keys(BudgetTracking).forEach(function(k) { delete BudgetTracking[k]; });
            window.location.hash = '';
            return { success: true };
        })
        .catch(function(error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        });
}

function getUserData(uid) {
    return db.collection('users').doc(uid).get()
        .then(function(doc) {
            if (doc.exists) return doc.data();
            return null;
        })
        .catch(function(error) {
            console.error('Error getting user data:', error);
            return null;
        });
}

// ---- FIRESTORE PROJECT CRUD ----

function saveProject(projectData) {
    var user = auth.currentUser;
    if (!user) return Promise.resolve({ success: false, error: 'Not authenticated' });

    var docData = {
        name: projectData.name || '',
        programme: projectData.programme || '',
        projectNumber: projectData.projectNumber || '',
        startDate: projectData.startDate || '',
        endDate: projectData.endDate || '',
        duration: projectData.duration || 24,
        status: projectData.status || 'active',
        description: projectData.description || '',
        totalBudget: projectData.totalBudget || 0,
        coordinator: projectData.coordinator || '',
        coordinatorCountry: projectData.coordinatorCountry || '',
        lumpSum: projectData.lumpSum || { totalGrant: 0, wpAllocations: {} },
        partners: projectData.partners || [],
        workPackages: projectData.workPackages || [],
        tasks: projectData.tasks || [],
        documents: projectData.documents || { folders: [] },
        meetings: projectData.meetings || [],
        dissemination: projectData.dissemination || { summary: { events: 0, publications: 0, socialReach: 0, website_visits: 0 }, activities: [] },
        activityStream: projectData.activityStream || [],
        budgetTracking: projectData.budgetTracking || { wpStatus: [], partnerTransfers: [] },
        ownerId: user.uid,
        ownerEmail: user.email,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (projectData.firestoreId) {
        // Update existing
        return db.collection('projects').doc(projectData.firestoreId).update(docData)
            .then(function() { return { success: true, id: projectData.firestoreId }; })
            .catch(function(error) { return { success: false, error: error.message }; });
    } else {
        // Create new
        docData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        return db.collection('projects').add(docData)
            .then(function(docRef) { return { success: true, id: docRef.id }; })
            .catch(function(error) { return { success: false, error: error.message }; });
    }
}

function loadUserProjects() {
    var user = auth.currentUser;
    if (!user) return Promise.resolve([]);

    return db.collection('projects')
        .where('ownerId', '==', user.uid)
        .get()
        .then(function(snapshot) {
            // Clear existing data
            Object.keys(Projects).forEach(function(k) { delete Projects[k]; });
            Object.keys(Partners).forEach(function(k) { delete Partners[k]; });
            Object.keys(WorkPackages).forEach(function(k) { delete WorkPackages[k]; });
            Object.keys(Tasks).forEach(function(k) { delete Tasks[k]; });
            Object.keys(Documents).forEach(function(k) { delete Documents[k]; });
            Object.keys(Meetings).forEach(function(k) { delete Meetings[k]; });
            Object.keys(Dissemination).forEach(function(k) { delete Dissemination[k]; });
            Object.keys(ActivityStream).forEach(function(k) { delete ActivityStream[k]; });
            Object.keys(BudgetTracking).forEach(function(k) { delete BudgetTracking[k]; });

            snapshot.forEach(function(doc) {
                var data = doc.data();
                var id = doc.id;

                Projects[id] = {
                    id: id,
                    firestoreId: id,
                    name: data.name || '',
                    programme: data.programme || '',
                    projectNumber: data.projectNumber || '',
                    startDate: data.startDate || '',
                    endDate: data.endDate || '',
                    duration: data.duration || 24,
                    status: data.status || 'active',
                    description: data.description || '',
                    totalBudget: data.totalBudget || 0,
                    coordinator: data.coordinator || '',
                    coordinatorCountry: data.coordinatorCountry || '',
                    lumpSum: data.lumpSum || { totalGrant: 0, wpAllocations: {} }
                };

                Partners[id] = data.partners || [];
                WorkPackages[id] = data.workPackages || [];
                Tasks[id] = data.tasks || [];
                Documents[id] = data.documents || { folders: [] };
                Meetings[id] = data.meetings || [];
                Dissemination[id] = data.dissemination || { summary: { events: 0, publications: 0, socialReach: 0, website_visits: 0 }, activities: [] };
                ActivityStream[id] = data.activityStream || [];
                BudgetTracking[id] = data.budgetTracking || { wpStatus: [], partnerTransfers: [] };
            });

            return Object.keys(Projects);
        })
        .catch(function(error) {
            console.error('Error loading projects:', error);
            return [];
        });
}

// Save a specific sub-data of a project
function updateProjectField(projectId, fieldName, fieldValue) {
    if (!projectId) return Promise.resolve({ success: false, error: 'No project ID' });
    var updateData = {};
    updateData[fieldName] = fieldValue;
    updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    return db.collection('projects').doc(projectId).update(updateData)
        .then(function() { return { success: true }; })
        .catch(function(error) {
            console.error('Error updating field:', error);
            return { success: false, error: error.message };
        });
}

// ---- AUTH STATE LISTENER ----
function setupAuthListener() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            getUserData(user.uid).then(function(userData) {
                var names = (user.displayName || 'User').split(' ');
                var initials = (names[0] || 'U').charAt(0).toUpperCase();
                if (names[1]) initials += names[1].charAt(0).toUpperCase();

                AppState.currentUser = {
                    id: user.uid,
                    name: user.displayName || 'User',
                    email: user.email,
                    initials: initials,
                    role: (userData && userData.role) || 'Coordinator',
                    plan: (userData && userData.plan) || 'trial',
                    organization: (userData && userData.organization) || '',
                    photoURL: user.photoURL || null
                };

                // Load projects from Firestore then show app
                loadUserProjects().then(function(projectIds) {
                    if (projectIds.length > 0) {
                        AppState.currentProjectId = projectIds[0];
                    }
                    updateUserUI();
                    showApp();
                });
            });
        } else {
            showAuth('login');
        }
    });
}

function updateUserUI() {
    var user = AppState.currentUser;
    if (!user) return;

    var avatarEl = document.querySelector('.topbar-user .user-avatar');
    var nameEl = document.querySelector('.topbar-user .user-name');
    var roleEl = document.querySelector('.topbar-user .user-role');

    if (avatarEl) {
        if (user.photoURL) {
            avatarEl.innerHTML = '<img src="' + user.photoURL + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover" alt="">';
        } else {
            avatarEl.textContent = user.initials;
        }
    }
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
}

function showToast(message, type) {
    type = type || 'info';
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:14px 24px;border-radius:10px;color:#fff;font-size:14px;font-weight:500;z-index:9999;animation:slideUp 0.3s ease;max-width:400px;box-shadow:0 10px 15px rgba(0,0,0,0.1);';

    if (type === 'success') toast.style.background = '#10b981';
    else if (type === 'error') toast.style.background = '#ef4444';
    else toast.style.background = '#1e40af';

    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

function showAuthError(message) {
    var errorEl = document.getElementById('authError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}
