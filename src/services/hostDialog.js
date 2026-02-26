// 主持人话术数据库
const hostDialogues = {
  // 开场白
  welcome: {
    text: '欢迎来到虚拟换装体验馆！在这里，您可以尝试各种风格的服装，从日常休闲到古典优雅，再到晚宴华丽，总有一套适合您的风格！',
    emotion: 'excited'
  },

  // 各风格介绍
  styleIntroduction: {
    '日常': '欢迎来到日常风格换装间！日常风格注重舒适与实用，适合各种生活场景。请选择您喜欢的日常服装款式。',
    '古装': '欢迎来到古装风格换装间！感受传统文化的魅力，体验不同朝代的服饰风采。请选择您喜欢的古装款式。',
    '晚宴': '欢迎来到晚宴风格换装间！展现优雅与华丽，成为晚宴上的焦点。请选择您喜欢的晚宴礼服。'
  },

  // 日常风格服装介绍
  '日常': {
    'A': '日常风格A套装，暖金修身开衩裙，简约线条勾勒优雅，日常通勤也能自带高级感。',
    'B': '日常风格B套装，灰调无袖上衣搭配黑带开衩半裙，利落又不失少女感，轻松适配多种场合。',
    'C': '日常风格C套装，藏蓝短款上衣配橙黄印花大摆裙，复古又活泼，像把秋日暖阳穿在身上。',
    'D': '日常风格D套装，姜黄无袖直筒长裙，松弛又随性，慵懒日常里透着不费力的时髦。',
    'E': '日常风格E套装，宝蓝V领收腰蓬蓬裙，甜酷兼具，约会或派对都能成为焦点。',
    'F': '日常风格F套装，薄荷绿碎花外衫搭米白内搭，清新又飘逸，仿佛把春日花园穿在了身上。'
  },

  // 古装风格服装介绍
  '古装': {
    'A': '古风A套装，青纹抹胸曳地裙：青底暗纹如春水涟漪，朱红镶边与垂坠饰带添了几分古韵，行走间似携着江南烟雨的温婉。',
    'B': '古风B套装，黑金抹胸配金纹裙：黑金抹胸缀以宝石，金纹裙摆垂落如鎏金织就，酒红腰封束出利落腰线，尽显异域贵气。',
    'C': '古风C套装，朱红百褶长裙：朱红裙身如落霞染就，浅灰腰封系出雅致，百褶垂坠间藏着中式古典的端庄与温婉。',
    'D': '古风D套装，浅蓝长裙：浅蓝裙身似晴空流云，金带束腰勾勒柔婉曲线，简约中透着清灵雅致的古风韵味。',
    'E': '古风E套装，暗纹紫调短款裙装：深紫底色覆以暗纹，短款剪裁利落又不失神秘，如暗夜中绽放的幽紫花影。',
    'F': '古风F套装，红纹抹胸配米白草裙：红纹抹胸热烈似火，米白草裙缀以几何纹样，流苏轻摇间满是部落风情与灵动。。'
  },

  // 晚宴风格服装介绍
  '晚宴': {
    'A': '晚宴A套装，经典公主风晚宴裙：藏蓝上衣搭配金纹大摆裙，红蓝撞色复古又华丽，宛如童话里走出的优雅公主。',
    'B': '晚宴B套装，森系花神晚宴裙：渐变绿裙身如叶片舒展，立体花朵与藤蔓装饰点缀其间，清新又充满自然灵气。',
    'C': '晚宴C套装，柔粉梦幻晚宴裙：粉白配色温柔又梦幻，大裙摆自带优雅气场，是晚宴中温柔甜美的焦点。',
    'D': '晚宴D套装，星空蓝闪钻晚宴裙：宝蓝裙身缀满闪钻，白纱装饰增添浪漫，仿佛把整片星河穿在了身上。',
    'E': '晚宴E套装，柔粉系带晚宴裙：柔粉裙身垂坠感十足，粉紫系带勾勒线条，简约中透着东方温婉与雅致。',
    'F': '晚宴F套装，鎏金羽毛晚宴裙：金棕羽毛层叠如羽翼，自带神秘气场，是晚宴中极具个性的华丽存在。'
  },

  // 通用话术
  common: {
    selectPrompt: '请选择一套衣服，主持人将为您详细介绍',
    loading: '正在加载中，请稍候...',
    error: '抱歉，语音生成失败，请重试',
    back: '返回上一页'
  }
};

/**
 * 获取主持人话术
 * @param {string} type - 话术类型或风格名
 * @param {string} style - 风格（可选）
 * @param {string} outfit - 服装款式（可选）
 * @returns {string} - 话术文本
 */
export function getHostDialog(type, style = null, outfit = null) {
  console.log('获取话术参数:', { type, style, outfit });
  
  // 情况1：获取服装介绍（type是风格名，outfit是服装代码）
  if (outfit && hostDialogues[type] && hostDialogues[type][outfit]) {
    console.log('返回服装介绍:', type, outfit);
    return hostDialogues[type][outfit];
  }
  
  // 情况2：获取风格介绍
  if (type === 'styleIntroduction' && style && hostDialogues.styleIntroduction[style]) {
    console.log('返回风格介绍:', style);
    return hostDialogues.styleIntroduction[style];
  }
  
  // 情况3：获取欢迎语
  if (type === 'welcome') {
    console.log('返回欢迎语');
    return hostDialogues.welcome.text;
  }
  
  // 情况4：直接获取风格下的服装（处理旧逻辑）
  if (style && outfit && hostDialogues[style] && hostDialogues[style][outfit]) {
    console.log('返回服装介绍（旧逻辑）:', style, outfit);
    return hostDialogues[style][outfit];
  }
  
  console.log('返回默认提示');
  return hostDialogues.common.selectPrompt;
}

/**
 * 获取所有可用话术
 */
export function getAllDialogues() {
  return hostDialogues;
}