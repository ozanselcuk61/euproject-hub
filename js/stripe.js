/* ====================================
   EUProject Hub — Stripe Payment Integration
   ==================================== */

var STRIPE_PUBLISHABLE_KEY = 'pk_live_51TS4PP5lr58PCaKEzTUzlyhsliOFKoR9bAz2TQvqaoB3bExtasVTrAmNkUaH3YAT0rdY8fibbSyOONxh4wKbNZjX00xvlNDM1r';
var STRIPE_PRICE_ID = 'price_1TS4jk5lr58PCaKEKvt9wVDE';
var stripe = null;

function initStripe() {
    if (typeof Stripe !== 'undefined') {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    }
}

// Check if user has any paid plan
function hasPaidPlan(user) {
    return user && (user.plan === 'standard' || user.plan === 'plus' || user.plan === 'premium');
}

// Check if user can perform premium actions
function canUsePremiumFeature() {
    var user = AppState.currentUser;
    if (!user) return false;
    if (hasPaidPlan(user)) return true;
    if (user.projectAccess && AppState.currentProjectId) {
        if (user.projectAccess.indexOf(AppState.currentProjectId) >= 0) return true;
    }
    if (!user.trialEnd) return true;
    return new Date() <= new Date(user.trialEnd);
}

// Check if user can create NEW projects
function canCreateProject() {
    var user = AppState.currentUser;
    if (!user) return false;
    if (hasPaidPlan(user)) return true;
    if (!user.trialEnd) return true;
    return new Date() <= new Date(user.trialEnd);
}

// Check project limits per plan
function canCreateMoreProjects() {
    var user = AppState.currentUser;
    if (!user) return false;
    var ownedCount = Object.values(Projects).filter(function(p) { return p.ownerId === user.id && p.status !== 'archived'; }).length;
    if (user.plan === 'standard' && ownedCount >= 1) return false;
    if (user.plan === 'plus' && ownedCount >= 5) return false;
    if (user.plan === 'premium') return true;
    // Trial users
    if (!user.trialEnd || new Date() <= new Date(user.trialEnd)) return true;
    return false;
}

// Guard function - call before any add/edit/delete action
function requirePremium(actionName) {
    if (canUsePremiumFeature()) return true;
    showUpgradeModal(actionName);
    return false;
}

// Guard for project creation - stricter than requirePremium
function requirePremiumForProjectCreation() {
    if (canCreateProject()) return true;
    openModal('Subscription Required',
        '<div style="text-align:center;padding:20px 0">' +
        '<div style="width:64px;height:64px;border-radius:50%;background:var(--primary-50);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><i class="fas fa-lock" style="font-size:28px;color:var(--primary)"></i></div>' +
        '<h3 style="font-size:20px;margin-bottom:8px">Create Your Own Projects</h3>' +
        '<p style="color:var(--gray-500);margin-bottom:16px">You can access projects you\'ve been invited to for free.<br>To create your own projects, subscribe to Premium.</p>' +
        '<div style="font-size:24px;font-weight:800;color:var(--primary);margin-bottom:20px">€15<span style="font-size:14px;font-weight:500;color:var(--gray-500)">/month</span></div></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Maybe Later</button>' +
        '<button class="btn btn-primary btn-lg" onclick="closeModal();startCheckout()"><i class="fas fa-credit-card"></i> Subscribe Now</button>');
    return false;
}

function showUpgradeModal(actionName) {
    openModal('Choose a Plan',
        '<div style="text-align:center;padding:10px 0 20px">' +
        '<div style="width:64px;height:64px;border-radius:50%;background:var(--warning-light);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><i class="fas fa-crown" style="font-size:28px;color:var(--warning)"></i></div>' +
        '<h3 style="font-size:20px;margin-bottom:8px">Upgrade to Continue</h3>' +
        '<p style="color:var(--gray-500);margin-bottom:20px">To ' + (actionName || 'use this feature') + ', choose a plan. <strong>First month free!</strong></p></div>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
        '<div style="border:2px solid var(--gray-200);border-radius:var(--radius);padding:14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="closeModal();startCheckout(\'standard\')" onmouseover="this.style.borderColor=\'var(--primary)\'" onmouseout="this.style.borderColor=\'var(--gray-200)\'">' +
        '<div><strong>Standard</strong><div style="font-size:12px;color:var(--gray-500)">1 project · Unlimited members · 5 GB</div></div><span style="font-weight:800;color:var(--primary);font-size:18px">€5<span style="font-size:12px;font-weight:500">/mo</span></span></div>' +
        '<div style="border:2px solid var(--primary);border-radius:var(--radius);padding:14px;cursor:pointer;background:var(--primary-50);display:flex;justify-content:space-between;align-items:center" onclick="closeModal();startCheckout(\'plus\')">' +
        '<div><strong>Plus</strong> <span style="background:var(--primary);color:#fff;padding:1px 6px;border-radius:50px;font-size:10px">POPULAR</span><div style="font-size:12px;color:var(--gray-500)">5 projects · Unlimited members · 10 GB</div></div><span style="font-weight:800;color:var(--primary);font-size:18px">€15<span style="font-size:12px;font-weight:500">/mo</span></span></div>' +
        '<div style="border:2px solid var(--gray-200);border-radius:var(--radius);padding:14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="closeModal();startCheckout(\'premium\')" onmouseover="this.style.borderColor=\'var(--primary)\'" onmouseout="this.style.borderColor=\'var(--gray-200)\'">' +
        '<div><strong>Premium</strong><div style="font-size:12px;color:var(--gray-500)">Unlimited projects · Unlimited members · 20 GB</div></div><span style="font-weight:800;color:var(--primary);font-size:18px">€30<span style="font-size:12px;font-weight:500">/mo</span></span></div></div>',
        '<button class="btn btn-secondary" onclick="closeModal()">Maybe Later</button>');
}

// Check if user's trial has expired
function isTrialExpired() {
    var user = AppState.currentUser;
    if (!user) return false;
    if (user.plan === 'premium') return false;
    if (!user.trialEnd) return false;
    return new Date() > new Date(user.trialEnd);
}

// Get days remaining in trial
function getTrialDaysRemaining() {
    var user = AppState.currentUser;
    if (!user || !user.trialEnd) return 0;
    if (user.plan === 'premium') return -1; // premium, no trial
    var remaining = Math.ceil((new Date(user.trialEnd) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
}

// Redirect to Stripe Checkout
function startCheckout(planType) {
    if (!stripe) {
        showToast('Payment system loading, please try again.', 'error');
        return;
    }

    var user = AppState.currentUser;
    if (!user) {
        showToast('Please log in first.', 'error');
        return;
    }

    // Map plan to Stripe price ID (you'll need to create these in Stripe)
    var planPriceMap = {
        'standard': STRIPE_PRICE_ID, // Update with actual Stripe price IDs
        'plus': STRIPE_PRICE_ID,
        'premium': STRIPE_PRICE_ID
    };
    var selectedPlan = planType || 'plus';
    var selectedPriceId = planPriceMap[selectedPlan] || STRIPE_PRICE_ID;

    // Create checkout session via Cloud Function
    var checkoutUrl = 'https://us-central1-euproject-hub.cloudfunctions.net/createCheckoutSession';

    fetch(checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            priceId: selectedPriceId,
            planType: selectedPlan,
            userId: user.id,
            email: user.email,
            successUrl: window.location.origin + window.location.pathname + '?payment=success&plan=' + selectedPlan + '#page-settings',
            cancelUrl: window.location.origin + window.location.pathname + '#page-settings'
        })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.sessionId) {
            return stripe.redirectToCheckout({ sessionId: data.sessionId });
        } else if (data.url) {
            window.location.href = data.url;
        } else {
            // Fallback: direct Stripe payment link
            showToast('Redirecting to payment...', 'info');
            openStripePaymentLink();
        }
    })
    .catch(function(error) {
        console.error('Checkout error:', error);
        // Fallback to Stripe Payment Link
        openStripePaymentLink();
    });
}

// Fallback: Stripe Payment Link (works without Cloud Functions)
function openStripePaymentLink() {
    var user = AppState.currentUser;
    var paymentUrl = 'https://buy.stripe.com/test_YOUR_PAYMENT_LINK';

    // Use Stripe Checkout in client-only mode
    if (stripe) {
        stripe.redirectToCheckout({
            lineItems: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
            mode: 'subscription',
            successUrl: window.location.origin + window.location.pathname + '?payment=success#page-settings',
            cancelUrl: window.location.origin + window.location.pathname + '?payment=cancel#page-settings',
            customerEmail: user ? user.email : undefined
        }).then(function(result) {
            if (result.error) {
                showToast(result.error.message, 'error');
            }
        });
    }
}

// Handle successful payment (called after redirect back)
function handlePaymentSuccess() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
        var selectedPlan = urlParams.get('plan') || 'plus';
        var user = AppState.currentUser;
        if (user) {
            db.collection('users').doc(user.id).update({
                plan: selectedPlan,
                premiumSince: new Date().toISOString()
            }).then(function() {
                AppState.currentUser.plan = selectedPlan;
                var planNames = { standard: 'Standard', plus: 'Plus', premium: 'Premium' };
                showToast('Welcome to ' + (planNames[selectedPlan] || 'Premium') + '! All features unlocked.', 'success');
            });
        }
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
}

// Check trial status and show warning if needed
function checkTrialStatus() {
    var daysLeft = getTrialDaysRemaining();
    var user = AppState.currentUser;
    if (!user || user.plan === 'premium') return;

    if (daysLeft === 0) {
        showTrialExpiredBanner();
    } else if (daysLeft <= 7 && daysLeft > 0) {
        showTrialWarningBanner(daysLeft);
    }
}

function showTrialWarningBanner(daysLeft) {
    var existing = document.getElementById('trialBanner');
    if (existing) existing.remove();

    var banner = document.createElement('div');
    banner.id = 'trialBanner';
    banner.style.cssText = 'background:linear-gradient(90deg,#f59e0b,#f97316);color:#fff;padding:10px 24px;text-align:center;font-size:14px;font-weight:500;position:relative;z-index:60;';
    banner.innerHTML = '<i class="fas fa-clock"></i> Your free trial ends in <strong>' + daysLeft + ' days</strong>. ' +
        '<a href="#" onclick="navigateTo(\'settings\');return false" style="color:#fff;text-decoration:underline;font-weight:700">Upgrade to Premium (€15/mo)</a>' +
        ' <button onclick="this.parentElement.remove()" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;cursor:pointer;font-size:16px">&times;</button>';

    var mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.insertBefore(banner, mainContent.firstChild);
}

function showTrialExpiredBanner() {
    var existing = document.getElementById('trialBanner');
    if (existing) existing.remove();

    var banner = document.createElement('div');
    banner.id = 'trialBanner';
    banner.style.cssText = 'background:linear-gradient(90deg,#ef4444,#dc2626);color:#fff;padding:14px 24px;text-align:center;font-size:14px;font-weight:500;position:relative;z-index:60;';
    banner.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Your free trial has expired. ' +
        '<a href="#" onclick="startCheckout();return false" style="color:#fff;text-decoration:underline;font-weight:700">Upgrade to Premium (€15/mo)</a>' +
        ' to continue using all features.';

    var mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.insertBefore(banner, mainContent.firstChild);
}

// Manage subscription (customer portal)
function openCustomerPortal() {
    var user = AppState.currentUser;
    if (!user) return;

    var portalUrl = 'https://us-central1-euproject-hub.cloudfunctions.net/createPortalSession';

    fetch(portalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user.id,
            returnUrl: window.location.href
        })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.url) {
            window.location.href = data.url;
        }
    })
    .catch(function(error) {
        console.error('Portal error:', error);
        showToast('Could not open subscription manager.', 'error');
    });
}
