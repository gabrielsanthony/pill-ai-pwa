// src/components/FAQ.jsx
import React from "react";
import Modal from "./Modal.jsx";

const T = {
  English: {
    title: "Frequently Asked Questions",
    items: [
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
              Phone settings: allow notifications for your browser (Chrome,
              Safari etc.).
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
        q: 'What does “Meds Taken” do and when can I tap it?',
        a: (
          <p>
            The button appears within a <b>30-minute window</b> around your
            scheduled time. Tapping it logs the dose, updates progress, and
            moves the countdown to the next dose.
          </p>
        ),
      },
      {
        q: "How do Cheer Squad invites work?",
        a: (
          <ol>
            <li>
              Open <b>🤝 Support</b> → <b>Create Invite Link</b>.
            </li>
            <li>Share the link with a supporter (family, friend, caregiver).</li>
            <li>
              When they accept, they can send encouragement; you’ll see it in{" "}
              <b>Cheering Hub</b>.
            </li>
            <li>You can remove supporters at any time from the Support screen.</li>
          </ol>
        ),
      },
      {
        q: "Which languages are supported?",
        a: (
          <p>
            English, Te Reo Māori, Samoan, and Mandarin for core UI and Chat
            answers (where available). Switch at the top-right Language
            selector.
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
              <b>Early:</b> You can still hit <b>Meds Taken</b> when your dose
              is due; the next dose adjusts automatically.
            </li>
            <li>
              <b>Missed:</b> If you skip it, Pill-AI moves on to the next
              scheduled time. Ask your pharmacist/doctor if you’re unsure what
              to do after a missed dose.
            </li>
          </ul>
        ),
      },
      {
        q: "Can I export or delete my data?",
        a: (
          <p>
            Local app data can be deleted from the Privacy screen. If you’d like
            a simple export (JSON) of your local data, contact the team or we
            can add a download button.
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
    ],
  },

  "Te Reo Māori": {
    title: "Ngā Pātai Auau",
    items: [
      {
        q: "He aha te Pill-AI, ā, mā wai?",
        a: (
          <p>
            He tauira a Pill-AI hei āwhina i a koe ki te mārama ki ngā rongoā,
            ki te whakatakoto whakamaharatanga, me te whai wāhi mai o ngā
            kaitautoko (“Cheer Squad”). He mea ako me te whakatenatena, ehara i
            te taputapu haumanu.
          </p>
        ),
      },
      {
        q: "Ka penapena rānei a Pill-AI i aku raraunga whaiaro?",
        a: (
          <>
            <p>
              Kāore mātou e pātai mō tō ingoa/īmēra. Ka rokirokia ngā kōrero
              whakamahara me te ahunga ki tō pūrere anake (localStorage).
              Ka whakamahia ngā “push tokens” hei tuku noa i ngā whakamahara i
              tonoa e koe.
            </p>
            <p>
              Ka taea e koe te muku raraunga ā-roto i te mata Tūmataiti (🛡️
              Tūmataiti → “Muku aku raraunga taupānga”).
            </p>
          </>
        ),
      },
      {
        q: "Me pēhea te tautuhi, te whakatika, te whakakore i ngā whakamahara?",
        a: (
          <ol>
            <li>
              Haere ki <b>💊 Aroturuki/Track</b> → <b>➕ Tautuhi Maharatanga</b>.
            </li>
            <li>
              Whakakīa te <i>Ingoa rongoā</i>, kōwhiri <i>Roa-tonu</i> rānei{" "}
              <i>Ngā rā</i>, me te <i>Ōrau ia rā</i> me ngā wā.
            </li>
            <li>Pāwhiri <b>Save Reminder</b>, ā, whakaaetia ngā pānui.</li>
            <li>
              Hei whakatika: <b>💊 Track</b> → <b>Edit</b>. Hei whakakore katoa:{" "}
              <b>🗑️ Cancel Reminders</b>.
            </li>
          </ol>
        ),
      },
      {
        q: "Kāore au e whiwhi whakamōhiotanga — me aha?",
        a: (
          <ol>
            <li>Whakaaetanga pūtirotiro: me whakarite ki te <b>Allow</b>.</li>
            <li>
              Tautuhinga waea: whakaaetia ngā pānui mō tō pūtirotiro (Chrome,
              Safari, etc.).
            </li>
            <li>Kia hono tonu ki te ipurangi; tērā pea ka whakangū a DND.</li>
            <li>
              Tiakina anō te whakamahara kia whakahou ai te “push token”
              (Track → Save Reminder).
            </li>
          </ol>
        ),
      },
      {
        q: "He aha te mahi a “Meds Taken”, ā, āwhea ka pāwhiri ai?",
        a: (
          <p>
            Ka puta te pātene i roto i te <b>30 meneti</b> huri noa i te wā kua
            whakaritea. Ka pāwhiria, ka rēhita te horopeta, ka whakahōu te
            ahunga, ā, ka neke te tatau-whakamuri ki te horopeta e whai ake.
          </p>
        ),
      },
      {
        q: "Me pēhea te mahi o ngā pōhiri Cheer Squad?",
        a: (
          <ol>
            <li>
              Tuwhera <b>🤝 Support</b> → <b>Create Invite Link</b>.
            </li>
            <li>Tukua te hono ki te kaitautoko (whānau, hoa, kaitiaki).</li>
            <li>
              Ka whakaae rātou, ka āhei te tuku whakatenatena — ka kitea i te{" "}
              <b>Cheering Hub</b>.
            </li>
            <li>Ka taea te tango i ngā kaitautoko i ngā wā katoa.</li>
          </ol>
        ),
      },
      {
        q: "He aha ngā reo e tautokona ana?",
        a: (
          <p>
            Ingarihi, Te Reo Māori, Samoa, me Mandarin mō ngā wāhanga matua me
            ngā whakautu Chat (ki te wātea). Whakamahia te kōwhiringa Reo i te
            taha matau o runga.
          </p>
        ),
      },
      {
        q: "Ka kī mārika mai a Pill-AI he aha me mahi ki aku rongoā?",
        a: (
          <p>
            Kāo. He pārongo whānui mai i ngā puna pono o Aotearoa (pērā i a
            Medsafe). Ehara i te whakakapi i ngā tohutohu a te rata, te
            kaiwhakarato rongoā rānei.
          </p>
        ),
      },
      {
        q: "Me aha mēnā i horo, i ngaro rānei tētahi horopeta?",
        a: (
          <ul>
            <li>
              <b>I mua te tango:</b> Ka taea tonu te pāwhiri <b>Meds Taken</b>{" "}
              i te wā e taka ana; ka urutau aunoa te horopeta e whai ake.
            </li>
            <li>
              <b>I ngaro:</b> Ka neke a Pill-AI ki te wā kua whakaritea e whai
              ake. Me pātai ki tō rata/kaiwhakarato rongoā mēnā kāore koe i te
              mārama.
            </li>
          </ul>
        ),
      },
      {
        q: "Ka taea te kaweake, te muku rānei i aku raraunga?",
        a: (
          <p>
            Ka taea te muku i te mata Tūmataiti. Mēnā e hiahia ana koe ki tētahi
            kaweake māmā (JSON), whakapā mai — ka tāpiri mātou i tētahi pātene
            tikiake.
          </p>
        ),
      },
      {
        q: "Utu me te hototahitanga?",
        a: (
          <ul>
            <li>
              <b>Utu:</b> Tauira — kore utu.
            </li>
            <li>
              <b>Pūrere:</b> Ka mahi i ngā pūtirotiro hou katoa; ko te Reo he
              tautoko i te Speech Recognition.
            </li>
            <li>
              <b>Tūāpapa tuimotu:</b> Ka taea te pānui tuimotu, engari me te
              hononga ipurangi mō ngā whakamahara.
            </li>
          </ul>
        ),
      },
      {
        q: "He pai a Pill-AI mō ngā ohotata?",
        a: (
          <p>
            Kāo. Mēnā he take ohotata, me whakapā wawe ki ngā ratonga ohotata,
            ki tētahi mātanga hauora rānei.
          </p>
        ),
      },
    ],
  },

  Samoan: {
    title: "Fesili Masani",
    items: [
      {
        q: "O le ā le Pill-AI ma e mo ai?",
        a: (
          <p>
            O le Pill-AI o se polokalame faʻataʻitaʻi e fesoasoani e malamalama i
            vailaʻau, seti fa‘amanatu, ma aumai lagolago (“Cheer Squad”). Mo le
            aʻoa‘oga ma le fa‘amalosia—e le o se masini fa‘afoma‘i.
          </p>
        ),
      },
      {
        q: "E teu e Pill-AI ni a‘u fa‘amatalaga patino?",
        a: (
          <>
            <p>
              E lē matou fesili mo lou igoa/īmeli. E teu fa‘amaumauga o
              fa‘amanatu ma le alualu i luma i lau masini (localStorage). E na
              o le fa‘ao‘oina o fa‘amanatu e fa‘aaogā ai “push tokens”.
            </p>
            <p>
              E mafai ona e tapeina fa‘amaumauga i soo se taimi i le mata
              Tūmataiti (🛡️ Privacy → “Tape a‘u fa‘amaumauga”).
            </p>
          </>
        ),
      },
      {
        q: "E fa‘apefea ona seti, toe fa‘asa‘o, pe fa‘aleaogā fa‘amanatu?",
        a: (
          <ol>
            <li>
              Alu i le <b>💊 Track</b> → <b>➕ Set Med Reminder</b>.
            </li>
            <li>
              Fa‘atumu le <i>Vaila‘au</i>, filifili <i>Umi-tumau</i> pe{" "}
              <i>aso</i>, seti <i>taimi i le aso</i> ma taimi tonu.
            </li>
            <li>Oomi <b>Save Reminder</b> ma fa‘atagaina fa‘asilasilaga.</li>
            <li>
              Mo suiga: <b>💊 Track</b> → <b>Edit</b>. Mo le fa‘aleaogāina uma:{" "}
              <b>🗑️ Cancel Reminders</b>.
            </li>
          </ol>
        ),
      },
      {
        q: "E le o sau fa‘asilasilaga — o le ā e siaki?",
        a: (
          <ol>
            <li>Fa‘atagaga o le browser: seti i le <b>Allow</b>.</li>
            <li>
              Seti a le telefoni: fa‘atagaina fa‘asilasilaga mo lau browser
              (Chrome, Safari ma isi).
            </li>
            <li>
              Ia i luga le initaneti; e ono fa‘anoanoa e le Do Not Disturb.
            </li>
            <li>
              Teu le fa‘amanatu fou e toe fa‘afou ai le “push token” (Track →
              Save Reminder).
            </li>
          </ol>
        ),
      },
      {
        q: 'O le ā le “Meds Taken” ma āfea e mafai ai ona ou oomi?',
        a: (
          <p>
            E aliali mai le ki i totonu o le <b>30 minute</b> lata i le taimi
            ua fuafuaina. A oomi, e pueina le inuga, fa‘afou le alualu i luma,
            ma sifi atu i le isi taimi.
          </p>
        ),
      },
      {
        q: "E fa‘apefea vala‘auga a le Cheer Squad?",
        a: (
          <ol>
            <li>
              Tatala le <b>🤝 Support</b> → <b>Create Invite Link</b>.
            </li>
            <li>Fa‘asoa le so‘otaga i se aiga/uo/tausi.</li>
            <li>
              Pe a talia, e mafai ona lafo fa‘amalosiau; e va‘aia i le{" "}
              <b>Cheering Hub</b>.
            </li>
            <li>E mafai ona e aveese lagolago i soo se taimi.</li>
          </ol>
        ),
      },
      {
        q: "O ā gagana e lagolagoina?",
        a: (
          <p>
            Igilisi, Gagana Sāmoa, Te Reo Māori, ma Mandarin mo le UI autū ma
            tali a le Chat (pe a avanoa). Suia i le filifiliga <i>Language</i>.
          </p>
        ),
      },
      {
        q: "Pe ta‘u mai e Pill-AI tonu mea e fai i a‘u vaila‘au?",
        a: (
          <p>
            Leai. O fa‘amatalaga lautele mai punaoa fa‘atuatuaina i Niu Sila
            (e pei o Medsafe). E le suitulaga i fautuaga a se foma‘i po‘o se
            foma‘i vaila‘au.
          </p>
        ),
      },
      {
        q: "Ae pe a ou inu vave, pe misia se tasi?",
        a: (
          <ul>
            <li>
              <b>Vave:</b> E mafai lava ona oomi <b>Meds Taken</b> pe a o‘o le
              taimi; e fetu‘una‘i le isi taimi.
            </li>
            <li>
              <b>Misia:</b> Afai e te misia, e sifi le app i le isi taimi. Afai
              e lē mautinoa, fesili i lau foma‘i/foma‘i vaila‘au.
            </li>
          </ul>
        ),
      },
      {
        q: "E mafai ona ou sii mai pe tape a‘u fa‘amatalaga?",
        a: (
          <p>
            E mafai ona tape i le mata Tūmataiti. Afai e te mana‘o i se
            a‘umai faigofie (JSON), fa‘afeso‘ota‘i le ‘au — e mafai ona matou
            fa‘aopoopo se ki download.
          </p>
        ),
      },
      {
        q: "Tau ma fetaui?",
        a: (
          <ul>
            <li>
              <b>Tau:</b> Fa‘ata‘ita‘iga — e leai se totogi.
            </li>
            <li>
              <b>Masini:</b> Galue i browsers fou; e mana‘omia le Speech
              Recognition mo le leo.
            </li>
            <li>
              <b>Offline:</b> E mafai ona faitau mea ua sefe; ae mana‘omia le
              initaneti mo fa‘amanatu.
            </li>
          </ul>
        ),
      },
      {
        q: "E talafeagai mo fa‘alavelave fa‘afuase‘i?",
        a: (
          <p>
            Leai. Mo tulaga fa‘anatinati, vala‘au i auaunaga fa‘afuase‘i pe
            fa‘afeso‘ota‘i vave se foma‘i.
          </p>
        ),
      },
    ],
  },

  Mandarin: {
    title: "常见问题",
    items: [
      {
        q: "Pill-AI 是什么？适合哪些人？",
        a: (
          <p>
            Pill-AI 是一个原型应用，帮你了解药物、设置提醒，并邀请支持者（“加油小队”）。
            用于学习与激励，并不是医疗器械。
          </p>
        ),
      },
      {
        q: "Pill-AI 会保存我的个人数据吗？",
        a: (
          <>
            <p>
              我们不要求你的姓名/邮箱。提醒信息与进度保存在你的设备
              （localStorage）。推送令牌仅用于发送你请求的提醒。
            </p>
            <p>
              你可随时在“隐私”界面清除本机数据（🛡️ 隐私 → “清除本机应用数据”）。
            </p>
          </>
        ),
      },
      {
        q: "如何设置、修改或取消提醒？",
        a: (
          <ol>
            <li>
              打开 <b>💊 Track</b> → <b>➕ 设置用药提醒</b>。
            </li>
            <li>
              填写<strong>药名</strong>，选择<strong>长期</strong>或<strong>天数</strong>，
              设置<strong>每日次数</strong>与具体时间。
            </li>
            <li>点击 <b>保存提醒</b> 并允许通知。</li>
            <li>
              修改：<b>💊 Track</b> → <b>Edit</b>；全部取消：<b>🗑️ Cancel Reminders</b>。
            </li>
          </ol>
        ),
      },
      {
        q: "收不到通知怎么办？",
        a: (
          <ol>
            <li>浏览器权限：将通知设为 <b>允许</b>。</li>
            <li>手机设置：为你的浏览器开启通知（Chrome、Safari 等）。</li>
            <li>保持联网；“勿扰模式”可能会静音提醒。</li>
            <li>重新保存提醒以刷新推送令牌（Track → 保存提醒）。</li>
          </ol>
        ),
      },
      {
        q: "“Meds Taken” 有什么用？什么时候可以点？",
        a: (
          <p>
            在计划时间前后 <b>30 分钟</b>内会出现该按钮。点击后会记录本次用药、更新进度，
            并跳到下一次倒计时。
          </p>
        ),
      },
      {
        q: "加油小队的邀请如何运作？",
        a: (
          <ol>
            <li>
              打开 <b>🤝 Support</b> → <b>Create Invite Link</b>。
            </li>
            <li>把链接发给家人、朋友或照护者。</li>
            <li>
              对方接受后即可发送鼓励；你可在 <b>Cheering Hub</b> 看到。
            </li>
            <li>你可随时移除支持者。</li>
          </ol>
        ),
      },
      {
        q: "支持哪些语言？",
        a: (
          <p>
            英语、毛利语（Te Reo Māori）、萨摩亚语和中文（Mandarin）。可在右上角语言选择器切换。
          </p>
        ),
      },
      {
        q: "Pill-AI 会告诉我具体用药该怎么做吗？",
        a: (
          <p>
            不会。内容仅供参考，来源于新西兰可信渠道（如 Medsafe），不能替代医生或药师的专业建议。
          </p>
        ),
      },
      {
        q: "如果提前服用或错过一次怎么办？",
        a: (
          <ul>
            <li>
              <b>提前：</b> 到时间时仍可点击 <b>Meds Taken</b>；系统会自动调整下一次。
            </li>
            <li>
              <b>错过：</b> 应用会跳到下一次计划时间。如不确定处理方式，请咨询医生/药师。
            </li>
          </ul>
        ),
      },
      {
        q: "可以导出或删除我的数据吗？",
        a: (
          <p>
            可在“隐私”界面删除本机数据。若需要简单导出（JSON），可联系团队，我们可加入下载按钮。
          </p>
        ),
      },
      {
        q: "费用与兼容性？",
        a: (
          <ul>
            <li>
              <b>费用：</b> 原型，免费使用。
            </li>
            <li>
              <b>设备：</b> 适配现代手机/桌面浏览器；语音功能需浏览器支持语音识别。
            </li>
            <li>
              <b>离线：</b> 可离线阅读已保存内容，但提醒需要联网才能计划与送达。
            </li>
          </ul>
        ),
      },
      {
        q: "适合紧急情况吗？",
        a: <p>不适合。遇到紧急情况请立刻联系急救或咨询专业医护人员。</p>,
      },
    ],
  },
};

export default function FAQ({ isOpen, onClose, language = "English" }) {
  const L = T[language] || T.English;

  return (
    <Modal open={isOpen} onClose={onClose} title={L.title}>
      <div className="faq">
        {L.items.map(({ q, a }, i) => (
          <details key={i} open={i < 2 /* open first two by default */}>
            <summary>• {q}</summary>
            <div style={{ marginTop: 8 }}>{a}</div>
          </details>
        ))}
      </div>
    </Modal>
  );
}