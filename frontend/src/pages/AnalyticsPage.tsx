import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { analyticsAPI } from '../services/api.js';
import { Card } from '../components/Card.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await analyticsAPI.getProgress();
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Aggregating performance trends and metrics..." size="lg" />;
  }

  const skillDistribution = analytics?.skillDistribution || [];
  const matchTrends = analytics?.matchTrends || [];
  const interviewTrends = analytics?.interviewTrends || [];
  const verificationBreakdown = analytics?.verificationBreakdown || {
    selfReported: 0,
    resumeExtracted: 0,
    projectVerified: 0,
    assessmentVerified: 0,
  };

  const verificationPieData = [
    { name: 'Self-Reported', value: verificationBreakdown.selfReported, color: '#6B7280' },
    { name: 'Resume Extracted', value: verificationBreakdown.resumeExtracted, color: '#06B6D4' },
    { name: 'Project Verified', value: verificationBreakdown.projectVerified, color: '#10B981' },
    { name: 'Assessment Verified', value: verificationBreakdown.assessmentVerified, color: '#8B5CF6' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Career Analytics & Velocity</h2>
        <p className="text-xs text-gray-400 mt-1">
          Quantitative telemetry calculated from your real PostgreSQL database records.
        </p>
      </div>

      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Score Trends Over Time */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Job Match Score Trajectory</span>
              </h3>
              <Badge variant="primary">Historical Analysis</Badge>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Track how your overall match percentage progresses as you add skills and optimize experience.
            </p>

            <div className="h-64 w-full">
              {matchTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={matchTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="jobTitle" stroke="#6B7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6B7280" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#E5E7EB', fontSize: '12px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="overallScore" name="Overall Match %" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="skillScore" name="Skills Score %" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-500">
                  Run job match analyses to view historical trajectory.
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Verification Source Distribution */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Skill Verification Distribution</span>
              </h3>
              <Badge variant="emerald">Trust Matrix</Badge>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Breakdown of how your skills were validated across self-entry, resume ATS, and project proof.
            </p>

            <div className="h-64 w-full flex items-center justify-center">
              {verificationPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={verificationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {verificationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#E5E7EB', fontSize: '12px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-500">
                  No skills in database to calculate distribution.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Category Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Competencies by Domain</span>
            </h3>
            <Badge variant="cyan">Skill Clusters</Badge>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Count of technical skills identified across categories (Frontend, Backend, Database, Cloud, etc.)
          </p>

          <div className="h-64 w-full">
            {skillDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="category" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#E5E7EB', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Skills Count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                Upload a resume to populate domain distribution.
              </div>
            )}
          </div>
        </Card>

        {/* Mock Interview Performance */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Mock Interview Rubric Performance</span>
            </h3>
            <Badge variant="purple">Rubric History</Badge>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Chronological scores achieved across Technical, Behavioral, and HR mock interviews.
          </p>

          <div className="h-64 w-full">
            {interviewTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interviewTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="category" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#E5E7EB', fontSize: '12px' }}
                  />
                  <Bar dataKey="score" name="Rubric Score %" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                Complete mock interviews to track your rubric evaluations.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
