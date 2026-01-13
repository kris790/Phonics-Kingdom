import { SkillNode, Task } from '../types';
import { generateTasksForSkill } from '../data/taskTemplates';
import { PHONICS_RULES } from '../data/phonicsRules';

export const generateLocalTasks = (skill: SkillNode): Task[] => {
  // Find matching rules for this skill level
  const applicableRules = PHONICS_RULES.filter(r => r.level === skill.level);
  
  // If no rules found, use a safe default
  if (applicableRules.length === 0) {
    console.warn(`No local phonics rules found for level: ${skill.level}. Using fallback.`);
    return generateTasksForSkill(skill.level, 'b', 5);
  }

  // Pick a random rule from the applicable ones to provide variety
  const rule = applicableRules[Math.floor(Math.random() * applicableRules.length)];
  
  return generateTasksForSkill(skill.level, rule.target, 5);
};
