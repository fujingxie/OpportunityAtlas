import type { StudentCase } from "@/lib/types";

export const mockCases: StudentCase[] = [
  {
    id: "c-018",
    anonymousCode: "C-018",
    grade: "G11",
    schoolType: "international",
    gpaRange: "A-/A",
    academicSummary: "数学和物理基础强，已有校内科研经历，适合高强度 STEM 路径。",
    activityExperience: [
      {
        programId: "p-013",
        programName: "HMMT 哈佛-麻省理工数学竞赛",
        type: "Competition",
        stage: "G10 冬",
        description: "用团队竞赛验证数学能力，并为后续科研项目建立背景。"
      },
      {
        programId: "p-015",
        programName: "RSI 科学研究暑期项目",
        type: "Summer School",
        stage: "G11 夏",
        description: "完成独立研究与学术展示，成为申请叙事核心。"
      }
    ],
    intendedMajor: "Engineering",
    resultSummary: "Top 20 工程方向录取",
    resultTier: "Top 20",
    personalSummary: "路径重点是先证明学术能力，再用高强度科研形成可信研究叙事。",
    consultantReview: "适合已经具备竞赛基础和科研自驱力的学生复制部分路径。",
    tags: ["STEM", "工程", "顶尖分段", "线下科研"],
    status: "published",
    completeness: 96,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  },
  {
    id: "c-043",
    anonymousCode: "C-043",
    grade: "G11",
    schoolType: "public",
    gpaRange: "B+/A-",
    academicSummary: "公立国际部，数学基础稳定，活动起步不算早。",
    activityExperience: [
      {
        programId: "p-012",
        programName: "HiMCM 美国高中数学建模大赛",
        type: "Competition",
        stage: "G10 冬",
        description: "建立建模、英文论文和团队协作经历。"
      },
      {
        programId: "p-031",
        programName: "Pioneer Academics 先锋学术研究项目",
        type: "Research Program",
        stage: "G11 春",
        description: "把数据分析兴趣沉淀为研究论文。"
      }
    ],
    intendedMajor: "Data Science",
    resultSummary: "匹配校 Data Science 方向录取，冲刺校 waitlist",
    resultTier: "Matched",
    personalSummary: "不是堆高含金量项目，而是让每一步解释为什么选择数据科学。",
    consultantReview: "适合作为中等背景学生的稳健进阶参考。",
    tags: ["数据科学", "中等分段", "线上科研", "数学建模"],
    status: "published",
    completeness: 94,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  },
  {
    id: "c-071",
    anonymousCode: "C-071",
    grade: "G11",
    schoolType: "international",
    gpaRange: "A-",
    academicSummary: "表达能力强，社科阅读量较高，但量化背景一般。",
    activityExperience: [
      {
        programId: "p-006",
        programName: "IEO 国际经济学奥林匹克竞赛",
        type: "Competition",
        stage: "G10 春",
        description: "补足经济学基础和案例展示经验。"
      },
      {
        programId: "p-018",
        programName: "YYGS 耶鲁全球青年学者项目",
        type: "Summer School",
        stage: "G10 夏",
        description: "强化全球议题、讨论和领导力表达。"
      }
    ],
    intendedMajor: "Economics / International Relations",
    resultSummary: "Econ / IR 方向录取，叙事完整",
    resultTier: "Selective",
    personalSummary: "用全球议题连接经济学和公共政策，避免活动彼此孤立。",
    consultantReview: "适合人文社科和商科交叉方向学生参考。",
    tags: ["人文社科", "商科/经济", "全球事务", "夏校"],
    status: "published",
    completeness: 91,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  },
  {
    id: "c-096",
    anonymousCode: "C-096",
    grade: "G10",
    schoolType: "public",
    gpaRange: "B/B+",
    academicSummary: "晚启动生物方向，校内成绩中上，缺少明确活动主线。",
    activityExperience: [
      {
        programId: "p-010",
        programName: "USABO 美国生物奥林匹克竞赛",
        type: "Competition",
        stage: "G10 春",
        description: "先用竞赛课程建立生物基础和学习节奏。"
      },
      {
        programId: "p-032",
        programName: "Lumiere 科研学者项目",
        type: "Research Program",
        stage: "G10 夏",
        description: "完成入门研究项目，确认是否继续 BioMed 方向。"
      }
    ],
    intendedMajor: "Biology / BioMed",
    resultSummary: "方向更清晰，但冲刺顶尖科研项目仍有差距",
    resultTier: "Developing",
    personalSummary: "路径价值在于补强和校准方向，而不是包装成顶尖科研型。",
    consultantReview: "适合普通背景学生理解补强顺序。",
    tags: ["生物", "普通分段", "补强型", "科研入门"],
    status: "published",
    completeness: 89,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  },
  {
    id: "c-112",
    anonymousCode: "C-112",
    grade: "G10",
    schoolType: "international",
    gpaRange: "A-",
    academicSummary: "对新闻和社会议题有兴趣，写作强，活动需要更垂直。",
    activityExperience: [
      {
        programId: "p-023",
        programName: "Medill Cherubs 西北大学新闻学夏校",
        type: "Summer School",
        stage: "G10 夏",
        description: "建立新闻采访、写作和媒体伦理基础。"
      },
      {
        programId: "p-024",
        programName: "IYWS 爱荷华青年作家工作室",
        type: "Summer School",
        stage: "G11 夏",
        description: "强化非虚构写作和作品集质量。"
      }
    ],
    intendedMajor: "Journalism / Writing",
    resultSummary: "新闻传播方向录取，作品集质量提升明显",
    resultTier: "Selective",
    personalSummary: "写作型学生要尽早沉淀作品，而不是只堆夏校经历。",
    consultantReview: "适合写作和媒体方向学生参考。",
    tags: ["人文社科", "写作", "新闻", "夏校"],
    status: "published",
    completeness: 90,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  },
  {
    id: "c-128",
    anonymousCode: "C-128",
    grade: "G11",
    schoolType: "other",
    gpaRange: "A/A-",
    academicSummary: "艺术表达强，作品集基础好，但学术课程表现不稳定。",
    activityExperience: [
      {
        programId: "p-046",
        programName: "NYU Tisch 纽约大学Tisch艺术夏校",
        type: "Summer School",
        stage: "G11 夏",
        description: "集中产出影像作品并接受专业反馈。"
      }
    ],
    intendedMajor: "Film / Media Arts",
    resultSummary: "艺术学院方向录取，综合大学冲刺结果一般",
    resultTier: "Portfolio",
    personalSummary: "作品集路径有效，但学术成绩短板限制综合申请。",
    consultantReview: "适合作为艺术方向学生的边界案例。",
    tags: ["艺术", "作品集", "结果一般", "夏校"],
    status: "published",
    completeness: 86,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  },
  {
    id: "c-136",
    anonymousCode: "C-136",
    grade: "G11",
    schoolType: "international",
    gpaRange: "A",
    academicSummary: "CS 能力强，已参与校内算法社团，目标计算机科学。",
    activityExperience: [
      {
        programId: "p-002",
        programName: "IOI 国际信息学奥林匹克竞赛",
        type: "Competition",
        stage: "G10-G11",
        description: "通过选拔路径强化算法能力。"
      },
      {
        programId: "p-009",
        programName: "IOAI 国际人工智能奥林匹克竞赛",
        type: "Competition",
        stage: "G11 夏",
        description: "把算法优势延展到机器学习和 AI 伦理。"
      }
    ],
    intendedMajor: "Computer Science",
    resultSummary: "CS 强校录取，活动路径和方向高度一致",
    resultTier: "Top 30",
    personalSummary: "竞赛路径足够强时，项目数量不是关键，方向一致性更重要。",
    consultantReview: "适合算法竞赛型学生参考。",
    tags: ["STEM", "计算机", "竞赛", "顶尖分段"],
    status: "published",
    completeness: 95,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  },
  {
    id: "c-154",
    anonymousCode: "C-154",
    grade: "G11",
    schoolType: "public",
    gpaRange: "B+",
    academicSummary: "商科兴趣明确，但缺少可展示的项目深度。",
    activityExperience: [
      {
        programId: "p-019",
        programName: "LBW 沃顿商学院领导力夏校",
        type: "Summer School",
        stage: "G11 夏",
        description: "补足商业分析、演示和团队协作经历。"
      }
    ],
    intendedMajor: "Business",
    resultSummary: "商科方向录取，但冲刺结果受学术成绩限制",
    resultTier: "Matched",
    personalSummary: "单个夏校不能替代长期商业项目积累。",
    consultantReview: "适合作为商科路径风险提醒。",
    tags: ["商科/经济", "中等分段", "夏校", "风险案例"],
    status: "published",
    completeness: 84,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  },
  {
    id: "c-176",
    anonymousCode: "C-176",
    grade: "G10",
    schoolType: "international",
    gpaRange: "A-",
    academicSummary: "工程兴趣强，实验室经历不足，适合先做校内项目再申请科研。",
    activityExperience: [
      {
        programId: "p-033",
        programName: "UCSB RMP 加州大学圣塔芭芭拉研究导师计划",
        type: "Research Program",
        stage: "G11 夏",
        description: "在导师制研究中补足工程方向项目深度。"
      },
      {
        programId: "p-045",
        programName: "UIUC青年学者暑期STEMM研究项目",
        type: "Research Program",
        stage: "G11 夏",
        description: "作为全额资助科研项目冲刺目标。"
      }
    ],
    intendedMajor: "Mechanical Engineering",
    resultSummary: "工程方向申请材料完整，但最终选择更适配的研究型大学",
    resultTier: "Selective",
    personalSummary: "工程路径要有动手项目和研究问题，不能只靠课程成绩。",
    consultantReview: "适合 STEM 工程方向学生参考。",
    tags: ["STEM", "工程", "科研", "G11"],
    status: "published",
    completeness: 92,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  },
  {
    id: "c-203",
    anonymousCode: "C-203",
    grade: "G12",
    schoolType: "international",
    gpaRange: "B/B+",
    academicSummary: "方向切换较晚，从生物转公共卫生，活动解释成本较高。",
    activityExperience: [
      {
        programId: "p-044",
        programName: "埃默里大学暑期科研项目",
        type: "Research Program",
        stage: "G11 夏",
        description: "接触公共卫生与生物医学研究。"
      },
      {
        programId: "p-049",
        programName: "伦敦大学学院暑期预科项目",
        type: "Summer School",
        stage: "G12 前",
        description: "补充英国体系课程体验。"
      }
    ],
    intendedMajor: "Public Health",
    resultSummary: "匹配校录取，冲刺学校未录取",
    resultTier: "Developing",
    personalSummary: "方向切换需要更早的证据链，否则容易显得临时拼接。",
    consultantReview: "适合作为结果不完全理想的复盘案例。",
    tags: ["公共卫生", "结果一般", "方向切换", "科研"],
    status: "published",
    completeness: 88,
    createdAt: "2026-06-24T00:00:00Z",
    updatedAt: "2026-06-24T00:00:00Z"
  }
];

