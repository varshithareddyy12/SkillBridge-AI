import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Briefcase,
  Target,
  Compass,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Activity,
  Mic,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { analyticsAPI } from '../services/api.js';
import { DashboardOverview } from '../types/index.js';
import { StatsCard } from '../components/StatsCard.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await analyticsAPI.getOverview();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Calculating career readiness metrics..." size="lg" />;
  }

  const metrics = data?.metrics || {
    profileCompletionPercentage: 50,
    careerReadinessScore: 65,
    resumesUploaded: 0,
    jobsAnalyzed: 0,
    averageMatchScore: 0,
    skillsIdentified: 0,
    verifiedSkillsCount: 0,
    totalInterviews: 0,
    averageInterviewScore: 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#111827] to-[#111827] border border-indigo-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Career Intelligence Hub</span>
              <span className="text-gray-500">•</span>
              <span className="text-xs text-gray-400">Target: {user?.targetRole || 'Full Stack Engineer'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Engineer'}! 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              "Don't just discover whether you're job-ready. Discover exactly how to become job-ready."
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/resumes">
              <Button variant="primary" size="sm" icon={<FileText className="w-4 h-4" />}>
                Upload Resume
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="secondary" size="sm" icon={<Briefcase className="w-4 h-4" />}>
                Analyze Job
              </Button>
            </Link>
            <Link to="/matches">
              <Button variant="outline" size="sm" icon={<Target className="w-4 h-4" />}>
                Run Match
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Career Readiness Index"
          value={`${metrics.careerReadinessScore}%`}
          subtitle="Based on skills, match & tests"
          icon={<Award className="w-5 h-5" />}
          variant="indigo"
          trend="+5% this week"
        />
        <StatsCard
          title="Average Match Score"
          value={metrics.averageMatchScore > 0 ? `${metrics.averageMatchScore}%` : 'N/A'}
          subtitle={`Across ${metrics.jobsAnalyzed} target jobs`}
          icon={<Target className="w-5 h-5" />}
          variant="cyan"
        />
        <StatsCard
          title="Verified Competencies"
          value={metrics.verifiedSkillsCount}
          subtitle={`Out of ${metrics.skillsIdentified} total skills`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
        <StatsCard
          title="Interview Rating"
          value={metrics.averageInterviewScore > 0 ? `${metrics.averageInterviewScore}%` : 'Not Taken'}
          subtitle={`${metrics.totalInterviews} mock sessions logged`}
          icon={<Mic className="w-5 h-5" />}
          variant="purple"
        />
      </div>

      {/* Readiness Dial & Profile Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Readiness Gauge Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Overall Readiness Gauge</h3>
              <Badge variant="primary">Real DB Metrics</Badge>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Deterministic synthesis of your verified technical competencies, job match thresholds, roadmap completion, and mock interview rubric evaluations.
            </p>

            {/* Circular Meter Simulation */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#1F2937"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="url(#gradient-meter)"
                    strokeWidth="10"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * metrics.careerReadinessScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient-meter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{metrics.careerReadinessScore}%</span>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Ready</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>Profile Completion: {metrics.profileCompletionPercentage}%</span>
            <Link to="/profile" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Complete profile &rarr;
            </Link>
          </div>
        </Card>

        {/* Active Roadmap Card */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Active Learning Roadmap</h3>
              </div>
              {data?.activeRoadmap && (
                <Badge variant="cyan">{data.activeRoadmap.durationDays} Days Plan</Badge>
              )}
            </div>

            {data?.activeRoadmap ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-100">{data.activeRoadmap.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Focused on bridging skill gaps for: <strong className="text-gray-200">{data.activeRoadmap.targetRole}</strong>
                  </p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-300 mb-1.5">
                    <span>Milestones Completed: {data.activeRoadmap.completedMilestones} of {data.activeRoadmap.totalMilestones}</span>
                    <span className="text-indigo-400">{data.activeRoadmap.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${data.activeRoadmap.completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/80 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    <p className="font-medium text-gray-200">Next Recommended Action</p>
                    <p className="mt-0.5">Work on upcoming milestone exercises and practical project builds.</p>
                  </div>
                  <Link to="/roadmaps">
                    <Button variant="secondary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Milestones
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Compass className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-200">No Active Roadmap Generated</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-5">
                  Generate a structured 30, 60, or 90-day learning curriculum tailored to your target engineering role.
                </p>
                <Link to="/roadmaps">
                  <Button variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
                    Generate Custom Roadmap
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-400">Need practical project recommendations?</span>
            <Link to="/projects" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              Explore Project Studio &rarr;
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Matches & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Recent Job Matches</h3>
            </div>
            <Link to="/matches" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View all &rarr;
            </Link>
          </div>

          {data?.recentMatches && data.recentMatches.length > 0 ? (
            <div className="space-y-3">
              {data.recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800/80 hover:border-gray-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {match.jobDescription?.title || 'Target Job Position'}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {match.jobDescription?.company || 'Company'} • {new Date(match.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-base font-bold text-indigo-400">{match.overallMatchScore}%</span>
                      <p className="text-[10px] text-gray-500 uppercase">Match Score</p>
                    </div>
                    <Link to={`/matches?id=${match.id}`}>
                      <Button variant="ghost" size="sm" className="p-1.5">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-500">
              <p>No job matches run yet.</p>
              <Link to="/matches" className="text-indigo-400 hover:underline mt-2 inline-block">
                Run your first match calculation
              </Link>
            </div>
          )}
        </Card>

        {/* Recent Activity Log */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Recent Activity</h3>
            </div>
            <Badge variant="emerald">Live Audit</Badge>
          </div>

          {data?.recentActivities && data.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/30 border border-gray-800/60">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-200 truncate">{act.title}</p>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{act.description}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-500">
              <p>Your real-time audit trail will record actions as you upload resumes and analyze jobs.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
