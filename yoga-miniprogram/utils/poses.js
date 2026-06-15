// utils/poses.js
// 8 个基础瑜伽体式定义 + 评分规则
// 关键点使用 COCO 17 点格式:
//  0 鼻 1 左眼 2 右眼 3 左耳 4 右耳
//  5 左肩 6 右肩 7 左肘 8 右肘 9 左腕 10 右腕
//  11 左髋 12 右髋 13 左膝 14 右膝 15 左踝 16 右踝

/**
 * 计算两点中点
 */
function mid(p1, p2) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

/**
 * 计算两点连线相对于垂直方向的夹角(角度制,0~180)
 */
function verticalAngle(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // 垂直方向参考 (0,-1), atan2 计算与垂直方向的偏差
  const angle = Math.atan2(Math.abs(dx), Math.abs(dy)) * (180 / Math.PI);
  return angle;
}

/**
 * 计算三点形成的夹角(角度制,0~180)
 *  angleAt(b): a-b-c 形成的角
 */
function angleAt(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const m2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (m1 === 0 || m2 === 0) return 0;
  let cos = dot / (m1 * m2);
  cos = Math.max(-1, Math.min(1, cos));
  return Math.acos(cos) * (180 / Math.PI);
}

/**
 * 评分规则通用结构
 *  - name: 规则中文名
 *  - compute: (keypoints, mirrored) => number  实际角度(0~180)
 *  - target: 目标角度
 *  - tolerance: 容差(角度)
 *  - weight: 权重
 *  - side: 'left' | 'right' | 'both'  影响是否镜像后取反
 */
const POSES = [
  {
    id: 'mountain',
    name: '山式',
    englishName: 'Mountain Pose',
    sanskrit: 'Tadasana',
    emoji: '🧘',
    difficulty: 1,
    duration: 30,
    description: '站立山式,双脚并拢,双手自然下垂,头部居中,身体垂直于地面。',
    tips: [
      '双脚均匀承重,膝盖微曲',
      '肩膀放松下沉,不要耸肩',
      '头顶向上延伸,脊柱拉长'
    ],
    rules: [
      {
        name: '身体垂直',
        compute: (kp) => verticalAngle(mid(kp[11], kp[12]), mid(kp[5], kp[6])),
        target: 0, tolerance: 10, weight: 2
      },
      {
        name: '双腿伸直',
        compute: (kp) => angleAt(kp[11], kp[13], kp[15]),
        target: 175, tolerance: 15, weight: 1
      },
      {
        name: '右腿伸直',
        compute: (kp) => angleAt(kp[12], kp[14], kp[16]),
        target: 175, tolerance: 15, weight: 1
      },
      {
        name: '肩膀水平',
        compute: (kp) => verticalAngle(kp[5], kp[6]),
        target: 0, tolerance: 10, weight: 1
      }
    ]
  },
  {
    id: 'tree',
    name: '树式',
    englishName: 'Tree Pose',
    sanskrit: 'Vrksasana',
    emoji: '🌳',
    difficulty: 2,
    duration: 40,
    description: '单脚站立平衡体式,一腿站立,另一脚置于大腿内侧,双手合十于胸前或举过头顶。',
    tips: [
      '目光凝视前方固定点帮助平衡',
      '髋部保持正对前方',
      '支撑腿用力踩地,不要锁死膝盖'
    ],
    rules: [
      {
        name: '身体垂直',
        compute: (kp) => verticalAngle(mid(kp[11], kp[12]), mid(kp[5], kp[6])),
        target: 0, tolerance: 8, weight: 2
      },
      {
        name: '支撑腿伸直',
        compute: (kp) => angleAt(kp[11], kp[13], kp[15]),
        target: 175, tolerance: 12, weight: 2
      },
      {
        name: '髋部水平',
        compute: (kp) => verticalAngle(kp[11], kp[12]),
        target: 0, tolerance: 12, weight: 2
      },
      {
        name: '肩膀水平',
        compute: (kp) => verticalAngle(kp[5], kp[6]),
        target: 0, tolerance: 10, weight: 1
      }
    ]
  },
  {
    id: 'warrior1',
    name: '战士一式',
    englishName: 'Warrior I',
    sanskrit: 'Virabhadrasana I',
    emoji: '⚔️',
    difficulty: 2,
    duration: 40,
    description: '弓步站立,前腿屈膝 90 度,后腿伸直,双手举过头顶,头部看双手。',
    tips: [
      '前膝不要超过脚尖,垂直于地面',
      '后腿用力蹬地,脚跟下压',
      '髋部正对前方,不要外翻'
    ],
    rules: [
      {
        name: '前腿 90 度',
        compute: (kp) => angleAt(kp[11], kp[13], kp[15]),
        target: 90, tolerance: 20, weight: 2
      },
      {
        name: '后腿伸直',
        compute: (kp) => angleAt(kp[12], kp[14], kp[16]),
        target: 170, tolerance: 15, weight: 2
      },
      {
        name: '双手高举过头',
        compute: (kp) => verticalAngle(mid(kp[5], kp[6]), mid(kp[9], kp[10])),
        target: 0, tolerance: 25, weight: 2
      },
      {
        name: '上身挺直',
        compute: (kp) => verticalAngle(mid(kp[11], kp[12]), mid(kp[5], kp[6])),
        target: 0, tolerance: 15, weight: 1
      }
    ]
  },
  {
    id: 'warrior2',
    name: '战士二式',
    englishName: 'Warrior II',
    sanskrit: 'Virabhadrasana II',
    emoji: '🤺',
    difficulty: 2,
    duration: 40,
    description: '宽步站立,前腿屈膝 90 度,后腿伸直,双手侧平举,目光看前手指尖。',
    tips: [
      '双臂与肩同高,手掌向下用力',
      '肩膀下沉远离耳朵',
      '胸腔打开,髋部下沉'
    ],
    rules: [
      {
        name: '前腿 90 度',
        compute: (kp) => angleAt(kp[11], kp[13], kp[15]),
        target: 90, tolerance: 20, weight: 2
      },
      {
        name: '后腿伸直',
        compute: (kp) => angleAt(kp[12], kp[14], kp[16]),
        target: 170, tolerance: 15, weight: 2
      },
      {
        name: '双臂水平侧举',
        compute: (kp) => verticalAngle(kp[5], kp[9]),
        target: 0, tolerance: 15, weight: 1
      },
      {
        name: '右臂水平',
        compute: (kp) => verticalAngle(kp[6], kp[10]),
        target: 0, tolerance: 15, weight: 1
      },
      {
        name: '上身挺直',
        compute: (kp) => verticalAngle(mid(kp[11], kp[12]), mid(kp[5], kp[6])),
        target: 0, tolerance: 12, weight: 1
      }
    ]
  },
  {
    id: 'downdog',
    name: '下犬式',
    englishName: 'Downward-Facing Dog',
    sanskrit: 'Adho Mukha Svanasana',
    emoji: '🐕',
    difficulty: 2,
    duration: 45,
    description: '倒 V 形,双手双脚撑地,臀部向上推到最高,头部自然下垂。',
    tips: [
      '手掌均匀压地,十指张开',
      '脚跟尽量下踩,伸展腿后侧',
      '背部延展成直线,坐骨向上'
    ],
    rules: [
      {
        name: '髋部抬起',
        compute: (kp) => {
          // 肩-髋-踝 形成的角应接近 90 (倒 V)
          return angleAt(mid(kp[5], kp[6]), mid(kp[11], kp[12]), kp[15]);
        },
        target: 95, tolerance: 25, weight: 2
      },
      {
        name: '手臂伸直',
        compute: (kp) => angleAt(kp[5], kp[7], kp[9]),
        target: 170, tolerance: 15, weight: 1
      },
      {
        name: '右臂伸直',
        compute: (kp) => angleAt(kp[6], kp[8], kp[10]),
        target: 170, tolerance: 15, weight: 1
      },
      {
        name: '双腿伸直',
        compute: (kp) => angleAt(kp[11], kp[13], kp[15]),
        target: 170, tolerance: 15, weight: 1
      }
    ]
  },
  {
    id: 'cobra',
    name: '眼镜蛇式',
    englishName: 'Cobra Pose',
    sanskrit: 'Bhujangasana',
    emoji: '🐍',
    difficulty: 2,
    duration: 35,
    description: '俯卧撑起,双手撑在胸侧,上半身抬起,胸口打开,髋部不离地。',
    tips: [
      '肩膀下沉远离耳朵',
      '肘部微曲,不要锁死',
      '耻骨下压贴地,延展腰椎'
    ],
    rules: [
      {
        name: '上身抬起',
        compute: (kp) => {
          // 髋-肩-鼻形成的角反映上抬幅度
          return angleAt(mid(kp[11], kp[12]), mid(kp[5], kp[6]), kp[0]);
        },
        target: 150, tolerance: 30, weight: 2
      },
      {
        name: '手臂伸直',
        compute: (kp) => angleAt(kp[5], kp[7], kp[9]),
        target: 160, tolerance: 25, weight: 1
      },
      {
        name: '右臂伸直',
        compute: (kp) => angleAt(kp[6], kp[8], kp[10]),
        target: 160, tolerance: 25, weight: 1
      },
      {
        name: '肩膀水平',
        compute: (kp) => verticalAngle(kp[5], kp[6]),
        target: 0, tolerance: 15, weight: 1
      }
    ]
  },
  {
    id: 'bridge',
    name: '桥式',
    englishName: 'Bridge Pose',
    sanskrit: 'Setu Bandha Sarvangasana',
    emoji: '🌉',
    difficulty: 2,
    duration: 40,
    description: '仰卧,双脚踩地,髋部向上抬起,双手在体侧撑地或十指交扣于背下。',
    tips: [
      '双脚用力踩地,膝盖指向正前方',
      '髋部用力向上推,大腿与小腿接近 90 度',
      '肩膀向下压地,胸口找下巴'
    ],
    rules: [
      {
        name: '髋部抬起',
        compute: (kp) => {
          // 膝-髋-肩形成的角反映抬起幅度
          return angleAt(kp[13], mid(kp[11], kp[12]), mid(kp[5], kp[6]));
        },
        target: 170, tolerance: 25, weight: 2
      },
      {
        name: '大腿与小腿接近 90 度',
        compute: (kp) => angleAt(kp[11], kp[13], kp[15]),
        target: 85, tolerance: 20, weight: 1
      },
      {
        name: '右小腿垂直',
        compute: (kp) => angleAt(kp[12], kp[14], kp[16]),
        target: 85, tolerance: 20, weight: 1
      },
      {
        name: '肩膀水平',
        compute: (kp) => verticalAngle(kp[5], kp[6]),
        target: 0, tolerance: 10, weight: 1
      }
    ]
  },
  {
    id: 'child',
    name: '婴儿式',
    englishName: "Child's Pose",
    sanskrit: 'Balasana',
    emoji: '🧎',
    difficulty: 1,
    duration: 30,
    description: '跪坐,臀部坐在脚跟上,上身向前折叠,额头贴近地面,双手前伸或放体侧。',
    tips: [
      '臀部尽量坐在脚跟上',
      '背部放松,不要拱起',
      '呼吸均匀,延展脊柱'
    ],
    rules: [
      {
        name: '髋部下沉',
        compute: (kp) => {
          // 髋接近踝, y 差小
          return Math.abs(kp[15].y - mid(kp[11], kp[12]).y);
        },
        target: 0, tolerance: 0.15, weight: 2
      },
      {
        name: '上身折叠',
        compute: (kp) => {
          // 肩接近髋 (前后)
          const shoulder = mid(kp[5], kp[6]);
          const hip = mid(kp[11], kp[12]);
          return Math.abs(shoulder.x - hip.x);
        },
        target: 0, tolerance: 0.15, weight: 2
      },
      {
        name: '背部水平',
        compute: (kp) => verticalAngle(mid(kp[5], kp[6]), mid(kp[11], kp[12])),
        target: 0, tolerance: 30, weight: 1
      }
    ]
  }
];

/**
 * 根据 id 获取体式
 */
function getPoseById(id) {
  return POSES.find((p) => p.id === id);
}

/**
 * 体式列表(供首页使用)
 */
function getPoseList() {
  return POSES.map((p) => ({
    id: p.id,
    name: p.name,
    englishName: p.englishName,
    emoji: p.emoji,
    difficulty: p.difficulty,
    duration: p.duration,
    description: p.description
  }));
}

module.exports = {
  POSES,
  getPoseById,
  getPoseList,
  angleAt,
  verticalAngle,
  mid
};
