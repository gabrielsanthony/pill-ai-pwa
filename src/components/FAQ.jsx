// src/components/FAQ.jsx
import React from "react";
import Modal from "./Modal.jsx";

export default function FAQ({ isOpen, onClose, language = "English" }) {
  // You can localize later; English is default.
  const Q = [
    {
      q: "What is Pill-AI and who is it for?",
      a: (
        <p>
          Pill-AI is a prototype that helps you understand medicines, set
          reminders, and involve supporters (“Cheer Squad”). It’s for learning
          and motivation, not a medical device.
        </p>
      ),
    },
    {
      q: "Does Pill-AI store my personal data?",
      a: (
        <>
          <p>
            We don’t ask for your name/email. Reminder info and progress are
            stored on your device (localStorage). Push tokens are used only to
            deliver the reminders you asked for.
          </p>
          <p>
            You can clear local data anytime from the Privacy screen (🛡️
            Privacy → “Clear my app data”).
          </p>
        </>
      ),
    },
    {
      q: "How do I set, edit, or cancel reminders?",
      a: (
        <ol>
          <li>
            Go to <b>💊 Track</b> → <b>➕ Set Med Reminder</b>.
          </li>
          <li>
            Fill <i>Medicine</i>, choose <i>Long-term</i> or <i>Days</i>, set{" "}
            <i>Times per day</i> and exact times.
          </li>
          <li>Tap <b>Save Reminder</b> and allow notifications.</li>
          <li>
            To edit: open <b>💊 Track</b> → <b>Edit</b>. To cancel all:{" "}
            <b>🗑️ Cancel Reminders</b>.
          </li>
        </ol>
      ),
    },
    {
      q: "I’m not receiving notifications. What should I check?",
      a: (
        <ol>
          <li>Browser permission: set Notifications to <b>Allow</b>.</li>
          <li>
            Phone settings: allow notifications for your browser (Chrome, Safari
            etc.).
          </li>
          <li>Keep the device online; Do Not Disturb may silence alerts.</li>
          <li>
            Try saving the reminder again to refresh the push token (Track →
            Save Reminder).
          </li>
        </ol>
      ),
    },
    {
      q: "What does “Meds Taken” do and when can I tap it?",
      a: (
        <p>
          The button appears within a <b>30-minute window</b> around your
          scheduled time. Tapping it logs the dose, updates progress, and moves
          the countdown to the next dose.
        </p>
      ),
    },
    {
      q: "How do Cheer Squad invites work?",
      a: (
        <ol>
          <li>Open <b>🤝 Support</b> → <b>Create Invite Link</b>.</li>
          <li>Share the link with a supporter (family, friend, caregiver).</li>
          <li>
            When they accept, they can send encouragement; you’ll see it in{" "}
            <b>Cheering Hub</b>.
          </li>
          <li>
            You can remove supporters at any time from the Support screen.
          </li>
        </ol>
      ),
    },
    {
      q: "Which languages are supported?",
      a: (
        <p>
          English, Te Reo Māori, Samoan, and Mandarin for core UI and Chat
          answers (where available). Switch at the top-right Language selector.
        </p>
      ),
    },
    {
      q: "Will Pill-AI tell me exactly what to do with my medicines?",
      a: (
        <p>
          No. Pill-AI provides general information from trusted NZ sources
          (e.g., Medsafe). It does not replace advice from your doctor or
          pharmacist. Always seek professional help for personal guidance.
        </p>
      ),
    },
    {
      q: "What if I took a dose early or missed one?",
      a: (
        <ul>
          <li>
            <b>Early:</b> You can still hit <b>Meds Taken</b> when your dose is
            due; the next dose adjusts automatically.
          </li>
          <li>
            <b>Missed:</b> If you skip it, Pill-AI moves on to the next
            scheduled time. Ask your pharmacist/doctor if you’re unsure what to
            do after a missed dose.
          </li>
        </ul>
      ),
    },
    {
      q: "Can I export or delete my data?",
      a: (
        <p>
          Local app data can be deleted from the Privacy screen. If you’d like a
          simple export (JSON) of your local data, contact the team or we can
          add a download button.
        </p>
      ),
    },
    {
      q: "Costs and compatibility?",
      a: (
        <ul>
          <li>
            <b>Cost:</b> Prototype—free to use.
          </li>
          <li>
            <b>Devices:</b> Works on modern mobile/desktop browsers. Voice
            features require Speech Recognition support.
          </li>
          <li>
            <b>Offline:</b> You can read saved content offline, but reminders
            need connectivity to schedule and deliver.
          </li>
        </ul>
      ),
    },
    {
      q: "Is Pill-AI suitable for emergencies?",
      a: (
        <p>
          No. In urgent situations, contact emergency services or speak to a
          healthcare professional immediately.
        </p>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Frequently Asked Questions">
      <div className="faq">
        {Q.map(({ q, a }, i) => (
          <details key={i} open={i < 2 /* open first two by default */}>
            <summary>• {q}</summary>
            <div style={{ marginTop: 8 }}>{a}</div>
          </details>
        ))}
      </div>
    </Modal>
  );
}
