import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAYS = (n: number) => new Date(Date.now() + n * 24 * 60 * 60_000);
const AGO = (n: number) => new Date(Date.now() - n * 24 * 60 * 60_000);

async function reset() {
  const tables = [
    "ChallengeResponse",
    "LeaderboardResult",
    "Attempt",
    "Voucher",
    "FinancialEvent",
    "Transaction",
    "AttributionTouch",
    "CustomerEvent",
    "CRMInteraction",
    "CRMWave",
    "CRMCampaign",
    "SegmentMember",
    "Segment",
    "CampaignInterest",
    "Winner",
    "Question",
    "CustomerCampaign",
    "LandingPage",
    "Offer",
    "Campaign",
    "Prize",
    "Merchant",
    "Partner",
    "Customer",
    "Market",
    "HomepageModuleConfig",
    "DemoScenario",
    "AppSession",
  ];
  for (const t of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${t}";`);
  }
}

async function main() {
  await reset();

  const market = await prisma.market.create({
    data: { code: "EG", name: "Egypt", currency: "EGP", timezone: "Africa/Cairo", vatRate: 0.14 },
  });

  const merchantA = await prisma.merchant.create({
    data: {
      name: "Nile Retail Collective",
      nameAr: "تجمع نايل للتجزئة",
      description: "Nationwide electronics & lifestyle voucher network (demo merchant).",
      descriptionAr: "شبكة قسائم إلكترونيات ونمط حياة على مستوى الجمهورية (تاجر تجريبي).",
      terms: "Valid at participating demo merchant outlets. Not redeemable for cash. Expires 12 months from issue.",
      termsAr: "صالحة لدى منافذ التاجر التجريبي المشاركة. غير قابلة للاسترداد نقداً. تنتهي بعد 12 شهراً.",
    },
  });
  const merchantB = await prisma.merchant.create({
    data: {
      name: "Delta Device Hub",
      nameAr: "دلتا ديفايس هب",
      description: "Mobile device accessory & service voucher (demo).",
      terms: "EGP500 store credit toward eligible SKUs. Demo terms only.",
    },
  });
  const merchantC = await prisma.merchant.create({
    data: {
      name: "Red Sea Experiences",
      nameAr: "تجارب البحر الأحمر",
      description: "Travel & hospitality voucher network (demo).",
      terms: "Valid for demo travel packages; blackout dates may apply.",
    },
  });

  const partnerA = await prisma.partner.create({
    data: { name: "Influencer A", type: "influencer", commissionPct: 5 },
  });
  const partnerB = await prisma.partner.create({
    data: { name: "Affiliate Network B", type: "affiliate", commissionPct: 3 },
  });

  const prizeA = await prisma.prize.create({
    data: {
      name: "Flagship Phone Pro Max (Demo)",
      nameAr: "هاتف فلاجشيب برو ماكس (تجريبي)",
      description: "Latest flagship smartphone — pre-secured demo prize inventory.",
      descriptionAr: "أحدث هاتف فلاجشيب — جائزة تجريبية مؤمّنة مسبقاً.",
      imageUrl: "/prizes/phone.svg",
      estimatedValue: 110000,
      secured: true,
    },
  });
  const prizeB = await prisma.prize.create({
    data: {
      name: "Galaxy Flagship Ultra (Demo)",
      nameAr: "جالاكسي فلاجشيب ألترا (تجريبي)",
      description: "Android flagship smartphone — independent campaign prize.",
      imageUrl: "/prizes/samsung.svg",
      estimatedValue: 95000,
      secured: true,
    },
  });
  const prizeC = await prisma.prize.create({
    data: {
      name: "Red Sea Escape for Two (Demo)",
      nameAr: "رحلة البحر الأحمر لشخصين (تجريبي)",
      description: "3-night coastal escape experience — scheduled campaign.",
      imageUrl: "/prizes/travel.svg",
      estimatedValue: 80000,
      secured: true,
    },
  });

  const gameplayA = DAYS(21);
  const cutoffA = new Date(gameplayA.getTime() - 10 * 60_000);
  const gameplayB = DAYS(28);
  const cutoffB = new Date(gameplayB.getTime() - 10 * 60_000);

  const campaignA = await prisma.campaign.create({
    data: {
      slug: "flagship-phone-egypt",
      name: "Flagship Phone Challenge",
      nameAr: "تحدي الهاتف الفلاجشيب",
      tagline: "Skill up. Voucher in hand. Compete for the flagship.",
      taglineAr: "أظهر مهارتك. القسيمة بيدك. تنافس على الفلاجشيب.",
      description:
        "Pay EGP500 for a genuine EGP500 Nile Retail voucher plus one timed skill challenge attempt. Prize competed for — not purchased, not guaranteed.",
      descriptionAr:
        "ادفع ٥٠٠ ج.م مقابل قسيمة نايل بقيمة ٥٠٠ ج.م ومحاولة تحدي مهارة موقوتة. الجائزة للمنافسة — ليست شراءً وليست مضمونة.",
      status: "Live",
      marketId: market.id,
      merchantId: merchantA.id,
      prizeId: prizeA.id,
      standardPrice: 500,
      standardVoucherValue: 500,
      maxPurchasesPerUser: 5,
      questionCount: 5,
      timerSeconds: 60,
      gameplayDeadline: gameplayA,
      purchaseCutoff: cutoffA,
      heroImageUrl: "/prizes/phone.svg",
      cardImageUrl: "/prizes/phone.svg",
      brandColor: "#E11D48",
      showOnHome: true,
      showInDirectory: true,
      featured: true,
      homeSortOrder: 10,
      showLeaderboard: true,
      showWinners: true,
      prizeCostWorking: 110000,
      rulesText:
        "18+. One voucher + one attempt per purchase. Max 5 purchases/attempts per person. Ranking: correct DESC, time ASC, earliest valid attempt ASC. No random draw.",
      voucherTerms: merchantA.terms,
      voucherTermsAr: merchantA.termsAr,
    },
  });

  const campaignB = await prisma.campaign.create({
    data: {
      slug: "galaxy-flagship-egypt",
      name: "Galaxy Flagship Challenge",
      nameAr: "تحدي جالاكسي فلاجشيب",
      tagline: "Different prize. Different leaderboard. Same skill rules.",
      taglineAr: "جائزة مختلفة. لوحة مختلفة. نفس قواعد المهارة.",
      description:
        "Independent Samsung-class flagship campaign. Customer pays EGP500, receives EGP500 Delta Device Hub voucher, then competes on this campaign's leaderboard only.",
      descriptionAr:
        "حملة فلاجشيب مستقلة. ادفع ٥٠٠ ج.م واستلم قسيمة دلتا بقيمة ٥٠٠ ج.م ثم تنافس على لوحة هذه الحملة فقط.",
      status: "Live",
      marketId: market.id,
      merchantId: merchantB.id,
      prizeId: prizeB.id,
      standardPrice: 500,
      standardVoucherValue: 500,
      gameplayDeadline: gameplayB,
      purchaseCutoff: cutoffB,
      heroImageUrl: "/prizes/samsung.svg",
      cardImageUrl: "/prizes/samsung.svg",
      brandColor: "#2563EB",
      showOnHome: true,
      showInDirectory: true,
      featured: true,
      homeSortOrder: 20,
      showLeaderboard: true,
      showWinners: true,
      prizeCostWorking: 95000,
      rulesText: "Independent campaign rules identical in structure; separate leaderboard and prize.",
      rulesTextAr:
        "قواعد مستقلة بنفس البنية؛ لوحة متصدرين وجائزة منفصلتان. ١٨+ · بحد أقصى ٥ محاولات · بلا سحب عشوائي.",
      voucherTerms: merchantB.terms,
      voucherTermsAr: merchantB.termsAr,
    },
  });

  const campaignC = await prisma.campaign.create({
    data: {
      slug: "red-sea-escape",
      name: "Red Sea Escape",
      nameAr: "هروب البحر الأحمر",
      tagline: "Coming soon — register interest.",
      taglineAr: "قريباً — سجّل اهتمامك.",
      description: "Scheduled travel experience campaign. Notify flow only until Live.",
      descriptionAr: "حملة تجربة سفر مجدولة. مسار الإشعار فقط حتى تصبح مباشرة.",
      status: "Scheduled",
      marketId: market.id,
      merchantId: merchantC.id,
      prizeId: prizeC.id,
      standardPrice: 500,
      standardVoucherValue: 500,
      gameplayDeadline: DAYS(60),
      purchaseCutoff: DAYS(59),
      heroImageUrl: "/prizes/travel.svg",
      cardImageUrl: "/prizes/travel.svg",
      brandColor: "#0D9488",
      showOnHome: true,
      showInDirectory: true,
      featured: false,
      homeSortOrder: 30,
      showInUpcoming: true,
      showLeaderboard: false,
      showWinners: false,
      prizeCostWorking: 80000,
      rulesText: "Notify-only until Live. Same commercial structure when opened.",
      rulesTextAr: "إشعار فقط حتى تصبح مباشرة. نفس البنية التجارية عند الفتح.",
      voucherTerms: merchantC.terms,
      voucherTermsAr: merchantC.termsAr,
    },
  });

  // Closed past campaign (shown in past if enabled)
  const prizePast = await prisma.prize.create({
    data: {
      name: "Smart Watch Elite (Demo)",
      nameAr: "ساعة ذكية إيليت (تجريبي)",
      imageUrl: "/prizes/watch.svg",
      estimatedValue: 25000,
      secured: true,
    },
  });
  const campaignPast = await prisma.campaign.create({
    data: {
      slug: "smartwatch-spring",
      name: "Smart Watch Spring",
      nameAr: "ساعة ذكية الربيع",
      tagline: "Completed demo campaign",
      taglineAr: "حملة تجريبية مكتملة",
      status: "Closed",
      marketId: market.id,
      merchantId: merchantA.id,
      prizeId: prizePast.id,
      standardPrice: 500,
      standardVoucherValue: 500,
      gameplayDeadline: AGO(14),
      purchaseCutoff: AGO(14),
      heroImageUrl: "/prizes/watch.svg",
      cardImageUrl: "/prizes/watch.svg",
      brandColor: "#7C3AED",
      showOnHome: false,
      showInDirectory: true,
      featured: false,
      homeSortOrder: 90,
      showInPast: true,
      showLeaderboard: true,
      showWinners: true,
      prizeCostWorking: 25000,
    },
  });

  const offerAStd = await prisma.offer.create({
    data: {
      campaignId: campaignA.id,
      code: "STD500",
      name: "Standard EGP500",
      purchasePrice: 500,
      voucherValue: 500,
      offerType: "standard",
      priority: 100,
      active: true,
    },
  });
  const offerAPromo = await prisma.offer.create({
    data: {
      campaignId: campaignA.id,
      code: "RECOVER350",
      name: "Recovery / personalized EGP350",
      purchasePrice: 350,
      voucherValue: 500,
      offerType: "personalized",
      priority: 10,
      eligibleSegment: "checkout_abandoner",
      active: true,
    },
  });
  const offerAReplay = await prisma.offer.create({
    data: {
      campaignId: campaignA.id,
      code: "REPLAY350",
      name: "Replay EGP350",
      purchasePrice: 350,
      voucherValue: 500,
      offerType: "replay",
      priority: 20,
      eligibleSegment: "replay_eligible",
      active: true,
    },
  });
  await prisma.offer.create({
    data: {
      campaignId: campaignB.id,
      code: "STD500",
      name: "Standard EGP500",
      purchasePrice: 500,
      voucherValue: 500,
      offerType: "standard",
      priority: 100,
      active: true,
    },
  });

  const lpA = await prisma.landingPage.create({
    data: {
      slug: "ig-influencer-a-phone",
      campaignId: campaignA.id,
      partnerId: partnerA.id,
      name: "Instagram Influencer A — Phone",
      headline: "Compete for the flagship. Keep the voucher either way.",
      headlineAr: "تنافس على الفلاجشيب. والقسيمة لك في كل الأحوال.",
      subheadline: "Skill challenge • Genuine EGP500 merchant value • Demo only",
      creativeUrl: "/prizes/phone.svg",
      language: "en",
      active: true,
      offerId: offerAStd.id,
      utmSource: "instagram",
      utmMedium: "influencer",
      utmCampaign: "phone-a",
    },
  });
  await prisma.landingPage.create({
    data: {
      slug: "crm-recover-phone",
      campaignId: campaignA.id,
      partnerId: partnerA.id,
      name: "CRM Recovery LP",
      headline: "Your personalized offer is waiting",
      subheadline: "EGP350 for EGP500 voucher + challenge attempt",
      active: true,
      offerId: offerAPromo.id,
      utmSource: "crm",
      utmMedium: "sms",
      utmCampaign: "recover-ahmed",
    },
  });
  await prisma.landingPage.create({
    data: {
      slug: "affiliate-b-galaxy",
      campaignId: campaignB.id,
      partnerId: partnerB.id,
      name: "Affiliate B — Galaxy",
      headline: "Galaxy Flagship Challenge",
      active: true,
      utmSource: "affiliate",
      utmMedium: "cpc",
      utmCampaign: "galaxy-b",
    },
  });

  // Questions for A & B
  const questionsA = [
    {
      promptEn: "What is the capital of Egypt?",
      promptAr: "ما عاصمة مصر؟",
      options: ["Cairo", "Alexandria", "Giza", "Luxor"],
      optionsAr: ["القاهرة", "الإسكندرية", "الجيزة", "الأقصر"],
      correct: 0,
    },
    {
      promptEn: "2 + 2 × 3 = ?",
      promptAr: "٢ + ٢ × ٣ = ؟",
      options: ["12", "8", "10", "6"],
      optionsAr: ["١٢", "٨", "١٠", "٦"],
      correct: 1,
    },
    {
      promptEn: "Which planet is known as the Red Planet?",
      promptAr: "أي كوكب يُعرف بالكوكب الأحمر؟",
      options: ["Venus", "Mars", "Jupiter", "Mercury"],
      optionsAr: ["الزهرة", "المريخ", "المشتري", "عطارد"],
      correct: 1,
    },
    {
      promptEn: "HTML stands for?",
      promptAr: "HTML تعني؟",
      options: [
        "HyperText Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlinks Text Mark Language",
      ],
      optionsAr: [
        "لغة ترميز النص الفائق",
        "لغة تقنية حديثة عالية",
        "لغة ترميز أدوات المنزل",
        "لغة علامات روابط النص",
      ],
      correct: 0,
    },
    {
      promptEn: "How many minutes in 2.5 hours?",
      promptAr: "كم دقيقة في ٢٫٥ ساعة؟",
      options: ["120", "150", "180", "90"],
      optionsAr: ["١٢٠", "١٥٠", "١٨٠", "٩٠"],
      correct: 1,
    },
  ];
  for (let i = 0; i < questionsA.length; i++) {
    const q = questionsA[i];
    await prisma.question.create({
      data: {
        campaignId: campaignA.id,
        orderIndex: i,
        promptEn: q.promptEn,
        promptAr: q.promptAr,
        optionsJson: JSON.stringify(q.options),
        optionsAr: JSON.stringify(q.optionsAr),
        correctIndex: q.correct,
      },
    });
  }
  const questionsB = [
    {
      promptEn: "Nile River flows into which sea?",
      promptAr: "تصب مياه النيل في أي بحر؟",
      options: ["Red Sea", "Mediterranean", "Black Sea", "Arabian Sea"],
      optionsAr: ["البحر الأحمر", "البحر المتوسط", "البحر الأسود", "بحر العرب"],
      correct: 1,
    },
    {
      promptEn: "Binary of decimal 5?",
      promptAr: "ما التمثيل الثنائي للعدد ٥؟",
      options: ["101", "110", "111", "100"],
      optionsAr: ["١٠١", "١١٠", "١١١", "١٠٠"],
      correct: 0,
    },
    {
      promptEn: "Largest desert in Egypt?",
      promptAr: "أكبر صحراء في مصر؟",
      options: ["Eastern", "Western/Libyan", "Sinai", "Qattara"],
      optionsAr: ["الشرقية", "الغربية/الليبية", "سيناء", "القطارة"],
      correct: 1,
    },
    {
      promptEn: "Speed of light ≈?",
      promptAr: "سرعة الضوء تقريباً؟",
      options: ["300 km/s", "300,000 km/s", "3,000 km/s", "30,000 km/s"],
      optionsAr: ["٣٠٠ كم/ث", "٣٠٠٬٠٠٠ كم/ث", "٣٬٠٠٠ كم/ث", "٣٠٬٠٠٠ كم/ث"],
      correct: 1,
    },
    {
      promptEn: "Primary colors of light?",
      promptAr: "الألوان الأساسية للضوء؟",
      options: ["RYB", "RGB", "CMYK", "HSV"],
      optionsAr: ["RYB", "RGB", "CMYK", "HSV"],
      correct: 1,
    },
  ];
  for (let i = 0; i < questionsB.length; i++) {
    const q = questionsB[i];
    await prisma.question.create({
      data: {
        campaignId: campaignB.id,
        orderIndex: i,
        promptEn: q.promptEn,
        promptAr: q.promptAr,
        optionsJson: JSON.stringify(q.options),
        optionsAr: JSON.stringify(q.optionsAr),
        correctIndex: q.correct,
      },
    });
  }

  // Customers / personas
  const ahmed = await prisma.customer.create({
    data: {
      phone: "+201111111111",
      email: "ahmed.hassan@demo.smp",
      firstName: "Ahmed",
      lastName: "Hassan",
      displayName: "Ahmed H.",
      locale: "en",
      dateOfBirth: new Date("1995-03-12"),
      ageVerified: true,
      otpVerified: true,
      marketingConsent: true,
      publicityConsent: false,
      isDemo: true,
    },
  });
  const mariam = await prisma.customer.create({
    data: {
      phone: "+201222222222",
      email: "mariam.adel@demo.smp",
      firstName: "Mariam",
      lastName: "Adel",
      displayName: "Mariam A.",
      otpVerified: true,
      marketingConsent: true,
      isDemo: true,
    },
  });
  const omar = await prisma.customer.create({
    data: {
      phone: "+201333333333",
      email: "omar.khaled@demo.smp",
      firstName: "Omar",
      lastName: "Khaled",
      displayName: "Omar K.",
      otpVerified: true,
      marketingConsent: true,
      isDemo: true,
    },
  });
  const sara = await prisma.customer.create({
    data: {
      phone: "+201444444444",
      email: "sara.mahmoud@demo.smp",
      firstName: "Sara",
      lastName: "Mahmoud",
      displayName: "Sara M.",
      otpVerified: true,
      marketingConsent: true,
      publicityConsent: true,
      isDemo: true,
    },
  });

  // Seed leaderboard players for campaign A (so Ahmed can land ~#27)
  const leaderboardSeeds: { first: string; last: string; score: number; timeMs: number }[] = [];
  for (let i = 1; i <= 40; i++) {
    // Mix of scores; Ahmed will be 4/5 in 38420ms → many 5/5 and faster 4/5 ahead
    if (i <= 15) {
      leaderboardSeeds.push({ first: `Player`, last: `${i}`, score: 5, timeMs: 25000 + i * 800 });
    } else if (i <= 26) {
      leaderboardSeeds.push({ first: `Player`, last: `${i}`, score: 4, timeMs: 28000 + (i - 15) * 700 });
    } else {
      leaderboardSeeds.push({ first: `Player`, last: `${i}`, score: 4, timeMs: 40000 + (i - 26) * 900 });
    }
  }

  async function createCompletedAttempt(opts: {
    customerId: string;
    campaignId: string;
    merchantId: string;
    score: number;
    timeMs: number;
    amount?: number;
    offerId?: string;
    firstName: string;
    lastName: string;
    daysAgo?: number;
  }) {
    const when = AGO(opts.daysAgo ?? 3);
    const idem = `seed-${opts.customerId}-${opts.campaignId}-${opts.timeMs}-${Math.random().toString(36).slice(2, 8)}`;
    const tx = await prisma.transaction.create({
      data: {
        customerId: opts.customerId,
        campaignId: opts.campaignId,
        offerId: opts.offerId,
        amount: opts.amount ?? 500,
        voucherValue: 500,
        status: "succeeded",
        paymentRef: `SIM-${idem}`,
        idempotencyKey: idem,
        isFirstPayer: true,
        createdAt: when,
      },
    });
    const voucher = await prisma.voucher.create({
      data: {
        code: `VCH-${idem.slice(-10).toUpperCase()}`,
        customerId: opts.customerId,
        campaignId: opts.campaignId,
        merchantId: opts.merchantId,
        transactionId: tx.id,
        faceValue: 500,
        costValue: 50,
        status: "issued",
        issuedAt: when,
      },
    });
    const start = new Date(when.getTime() + 60_000);
    const end = new Date(start.getTime() + opts.timeMs);
    const attempt = await prisma.attempt.create({
      data: {
        customerId: opts.customerId,
        campaignId: opts.campaignId,
        voucherId: voucher.id,
        status: "completed",
        startedAt: start,
        finishedAt: end,
        serverStartAt: start,
        serverEndAt: end,
        score: opts.score,
        timeMs: opts.timeMs,
        valid: true,
        createdAt: when,
      },
    });
    await prisma.leaderboardResult.create({
      data: {
        campaignId: opts.campaignId,
        customerId: opts.customerId,
        attemptId: attempt.id,
        score: opts.score,
        timeMs: opts.timeMs,
        displayName: `${opts.firstName} ${opts.lastName.charAt(0)}.`,
        provisional: true,
        qualifyingAt: end,
      },
    });
    await prisma.customerCampaign.upsert({
      where: { customerId_campaignId: { customerId: opts.customerId, campaignId: opts.campaignId } },
      create: {
        customerId: opts.customerId,
        campaignId: opts.campaignId,
        purchaseCount: 1,
        attemptCount: 1,
        unusedAttempts: 0,
        bestScore: opts.score,
        bestTimeMs: opts.timeMs,
        lifecycle: "played",
        firstPayer: true,
        ltv: opts.amount ?? 500,
      },
      update: {
        purchaseCount: { increment: 1 },
        attemptCount: { increment: 1 },
        bestScore: opts.score,
        bestTimeMs: opts.timeMs,
      },
    });
    await prisma.financialEvent.create({
      data: {
        campaignId: opts.campaignId,
        transactionId: tx.id,
        type: "purchase",
        amount: opts.amount ?? 500,
        metaJson: JSON.stringify({ voucherCost: 50, isNewPayer: true }),
      },
    });
    return attempt;
  }

  for (const row of leaderboardSeeds) {
    const c = await prisma.customer.create({
      data: {
        phone: `+2015${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}${row.last}`,
        firstName: row.first,
        lastName: row.last,
        displayName: `${row.first} ${row.last.charAt(0)}.`,
        otpVerified: true,
        isDemo: true,
      },
    });
    await createCompletedAttempt({
      customerId: c.id,
      campaignId: campaignA.id,
      merchantId: merchantA.id,
      score: row.score,
      timeMs: row.timeMs,
      firstName: row.first,
      lastName: row.last,
    });
  }

  // Ahmed: attribution LP → abandon → CRM recover → pay 350 → score 4/5 in 38420ms
  await prisma.attributionTouch.create({
    data: {
      customerId: ahmed.id,
      campaignId: campaignA.id,
      landingPageId: lpA.id,
      partnerId: partnerA.id,
      source: "instagram",
      medium: "influencer",
      touchedAt: AGO(5),
      expiresAt: DAYS(25),
    },
  });
  await prisma.customerEvent.createMany({
    data: [
      { customerId: ahmed.id, campaignId: campaignA.id, type: "lp_view", payload: JSON.stringify({ lp: lpA.slug }) },
      { customerId: ahmed.id, campaignId: campaignA.id, type: "otp_verified", createdAt: AGO(5) },
      { customerId: ahmed.id, campaignId: campaignA.id, type: "checkout_abandon", createdAt: AGO(4), payload: JSON.stringify({ offer: "STD500" }) },
      { customerId: ahmed.id, campaignId: campaignA.id, type: "crm_recover_sent", createdAt: AGO(2) },
    ],
  });
  await prisma.customerCampaign.create({
    data: {
      customerId: ahmed.id,
      campaignId: campaignA.id,
      purchaseCount: 0,
      attemptCount: 0,
      unusedAttempts: 0,
      lifecycle: "checkout_abandoner",
    },
  });

  // Complete Ahmed purchase path in seed as "post-recovery" state for demo consistency
  // (Golden path can also be replayed fresh via Reset + journey)
  const ahmedTx = await prisma.transaction.create({
    data: {
      customerId: ahmed.id,
      campaignId: campaignA.id,
      offerId: offerAPromo.id,
      amount: 350,
      voucherValue: 500,
      status: "succeeded",
      paymentRef: "SIM-AHMED-350",
      idempotencyKey: "ahmed-recover-350",
      isFirstPayer: true,
      attributionJson: JSON.stringify({ partnerId: partnerA.id, landingPageId: lpA.id, source: "crm" }),
      createdAt: AGO(1),
    },
  });
  const ahmedVoucher = await prisma.voucher.create({
    data: {
      code: "VCH-AHMED350",
      customerId: ahmed.id,
      campaignId: campaignA.id,
      merchantId: merchantA.id,
      transactionId: ahmedTx.id,
      faceValue: 500,
      costValue: 50,
      status: "issued",
      terms: merchantA.terms,
      issuedAt: AGO(1),
    },
  });
  const aStart = AGO(1);
  const aEnd = new Date(aStart.getTime() + 38420);
  const ahmedAttempt = await prisma.attempt.create({
    data: {
      customerId: ahmed.id,
      campaignId: campaignA.id,
      voucherId: ahmedVoucher.id,
      status: "completed",
      startedAt: aStart,
      finishedAt: aEnd,
      serverStartAt: aStart,
      serverEndAt: aEnd,
      score: 4,
      timeMs: 38420,
      valid: true,
    },
  });
  await prisma.leaderboardResult.create({
    data: {
      campaignId: campaignA.id,
      customerId: ahmed.id,
      attemptId: ahmedAttempt.id,
      score: 4,
      timeMs: 38420,
      displayName: "Ahmed H.",
      provisional: true,
      qualifyingAt: aEnd,
    },
  });
  await prisma.customerCampaign.update({
    where: { customerId_campaignId: { customerId: ahmed.id, campaignId: campaignA.id } },
    data: {
      purchaseCount: 1,
      attemptCount: 1,
      unusedAttempts: 0,
      bestScore: 4,
      bestTimeMs: 38420,
      lifecycle: "played",
      firstPayer: true,
      ltv: 350,
      contribution: 0,
    },
  });
  await prisma.customerEvent.create({
    data: {
      customerId: ahmed.id,
      campaignId: campaignA.id,
      type: "purchase_succeeded",
      payload: JSON.stringify({ amount: 350, voucher: "VCH-AHMED350" }),
    },
  });
  await prisma.customerEvent.create({
    data: {
      customerId: ahmed.id,
      campaignId: campaignA.id,
      type: "challenge_completed",
      payload: JSON.stringify({ score: 4, timeMs: 38420 }),
    },
  });
  await prisma.financialEvent.create({
    data: {
      campaignId: campaignA.id,
      transactionId: ahmedTx.id,
      type: "purchase",
      amount: 350,
      metaJson: JSON.stringify({ voucherCost: 50, isNewPayer: true, offer: "RECOVER350" }),
    },
  });

  // Mariam: OTP verified checkout abandoner
  await prisma.customerCampaign.create({
    data: {
      customerId: mariam.id,
      campaignId: campaignA.id,
      lifecycle: "checkout_abandoner",
      purchaseCount: 0,
    },
  });
  await prisma.customerEvent.create({
    data: {
      customerId: mariam.id,
      campaignId: campaignA.id,
      type: "checkout_abandon",
      payload: JSON.stringify({ step: "payment" }),
    },
  });

  // Omar: purchased, voucher issued, unused attempt — NBA = play
  const omarTx = await prisma.transaction.create({
    data: {
      customerId: omar.id,
      campaignId: campaignA.id,
      offerId: offerAStd.id,
      amount: 500,
      voucherValue: 500,
      status: "succeeded",
      paymentRef: "SIM-OMAR",
      idempotencyKey: "omar-std-500",
      isFirstPayer: true,
    },
  });
  const omarVoucher = await prisma.voucher.create({
    data: {
      code: "VCH-OMAR500",
      customerId: omar.id,
      campaignId: campaignA.id,
      merchantId: merchantA.id,
      transactionId: omarTx.id,
      faceValue: 500,
      costValue: 50,
      status: "issued",
    },
  });
  await prisma.attempt.create({
    data: {
      customerId: omar.id,
      campaignId: campaignA.id,
      voucherId: omarVoucher.id,
      status: "entitled",
    },
  });
  await prisma.customerCampaign.create({
    data: {
      customerId: omar.id,
      campaignId: campaignA.id,
      purchaseCount: 1,
      attemptCount: 0,
      unusedAttempts: 1,
      lifecycle: "voucher_ready",
      firstPayer: true,
      ltv: 500,
    },
  });

  // Sara: cross-campaign high-LTV
  await createCompletedAttempt({
    customerId: sara.id,
    campaignId: campaignA.id,
    merchantId: merchantA.id,
    score: 5,
    timeMs: 32000,
    firstName: "Sara",
    lastName: "Mahmoud",
    amount: 500,
  });
  await createCompletedAttempt({
    customerId: sara.id,
    campaignId: campaignB.id,
    merchantId: merchantB.id,
    score: 4,
    timeMs: 41000,
    firstName: "Sara",
    lastName: "Mahmoud",
    amount: 500,
  });
  await prisma.customerCampaign.update({
    where: { customerId_campaignId: { customerId: sara.id, campaignId: campaignA.id } },
    data: { lifecycle: "high_ltv", ltv: 1000 },
  });

  // Rank all leaderboard results for A and B
  async function recomputeRanks(campaignId: string) {
    const rows = await prisma.leaderboardResult.findMany({ where: { campaignId } });
    const sorted = [...rows].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
      return a.qualifyingAt.getTime() - b.qualifyingAt.getTime();
    });
    for (let i = 0; i < sorted.length; i++) {
      await prisma.leaderboardResult.update({
        where: { id: sorted[i].id },
        data: { rank: i + 1 },
      });
      await prisma.customerCampaign.updateMany({
        where: { customerId: sorted[i].customerId, campaignId },
        data: { bestRank: i + 1 },
      });
    }
  }
  await recomputeRanks(campaignA.id);
  await recomputeRanks(campaignB.id);

  // Verified winner on past campaign (demo labeled)
  await prisma.winner.create({
    data: {
      campaignId: campaignPast.id,
      maskedName: "Nour S.",
      prizeName: "Smart Watch Elite (Demo)",
      verified: true,
      publicityConsent: true,
      publishedAt: AGO(10),
      isDemo: true,
    },
  });

  // Homepage modules
  const modules = [
    { key: "hero", enabled: true, sortOrder: 10, titleEn: "Featured prizes", titleAr: "جوائز مميزة" },
    { key: "active", enabled: true, sortOrder: 20, titleEn: "Active campaigns", titleAr: "حملات نشطة" },
    { key: "upcoming", enabled: true, sortOrder: 30, titleEn: "Coming soon", titleAr: "قريباً" },
    { key: "winners", enabled: true, sortOrder: 40, titleEn: "Verified winners", titleAr: "فائزون موثّقون" },
    { key: "leaderboards", enabled: true, sortOrder: 50, titleEn: "Leaderboards", titleAr: "المتصدرون" },
    { key: "how_it_works", enabled: true, sortOrder: 60, titleEn: "How SMP Works", titleAr: "كيف تعمل SMP" },
    { key: "trust", enabled: true, sortOrder: 70, titleEn: "Merchant value & trust", titleAr: "قيمة التاجر والثقة" },
    { key: "personalized", enabled: true, sortOrder: 15, titleEn: "For you", titleAr: "لك" },
  ];
  for (const m of modules) {
    await prisma.homepageModuleConfig.create({ data: m });
  }

  // Segments + CRM
  const segAbandon = await prisma.segment.create({
    data: {
      name: "Checkout abandoners — Campaign A",
      description: "OTP verified, abandoned checkout, no purchase",
      rulesJson: JSON.stringify({
        and: [{ field: "lifecycle", op: "eq", value: "checkout_abandoner" }, { field: "campaignId", op: "eq", value: campaignA.id }],
      }),
    },
  });
  await prisma.segmentMember.createMany({
    data: [
      { segmentId: segAbandon.id, customerId: ahmed.id },
      { segmentId: segAbandon.id, customerId: mariam.id },
    ],
  });
  // Fix Ahmed — he's played now; keep Mariam in abandon segment for CRM demo
  await prisma.segmentMember.deleteMany({ where: { segmentId: segAbandon.id, customerId: ahmed.id } });

  const segReplay = await prisma.segment.create({
    data: {
      name: "Replay eligible — Campaign A",
      rulesJson: JSON.stringify({ and: [{ field: "lifecycle", op: "eq", value: "played" }, { field: "purchaseCount", op: "lt", value: 5 }] }),
    },
  });
  await prisma.segmentMember.create({ data: { segmentId: segReplay.id, customerId: ahmed.id } });

  const crm = await prisma.cRMCampaign.create({
    data: {
      name: "Recover checkout abandoners",
      objective: "checkout_recovery",
      campaignId: campaignA.id,
      segmentId: segAbandon.id,
      channel: "sms",
      messageTemplate: "Ahmed — your EGP350 offer for EGP500 voucher is ready. Demo only.",
      offerCode: "RECOVER350",
      lpSlug: "crm-recover-phone",
      status: "completed",
    },
  });
  const wave = await prisma.cRMWave.create({
    data: {
      crmCampaignId: crm.id,
      name: "Wave 1 — recovery",
      sentAt: AGO(2),
      controlPct: 0.1,
      status: "sent",
    },
  });
  await prisma.cRMInteraction.create({
    data: {
      waveId: wave.id,
      customerId: mariam.id,
      channel: "sms",
      isControl: false,
      status: "delivered",
      responded: false,
      sentAt: AGO(2),
    },
  });
  await prisma.cRMInteraction.create({
    data: {
      waveId: wave.id,
      customerId: ahmed.id,
      channel: "sms",
      isControl: false,
      status: "delivered",
      responded: true,
      revenueAttr: 350,
      sentAt: AGO(2),
    },
  });

  await prisma.demoScenario.createMany({
    data: [
      { key: "ahmed_golden_path", name: "Ahmed Hassan Golden Path", description: "LP → abandon → CRM → EGP350 → 4/5 38.42s", active: true },
      { key: "omar_play_now", name: "Omar unused attempt", active: true },
      { key: "investor_tour", name: "Investor Mode tour", active: true },
    ],
  });

  // Admin session hint customer
  await prisma.customer.create({
    data: {
      phone: "+201000000001",
      firstName: "Demo",
      lastName: "Admin",
      displayName: "Demo Admin",
      otpVerified: true,
      isDemo: true,
    },
  });

  const ahmedRank = await prisma.leaderboardResult.findFirst({
    where: { customerId: ahmed.id, campaignId: campaignA.id },
  });
  console.log("Seed complete. Ahmed rank:", ahmedRank?.rank, "score", ahmedRank?.score, "time", ahmedRank?.timeMs);
  console.log("Offers:", offerAStd.code, offerAPromo.code, offerAReplay.code);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
