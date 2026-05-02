/* ====================================
   EUProject Hub — Email Notifications (EmailJS)
   ==================================== */

var EMAILJS_PUBLIC_KEY = 'HiK5i6b4O6m8whd6x';
var EMAILJS_SERVICE_ID = 'service_lpdblfq';
var EMAILJS_TEMPLATE_ID = 'template_qq4yqlv';

function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
}

function sendEmail(toEmail, toName, subject, message, projectName) {
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS not loaded');
        return Promise.resolve({ success: false });
    }

    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: toEmail,
        to_name: toName || 'Team Member',
        subject: subject,
        message: message,
        project_name: projectName || ''
    }).then(function() {
        return { success: true };
    }).catch(function(error) {
        console.error('Email error:', error);
        return { success: false, error: error };
    });
}

// ---- NOTIFICATION TRIGGERS ----

function notifyPartnerAdded(partner, project) {
    if (!partner.email) return;
    sendEmail(
        partner.email,
        partner.contact || partner.name,
        'You have been added to project: ' + project.name,
        'You have been added as a ' + (partner.role || 'partner') + ' to the EU project "' + project.name + '" (' + (project.programme || '') + ') on EUProject Hub.\n\nYour budget allocation: ' + formatCurrency(partner.budget) + '\n\nLog in to view the project: https://ozanselcuk61.github.io/euproject-hub/app.html',
        project.name
    ).then(function(result) {
        if (result.success) showToast('Notification sent to ' + partner.email, 'success');
    });
}

function notifyTaskAssigned(task, assigneeEmail, project) {
    if (!assigneeEmail) return;
    sendEmail(
        assigneeEmail,
        task.assignee || 'Team Member',
        'New task assigned: ' + task.title,
        'A new task has been assigned to you:\n\nTask: ' + task.title + '\nWork Package: ' + (task.wp || 'N/A') + '\nDue Date: ' + (task.due ? formatDate(task.due) : 'Not set') + '\nPriority: ' + (task.priority || 'medium') + '\n\nLog in to view: https://ozanselcuk61.github.io/euproject-hub/app.html',
        project.name
    );
}

function notifyPartnerInvited(email, inviterName, projectName, role) {
    sendEmail(
        email,
        '',
        'Invitation to join EU project: ' + projectName,
        inviterName + ' has invited you to join the EU project "' + projectName + '" as ' + (role || 'partner') + ' on EUProject Hub.\n\nCreate a free account to get started: https://ozanselcuk61.github.io/euproject-hub/app.html#register',
        projectName
    ).then(function(result) {
        if (result.success) showToast('Invitation email sent to ' + email, 'success');
    });
}

function notifyDeadlineReminder(task, assigneeEmail, project) {
    if (!assigneeEmail) return;
    sendEmail(
        assigneeEmail,
        task.assignee || 'Team Member',
        'Deadline reminder: ' + task.title,
        'This is a reminder that the following task is due soon:\n\nTask: ' + task.title + '\nDue Date: ' + formatDate(task.due) + '\nProject: ' + project.name + '\n\nPlease make sure to complete it on time.',
        project.name
    );
}
