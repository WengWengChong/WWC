/* 作品集数据 —— 演示视频全部托管于 B 站，站点只引用 BV 号 */
const BILI_MID   = '1312754929';
const BILI_SPACE = 'https://space.bilibili.com/' + BILI_MID + '/upload/video';
const BILI_PLAYER = 'https://player.bilibili.com/player.html';

const CATEGORIES = [
  { id: 'all',  name: '全部作品',   en: 'ALL' },
  { id: 'ue',   name: 'UE5 虚幻引擎', en: 'UNREAL' },
  { id: 'unity',name: 'Unity / VR·AR', en: 'UNITY' },
  { id: 'anim', name: '三维动画与渲染', en: 'ANIMATION' }
];

/* spec:    技术规格（弹窗顶部信息卡）[标签, 值]
   deliver: 交付成果
   sections: 分节说明 [小标题, 正文]                    */
const PROJECTS = [
  {
    id: 'gas',
    cat: 'ue',
    order: 1,
    title: 'UE 游戏系统设计（GAS）',
    role: '制作第二场景',
    date: '2026.04 - 2026.07',
    year: '2026',
    bvid: 'BV1NbxC6YEEF',
    cover: 'assets/img/cover-gas.jpg',
    desc: '两大场景设计，主要负责第二场景。设计 GAS 系统核心逻辑（血量、经验、伤害、耐力）；实现近战攻击、远程攻击、连击攻击、瞬移等多个技能，以及打断施法等效果；完成斩杀敌人特效、切换操控人物与差异化技能数值；使用 AI 生成角色 UI 效果图，经 PS 调整后应用到 UI 中。',
    tags: ['UE5', 'GAS 系统', '蓝图', '战斗系统', 'AI 辅助 UI'],
    spec: [
      ['PLATFORM', 'PC / Windows'],
      ['ENGINE', 'Unreal Engine 5'],
      ['ROLE', '第二场景 · 战斗系统'],
      ['TYPE', '团队项目']
    ],
    deliver: '两大场景 + 可打断的连招战斗系统',
    sections: [
      ['项目概述与技术选型',
       '课程级 UE5 动作游戏项目，共两大场景，我负责第二场景的整体搭建与 GAS 战斗系统的落地。技术选型：Unreal Engine 5、Gameplay Ability System（GAS）、Gameplay Tags、蓝图可视化脚本，角色 UI 先由 AI 生成概念稿再经 Photoshop 调整切图。'],
      ['角色属性与伤害结算',
       '基于 GAS 搭建生命、经验、耐力三条核心属性，用 Gameplay Effect 统一处理伤害、消耗与状态变化：血量归零触发死亡流程，经验增长驱动等级与数值成长，耐力则限制连招与位移的持续输出节奏。'],
      ['技能系统与打断规则',
       '实现近战攻击、远程攻击、连击、瞬移等多套技能，用 Gameplay Tags 驱动技能状态流转：施法途中被击中立即被打断，瞬移带短暂无敌帧，连击段数随按键节奏逐段推进。怪物同样接入这套技能框架，做到敌我共用一套规则，数值差异靠配置区分。'],
      ['表现与界面',
       '完成斩杀敌人的命中特效与处决演出，并支持切换操控角色，每个角色持有独立技能组与数值。角色 UI 效果图先由 AI 生成概念稿，再经 Photoshop 调整色阶、层级与排版后切图应用到游戏内 HUD，保证界面与整体美术调性一致。']
    ]
  },
  {
    id: 'gujian',
    cat: 'ue',
    order: 2,
    title: '古建纪行',
    role: '场景跳转设计 & 第一场景搭建',
    date: '2026.03 - 2026.06',
    year: '2026',
    bvid: 'BV1PbxC6YEDc',
    cover: 'assets/img/cover-gujian.jpg',
    desc: '采纳计算机设计大赛 2026 设计标准：一位旅人通过时光机前往不同古建筑参观，并完成相应小游戏通往下一关，在游戏过程中全面了解建筑历史。负责时光机跳转场景逻辑（Load Stream Level 节点）、抽奖式运转机制、时光机场景搭建与古建筑 UI 介绍、运行特效（灯光闪烁）与传送特效（虫洞穿梭）。',
    tags: ['UE5', '关卡流送', '交互逻辑', '特效', 'UI'],
    spec: [
      ['PLATFORM', 'PC / Windows'],
      ['ENGINE', 'Unreal Engine 5'],
      ['ROLE', '场景跳转 · 第一场景'],
      ['TYPE', '竞赛项目 · 计算机设计大赛 2026']
    ],
    deliver: '可连续游览的古建关卡与时光机传送体验',
    sections: [
      ['项目概述与技术选型',
       '按计算机设计大赛 2026 的设计标准搭建的古建筑主题游戏：旅人乘时光机前往不同朝代的古建筑参观，完成对应小游戏后通往下一关，在游玩过程中了解建筑历史。技术选型：Unreal Engine 5、Level Streaming 关卡流送、蓝图、Niagara 粒子、UMG 界面。'],
      ['场景跳转与关卡流送',
       '用 Load Stream Level 节点实现时光机在多个古建场景之间无缝穿梭：旧场景卸载、新场景加载与玩家出生点重定位统一放在同一段流程里执行，避免读条与黑屏，让"穿越"这件事在观感上一气呵成。'],
      ['时光机运转逻辑',
       '时光机不是一键传送，而是一段「抽奖式」运转过程：指针随机停留在一段年代上，随后播放对应的机械运转动画与音效，最后才执行跳转。把等待本身做成可看的内容，也让每一关的进入有仪式感。'],
      ['特效与历史信息呈现',
       '运转时用灯光闪烁表现能量堆积，传送时用虫洞穿梭粒子表现空间撕裂；每座古建筑都配有 UMG 信息面板，展示建造年代、结构与工艺特点，让"参观"真的能读到东西，而不只是看风景。']
    ]
  },
  {
    id: 'pcg',
    cat: 'ue',
    order: 3,
    title: '智能三维建模（PCG）',
    role: '第四场景搭建',
    date: '2025.09 - 2025.12',
    year: '2025',
    bvid: 'BV1WbxC6YERp',
    cover: 'assets/img/cover-pcg.jpg',
    desc: '通过 PCG 样条线设计场景，完成群山、树木、石头、花、草、房屋等的布局设计；在样条线中控制控制点的分布，使不同物品协调分布在不同位置；最后用摄像机动画展现场景全貌。',
    tags: ['UE5', 'PCG', '程序化生成', '场景美术'],
    spec: [
      ['PLATFORM', 'PC / Windows'],
      ['ENGINE', 'Unreal Engine 5 · PCG'],
      ['ROLE', '第四场景搭建'],
      ['TYPE', '团队项目']
    ],
    deliver: '全程序化生成的自然场景与巡游镜头',
    sections: [
      ['项目概述与技术选型',
       '用 UE5 的 PCG 框架搭建整片自然场景，把「手动摆物件」换成「用规则生成」。技术选型：Unreal Engine 5、PCG Graph、Spline 样条线、植被实例化与材质、Sequencer 摄像机动画。'],
      ['样条线驱动的布局',
       '以样条线作为场景骨架：控制点的疏密决定物品的分布密度，曲线走向决定山势与路径。群山、树木、石头、花草、房屋各自绑定不同的生成规则，又共享同一套样条参数，因此调整一处就能整体联动，改地形不必再一个个挪模型。'],
      ['分层与协调分布',
       '植被、岩石、建筑分属不同的 PCG 图层，用密度、坡度、高度与随机种子控制落点，避免互相穿插——树不长在石头上、房子不悬在坡面外。近景保留手工微调的余量，远景则完全交给规则批量生成，兼顾效率与观感。'],
      ['镜头呈现',
       '最后用摄像机动画做一次完整巡游：从山脚推到山顶、从林间穿到村落，用一个连续镜头把程序化生成的整体效果一次性交代清楚，也方便对外展示时快速建立空间印象。']
    ]
  },
  {
    id: 'shuguang',
    cat: 'unity',
    order: 4,
    title: '曙光之城',
    role: '独立开发',
    date: '2026.08 - 2026.10',
    year: '2026',
    bvid: 'BV1WhxC6wEva',
    cover: 'assets/img/cover-shuguang.jpg',
    desc: '独立完成的三阶段关卡制动作游戏：外围清怪 → 守护核心抵挡三波敌人 → 通关结算，阶段推进、存档复活与失败重来共用一套状态机。敌人 AI 基于 NavMesh 寻路巡逻巢穴，卡死后自动回退重入导航，三波进攻节奏交由行为树调度，击杀接布娃娃受击表现。射击穿透、坦克炮台与炮管升降、无人机索敌三种操控分别调手感，共用一套可切换角色控制器与血量 / 耐力 / 伤害结算；炮弹留弹坑与爆炸特效，常显雷达同步战场，失败重来用 Shader 转场。',
    tags: ['Unity', 'NavMesh', '行为树 AI', 'Ragdoll', 'Shader'],
    spec: [
      ['PLATFORM', 'PC / Windows'],
      ['ENGINE', 'Unity'],
      ['ROLE', '独立开发'],
      ['TYPE', '个人项目']
    ],
    deliver: '三阶段关卡 + 三种可切换操控的完整动作游戏',
    sections: [
      ['三阶段关卡流程',
       '独立设计三阶段关卡流程：外围清怪 → 守护核心抵挡三波行为树敌人 → 通关结算。阶段推进、存档复活与失败重来共用一套状态机，任何一处状态变化都不会让流程卡死。'],
      ['敌人 AI 与进攻节奏',
       '敌人 AI 以 NavMesh 寻路配巡逻点兜底，卡死后自动回退重入导航，不会贴着墙原地抖动；三波进攻节奏交给行为树调度，击杀接布娃娃（Ragdoll）受击表现，让打击反馈落得实在。'],
      ['三种操控与统一结算',
       '射击穿透、坦克炮台与炮管升降、无人机索敌三种操控分别调手感，共用一套可切换的角色控制器与血量 / 耐力 / 伤害结算体系，换载具不换规则，玩家的操作习惯可以延续。'],
      ['战场反馈与转场',
       '炮弹留弹坑与爆炸特效，常显雷达同步战场态势，不用回头找敌人；失败重来用 Shader 转场，把「再试一次」做成一段有节奏的过场，而不是生硬地重载关卡。']
    ]
  },
  {
    id: 'arpet',
    cat: 'unity',
    order: 5,
    title: 'AR 喂养小精灵',
    role: '手势交互 & 玩法循环',
    date: '2026.03 - 2026.06',
    year: '2026',
    bvid: 'BV1AhxC6wEBq',
    cover: 'assets/img/cover-arpet.jpg',
    desc: '团队项目，个人负责手势交互与玩法循环。基于 PICO AR 手势方案搭交互底座：把双手识别结果映射成 XRController 左右手模型，点按钮、抓物体全程不依赖手柄。挥砍水果按切面替换材质并生成两半模型，得分折成金币，再到商店换食物投喂精灵，好感度随之上涨；好感度阈值触发「惊喜」表现，骨骼动画 + Animator 状态机把数值变成看得见的情绪反馈。',
    tags: ['PICO AR', '手势追踪', 'XRController', '世界空间 UI', '骨骼动画'],
    spec: [
      ['PLATFORM', 'Android · PICO AR'],
      ['ENGINE', 'Unity · PICO SDK'],
      ['ROLE', '手势交互 · 玩法循环'],
      ['TYPE', '团队项目']
    ],
    deliver: '不依赖手柄的手势交互与「挥砍—换币—投喂」闭环',
    sections: [
      ['项目概述与技术选型',
       '团队项目中由我负责手势交互与玩法循环。技术选型：Unity、PICO AR、PICO 手势追踪、XRController、Animator 状态机、世界空间 UI，目标是在不拿手柄的前提下把操作跑通。'],
      ['手势交互底座',
       '基于 PICO AR 的手势方案搭交互底座：把双手识别结果映射成 XRController 左右手模型，点按钮、抓物体全程不依赖手柄。这样上层玩法不用关心「手是真手还是手柄」，交互代码一次写好即可复用。'],
      ['玩法循环',
       '两个玩法串成一条完整循环：挥砍水果时按切面替换材质并生成两半模型，得分折成金币，再到商店换食物投喂精灵，好感度随之上涨。给玩家一个明确的驱动力——砍得越准，精灵越喜欢你。'],
      ['情绪反馈与空间 UI',
       '好感度达到阈值触发「惊喜」表现，骨骼动画配合 Animator 状态机把数值变成看得见的情绪反馈，而不是弹一行数字。UI 与精灵统一走世界空间锚定，界面贴在真实空间里而不是糊在屏幕上，走动时也能保持对位。']
    ]
  },
  {
    id: 'vrpool',
    cat: 'unity',
    order: 6,
    title: 'SteamVR 台球小游戏',
    role: '功能制作',
    date: '2025.10 - 2025.12',
    year: '2025',
    bvid: 'BV1PbxC6YEos',
    cover: 'assets/img/cover-vrpool.jpg',
    desc: '使用 Unity 制作一款 VR 台球小游戏，通过拿起球杆、击打蓄力、辅助线瞄准等功能实现台球游戏玩法。从导入 SteamVR 基础文件、配置环境、模型调整到功能制作，全部由个人完成。',
    tags: ['Unity', 'SteamVR', 'VR 交互', '物理'],
    spec: [
      ['PLATFORM', 'PC VR · SteamVR'],
      ['ENGINE', 'Unity'],
      ['ROLE', '功能制作'],
      ['TYPE', '个人项目']
    ],
    deliver: '可抓杆、蓄力、瞄准的完整 VR 台球玩法',
    sections: [
      ['项目概述与技术选型',
       '用 Unity 做的一款 VR 台球小游戏，从导入 SteamVR 基础文件、配置环境、调整模型到功能制作全部个人完成。技术选型：Unity、SteamVR Plugin、XR 交互、Rigidbody 物理与物理材质、辅助线渲染。'],
      ['球杆抓取与蓄力',
       '球杆作为可抓取物体接入手柄：抓取点跟手、挥动带惯性；按下扳机进入蓄力状态，向后拉的距离映射成击球力度，松手即出杆。力度留有余量，轻推能做走位，重击可以开球。'],
      ['辅助线瞄准',
       '用射线在台面上投射辅助线，实时计算母球与目标球的碰撞点，把瞄准从「凭感觉」变成「看得见」；辅助线随球杆方向与俯仰角实时更新，瞄准时还能预判目标球的出球方向。'],
      ['物理与手感调校',
       '球与球、球与库边的碰撞用物理材质分别调弹性与摩擦，反复试出既符合直觉又不至于「飘」的手感；台面摩擦力与出杆力度单独做了参数面板，方便快速迭代而不必改代码。']
    ]
  },
  {
    id: 'plane',
    cat: 'unity',
    order: 7,
    title: 'Unity 飞机大战',
    role: '个人项目',
    date: '2024.11 - 2024.12',
    year: '2024',
    bvid: 'BV1NbxC6YEMj',
    cover: 'assets/img/cover-plane.jpg',
    desc: '基于 Unity 引擎开发经典飞机大战游戏，通过 AI 辅助生成飞机模型，并实现核心玩法功能，包括道具系统、血条管理等。项目初期参考教程掌握基础玩法逻辑，随后逐步添加新功能，持续优化代码结构与游戏体验；全程独立完成，涵盖需求分析、功能设计、代码实现与调试优化。',
    tags: ['Unity', 'C#', '玩法系统', 'AI 建模'],
    spec: [
      ['PLATFORM', 'PC / Android'],
      ['ENGINE', 'Unity · C#'],
      ['ROLE', '独立开发'],
      ['TYPE', '个人项目']
    ],
    deliver: '含道具与血量系统的完整 2D 射击玩法',
    sections: [
      ['项目概述与技术选型',
       '基于 Unity 开发的经典飞机大战，独立完成需求分析、功能设计、代码实现与调试优化。技术选型：Unity、C#、对象池、Sprite 动画，飞机模型通过 AI 辅助生成后再手动微调。'],
      ['核心玩法与敌人逻辑',
       '玩家飞机支持移动与射击，敌人按波次生成并沿预设轨迹推进，命中判定与爆炸反馈即时响应；难度随时间递增，越往后弹幕越密，逼迫玩家在走位与输出之间做取舍。'],
      ['道具与血量系统',
       '掉落道具分火力强化、护盾、回血几类，拾取即生效并附短暂无敌时间；血条与护盾值统一管理，受击、回复与死亡都在同一套状态里流转，不会出现血量与表现对不上的情况。'],
      ['迭代过程',
       '项目初期参考教程掌握基础玩法逻辑，随后逐步添加新功能，持续优化代码结构与游戏体验。美术资源用 AI 生成的模型替代手绘，把大部分前期时间省下来投在玩法与手感上。']
    ]
  },
  {
    id: 'render',
    cat: 'anim',
    order: 8,
    title: '第九届世界渲染大赛',
    role: '动画制作',
    date: '2025.02 - 2025.06',
    year: '2025',
    bvid: 'BV1PbxC6YEQx',
    cover: 'assets/img/cover-render.jpg',
    desc: '基于第九届世界渲染大赛模板，独立完成骨骼绑定与动画制作，为骨骼刷权重；结合马里奥冒险主题丰富场景内容，实现爆炸、陨石、水流等多种特效，提升整体视觉表现力。',
    tags: ['Blender', '骨骼绑定', '动画', '特效'],
    spec: [
      ['PLATFORM', 'Blender'],
      ['ENGINE', 'Blender · Cycles'],
      ['ROLE', '绑定 · 动画 · 特效'],
      ['TYPE', '竞赛项目 · 第九届世界渲染大赛']
    ],
    deliver: '完整骨骼绑定与动画的参赛短片',
    sections: [
      ['项目概述与技术选型',
       '基于第九届世界渲染大赛的官方模板创作，独立完成骨骼绑定与动画制作。技术选型：Blender、Armature 骨骼系统、权重绘制、关键帧动画、粒子与流体特效。'],
      ['骨骼绑定与权重',
       '按角色结构搭建骨骼链，逐段刷权重，保证关节弯折时形变自然、不出现穿插与塌陷；绑定完成后补了一套基础肢体控制，方便后续摆动作时快速调整姿态。'],
      ['场景与叙事',
       '结合马里奥冒险主题丰富场景内容，把镜头、道具与角色动作串成一条完整的冒险线，让短片有起承转合，而不只是一段技术演示。'],
      ['特效与渲染',
       '实现爆炸、陨石、水流等多种特效，调整灯光与材质提升整体视觉表现力，最后按比赛要求输出成片，在有限的时间里把画面完成度做到最高。']
    ]
  }
];

/* 能力方向 */
const STUDIO = [
  {
    num: '01',
    name: 'UE5 游戏系统设计', en: 'Unreal Engine 5',
    desc: 'GAS 战斗框架 · PCG 程序化场景 · 关卡流送与传送特效',
    img: 'assets/img/cover-gas.jpg'
  },
  {
    num: '02',
    name: 'Unity VR / AR 交互', en: 'Unity & XR',
    desc: 'SteamVR 台球 · AR 手势玩法 · 移动端沉浸式体验',
    img: 'assets/img/cover-plane.jpg'
  },
  {
    num: '03',
    name: '三维动画与渲染', en: 'Animation & Render',
    desc: 'Blender 骨骼绑定 · 权重与动画 · 爆炸 / 陨石 / 水流特效',
    img: 'assets/img/cover-render.jpg'
  },
  {
    num: '04',
    name: '独立全流程开发', en: 'Full-cycle Dev',
    desc: '需求分析 → 功能设计 → 实现 → 调优，AI 工具辅助提效',
    img: 'assets/img/cover-pcg.jpg'
  }
];

const TIMELINE = [
  { time: '2024.11 - 12', title: 'Unity 飞机大战', role: '个人项目', cat: 'unity' },
  { time: '2025.02 - 06', title: '第九届世界渲染大赛', role: '动画制作', cat: 'anim' },
  { time: '2025.09 - 12', title: '智能三维建模（PCG）', role: '第四场景搭建', cat: 'ue' },
  { time: '2025.10 - 12', title: 'SteamVR 台球小游戏', role: '功能制作', cat: 'unity' },
  { time: '2026.03 - 06', title: '古建纪行', role: '场景跳转 & 第一场景', cat: 'ue' },
  { time: '2026.03 - 06', title: 'AR 喂养小精灵', role: '手势交互 & 玩法循环', cat: 'unity' },
  { time: '2026.04 - 07', title: 'UE 游戏系统设计（GAS）', role: '制作第二场景', cat: 'ue' },
  { time: '2026.08 - 10', title: '曙光之城', role: '独立开发', cat: 'unity' }
];

/* Hero 背景画面（原视频已迁至 B 站，首屏改用静态画面缓慢推移） */
const HERO_POSTER = 'assets/img/hero-poster.jpg';

/* 生成 B 站播放器地址 */
function biliEmbed(bvid, autoplay) {
  return BILI_PLAYER + '?bvid=' + bvid + '&p=1&autoplay=' + (autoplay ? 1 : 0)
    + '&danmaku=0&high_quality=1&as_wide=1';
}
function biliWatch(bvid) { return 'https://www.bilibili.com/video/' + bvid; }

/* 展示带条目（取有视频的作品） */
const REEL = [
  { id: 'shuguang', cap: 'SHOWREEL', sub: '曙光之城',        img: 'assets/img/cover-shuguang.jpg' },
  { id: 'gas',    cap: 'SHOWREEL', sub: 'UE5 GAS 战斗系统',  img: 'assets/img/cover-gas.jpg' },
  { id: 'pcg',    cap: 'SHOWREEL', sub: 'PCG 程序化场景',    img: 'assets/img/cover-pcg.jpg' },
  { id: 'render', cap: 'SHOWREEL', sub: '世界渲染大赛',      img: 'assets/img/cover-render.jpg' },
  { id: 'vrpool', cap: 'SHOWREEL', sub: 'SteamVR 台球',      img: 'assets/img/cover-vrpool.jpg' },
  { id: 'arpet',  cap: 'SHOWREEL', sub: 'AR 喂养小精灵',     img: 'assets/img/cover-arpet.jpg' },
  { id: 'plane',  cap: 'SHOWREEL', sub: 'Unity 飞机大战',    img: 'assets/img/cover-plane.jpg' },
  { id: 'gujian', cap: 'SHOWREEL', sub: '古建纪行',          img: 'assets/img/cover-gujian.jpg' }
];
