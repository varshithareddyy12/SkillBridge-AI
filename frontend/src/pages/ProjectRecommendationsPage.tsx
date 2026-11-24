import React, { useState, useEffect } from 'react';
import {
  Code2,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  BookmarkCheck,
  FolderPlus,
  Play,
  Award,
} from 'lucide-react';
import { projectAPI } from '../services/api.js';
import { ProjectRecommendation } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

export const ProjectRecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await projectAPI.getAll();
      if (res.data.success) {
        setProjects(res.data.data.projects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommend = async () => {
    setIsGenerating(true);
    try {
      const res = await projectAPI.recommend({
        targetRole: user?.targetRole || 'Full Stack Software Engineer',
        difficulty: selectedDifficulty,
      });

      if (res.data.success) {
        await fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'SAVED' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      await projectAPI.updateStatus(id, status);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your practical project inventory..." size="lg" />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Generator Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Practical Project Studio</h2>
          <p className="text-xs text-gray-400 mt-1">
            Build resume-differentiating portfolio projects designed explicitly to demonstrate your missing skills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDifficulty}
            onChange={(e: any) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="BEGINNER">Beginner Complexity</option>
            <option value="INTERMEDIATE">Intermediate (Production Ready)</option>
            <option value="ADVANCED">Advanced / Distributed</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRecommend}
            isLoading={isGenerating}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Generate Targeted Projects
          </Button>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.id} className="space-y-5 border-gray-800 hover:border-gray-700">
              {/* Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                    <Badge variant={project.difficulty === 'ADVANCED' ? 'rose' : project.difficulty === 'INTERMEDIATE' ? 'cyan' : 'emerald'}>
                      {project.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{project.problemStatement}</p>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">Status:</span>
                  <select
                    value={project.status}
                    onChange={(e: any) => handleUpdateStatus(project.id, e.target.value)}
                    className="px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs font-semibold text-indigo-400 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SAVED">Saved</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed (Verified)</option>
                  </select>
                </div>
              </div>

              {/* Technologies & Skills Developed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Technologies Required</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(project.technologies || []).map((t) => (
                      <Badge key={t} variant="primary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Skills Mastered</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(project.skillsDeveloped || []).map((s) => (
                      <Badge key={s} variant="emerald">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Implementation Steps */}
              {project.implementationSteps && project.implementationSteps.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Implementation Architecture & Milestones</span>
                  </h4>
                  <div className="space-y-2">
                    {project.implementationSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-gray-900/40 rounded-lg border border-gray-800 text-xs text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Outcome & Portfolio Pitch */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                <div className="text-xs text-gray-300">
                  <strong className="text-indigo-400">Production Outcome: </strong>
                  <span>{project.expectedOutcome}</span>
                </div>
                <div className="text-xs text-gray-400">
                  <strong className="text-emerald-400">Portfolio Value: </strong>
                  <span>{project.portfolioValue}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Practical Projects Recommended Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-6">
            Click "Generate Targeted Projects" above to receive practical, resume-worthy project designs based on your missing skills.
          </p>
          <Button variant="primary" size="md" onClick={handleRecommend} icon={<Sparkles className="w-4 h-4" />}>
            Generate Projects Now
          </Button>
        </Card>
      )}
    </div>
  );
};
