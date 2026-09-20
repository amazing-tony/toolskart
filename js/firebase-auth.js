/**
 * Amazing-Tools — Firebase Auth + Firestore Module
 * Google Sign-In, user profile sync, shared ratings, tool requests
 * Project: amazing-tools-aea33
 */

// ── Firebase SDK (v9 compat via CDN modules) ─────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
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

// Check for local guest user if not signed in with Google
function getLocalGuestUser() {
  try {
    const raw = localStorage.getItem('at_guest_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function setLocalGuestUser(name, emoji) {
  const guest = {
    uid: 'guest_' + Date.now(),
    displayName: name || 'Guest User',
    photoEmoji: emoji || '👤',
    photoURL: null,
    isGuest: true,
  };
  try { localStorage.setItem('at_guest_user', JSON.stringify(guest)); } catch (_) {}
  currentUser = guest;
  updateAuthUI(guest);
  return guest;
}

function clearLocalGuestUser() {
  try { localStorage.removeItem('at_guest_user'); } catch (_) {}
  currentUser = null;
  updateAuthUI(null);
}

/* ─────────────────────────────────────────────────────────────
   AUTH MODAL & SIGN-IN
───────────────────────────────────────────────────────────── */
function showAuthModal(errorMessage = '') {
  let modal = document.getElementById('atAuthModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'atAuthModal';
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 100000;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    `;
    document.body.appendChild(modal);
  }

  // ── Logged In User View (Google Account or Guest) ─────────────
  if (currentUser) {
    const user = currentUser;
    const isGoogle = !!user.email;
    const avatarHtml = user.photoURL 
      ? `<img src="${user.photoURL}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid #3B82F6;" alt="avatar" referrerpolicy="no-referrer">`
      : `<div style="width:48px; height:48px; border-radius:50%; background:rgba(37,99,235,0.12); display:flex; align-items:center; justify-content:center; font-size:1.6rem; border:2px solid #3B82F6;">${user.photoEmoji || '👤'}</div>`;

    modal.innerHTML = `
      <div style="background: var(--color-surface, #fff); color: var(--color-text, #1e293b); border: 1px solid var(--color-border, #cbd5e1); border-radius: 14px; max-width: 440px; width: 100%; padding: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); font-family: inherit;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 1.25rem;">
          <h3 style="margin:0; font-size: 1.15rem; display:flex; align-items:center; gap:0.45rem;">
            <span>👤</span> Account Profile
          </h3>
          <button id="closeAuthModalBtn" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--color-text-secondary, #64748b);">✕</button>
        </div>

        <div style="display:flex; align-items:center; gap:0.9rem; padding: 1rem; background: var(--color-bg, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 10px; margin-bottom: 1.25rem;">
          ${avatarHtml}
          <div style="flex:1; overflow:hidden;">
            <div style="font-weight:700; font-size:1rem; color:var(--color-text, #0f172a); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${user.displayName || 'Productive User'}
            </div>
            <div style="font-size:0.82rem; color:var(--color-text-secondary, #64748b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${user.email || 'Local Browser Profile'}
            </div>
            <span style="display:inline-block; margin-top:0.3rem; font-size:0.7rem; font-weight:700; padding:0.12rem 0.5rem; border-radius:999px; background:${isGoogle ? '#DCFCE7' : '#FEF3C7'}; color:${isGoogle ? '#15803D' : '#B45309'};">
              ${isGoogle ? '✓ Signed in via Google' : '✓ Guest Profile Active'}
            </span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.6rem;">
          <button id="modalSignOutBtn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.7rem 1rem; background: #DC2626; color: #fff; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(220,38,38,0.25); transition: all 0.15s ease;">
            <span>🚪</span> Sign Out / Logout
          </button>
          ${!isGoogle ? `
            <button id="modalSwitchToGoogleBtn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem 1rem; background: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
              Switch to Google Account
            </button>
          ` : ''}
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const closeBtn = document.getElementById('closeAuthModalBtn');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    const signOutBtn = document.getElementById('modalSignOutBtn');
    if (signOutBtn) {
      signOutBtn.onclick = async () => {
        signOutBtn.disabled = true;
        signOutBtn.innerText = 'Signing out…';
        await signOutUser();
        modal.style.display = 'none';
        const toast = document.getElementById('themeToast');
        if (toast) {
          toast.textContent = '👋 Signed out successfully!';
          toast.style.display = 'block';
          toast.style.opacity = '1';
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.style.display = 'none', 400);
          }, 3000);
        }
      };
    }

    const switchToGoogle = document.getElementById('modalSwitchToGoogleBtn');
    if (switchToGoogle) {
      switchToGoogle.onclick = () => {
        clearLocalGuestUser();
        showAuthModal();
      };
    }
    return;
  }

  // ── Unauthenticated / Sign-In View ────────────────────────────
  const guest = getLocalGuestUser();
  const currentGuestName = guest ? guest.displayName : '';

  modal.innerHTML = `
    <div style="background: var(--color-surface, #fff); color: var(--color-text, #1e293b); border: 1px solid var(--color-border, #cbd5e1); border-radius: 14px; max-width: 440px; width: 100%; padding: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); font-family: inherit;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 1rem;">
        <h3 style="margin:0; font-size: 1.15rem; display:flex; align-items:center; gap:0.45rem;">
          <span>👤</span> User Account &amp; Profile
        </h3>
        <button id="closeAuthModalBtn" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--color-text-secondary, #64748b);">✕</button>
      </div>

      <p style="margin: 0 0 1rem; font-size: 0.84rem; color: var(--color-text-secondary, #64748b); line-height: 1.45;">
        Sign in to save your calculator inputs, sync ratings, and personalize your experience across 42 tools.
      </p>

      ${errorMessage ? `
        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; font-size: 0.8rem; color: #dc2626;">
          <strong>Sign-in notice:</strong> ${errorMessage}
          <div style="margin-top:0.4rem; font-size:0.75rem; color:#b91c1c;">
            💡 Admin setup required: Enable Google provider in <a href="https://console.firebase.google.com/project/amazing-tools-aea33/authentication/providers" target="_blank" style="color:#2563eb; text-decoration:underline;">Firebase Console</a> and add <code>amazing-tools.github.io</code> to Authorized Domains.
          </div>
        </div>
      ` : ''}

      <!-- Google Sign In Button -->
      <button id="modalGoogleSignInBtn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 0.65rem 1rem; background: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background 0.15s ease;">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
        Sign in with Google
      </button>

      <div style="display:flex; align-items:center; margin: 1.1rem 0; color: var(--color-text-secondary, #94a3b8); font-size: 0.78rem;">
        <div style="flex:1; height:1px; background:var(--color-border, #e2e8f0);"></div>
        <span style="padding: 0 0.6rem;">OR USE INSTANT GUEST PROFILE</span>
        <div style="flex:1; height:1px; background:var(--color-border, #e2e8f0);"></div>
      </div>

      <!-- Instant Guest Profile -->
      <div style="background: var(--color-bg, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 8px; padding: 0.85rem;">
        <label style="display:block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.35rem;">Your Name / Nickname:</label>
        <div style="display:flex; gap:0.4rem; margin-bottom: 0.6rem;">
          <input type="text" id="guestNameInput" value="${currentGuestName || 'Productive User'}" placeholder="Enter your name" style="flex:1; padding: 0.45rem 0.65rem; border: 1px solid var(--color-border, #cbd5e1); border-radius: 6px; font-size: 0.85rem; background: var(--color-surface, #fff); color: inherit;">
          <select id="guestEmojiSelect" style="padding: 0.45rem; border: 1px solid var(--color-border, #cbd5e1); border-radius: 6px; font-size: 1rem; background: var(--color-surface, #fff); color: inherit;">
            <option value="👤">👤</option>
            <option value="⚡">⚡</option>
            <option value="🚀">🚀</option>
            <option value="💼">💼</option>
            <option value="🌟">🌟</option>
            <option value="🎯">🎯</option>
          </select>
        </div>
        <button id="modalGuestSaveBtn" style="width: 100%; padding: 0.5rem; background: var(--color-primary, #2563eb); color: #fff; border: none; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer;">
          ✓ Save Local Profile (100% In-Browser)
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  // Close handlers
  const closeBtn = document.getElementById('closeAuthModalBtn');
  if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  // Google sign in click
  const googleBtn = document.getElementById('modalGoogleSignInBtn');
  if (googleBtn) {
    googleBtn.onclick = async () => {
      googleBtn.innerText = 'Connecting to Google…';
      googleBtn.disabled = true;
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const res = await signInWithPopup(auth, provider);
        modal.style.display = 'none';
        return res.user;
      } catch (err) {
        console.warn('[AT Auth] Google popup sign-in error:', err.code, err.message);
        let friendlyMsg = err.message;
        if (err.code === 'auth/configuration-not-found' || err.message.includes('invalid') || err.message.includes('action')) {
          friendlyMsg = 'Google Sign-In is pending activation in Firebase Console.';
        } else if (err.code === 'auth/popup-closed-by-user') {
          friendlyMsg = 'Sign-in popup was closed before completing.';
        } else if (err.code === 'auth/unauthorized-domain') {
          friendlyMsg = 'Domain amazing-tools.github.io must be added to Authorized Domains in Firebase Console.';
        }
        showAuthModal(friendlyMsg);
      }
    };
  }

  // Guest profile save
  const guestSaveBtn = document.getElementById('modalGuestSaveBtn');
  if (guestSaveBtn) {
    guestSaveBtn.onclick = () => {
      const name = document.getElementById('guestNameInput')?.value?.trim();
      const emoji = document.getElementById('guestEmojiSelect')?.value || '👤';
      setLocalGuestUser(name, emoji);
      modal.style.display = 'none';
    };
  }
}

async function signIn() {
  showAuthModal();
}

async function signOutUser() {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('[AT Auth] Sign-out failed:', e.message);
  }
  clearLocalGuestUser();
}

// Auth state listener — updates header button + syncs user profile
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    updateAuthUI(user);
    await syncUserProfile(user);
  } else {
    const guest = getLocalGuestUser();
    if (guest) {
      currentUser = guest;
      updateAuthUI(guest);
    } else {
      currentUser = null;
      updateAuthUI(null);
    }
  }
});

function updateAuthUI(user) {
  const btn  = document.getElementById('authSignInBtn');
  const wrap = document.getElementById('authBtnWrap');
  if (!btn && !wrap) return;

  if (user) {
    const label  = user.displayName ? user.displayName.split(' ')[0] : 'You';
    const avatar = user.photoURL
      ? `<img src="${user.photoURL}" class="auth-btn-avatar" alt="avatar" referrerpolicy="no-referrer">`
      : (user.photoEmoji || '👤');
    if (btn) {
      btn.innerHTML = `${avatar} <span class="auth-btn-label">${label}</span>`;
      btn.title = `Signed in as ${user.displayName || user.email} — Click to view account or Sign Out`;
      btn.onclick = () => showAuthModal();
      btn.style.background = 'rgba(66,133,244,0.12)';
      btn.style.borderColor = '#4285F4';
      btn.style.color = '#4285F4';
    }
  } else {
    if (btn) {
      btn.innerHTML = `<span>👤</span> <span class="auth-btn-label">Sign In</span>`;
      btn.title = 'Sign in with Google or continue as guest';
      btn.onclick = () => showAuthModal();
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
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
