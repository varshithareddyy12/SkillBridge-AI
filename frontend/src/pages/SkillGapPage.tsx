import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Edit2,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';
import { skillAPI } from '../services/api.js';
import { UserSkill } from '../types/index.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

export const SkillGapPage: React.FC = () => {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [skillGapData, setSkillGapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);

  // New skill form
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Technical');
  const [customProficiency, setCustomProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const [skillsRes, gapsRes] = await Promise.all([
        skillAPI.getAll(),
        skillAPI.getGaps(),
      ]);

      if (skillsRes.data.success) {
        setUserSkills(skillsRes.data.data.userSkills);
      }
      if (gapsRes.data.success) {
        setSkillGapData(gapsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    try {
      const res = await skillAPI.add({
        name: customName.trim(),
        category: customCategory,
        proficiencyLevel: customProficiency,
        yearsExperience: 1,
      });

      if (res.data.success) {
        setUserSkills((prev) => [res.data.data.userSkill, ...prev]);
        setCustomName('');
        setIsAddingCustom(false);
        // Refresh gap analysis
        const gapsRes = await skillAPI.getGaps();
        if (gapsRes.data.success) setSkillGapData(gapsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProficiency = async (id: string, newLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT') => {
    try {
      const res = await skillAPI.update(id, { proficiencyLevel: newLevel });
      if (res.data.success) {
        setUserSkills((prev) =>
          prev.map((s) => (s.id === id ? { ...s, proficiencyLevel: newLevel } : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'PROJECT_VERIFIED':
        return <Badge variant="emerald" size="sm">Project Verified</Badge>;
      case 'ASSESSMENT_VERIFIED':
        return <Badge variant="purple" size="sm">Assessment Verified</Badge>;
      case 'RESUME_EXTRACTED':
        return <Badge variant="cyan" size="sm">Resume Extracted</Badge>;
      default:
        return <Badge variant="gray" size="sm">Self-Reported</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Calculating skill gap matrix against market demands..." size="lg" />;
  }

  const missingSkills = skillGapData?.missingSkills || [];
  const acquiredSkills = skillGapData?.acquiredSkills || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Skill Gap Matrix & Verification</h2>
          <p className="text-xs text-gray-400 mt-1">
            Compare verified competencies against aggregated requirements across all your analyzed target jobs.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddingCustom((prev) => !prev)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Custom Skill
        </Button>
      </div>

      {/* Add Custom Skill Form */}
      {isAddingCustom && (
        <Card className="bg-gray-900/60 border-indigo-500/30 animate-slide-up">
          <h3 className="text-sm font-bold text-white mb-3">Add Self-Reported Skill</h3>
          <p className="text-xs text-gray-400 mb-4">
            Note: Self-reported skills are explicitly tagged as unverified until supported by a completed portfolio project or assessment.
          </p>

          <form onSubmit={handleAddCustomSkill} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Skill Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Redis, Tailwind, GraphQL"
                required
                className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Cloud/DevOps">Cloud/DevOps</option>
                <option value="Tools">Tools</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Proficiency</label>
              <select
                value={customProficiency}
                onChange={(e: any) => setCustomProficiency(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm" className="w-full">
                Save Skill
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddingCustom(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium">Acquired Skills</p>
            <h4 className="text-2xl font-bold text-white mt-0.5">{userSkills.length}</h4>
            <p className="text-[11px] text-gray-500">In your profile inventory</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium">Critical Skill Gaps</p>
            <h4 className="text-2xl font-bold text-rose-400 mt-0.5">{missingSkills.length}</h4>
            <p className="text-[11px] text-gray-500">Demanded by target roles</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium">Verified Skills</p>
            <h4 className="text-2xl font-bold text-purple-400 mt-0.5">
              {userSkills.filter((s) => ['PROJECT_VERIFIED', 'ASSESSMENT_VERIFIED'].includes(s.verificationSource)).length}
            </h4>
            <p className="text-[11px] text-gray-500">Project / assessment backed</p>
          </div>
        </Card>
      </div>

      {/* Missing Skills Priority Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Prioritized Skill Gaps to Close</h3>
            <p className="text-xs text-gray-400 mt-0.5">Ranked by frequency in your analyzed jobs.</p>
          </div>
        </div>

        {missingSkills.length > 0 ? (
          <div className="space-y-3">
            {missingSkills.map((gap: any) => (
              <div
                key={gap.name}
                className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{gap.name}</span>
                    <Badge variant={gap.learningPriority === 'HIGH' ? 'rose' : 'amber'}>
                      {gap.learningPriority} Priority
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{gap.importanceExplanation}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono text-indigo-400">{gap.frequencyInJobs} Jobs</span>
                    <p className="text-[10px] text-gray-500 uppercase">Market Demand</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-400 py-4 text-center">
            Zero skill gaps detected! Your current profile covers all requirements in analyzed roles.
          </p>
        )}
      </Card>

      {/* Your Verified & Identified Skills Table */}
      <Card>
        <h3 className="font-bold text-white text-base mb-1">Your Identified Skills</h3>
        <p className="text-xs text-gray-400 mb-4">Manage proficiency ratings and review verification authenticity.</p>

        {userSkills.length > 0 ? (
          <div className="divide-y divide-gray-800/80">
            {userSkills.map((us) => (
              <div key={us.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-200">{us.skill.name}</span>
                  {getSourceBadge(us.verificationSource)}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">Proficiency:</span>
                  <select
                    value={us.proficiencyLevel}
                    onChange={(e: any) => handleUpdateProficiency(us.id, e.target.value)}
                    className="px-2.5 py-1 bg-gray-900 border border-gray-700 rounded-lg text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-6 text-center">
            No skills added yet. Upload a resume or add custom skills above.
          </p>
        )}
      </Card>
    </div>
  );
};
