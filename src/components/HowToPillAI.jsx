// src/components/HowToPillAI.jsx
import React from "react";
import Modal from "./Modal.jsx";

// YouTube Shorts ID for "How to use Pill-AI"
const YT_VIDEO_ID = "pCMAFGFJRo0";

/**
 * Fully localized copy for How-to modal.
 * You can tweak any phrasing below without touching the render logic.
 */
const HOWTO = {
  English: {
    title: "How to use Pill-AI",
    cards: [
      {
        type: "ol",
        open: true,
        summary: "🚀 Quick start",
        items: [
          "Go to Chat → ask a medicine question (or tap the mic).",
          "Switch to Track → set your reminders (name, duration, times).",
          "Tap “Meds Taken” when a dose is due to log it and fill the progress bar.",
          "Open Support → invite your Cheer Squad (share link) and get encouragement.",
          "Try Learn → take a quiz and earn XP; check Earn for rewards."
        ]
      },
      {
        type: "ol",
        summary: "💬 Chat — ask safe medicine questions",
        items: [
          "Open the Chat tab.",
          "Type your question (e.g., “How do I take amoxicillin?”) or tap the mic to speak.",
          "Tap Send. Answers use trusted NZ sources and simple language.",
          "(Optional) Change language using the selector at the top.",
          "Tip: Answers can auto-fill the reminder form (drug name, duration) in Track."
        ]
      },
      {
        type: "ol",
        summary: "💊 Track — set reminders (short-term or long-term)",
        items: [
          "Open the Track tab and tap Set a Reminder.",
          "Medicine: enter the name (auto-fills from Chat if available).",
          "Duration: choose Long Term or Number of days (1–20).",
          "Times per day: choose 1–4.",
          "For each time, pick the clock time (e.g., 8:00, 14:00, 20:00).",
          "Allow notifications if prompted (browser/device permission).",
          "Tap Save Reminder. You’ll see a schedule summary and a progress bar."
        ],
        after:
          "What happens next? You’ll get a push notification at each time. When a dose window opens (±30 min), the Meds Taken button appears."
      },
      {
        type: "ul",
        summary: "📈 Track — log doses, skip, cancel, or change times",
        items: [
          "Log a dose: When the timer hits a scheduled time (or within ±30 min), tap Meds Taken. Progress % increases.",
          "Took it early? Tap Meds Taken when you take it; the next dose reschedules automatically.",
          "Skip a dose: If you missed it, do nothing. The app moves to the next dose and keeps the log clean.",
          "Change times/duration: Tap Edit on the reminder, adjust fields, Save.",
          "Cancel one reminder: Use Cancel beside that reminder.",
          "Cancel all reminders: Tap Cancel All Reminders in the Track card."
        ]
      },
      {
        type: "ol",
        summary: "🤝 Support — invite your Cheer Squad",
        items: [
          "Open Support.",
          "Tap Create Invite Link (or Invite).",
          "Share the link by text/email/DM with family, friends, or a caregiver.",
          "When they join, they’ll appear in your Support dashboard.",
          "Supporters can send you encouragement; you’ll see it in Cheering Hub."
        ],
        after: "Tip: You can mask phone numbers; only initials/avatars show by default."
      },
      {
        type: "ol",
        summary: "🎉 Cheering Hub — see boosts from your supporters",
        items: [
          "Open Cheering Hub to view messages and reactions.",
          "Reply with thanks or emojis. Positive nudges also appear in notifications.",
          "Progress updates auto-post so supporters can celebrate milestones."
        ]
      },
      {
        type: "ol",
        summary: "📚 Learn & 🏆 Earn — quizzes and XP",
        items: [
          "Open Learn and tap Start Quiz.",
          "Answer multiple-choice questions about your medicine (how it works, how to take, cautions).",
          "Tap Submit → see feedback. Correct answers give you XP.",
          "Open Earn to see your XP total and rewards/badges."
        ]
      },
      {
        type: "ol",
        summary: "🎙️ Voice Assistant — hands-free Q&A",
        items: [
          "Go to Voice (or use the mic in Chat).",
          "Tap the mic, ask your question clearly, then tap again to stop.",
          "Pill-AI reads the answer aloud and shows it on screen."
        ]
      },
      {
        type: "ul",
        summary: "🔔 Notifications — allow and troubleshoot",
        items: [
          "Allow: When prompted, choose Allow notifications for this site.",
          "Didn’t get a prompt? Browser address bar → site settings → Notifications → Allow.",
          "iOS/Android: Ensure Push notifications for your browser are enabled in system settings."
        ]
      },
      {
        type: "p",
        summary: "🛡️ Safety",
        para:
          "Pill-AI gives general information from trusted NZ sources. It doesn’t replace advice from your pharmacist or doctor—always seek personal guidance for your situation."
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────

  "Te Reo Māori": {
    title: "Me pēhea te whakamahi i a Pill-AI",
    cards: [
      {
        type: "ol",
        open: true,
        summary: "🚀 Tīmata tere",
        items: [
          "Haere ki Kōrerorero → pātai mō ngā rongoā (pāwhiria te hopuoro mēnā e hiahiatia).",
          "Huri ki Aroturuki → tautuhia ō whakamaumahara (ingoa, roanga, wā).",
          "Pāwhiria “Kua Tangohia te Rongoā” ina tae ki te wā kia rēhita ai, kia whakakī ai te pae ahunga.",
          "Whakatuwhera Tautoko → tonoa tō Cheer Squad (tiri hononga) kia whiwhi whakatenatena.",
          "Whakamātauria te Ako → tango pātaitai ka whiwhi XP; tirohia te Whiwhi mō ngā utu."
        ]
      },
      {
        type: "ol",
        summary: "💬 Kōrerorero — pātai haumaru mō ngā rongoā",
        items: [
          "Whakatūwheratia te ripa Kōrerorero.",
          "Tāurua tō pātai (pērā i te “Me pēhea taku tango amoxicillin?”) rānei pāwhiritia te hopuoro.",
          "Pāwhiri Tukua. Ka whakamahi ngā whakautu i ngā puna whaimana o Aotearoa, he reo māmā hoki.",
          "(Kōwhiringa) Hurihia te reo mā te kōwhiringa kei runga.",
          "Tohu: Ka āhei ngā whakautu ki te whakakī aunoa i te puka whakamahara i Aroturuki."
        ]
      },
      {
        type: "ol",
        summary: "💊 Aroturuki — tautuhi whakamaumahara (poto, roa rānei)",
        items: [
          "Whakatūwheratia te ripa Aroturuki, pāwhiri Tautuhi Whakamaumahara.",
          "Rongoā: tāurua te ingoa (ka whakakī-aunoa mai i Kōrerorero mēnā kei reira).",
          "Roanga: kōwhiria te Roa-Tonu, rānei te Tau o ngā rā (1–20).",
          "Ngā wā ia rā: kōwhiria 1–4.",
          "Mō ia wā, tīpakohia te hāora (hei tauira, 8:00, 14:00, 20:00).",
          "Whakaaetia ngā whakamōhiotanga mēnā ka tonoa.",
          "Pāwhiri Tiaki Whakamaumahara. Ka kitea he whakarāpopototanga me tētahi pae ahunga."
        ],
        after:
          "Ka aha ināianei? Ka tae mai he pānui pana i ia wā kua whakaritea. Ina whakatuwhera te matapihi horopeta (±30 meneti), ka kitea te pātene Kua Tangohia te Rongoā."
      },
      {
        type: "ul",
        summary: "📈 Aroturuki — rēhita, whakakore, huri i ngā wā",
        items: [
          "Rēhita: Ina tae ki te wā kua whakaritea (rānei i roto i te ±30 meneti), pāwhiri Kua Tangohia te Rongoā.",
          "I tangohia wawe? Pāwhiri Kua Tangohia te Rongoā i taua wā; ka whakarite aunoatia te horopeta e whai ake.",
          "Waiho tētahi horopeta: Ki te ngaro, kaua e mahi; ka neke noa te taupānga ki te horopeta e whai ake.",
          "Huri wā/roanga: Pāwhiri Whakatika ki te whakamahara, whakatika āpure, Tiaki.",
          "Whakakore i tētahi: Pāwhiri Whakakore i te taha o taua whakamahara.",
          "Whakakore katoa: Pāwhiri Whakakore i Ngā Whakamaumahara i te kāri Aroturuki."
        ]
      },
      {
        type: "ol",
        summary: "🤝 Tautoko — tonoa tō Cheer Squad",
        items: [
          "Whakatūwheratia te Tautoko.",
          "Pāwhiri Waihanga Hono Pōhiri (rānei Pōhiri).",
          "Tiria te hono mā te īmēra/kāmuri/pōkā-kupu ki te whānau, ki ngā hoa, ki te kaitiaki.",
          "Ina hono mai rātou, ka kitea ki tō rārangi Tautoko.",
          "Ka taea e ngā kaitautoko te tuku whakatenatena; ka kitea ki Cheering Hub."
        ],
        after:
          "Tohu: Ka taea te huna i ngā tau waea; ko ngā pūāhua tīmatanga/āhua anake ka kitea."
      },
      {
        type: "ol",
        summary: "🎉 Cheering Hub — tirohia ngā whakatenatena",
        items: [
          "Whakatūwheratia te Cheering Hub kia kite i ngā karere me ngā tauhohenga.",
          "Whakautu mā te whakawhetai, mā ngā emoji hoki. Ka kitea hoki ngā nudge pai hei whakamōhiotanga.",
          "Ka tuku aunoatia ngā whakahōunga ahunga kia whakanui ai ngā kaitautoko."
        ]
      },
      {
        type: "ol",
        summary: "📚 Ako & 🏆 Whiwhi — pātaitai me te XP",
        items: [
          "Whakatūwheratia te Ako, pāwhiri Tīmata Pātaitai.",
          "Whakautua ngā pātai kōwhiringa-maha mō tō rongoā (me pēhea te mahi, me pēhea te tango, ngā tūpato).",
          "Pāwhiri Tukuna → ka kite i te urupare. Ka whiwhi XP mō ngā whakautu tika.",
          "Whakatūwheratia te Whiwhi kia kite i tō XP me ngā tohu/bārihi."
        ]
      },
      {
        type: "ol",
        summary: "🎙️ Āwhina Reo — pātai mā te reo",
        items: [
          "Haere ki Reo (rānei whakamahia te hopuoro i Kōrerorero).",
          "Pāwhiri i te hopuoro, pātai marama, kātahi ka pāwhiri anō kia mutu.",
          "Ka pānui a Pill-AI i te whakautu, ka whakaatu hoki ki te mata."
        ]
      },
      {
        type: "ul",
        summary: "🔔 Whakamōhiotanga — whakaaetia me te rapurongoā",
        items: [
          "Whakaaetia: Ina tonoa, kōwhiria te Whakaaetia mō tēnei pae.",
          "Kāore i puta te tono? Pae wāhitau pūtirotiro → tautuhinga pae → Whakamōhiotanga → Whakaaetia.",
          "iOS/Android: Me whakahohe ngā pana mō tō pūtirotiro i ngā tautuhinga pūnaha."
        ]
      },
      {
        type: "p",
        summary: "🛡️ Haumaru",
        para:
          "He mōhiohio whānui noa iho ā Pill-AI mai i ngā puna whaimana o Aotearoa; ehara i te whakakapi i ngā tohutohu a te rata, a te kaiwhakarato rongoā rānei. Me rapu tohutohu whaiaro i ngā wā katoa."
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────

  Samoan: {
    title: "Fa‘aaogā o le Pill-AI",
    cards: [
      {
        type: "ol",
        open: true,
        summary: "🚀 Amata vave",
        items: [
          "Alu i le Talanoaga → fesili i se fesili e uiga i vaila‘au (po‘o kiliki le mic).",
          "Sui i le Siaki → seti au fa‘amanatu (igoa, umi, taimi).",
          "Oomi “Meds Taken” pe a oo le taimi ina ia faamauina ma faatumu le pa alualu i luma.",
          "Tatala Lagolago → valaaulia lau Cheer Squad (fa‘asoa le sootaga) ma maua le uunaiga.",
          "Taumafai A‘oa‘o → fai se suega ma maua XP; siaki Maua mo fa‘ailoga."
        ]
      },
      {
        type: "ol",
        summary: "💬 Talanoaga — fesili saogalemu e uiga i vaila‘au",
        items: [
          "Tatala le tab Talanoaga.",
          "Tusi lau fesili (fa‘ata‘ita‘iga: “E fa‘afefea ona inu amoxicillin?”) po‘o fa‘aaoga le mic.",
          "Oomi Tuku. E fa‘aaogā tali mai punaoa fa‘atuatuaina a Niu Sila i se gagana faigofie.",
          "(Filifiliga) Suia le gagana i le pito i luga.",
          "Fautuaga: E mafai e tali ona faatumu aunoa le fomu fa‘amanatu i le Siaki."
        ]
      },
      {
        type: "ol",
        summary: "💊 Siaki — seti fa‘amanatu (pu‘upu‘u pe umi)",
        items: [
          "Tatala le tab Siaki ma kiliki Seti se Fa‘amanatu.",
          "Vaila‘au: tusia le igoa (e mafai ona auto-fill mai le Talanoaga).",
          "Umi: filifili Umi-Tumau pe Numera o aso (1–20).",
          "Taimi i le aso: filifili 1–4.",
          "Mo taimi ta‘itasi, filifili le itula (fa‘ata‘ita‘iga 8:00, 14:00, 20:00).",
          "Fa‘atagaina fa‘asilasilaga pe a fesiligia.",
          "Oomi Save Reminder. O le a e va‘ai i le fa‘asologa ma le pa alualu i luma."
        ],
        after:
          "O le ā le mea e soso‘o ai? E te maua ai se fa‘asilasilaga i taimi ta‘itasi. Pe a matala le fa‘amalama o le inuga (±30 minute) e aliali mai ai le ki Meds Taken."
      },
      {
        type: "ul",
        summary: "📈 Siaki — faamauina, soso‘o, soloia, pe suia taimi",
        items: [
          "Faamauina: Pe a oo i le taimi (po‘o i totonu o le ±30 minute), oomi Meds Taken.",
          "Na e inu vave? Oomi Meds Taken i lena taimi; e toe faatulaga aunoa le isi inuga.",
          "Sosola se inuga: Afai e misia, aua le faia se mea—e soso‘o le app i le isi inuga.",
          "Sui taimi/umi: Kiliki Edit i le fa‘amanatu, sui fanua, Save.",
          "Soloia se fa‘amanatu e tasi: Kiliki Cancel i tafatafa.",
          "Soloia mea uma: Kiliki Cancel All Reminders i le Siaki."
        ]
      },
      {
        type: "ol",
        summary: "🤝 Lagolago — valaaulia lau Cheer Squad",
        items: [
          "Tatala Lagolago.",
          "Kiliki Create Invite Link (po‘o Invite).",
          "Fa‘asoa le sootaga i SMS/īmeli/DM i aiga, uō, po‘o le tagata tausi.",
          "A latou auai, o le a aliali i lau dashboard Lagolago.",
          "E mafai e uō ona lafo fa‘amalosi‘aga; e te va‘ai i le Cheering Hub."
        ],
        after:
          "Fautuaga: E mafai ona natia numera telefoni; e na‘o mataitusi amata/ata vaaia."
      },
      {
        type: "ol",
        summary: "🎉 Cheering Hub — va‘ai i fa‘amalosi‘aga a uō",
        items: [
          "Tatala Cheering Hub e matamata i fe‘au ma tali.",
          "Tali i le fa‘afetai po‘o emojis. O nudge lelei e aliali i fa‘asilasilaga.",
          "Fa‘afouga o le alualu i luma e lafo aunoa mo paetae."
        ]
      },
      {
        type: "ol",
        summary: "📚 A‘oa‘o & 🏆 Maua — suega ma XP",
        items: [
          "Tatala A‘oa‘o ma kiliki Start Quiz.",
          "Tali fesili MCQ e uiga i le vaila‘au (fa‘aaogāina, auala e inu ai, lapata‘iga).",
          "Kiliki Submit → va‘ai i le tali mai. O tali sa‘o e maua ai XP.",
          "Tatala Maua e va‘ai ai i le XP ma pine/fa‘ailoga."
        ]
      },
      {
        type: "ol",
        summary: "🎙️ Fesoasoani Leo — Q&A e aunoa ma lima",
        items: [
          "Alu i le Leo (po‘o fa‘aaoga le mic i le Talanoaga).",
          "Kiliki le mic, fai le fesili manino, kiliki toe e taofi.",
          "E faitau e Pill-AI le tali ma fa‘aali i le lau."
        ]
      },
      {
        type: "ul",
        summary: "🔔 Fa‘asilasilaga — fa‘atagaina ma fa‘aleleia",
        items: [
          "Fa‘atagaina: Pe a fesiligia, filifili Allow mo lenei ‘upega tafa‘ilagi.",
          "Le‘i aliali mai le fesili? Tuatusi o le browser → site settings → Notifications → Allow.",
          "iOS/Android: Ia ki push notifications mo lau browser i seti a le masini."
        ]
      },
      {
        type: "p",
        summary: "🛡️ Saogalemu",
        para:
          "E tu‘uina mai e Pill-AI fa‘amatalaga lautele mai punaoa fa‘atuatuaina i Niu Sila; e le suia fautuaga a lau foma‘i po‘o le foma‘i vaila‘au."
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────

  Mandarin: {
    title: "如何使用 Pill-AI",
    cards: [
      {
        type: "ol",
        open: true,
        summary: "🚀 快速开始",
        items: [
          "进入“聊天” → 提出药物相关问题（或点击麦克风）。",
          "切换到“追踪” → 设置提醒（名称、时长、时间）。",
          "需要服药时点击“已服药”，记录并更新进度条。",
          "打开“支持” → 邀请你的加油小队（分享链接）获取鼓励。",
          "试试“学习” → 做测验得 XP；在“奖励”查看回报。"
        ]
      },
      {
        type: "ol",
        summary: "💬 聊天 — 提出安全的用药问题",
        items: [
          "打开“聊天”标签页。",
          "输入你的问题（如“阿莫西林怎么服用？”）或点击麦克风语音提问。",
          "点击“发送”。答案来自新西兰可信来源，并使用通俗语言。",
          "（可选）在顶部语言选择器切换语言。",
          "提示：答案可自动填充“追踪”里的提醒表单（药名、疗程天数）。"
        ]
      },
      {
        type: "ol",
        summary: "💊 追踪 — 设置提醒（短期或长期）",
        items: [
          "打开“追踪”并点击“设置提醒”。",
          "药物：输入名称（若来自聊天，可自动填充）。",
          "时长：选择“长期”或“天数（1–20）”。",
          "每日次数：选择 1–4 次。",
          "为每个时点选择时间（如 8:00、14:00、20:00）。",
          "若弹出权限提示，请允许通知。",
          "点击“保存提醒”。将看到日程摘要和进度条。"
        ],
        after:
          "接下来？每个时点都会收到推送通知。剂量窗口开启时（±30 分钟），会出现“已服药”按钮。"
      },
      {
        type: "ul",
        summary: "📈 追踪 — 记录、跳过、取消或修改时间",
        items: [
          "记录：到点（或±30 分钟内）点击“已服药”，进度百分比会上升。",
          "提前服用？在你服用时点击“已服药”，下一次会自动重新安排。",
          "跳过：错过了就不必操作，应用会自动跳到下一次，记录保持整洁。",
          "修改时间/时长：在提醒上点击“编辑”，调整后保存。",
          "取消单个提醒：使用该提醒旁的“取消”。",
          "全部取消：在“追踪”卡片点击“取消所有提醒”。"
        ]
      },
      {
        type: "ol",
        summary: "🤝 支持 — 邀请你的加油小队",
        items: [
          "打开“支持”。",
          "点击“创建邀请链接”（或“邀请”）。",
          "通过短信/邮箱/私信分享给家人、朋友或照护者。",
          "对方加入后会显示在你的支持面板。",
          "支持者可以发送鼓励，你会在“助威中心”看到。"
        ],
        after: "提示：可以隐藏电话号码；默认仅显示首字母/头像。"
      },
      {
        type: "ol",
        summary: "🎉 助威中心 — 查看来自好友的鼓励",
        items: [
          "打开“助威中心”查看消息与回应。",
          "以谢谢或表情回复；正向提醒也会出现在通知里。",
          "进度更新会自动发布，大家可一起庆祝里程碑。"
        ]
      },
      {
        type: "ol",
        summary: "📚 学习 & 🏆 奖励 — 测验和 XP",
        items: [
          "进入“学习”，点击“开始测验”。",
          "回答与你药物相关的选择题（原理、用法、注意事项）。",
          "点击“提交” → 查看反馈；正确答案可获得 XP。",
          "打开“奖励”查看 XP 总数和徽章。"
        ]
      },
      {
        type: "ol",
        summary: "🎙️ 语音助手 — 免手操作问答",
        items: [
          "进入“语音”（或在聊天中使用麦克风）。",
          "点击麦克风，清晰提问；再次点击以结束。",
          "Pill-AI 会朗读答案并显示在屏幕上。"
        ]
      },
      {
        type: "ul",
        summary: "🔔 通知 — 允许与排查",
        items: [
          "允许：出现提示时选择“允许”此站点的通知。",
          "没看到提示？地址栏 → 站点设置 → 通知 → 允许。",
          "iOS/Android：在系统设置中启用浏览器的推送通知。"
        ]
      },
      {
        type: "p",
        summary: "🛡️ 安全",
        para:
          "Pill-AI 提供来自新西兰可信来源的一般信息，不能替代药师或医生的个性化建议。请根据自身情况咨询专业人士。"
      }
    ]
  }
};

/** Generic renderer driven by HOWTO[language] content. */
function Card({ c }) {
  if (c.type === "p") {
    return (
      <details className="howto" open={c.open}>
        <summary>{c.summary}</summary>
        <p>{c.para}</p>
      </details>
    );
  }
  const ListTag = c.type === "ul" ? "ul" : "ol";
  return (
    <details className="howto" open={c.open}>
      <summary>{c.summary}</summary>
      <ListTag>
        {c.items?.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ListTag>
      {c.after && <p style={{ marginTop: 8 }}>{c.after}</p>}
    </details>
  );
}

// Small inline responsive wrapper (works without extra CSS files)
function PortraitVideo({ videoId, title = "How to use Pill-AI video" }) {
  const wrapper = {
    position: "relative",
    width: "100%",
    // 9:16 portrait -> padding-bottom: 177.78%
    paddingBottom: "177.78%",
    margin: "12px 0 20px 0",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 0 0 1px rgba(0,0,0,.06) inset",
    maxWidth: 420,
    marginLeft: "auto",
    marginRight: "auto"
  };
  const iframe = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: 0
  };
  return (
    <div style={wrapper} aria-label={title}>
      <iframe
        style={iframe}
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

export default function HowToPillAI({ isOpen, onClose, language = "English" }) {
  if (!isOpen) return null;
  const t = HOWTO[language] || HOWTO.English;

  return (
    <Modal open={isOpen} onClose={onClose} title={t.title}>
      {/* Embedded YouTube Shorts (portrait) */}
      <PortraitVideo videoId={YT_VIDEO_ID} />

      <div className="howto">
        {t.cards.map((c, i) => (
          <Card key={i} c={c} />
        ))}
      </div>
    </Modal>
  );
}