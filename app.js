// Firebase Modular SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Firebase project configuration retrieved from service account
const firebaseConfig = {
  apiKey: "AIzaSyCyPmg3e9bSS4GAwHv8J6hlB6u7sjEk2o0",
  authDomain: "jigsawpuzzlesolve.firebaseapp.com",
  projectId: "jigsawpuzzlesolve",
  storageBucket: "jigsawpuzzlesolve.firebasestorage.app",
  messagingSenderId: "496814701803",
  appId: "1:496814701803:web:cf2bbb83f01cf34cda92ae"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

// Helper to add timeout to promises (prevents infinite "Saving..." UI lockup)
const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase connection timed out. Check Security Rules.')), ms));

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
      if (!db) {
        throw new Error("Firestore not initialized");
      }

      // Save to Firebase Firestore with 8s timeout limit
      await Promise.race([
        addDoc(collection(db, "waitlist"), {
          email: email,
          createdAt: serverTimestamp(),
          source: "landing_page"
        }),
        timeout(8000)
      ]);

      // Success UI feedback
      messageDiv.textContent = "🎉 You're on the list! We'll notify you as soon as early access opens.";
      messageDiv.className = 'form-message success';
      emailInput.value = '';
    } catch (err) {
      console.error("Submission error:", err);
      messageDiv.textContent = `❌ ${err.message || "Failed to submit. Please check Firestore security rules."}`;
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
