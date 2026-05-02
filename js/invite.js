/* ====================================
   EUProject Hub — Partner Invite System
   ==================================== */

function openInvitePartnerModal() {
    openModal('Invite Partner',
        '<p style="color:var(--gray-600);margin-bottom:20px">Send an email invitation to a partner organization. They will receive a link to join this project.</p>' +
        '<div class="form-group"><label class="form-label">Email Address *</label><input type="email" class="form-input" id="invEmail" placeholder="partner@university.edu"></div>' +
        '<div class="form-group"><label class="form-label">Role</label><select class="form-select" id="invRole">' +
        '<option value="partner">Partner</option><option value="coordinator">Co-Coordinator</option><option value="associated">Associated Partner</option></select></div>' +
        '<div class="form-group"><label class="form-label">Personal Message (optional)</label>' +
        '<textarea class="form-textarea" id="invMessage" rows="3" placeholder="You have been invited to join our EU project..."></textarea></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="sendPartnerInvite()"><i class="fas fa-paper-plane"></i> Send Invitation</button>');
}

function sendPartnerInvite() {
    var email = document.getElementById('invEmail').value.trim();
    if (!email) { alert('Please enter an email address.'); return; }

    var pid = AppState.currentProjectId;
    var project = getCurrentProject();
    var role = document.getElementById('invRole').value;
    var message = document.getElementById('invMessage').value.trim();

    var invite = {
        email: email,
        role: role,
        message: message,
        projectId: pid,
        projectName: project.name,
        invitedBy: AppState.currentUser.name,
        invitedByEmail: AppState.currentUser.email,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // Save invite to Firestore
    db.collection('invites').add(invite).then(function(ref) {
        addActivity(pid, 'invited', email + ' as ' + role);
        if (typeof notifyPartnerInvited === 'function') notifyPartnerInvited(email, AppState.currentUser.name, project.name, role);
        showToast('Invitation sent to ' + email, 'success');
        closeModal();
    }).catch(function(err) {
        showToast('Error sending invite: ' + err.message, 'error');
    });
}

// Check for pending invites for current user
function checkPendingInvites() {
    if (!AppState.currentUser || !AppState.currentUser.email) return;

    db.collection('invites')
        .where('email', '==', AppState.currentUser.email)
        .where('status', '==', 'pending')
        .get()
        .then(function(snapshot) {
            if (snapshot.empty) return;
            snapshot.forEach(function(doc) {
                var invite = doc.data();
                showInviteNotification(doc.id, invite);
            });
        })
        .catch(function(err) { console.error('Invite check error:', err); });
}

function showInviteNotification(inviteId, invite) {
    var banner = document.createElement('div');
    banner.id = 'invite_' + inviteId;
    banner.style.cssText = 'background:linear-gradient(90deg,var(--primary),var(--accent));color:#fff;padding:12px 24px;text-align:center;font-size:14px;position:relative;z-index:60;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;';
    banner.innerHTML = '<span><i class="fas fa-envelope"></i> <strong>' + invite.invitedBy + '</strong> invited you to join project <strong>' + invite.projectName + '</strong> as ' + invite.role + '</span>' +
        '<button class="btn btn-sm btn-white" onclick="acceptInvite(\'' + inviteId + '\')">Accept</button>' +
        '<button class="btn btn-sm btn-ghost" style="color:#fff" onclick="declineInvite(\'' + inviteId + '\')">Decline</button>';

    var mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.insertBefore(banner, mainContent.firstChild);
}

function acceptInvite(inviteId) {
    db.collection('invites').doc(inviteId).get().then(function(doc) {
        if (!doc.exists) return;
        var invite = doc.data();
        var uid = AppState.currentUser.id;

        // Mark invite as accepted
        doc.ref.update({ status: 'accepted', acceptedAt: new Date().toISOString(), acceptedBy: uid });

        // Grant project access to this user
        db.collection('users').doc(uid).update({
            projectAccess: firebase.firestore.FieldValue.arrayUnion(invite.projectId)
        }).then(function() {
            // Update local state
            if (!AppState.currentUser.projectAccess) AppState.currentUser.projectAccess = [];
            AppState.currentUser.projectAccess.push(invite.projectId);
        });

        // Also store shared project reference so user can load it
        db.collection('users').doc(uid).collection('sharedProjects').doc(invite.projectId).set({
            projectId: invite.projectId,
            projectName: invite.projectName,
            ownerEmail: invite.invitedByEmail,
            role: invite.role,
            joinedAt: new Date().toISOString()
        });

        // Remove banner
        var banner = document.getElementById('invite_' + inviteId);
        if (banner) banner.remove();

        showToast('Invitation accepted! You joined ' + invite.projectName, 'success');

        // Reload data to include shared project
        loadUserData().then(function() { navigateTo('dashboard'); });
    });
}

function declineInvite(inviteId) {
    db.collection('invites').doc(inviteId).update({ status: 'declined' });
    var banner = document.getElementById('invite_' + inviteId);
    if (banner) banner.remove();
    showToast('Invitation declined', 'info');
}
