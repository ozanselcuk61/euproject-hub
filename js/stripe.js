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
function startCheckout() {
    if (!stripe) {
        showToast('Payment system loading, please try again.', 'error');
        return;
    }

    var user = AppState.currentUser;
    if (!user) {
        showToast('Please log in first.', 'error');
        return;
    }

    // Create checkout session via Cloud Function
    var checkoutUrl = 'https://us-central1-euproject-hub.cloudfunctions.net/createCheckoutSession';

    fetch(checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            priceId: STRIPE_PRICE_ID,
            userId: user.id,
            email: user.email,
            successUrl: window.location.origin + window.location.pathname + '#page-settings',
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
        // Update user plan in Firestore
        var user = AppState.currentUser;
        if (user) {
            db.collection('users').doc(user.id).update({
                plan: 'premium',
                premiumSince: new Date().toISOString()
            }).then(function() {
                AppState.currentUser.plan = 'premium';
                showToast('Welcome to Premium! All features unlocked.', 'success');
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
