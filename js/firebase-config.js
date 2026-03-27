/* ====================================
   EUProject Hub — Firebase Configuration
   ==================================== */

// Firebase App & Services (using compat libraries for simplicity with vanilla JS)
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
}

// ---- AUTH FUNCTIONS ----

// Register with email/password
async function registerWithEmail(email, password, firstName, lastName, organization) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update display name
        await user.updateProfile({
            displayName: firstName + ' ' + lastName
        });

        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
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

        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Login with email/password
async function loginWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Login with Google
async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Check if user doc exists, if not create one
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            const names = (user.displayName || 'User').split(' ');
            await db.collection('users').doc(user.uid).set({
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

        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout
async function logoutUser() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get current user data from Firestore
async function getUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// ---- FIRESTORE PROJECT FUNCTIONS ----

// Save a project to Firestore
async function saveProject(projectData) {
    try {
        const user = auth.currentUser;
        if (!user) return { success: false, error: 'Not authenticated' };

        const docRef = await db.collection('projects').add({
            ...projectData,
            ownerId: user.uid,
            ownerEmail: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get user's projects from Firestore
async function getUserProjects(uid) {
    try {
        const snapshot = await db.collection('projects')
            .where('ownerId', '==', uid)
            .orderBy('createdAt', 'desc')
            .get();

        const projects = [];
        snapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        return projects;
    } catch (error) {
        console.error('Error getting projects:', error);
        return [];
    }
}

// ---- AUTH STATE LISTENER ----
function setupAuthListener() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            const userData = await getUserData(user.uid);
            const names = (user.displayName || 'User').split(' ');

            AppState.currentUser = {
                id: user.uid,
                name: user.displayName || 'User',
                email: user.email,
                initials: (names[0] || 'U')[0] + (names[1] || '')[0] || '',
                role: userData?.role || 'Coordinator',
                plan: userData?.plan || 'trial',
                organization: userData?.organization || '',
                photoURL: user.photoURL || null
            };

            // Update UI with user info
            updateUserUI();
            showApp();
        } else {
            // User is signed out
            showAuth('login');
        }
    });
}

// Update UI elements with current user info
function updateUserUI() {
    const user = AppState.currentUser;
    if (!user) return;

    const avatarEl = document.querySelector('.topbar-user .user-avatar');
    const nameEl = document.querySelector('.topbar-user .user-name');
    const roleEl = document.querySelector('.topbar-user .user-role');

    if (avatarEl) {
        if (user.photoURL) {
            avatarEl.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" alt="">`;
        } else {
            avatarEl.textContent = user.initials;
        }
    }
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;padding:14px 24px;border-radius:var(--radius);color:#fff;font-size:14px;font-weight:500;z-index:9999;animation:slideUp 0.3s ease;max-width:400px;box-shadow:var(--shadow-lg);`;

    if (type === 'success') toast.style.background = 'var(--success)';
    else if (type === 'error') toast.style.background = 'var(--danger)';
    else toast.style.background = 'var(--primary)';

    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
