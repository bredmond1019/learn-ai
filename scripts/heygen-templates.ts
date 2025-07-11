// HeyGen Video Generation Templates for Different Module Types

export interface VideoTemplate {
  avatarId: string;
  avatarStyle: string;
  voiceId: string;
  voiceSpeed: number;
  background: {
    type: 'color' | 'image' | 'video';
    value: string;
  };
  intro: string;
  outro: string;
  transitions: string[];
  cameraPosition?: string;
  gestures?: boolean;
}

export const MODULE_TEMPLATES: Record<string, VideoTemplate> = {
  // Theory/Concept modules - Professional educator style
  theory: {
    avatarId: 'alex_business_sitting',
    avatarStyle: 'professional',
    voiceId: 'en-US-JennyNeural',
    voiceSpeed: 0.95,
    background: {
      type: 'color',
      value: '#1e293b' // Dark slate for focus
    },
    intro: 'Welcome to {module_name}. Today we\'ll explore {main_concept} and understand how it shapes modern AI systems.',
    outro: 'Excellent work! You\'ve now mastered the fundamentals of {main_concept}. Remember to complete the interactive exercises to reinforce your learning.',
    transitions: [
      'Let\'s start by understanding the core concepts.',
      'Now, let\'s dive deeper into the details.',
      'Moving on to the next important aspect.',
      'Here\'s where it gets really interesting.',
      'Finally, let\'s tie it all together.'
    ],
    gestures: true
  },

  // Practice/Hands-on modules - Casual instructor style
  practice: {
    avatarId: 'monica_casual_standing',
    avatarStyle: 'casual',
    voiceId: 'en-US-AriaNeural',
    voiceSpeed: 1.0,
    background: {
      type: 'image',
      value: 'developer_workspace' // Code editor background
    },
    intro: 'Hey there! Ready to get your hands dirty with {module_name}? Let\'s build something awesome together.',
    outro: 'Amazing job! You\'ve successfully implemented {main_concept}. Keep practicing and experimenting with the code.',
    transitions: [
      'Let me show you how this works.',
      'Now it\'s your turn to try.',
      'Here\'s a pro tip for you.',
      'Let\'s debug this together.',
      'Check out this cool feature.'
    ],
    cameraPosition: 'top_right',
    gestures: true
  },

  // Project modules - Professional presenter style
  project: {
    avatarId: 'alex_professional_presenting',
    avatarStyle: 'presenting',
    voiceId: 'en-US-GuyNeural',
    voiceSpeed: 1.0,
    background: {
      type: 'image',
      value: 'modern_office'
    },
    intro: 'Welcome to our capstone project: {module_name}. We\'ll build a production-ready {main_concept} from scratch.',
    outro: 'Congratulations on completing this project! You\'ve built a real-world {main_concept}. Share your implementation and get feedback from the community.',
    transitions: [
      'First, let\'s set up our project structure.',
      'Now we\'ll implement the core functionality.',
      'Time to add some advanced features.',
      'Let\'s ensure our code is production-ready.',
      'Finally, we\'ll deploy and test everything.'
    ],
    gestures: true
  },

  // Assessment/Quiz modules - Encouraging teacher style
  assessment: {
    avatarId: 'sarah_teacher_sitting',
    avatarStyle: 'educational',
    voiceId: 'en-US-JennyNeural',
    voiceSpeed: 0.95,
    background: {
      type: 'color',
      value: '#0f172a' // Very dark for focus
    },
    intro: 'Time to test your knowledge of {module_name}. Don\'t worry, this is a learning opportunity. Let\'s see what you\'ve mastered!',
    outro: 'Well done completing this assessment! Review any concepts you found challenging and remember, mastery comes with practice.',
    transitions: [
      'Let\'s start with some fundamentals.',
      'Now for something a bit more challenging.',
      'Think carefully about this one.',
      'Almost there, keep going!',
      'Last question, you\'ve got this!'
    ],
    gestures: false
  },

  // Introduction modules - Welcoming host style
  introduction: {
    avatarId: 'james_host_standing',
    avatarStyle: 'welcoming',
    voiceId: 'en-US-ChristopherNeural',
    voiceSpeed: 0.98,
    background: {
      type: 'image',
      value: 'tech_conference'
    },
    intro: 'Welcome to {module_name}! I\'m excited to be your guide on this learning journey. Let\'s discover what makes {main_concept} so powerful.',
    outro: 'You\'re off to a great start! In the next module, we\'ll build on these foundations. See you there!',
    transitions: [
      'First, let me give you the big picture.',
      'Here\'s what you need to know.',
      'This is really important to understand.',
      'Let me share a real-world example.',
      'Now you\'re ready for the next step.'
    ],
    gestures: true
  }
};

// Portuguese (pt-BR) voice mappings
export const PORTUGUESE_VOICES: Record<string, string> = {
  'en-US-JennyNeural': 'pt-BR-FranciscaNeural',
  'en-US-AriaNeural': 'pt-BR-ThalitaNeural',
  'en-US-GuyNeural': 'pt-BR-AntonioNeural',
  'en-US-ChristopherNeural': 'pt-BR-JulioNeural'
};

// Template selection based on module metadata
export function selectTemplate(moduleType: string, moduleDifficulty: string): VideoTemplate {
  // Special handling for specific module patterns
  if (moduleType === 'assessment' || moduleType === 'quiz') {
    return MODULE_TEMPLATES.assessment;
  }
  
  if (moduleType === 'project' || moduleType === 'capstone') {
    return MODULE_TEMPLATES.project;
  }
  
  if (moduleType === 'practice' || moduleType === 'exercise') {
    return MODULE_TEMPLATES.practice;
  }
  
  if (moduleType === 'concept' || moduleType === 'theory') {
    return MODULE_TEMPLATES.theory;
  }
  
  // Default based on difficulty
  if (moduleDifficulty === 'beginner') {
    return MODULE_TEMPLATES.introduction;
  }
  
  return MODULE_TEMPLATES.theory;
}

// Generate script with template
export function applyTemplate(
  template: VideoTemplate,
  moduleData: {
    title: string;
    mainConcept: string;
    sections: any[];
  }
): string {
  const intro = template.intro
    .replace('{module_name}', moduleData.title)
    .replace('{main_concept}', moduleData.mainConcept);
    
  const outro = template.outro
    .replace('{module_name}', moduleData.title)
    .replace('{main_concept}', moduleData.mainConcept);
    
  return {
    intro,
    outro,
    transitions: template.transitions,
    voiceConfig: {
      id: template.voiceId,
      speed: template.voiceSpeed
    },
    avatarConfig: {
      id: template.avatarId,
      style: template.avatarStyle,
      gestures: template.gestures
    },
    background: template.background
  };
}

// Quick template for urgent conversions
export const QUICK_TEMPLATE: VideoTemplate = {
  avatarId: 'alex_business_sitting',
  avatarStyle: 'professional',
  voiceId: 'en-US-JennyNeural',
  voiceSpeed: 1.0,
  background: {
    type: 'color',
    value: '#1e293b'
  },
  intro: 'Welcome to this lesson. Let\'s get started.',
  outro: 'Thanks for watching. See you in the next module.',
  transitions: [
    'Next,',
    'Now,',
    'Moving on,',
    'Additionally,',
    'Finally,'
  ],
  gestures: false // Faster rendering without gestures
};