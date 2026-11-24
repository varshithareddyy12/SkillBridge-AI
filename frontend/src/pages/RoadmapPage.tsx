import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { roadmapAPI } from '../services/api.js';
import { CareerRoadmap, RoadmapMilestone } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

export const RoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<CareerRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [durationDays, setDurationDays] = useState<number>(60);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setIsLoading(true);
    try {
      const res = await roadmapAPI.getAll();
      if (res.data.success) {
        setRoadmaps(res.data.data.roadmaps);
        if (res.data.data.roadmaps.length > 0) {
          setSelectedRoadmap(res.data.data.roadmaps[0]);
          // Default expand the first milestone
          if (res.data.data.roadmaps[0].milestones?.[0]) {
            setExpandedMilestones({ [res.data.data.roadmaps[0].milestones[0].id]: true });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await roadmapAPI.generate({
        targetRole: user?.targetRole || 'Full Stack Software Engineer',
        durationDays,
      });

      if (res.data.success) {
        const newRoadmap = res.data.data.roadmap;
        setRoadmaps((prev) => [newRoadmap, ...prev]);
        setSelectedRoadmap(newRoadmap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    if (!selectedRoadmap) return;

    try {
      await roadmapAPI.updateMilestone(selectedRoadmap.id, milestoneId, !currentStatus);

      // Update state locally
      const updatedMilestones = selectedRoadmap.milestones.map((m) =>
        m.id === milestoneId ? { ...m, isCompleted: !currentStatus } : m
      );

      const updatedRoadmap = {
        ...selectedRoadmap,
        milestones: updatedMilestones,
      };

      setSelectedRoadmap(updatedRoadmap);
      setRoadmaps((prev) =>
        prev.map((r) => (r.id === selectedRoadmap.id ? updatedRoadmap : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your career roadmap milestones..." size="lg" />;
  }

  const completedCount = selectedRoadmap
    ? selectedRoadmap.milestones.filter((m) => m.isCompleted).length
    : 0;
  const totalCount = selectedRoadmap ? selectedRoadmap.milestones.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Generator Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Personalized Learning Roadmap</h2>
          <p className="text-xs text-gray-400 mt-1">
            Sequential milestones engineered to close your skill gaps for: <strong className="text-gray-200">{user?.targetRole || 'Full Stack Engineer'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value={30}>30 Days (Accelerated)</option>
            <option value={60}>60 Days (Comprehensive)</option>
            <option value={90}>90 Days (Deep Mastery)</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            isLoading={isGenerating}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Generate New Roadmap
          </Button>
        </div>
      </div>

      {selectedRoadmap ? (
        <div className="space-y-6">
          {/* Progress Header Card */}
          <Card className="bg-gradient-to-r from-gray-900 via-[#111827] to-[#111827]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{selectedRoadmap.title}</h3>
                  <Badge variant="cyan">{selectedRoadmap.durationDays} Days</Badge>
                </div>
                <p className="text-xs text-gray-400 max-w-2xl">{selectedRoadmap.overview}</p>
              </div>

              <div className="w-full md:w-64 shrink-0">
                <div className="flex justify-between text-xs text-gray-300 font-medium mb-1.5">
                  <span>Overall Completion</span>
                  <span className="text-indigo-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-500 mt-1 inline-block">
                  {completedCount} of {totalCount} Milestones Verified
                </span>
              </div>
            </div>
          </Card>

          {/* Milestones Timeline */}
          <div className="space-y-4">
            {selectedRoadmap.milestones.map((milestone, idx) => {
              const isExpanded = expandedMilestones[milestone.id];
              return (
                <div
                  key={milestone.id}
                  className={`border rounded-xl transition-all ${
                    milestone.isCompleted
                      ? 'bg-emerald-950/10 border-emerald-500/30'
                      : 'bg-[#111827] border-gray-800/80'
                  }`}
                >
                  {/* Milestone Header */}
                  <div
                    onClick={() => toggleExpand(milestone.id)}
                    className="p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMilestone(milestone.id, milestone.isCompleted);
                        }}
                        className="text-gray-400 hover:text-emerald-400 transition-colors shrink-0"
                      >
                        {milestone.isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-600 hover:text-gray-400" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-indigo-400 font-bold">Phase {idx + 1}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>~{milestone.estimatedDays} Days</span>
                          </span>
                        </div>
                        <h4
                          className={`text-base font-semibold truncate mt-0.5 ${
                            milestone.isCompleted ? 'text-emerald-300 line-through' : 'text-white'
                          }`}
                        >
                          {milestone.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {milestone.isCompleted && (
                        <Badge variant="emerald" size="sm">Completed</Badge>
                      )}
                      <span className="text-gray-400 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Milestone Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-gray-800/60 space-y-4 text-xs animate-fade-in">
                      <p className="text-gray-300 leading-relaxed">{milestone.description}</p>

                      {/* Topics */}
                      {milestone.topics && milestone.topics.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-200 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Curriculum Topics to Study</span>
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {milestone.topics.map((topic, tIdx) => (
                              <div
                                key={tIdx}
                                className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-2 text-gray-300"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                <span>{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Practice Projects */}
                      {milestone.projects && milestone.projects.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-200 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Hands-On Practical Build</span>
                          </h5>
                          <div className="space-y-2">
                            {milestone.projects.map((proj, pIdx) => (
                              <div key={pIdx} className="p-3 rounded-lg bg-gray-900/60 border border-gray-800">
                                <p className="font-semibold text-white">{proj.title}</p>
                                <p className="text-gray-400 mt-1">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="text-center py-16">
          <Compass className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Roadmap Generated Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-6">
            Click "Generate New Roadmap" above to create a customized milestone roadmap designed to close your skill gaps.
          </p>
          <Button variant="primary" size="md" onClick={handleGenerate} icon={<Sparkles className="w-4 h-4" />}>
            Generate Roadmap
          </Button>
        </Card>
      )}
    </div>
  );
};
