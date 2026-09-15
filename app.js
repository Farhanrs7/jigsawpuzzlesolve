// Firebase Modular SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if user has updated Firebase Config
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

let db = null;
if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase Initialization Error:", e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('user-email');
  const submitBtn = document.getElementById('submit-btn');
  const messageDiv = document.getElementById('form-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email) return;

    // UI Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Saving...</span>`;
    messageDiv.textContent = '';
    messageDiv.className = 'form-message';

    try {
      if (isFirebaseConfigured && db) {
        // Save to Firebase Firestore under "waitlist" collection
        await addDoc(collection(db, "waitlist"), {
          email: email,
          createdAt: serverTimestamp(),
          source: "landing_page"
        });
      } else {
        // Fallback demo mode when Firebase config isn't added yet
        console.warn("Firebase config missing. Saving locally for testing.");
        const existing = JSON.parse(localStorage.getItem('puzzle_waitlist') || '[]');
        existing.push({ email, createdAt: new Date().toISOString() });
        localStorage.setItem('puzzle_waitlist', JSON.stringify(existing));
        await new Promise(r => setTimeout(r, 600)); // Simulate net delay
      }

      // Success UI feedback
      messageDiv.textContent = "🎉 You're on the list! We'll notify you as soon as early access opens.";
      messageDiv.className = 'form-message success';
      emailInput.value = '';
    } catch (err) {
      console.error("Submission error:", err);
      messageDiv.textContent = "❌ Failed to submit. Please try again or check back later.";
      messageDiv.className = 'form-message error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Notify Me</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      `;
    }
  });
});
