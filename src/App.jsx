import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/pill-ai-logo.png'; // ✅ Updated image import
import { requestPermissionAndGetToken } from './firebase-notifications';

function App() {
  const [language, setLanguage] = useState('English');
  const [question, setQuestion] = useState('');
  const [simplify, setSimplify] = useState(false);
  const [memory, setMemory] = useState(false);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    requestPermissionAndGetToken();
  }, []);

  const content = {
    English: {
      privacy: `Pill-AI does not collect or store any personal data. All interactions are processed anonymously. Please consult a healthcare professional for any medical concerns.`,
      faq: [
        { q: 'Can I trust Pill-AI?', a: 'Pill-AI uses official NZ medicine data but is only a prototype.' },
        { q: 'Does it store my data?', a: 'No, it processes your questions anonymously.' },
        { q: 'Is it suitable for emergencies?', a: 'No. Always consult a pharmacist or doctor for urgent concerns.' }
      ]
    },
    'Te Reo Māori': {
      privacy: `Kāore a Pill-AI e kohikohi, e pupuri rānei i ngā raraunga whaiaro. Ka mahia ā-tūmataiti ngā pātai katoa. Tēnā tirohia tētahi rata mō ngā āwangawanga hauora.`,
      faq: [
        { q: 'Ka taea e au te whakawhirinaki ki a Pill-AI?', a: 'He raraunga rongoā whaimana nō Aotearoa e whakamahia ana, engari he tauira anake tēnei.' },
        { q: 'Ka penapena raraunga taku?', a: 'Kāo. Ka whakahaeretia ā-tūmataiti ngā pātai.' },
        { q: 'He pai mō ngā take ohorere?', a: 'Kāo. Me whakapā tonu ki te rata, ki te kaiwhakarato rongoā rānei.' }
      ]
    },
    Samoan: {
      privacy: `E le aoina pe teu e Pill-AI ni faamatalaga patino. E faagasolo uma fesili i se auala e le mafai ona iloa ai se tagata. Faamolemole fesili i se foma’i pe afai e iai ni ou popolega tau le soifua maloloina.`,
      faq: [
        { q: 'E mafai ona ou faatuatuaina le Pill-AI?', a: 'O lo’o fa’aaoga ai faamatalaga aloa’ia i Niu Sila ae o se fa’ata’ita’iga lea.' },
        { q: 'E teu ai a’u faamatalaga?', a: 'Leai. E faagasolo i se auala e le mafai ona iloa ai.' },
        { q: 'E mafai ona fa’aaoga i tulaga fa’afuase’i?', a: 'Leai. Faamolemole fesili i se foma’i pe lo’o tauave rongoā.' }
      ]
    },
    Mandarin: {
      privacy: `Pill-AI 不会收集或存储任何个人数据。所有互动都是匿名处理的。如有健康问题，请咨询医生或药剂师。`,
      faq: [
        { q: '我可以信任 Pill-AI 吗？', a: 'Pill-AI 使用的是新西兰官方药品信息，但目前仅是一个原型。' },
        { q: '它会存储我的数据吗？', a: '不会，所有问题都是匿名处理的。' },
        { q: '适用于紧急情况吗？', a: '不适用。如遇紧急情况，请立即联系医生或药剂师。' }
      ]
    }
  };
  return (
    <div className="app-container">
      <header className="header">
        <img
          src={logo} // ✅ Use imported image path
          alt="Pill-AI Logo"
          className="logo"
          width="100"
        />
        <h1>PILL-AI</h1>
        <p className="tagline">Your Trusted Medicines Advisor</p>
      </header>
      <div className="form-group">
        <label htmlFor="language">🌐 Choose answer language:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Te Reo Māori</option>
          <option>Samoan</option>
          <option>Mandarin</option>
        </select>
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="💡 Ask a medication related question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <button
        className="send-button"
        onClick={async () => {
  if (question.trim() === '') return;

  setAnswer("⏳ Loading...");

  try {
    const response = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    question,
    language,
    simplify
  })
});

const data = await response.json();
setAnswer(data.reply || "⚠️ No response received.");

  } catch (err) {
    console.error(err);
    setAnswer("⚠️ Error contacting the AI service.");
  }
}}
    >
      Send
    </button>
    {answer && (
      <div className="answer-box">
        <strong>💬 Answer:</strong>
        <p>{answer}</p>
      </div>
    )}
      <p className="warning">
        ⚠️ <strong>Pill-AI is a prototype for testing purposes only and MUST NOT be relied upon for health advice.</strong>
        Please contact your doctor or pharmacist if you have any questions about your health or medications.
      </p>
      <div className="toggles">
        <label>
          <input
            type="checkbox"
            checked={simplify}
            onChange={() => setSimplify(!simplify)}
          />
          ✨ Simplify the answer's language
        </label>
        <label>
          <input
            type="checkbox"
            checked={memory}
            onChange={() => setMemory(!memory)}
          />
          🧠 Memorise previous answers for context in follow-up questions
        </label>
      </div>
      {/* Privacy Policy */}
      <details className="info-section">
        <summary>🔒 Privacy Policy – Click to expand</summary>
        <p>{content[language].privacy}</p>
      </details>
      {/* FAQ Section */}
      <details className="info-section">
        <summary>❓ FAQ – Click to expand</summary>
        <ul>
          {content[language].faq.map((item, idx) => (
            <li key={idx}><strong>Q:</strong> {item.q}<br /><strong>A:</strong> {item.a}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
export default App;
