// src/components/HowToPillAI.jsx
import React from "react";
import Modal from "./Modal.jsx";

export default function HowToPillAI({ isOpen, onClose }) {
  return (
    <Modal open={isOpen} onClose={onClose} title="How to use Pill-AI">
      <div className="howto">
        {/* QUICK START */}
        <details open>
          <summary>🚀 Quick start</summary>
          <ol>
            <li>Go to <b>Chat</b> ➜ ask a medicine question (or tap the mic).</li>
            <li>Switch to <b>Track</b> ➜ set your reminders (name, duration, times).</li>
            <li>Tap <b>Meds Taken</b> when a dose is due to log it and fill the progress bar.</li>
            <li>Open <b>Support</b> ➜ invite your Cheer Squad (share link) and get encouragement.</li>
            <li>Try <b>Learn</b> ➜ take a quiz and earn XP; check <b>Earn</b> for rewards.</li>
          </ol>
        </details>

        {/* CHAT */}
        <details>
          <summary>💬 Chat — ask safe medicine questions</summary>
          <ol>
            <li>Open the <b>Chat</b> tab.</li>
            <li>Type your question (e.g., “How do I take amoxicillin?”) or tap the mic to speak.</li>
            <li>Tap <b>Send</b>. Answers use trusted NZ sources and simple language.</li>
            <li>(Optional) Change language using the language selector at the top.</li>
            <li><i>Tip:</i> Answers can auto-fill the reminder form (drug name, duration) in Track.</li>
          </ol>
        </details>

        {/* TRACK: CREATE REMINDERS */}
        <details>
          <summary>💊 Track — set reminders (short-term or long-term)</summary>
          <ol>
            <li>Open the <b>Track</b> tab and tap <b>Set a Reminder</b>.</li>
            <li><b>Medicine</b>: enter the name (auto-fills from Chat if available).</li>
            <li><b>Duration</b>: choose <b>Long Term</b> <i>or</i> select <b>Number of days (1–20)</b>.</li>
            <li><b>Times per day</b>: choose 1–4.</li>
            <li>For each time, pick the clock time (e.g., 8:00, 14:00, 20:00).</li>
            <li>Allow notifications if prompted (browser/device permission).</li>
            <li>Tap <b>Save Reminder</b>. You’ll see a schedule summary and a progress bar.</li>
          </ol>
          <p><i>What happens next?</i> You’ll get a push notification at each time. When a dose window opens (±30 min), the <b>Meds Taken</b> button appears.</p>
        </details>

        {/* TRACK: TAKING / SKIPPING / CANCELLING */}
        <details>
          <summary>📈 Track — log doses, skip, cancel, or change times</summary>
          <ul>
            <li><b>Log a dose:</b> When the timer hits a scheduled time (or within ±30 min), tap <b>Meds Taken</b>. Progress % increases.</li>
            <li><b>Took it early?</b> Tap <b>Meds Taken</b> when you take it; the next dose reschedules automatically.</li>
            <li><b>Skip a dose:</b> If you missed it, do nothing. The app moves to the next dose and keeps the log clean.</li>
            <li><b>Change times/duration:</b> Tap <b>Edit</b> on the reminder, adjust fields, <b>Save</b>.</li>
            <li><b>Cancel one reminder:</b> Use <b>Cancel</b> beside that reminder.</li>
            <li><b>Cancel all reminders:</b> Tap <b>Cancel All Reminders</b> in the Track card.</li>
          </ul>
        </details>

        {/* SUPPORT / CHEER SQUAD INVITES */}
        <details>
          <summary>🤝 Support — invite your Cheer Squad</summary>
          <ol>
            <li>Open <b>Support</b>.</li>
            <li>Tap <b>Create Invite Link</b> (or <b>Invite</b>).</li>
            <li>Share the link by text/email/DM with family, friends, or a caregiver.</li>
            <li>When they join, they’ll appear in your Support dashboard.</li>
            <li>Supporters can send you encouragement; you’ll see it in <b>Cheering Hub</b>.</li>
          </ol>
          <p><i>Tip:</i> You can mask phone numbers; only initials/avatars show by default.</p>
        </details>

        {/* CHEERING HUB */}
        <details>
          <summary>🎉 Cheering Hub — see boosts from your supporters</summary>
          <ol>
            <li>Open <b>Cheering Hub</b> to view messages and reactions.</li>
            <li>Reply with thanks or emojis. Positive nudges also appear in notifications.</li>
            <li>Progress updates auto-post so supporters can celebrate milestones.</li>
          </ol>
        </details>

        {/* LEARN / EARN */}
        <details>
          <summary>📚 Learn & 🏆 Earn — quizzes and XP</summary>
          <ol>
            <li>Open <b>Learn</b> and tap <b>Start Quiz</b>.</li>
            <li>Answer multiple-choice questions about your medicine (how it works, how to take, cautions).</li>
            <li>Tap <b>Submit</b> ➜ see feedback. Correct answers give you <b>XP</b>.</li>
            <li>Open <b>Earn</b> to see your XP total and rewards/badges.</li>
          </ol>
        </details>

        {/* VOICE */}
        <details>
          <summary>🎙️ Voice Assistant — hands-free Q&A</summary>
          <ol>
            <li>Go to <b>Voice</b> (or use the mic in Chat).</li>
            <li>Tap the mic, ask your question clearly, then tap again to stop.</li>
            <li>Pill-AI reads the answer aloud and shows it on screen.</li>
          </ol>
        </details>

        {/* NOTIFICATIONS */}
        <details>
          <summary>🔔 Notifications — allow and troubleshoot</summary>
          <ul>
            <li><b>Allow:</b> When prompted, choose <b>Allow</b> notifications for this site.</li>
            <li><b>Didn’t get a prompt?</b> Browser address bar ➜ site settings ➜ Notifications ➜ <b>Allow</b>.</li>
            <li><b>iOS/Android:</b> Ensure <i>Push notifications</i> for your browser are enabled in system settings.</li>
          </ul>
        </details>

        {/* SAFETY */}
        <details>
          <summary>🛡️ Safety</summary>
          <p>Pill-AI gives general information from trusted NZ sources. It doesn’t replace advice from your pharmacist or doctor—always seek personal guidance for your situation.</p>
        </details>
      </div>
    </Modal>
  );
}