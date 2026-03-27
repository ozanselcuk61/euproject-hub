/* ====================================
   EUProject Hub — Firebase Configuration
   ==================================== */

let auth;
let db;

// Initialize Firebase
function initFirebase() {
    const firebaseConfig = {
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

    // Handle redirect result (for Google sign-in)
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

// Register with email/password
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

// Login with email/password
function loginWithEmail(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            return { success: true, user: userCredential.user };
        })
        .catch(function(error) {
            return { success: false, error: error.message };
        });
}

// Login with Google - use redirect for Safari compatibility
function loginWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    // Try popup first, fall back to redirect
    return auth.signInWithPopup(provider)
        .then(function(result) {
            return handlePostLogin(result.user).then(function() {
                return { success: true, user: result.user };
            });
        })
        .catch(function(error) {
            // If popup blocked or failed, try redirect
            if (error.code === 'auth/popup-blocked' ||
                error.code === 'auth/popup-closed-by-user' ||
                error.code === 'auth/cancelled-popup-request') {
                return auth.signInWithRedirect(provider);
            }
            return { success: false, error: error.message };
        });
}

// Handle user after login (create Firestore doc if needed)
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

// Logout
function logoutUser() {
    return auth.signOut()
        .then(function() {
            appInitialized = false;
            window.location.hash = '';
            return { success: true };
        })
        .catch(function(error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        });
}

// Get current user data from Firestore
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

// ---- FIRESTORE PROJECT FUNCTIONS ----

function saveProject(projectData) {
    var user = auth.currentUser;
    if (!user) return Promise.resolve({ success: false, error: 'Not authenticated' });

    return db.collection('projects').add({
        ...projectData,
        ownerId: user.uid,
        ownerEmail: user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function(docRef) {
        return { success: true, id: docRef.id };
    }).catch(function(error) {
        return { success: false, error: error.message };
    });
}

function getUserProjects(uid) {
    return db.collection('projects')
        .where('ownerId', '==', uid)
        .get()
        .then(function(snapshot) {
            var projects = [];
            snapshot.forEach(function(doc) {
                projects.push({ id: doc.id, ...doc.data() });
            });
            return projects;
        })
        .catch(function(error) {
            console.error('Error getting projects:', error);
            return [];
        });
}

// ---- AUTH STATE LISTENER ----
function setupAuthListener() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
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

                updateUserUI();
                showApp();
            });
        } else {
            // User is signed out
            showAuth('login');
        }
    });
}

// Update UI elements with current user info
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

// Show toast notification
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

// Show auth error
function showAuthError(message) {
    var errorEl = document.getElementById('authError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}
