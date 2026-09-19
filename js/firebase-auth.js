/**
 * Amazing-Tools — Firebase Auth + Firestore Module
 * Google Sign-In, user profile sync, shared ratings, tool requests
 * Project: amazing-tools-aea33
 */

// ── Firebase SDK (v9 compat via CDN modules) ─────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  projectId:         'amazing-tools-aea33',
  appId:             '1:859384820636:web:9f28fdf5bcabb3f5b20e59',
  storageBucket:     'amazing-tools-aea33.firebasestorage.app',
  apiKey:            'AIzaSyAd2yV0KV_lhFp5P22Eoy-KlmNJVAgcQVE',
  authDomain:        'amazing-tools-aea33.firebaseapp.com',
  messagingSenderId: '859384820636',
  measurementId:     'G-Z3G5580LJG',
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

let currentUser = null;

/* ─────────────────────────────────────────────────────────────
   AUTH — Google Sign-In (redirect flow for GitHub Pages compat)
   signInWithPopup fails on GitHub Pages ("action invalid") because
   the popup auth handler at firebaseapp.com/auth tries to redirect
   back to amazing-tools.github.io which must be in Firebase's
   authorized domains. signInWithRedirect routes entirely through
   Firebase's own domain and avoids this restriction.
───────────────────────────────────────────────────────────── */
async function signIn() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    // signInWithRedirect: navigates away, then returns with session on callback
    await signInWithRedirect(auth, provider);
    // (page will reload; result picked up by checkRedirectResult below)
  } catch (e) {
    console.warn('[AT Auth] Sign-in redirect failed:', e.message);
  }
}

/**
 * Called once on page load to pick up the result from signInWithRedirect.
 * Firebase persists the redirect session automatically.
 */
async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      // Redirect sign-in just completed — profile sync handled by onAuthStateChanged
      console.log('[AT Auth] Redirect sign-in OK:', result.user.email);
    }
  } catch (e) {
    // auth/popup-closed-by-user or auth/cancelled-popup-request — silently ignore
    if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
      console.warn('[AT Auth] Redirect result error:', e.code, e.message);
    }
  }
}

// Kick off redirect-result check immediately on module load
checkRedirectResult();

async function signOutUser() {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('[AT Auth] Sign-out failed:', e.message);
  }
}

// Auth state listener — updates header button + syncs user profile
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  updateAuthUI(user);
  if (user) await syncUserProfile(user);
});

function updateAuthUI(user) {
  const btn  = document.getElementById('authSignInBtn');
  const wrap = document.getElementById('authBtnWrap');
  if (!btn && !wrap) return;

  if (user) {
    // Show avatar + name
    const label  = user.displayName ? user.displayName.split(' ')[0] : 'You';
    const avatar = user.photoURL
      ? `<img src="${user.photoURL}" class="auth-btn-avatar" alt="avatar" referrerpolicy="no-referrer">`
      : '👤';
    if (btn) {
      btn.innerHTML = `${avatar} <span class="auth-btn-label">${label}</span>`;
      btn.title = `Signed in as ${user.email} — Click to sign out`;
      btn.onclick = signOutUser;
      btn.style.background = 'rgba(66,133,244,0.12)';
      btn.style.borderColor = '#4285F4';
      btn.style.color = '#4285F4';
    }
  } else {
    if (btn) {
      btn.innerHTML = `<span>👤</span> <span class="auth-btn-label">Sign In</span>`;
      btn.title = 'Sign in with Google — you will be redirected to Google';
      btn.onclick = async function() {
        btn.innerHTML = `<span class="auth-btn-label">Redirecting…</span>`;
        btn.disabled = true;
        await signIn();
      };
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.disabled = false;
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   FIRESTORE — User Profile (recently-used, favorites sync)
───────────────────────────────────────────────────────────── */
async function syncUserProfile(user) {
  try {
    const ref  = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // First login — create profile
      await setDoc(ref, {
        displayName: user.displayName,
        email:       user.email,
        photoURL:    user.photoURL,
        createdAt:   serverTimestamp(),
        lastSeen:    serverTimestamp(),
      });
    } else {
      await updateDoc(ref, { lastSeen: serverTimestamp() });
    }
  } catch (e) {
    console.warn('[AT Auth] Profile sync failed:', e.message);
  }
}

/* ─────────────────────────────────────────────────────────────
   FIRESTORE — Shared Tool Ratings
───────────────────────────────────────────────────────────── */

/**
 * Submit a star rating for a tool (1–5).
 * Stores per-user rating + updates aggregated average on tool doc.
 */
async function submitRating(toolId, stars) {
  if (!currentUser) {
    // Fallback to localStorage-only
    if (window.AT_Features) window.AT_Features.setRating(toolId, stars);
    return;
  }
  try {
    const userRatingRef = doc(db, 'toolRatings', toolId, 'userRatings', currentUser.uid);
    const toolRef       = doc(db, 'toolRatings', toolId);
    const existing      = await getDoc(userRatingRef);

    // Save/update user's individual rating
    await setDoc(userRatingRef, {
      stars, uid: currentUser.uid, ts: serverTimestamp()
    });

    if (!existing.exists()) {
      // New vote — increment count and add to total
      const toolSnap = await getDoc(toolRef);
      if (toolSnap.exists()) {
        await updateDoc(toolRef, {
          totalStars: increment(stars),
          ratingCount: increment(1),
        });
      } else {
        await setDoc(toolRef, { totalStars: stars, ratingCount: 1 });
      }
    } else {
      // Changed vote — adjust total by difference
      const diff = stars - (existing.data().stars || 0);
      await updateDoc(toolRef, { totalStars: increment(diff) });
    }
    // Also save locally
    if (window.AT_Features) window.AT_Features.setRating(toolId, stars);
  } catch (e) {
    console.warn('[AT Auth] Rating submit failed:', e.message);
  }
}

/**
 * Get aggregated rating for a tool: { avg: 4.7, count: 23 }
 */
async function getToolRating(toolId) {
  try {
    const snap = await getDoc(doc(db, 'toolRatings', toolId));
    if (!snap.exists()) return null;
    const { totalStars, ratingCount } = snap.data();
    return {
      avg:   ratingCount > 0 ? (totalStars / ratingCount).toFixed(1) : '0',
      count: ratingCount || 0,
    };
  } catch (_) { return null; }
}

/* ─────────────────────────────────────────────────────────────
   FIRESTORE — Tool Requests
───────────────────────────────────────────────────────────── */
async function submitToolRequest(toolName, category, description) {
  try {
    await addDoc(collection(db, 'toolRequests'), {
      toolName, category, description,
      uid:       currentUser ? currentUser.uid : null,
      userName:  currentUser ? currentUser.displayName : 'Anonymous',
      ts:        serverTimestamp(),
      votes:     1,
    });
  } catch (e) {
    console.warn('[AT Auth] Tool request submit failed:', e.message);
  }
}

/**
 * Fetch top tool requests for community wishlist display
 */
async function getTopToolRequests(maxItems = 8) {
  try {
    const q    = query(collection(db, 'toolRequests'), orderBy('votes', 'desc'), limit(maxItems));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (_) { return []; }
}

/* ─────────────────────────────────────────────────────────────
   INIT — render shared ratings on tool cards
───────────────────────────────────────────────────────────── */
async function renderSharedRatings() {
  const cards = document.querySelectorAll('[data-tool]');
  for (const card of cards) {
    const toolId = card.dataset.tool;
    if (!toolId) continue;
    const rating = await getToolRating(toolId);
    if (!rating || rating.count === 0) continue;

    // Inject rating badge into card footer
    const footer = card.querySelector('.tool-card-footer, .featured-features');
    if (footer) {
      const badge = document.createElement('span');
      badge.className = 'tool-rating-badge';
      badge.title = `${rating.count} ratings`;
      badge.innerHTML = `⭐ ${rating.avg}`;
      footer.prepend(badge);
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   PUBLIC API
───────────────────────────────────────────────────────────── */
window.AT_Auth = {
  signIn,
  signOut:          signOutUser,
  getUser:          () => currentUser,
  isSignedIn:       () => !!currentUser,
  submitRating,
  getToolRating,
  submitToolRequest,
  getTopToolRequests,
  db, auth,
};

// Render shared ratings after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderSharedRatings);
} else {
  renderSharedRatings();
}
