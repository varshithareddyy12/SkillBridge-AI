import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Compass,
  ArrowRight,
  TrendingUp,
  Layers,
  Award,
} from 'lucide-react';
import { matchAPI, resumeAPI, jobAPI } from '../services/api.js';
import { MatchReport, Resume, JobDescription } from '../types/index.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

export const MatchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<MatchReport[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchReport | null>(null);

  // Selector form state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resumesRes, jobsRes, matchesRes] = await Promise.all([
        resumeAPI.getAll(),
        jobAPI.getAll(),
        matchAPI.getAll(),
      ]);

      if (resumesRes.data.success) {
        setResumes(resumesRes.data.data.resumes);
        if (resumesRes.data.data.resumes.length > 0) {
          const primary = resumesRes.data.data.resumes.find((r: Resume) => r.isPrimary);
          setSelectedResumeId(primary ? primary.id : resumesRes.data.data.resumes[0].id);
        }
      }

      if (jobsRes.data.success) {
        setJobs(jobsRes.data.data.jobs);
        if (jobsRes.data.data.jobs.length > 0) {
          setSelectedJobId(jobsRes.data.data.jobs[0].id);
        }
      }

      if (matchesRes.data.success) {
        setMatches(matchesRes.data.data.matches);
        const urlId = searchParams.get('id');
        if (urlId) {
          const found = matchesRes.data.data.matches.find((m: MatchReport) => m.id === urlId);
          if (found) setSelectedMatch(found);
        } else if (matchesRes.data.data.matches.length > 0) {
          setSelectedMatch(matchesRes.data.data.matches[0]);
        }
      }
    } catch (err) {
      setError('Failed to load matching engine data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunMatch = async () => {
    if (!selectedResumeId || !selectedJobId) {
      setError('Please select both a resume and a job description to calculate match score.');
      return;
    }

    setIsMatching(true);
    setError(null);
    try {
      const res = await matchAPI.analyze({
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId,
      });

      if (res.data.success) {
        const newReport = res.data.data.matchReport;
        setMatches((prev) => [newReport, ...prev]);
        setSelectedMatch(newReport);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Match calculation failed.');
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading match records and formulas..." size="lg" />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Intelligent Job Matching Engine</h2>
          <p className="text-xs text-gray-400 mt-1">
            Explainable, deterministic match calculation based on 60% skills, 25% experience, and 15% education alignment.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaModal(true)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          <span>How Match Score is Calculated</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Match Runner Card */}
      <Card className="bg-gradient-to-r from-gray-900 via-[#111827] to-[#111827] border-gray-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <span>Run Explainable Match Calculation</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Select Resume</label>
            {resumes.length > 0 ? (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} {r.isPrimary ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-400 py-2">Please upload a resume first.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Select Target Job</label>
            {jobs.length > 0 ? (
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.company})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-400 py-2">Please analyze a job description first.</p>
            )}
          </div>

          <div>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              disabled={resumes.length === 0 || jobs.length === 0}
              isLoading={isMatching}
              onClick={handleRunMatch}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Compute Explainable Match
            </Button>
          </div>
        </div>
      </Card>

      {/* Match Report Detail */}
      {selectedMatch ? (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="flex flex-col items-center justify-center p-6 text-center border-indigo-500/30 bg-[#131A2D]">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                Overall Match Score
              </span>
              <span className="text-5xl font-black text-white">{selectedMatch.overallMatchScore}%</span>
              <span className="text-xs text-gray-400 mt-2">Deterministic Calculation</span>
            </Card>

            <Card className="flex flex-col justify-center p-5">
              <span className="text-xs text-gray-400 uppercase font-medium">Skills Alignment (60%)</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1">{selectedMatch.skillMatchScore}%</span>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedMatch.skillMatchScore}%` }} />
              </div>
            </Card>

            <Card className="flex flex-col justify-center p-5">
              <span className="text-xs text-gray-400 uppercase font-medium">Experience Ratio (25%)</span>
              <span className="text-2xl font-bold text-cyan-400 mt-1">{selectedMatch.experienceMatchScore}%</span>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${selectedMatch.experienceMatchScore}%` }} />
              </div>
            </Card>

            <Card className="flex flex-col justify-center p-5">
              <span className="text-xs text-gray-400 uppercase font-medium">Education Alignment (15%)</span>
              <span className="text-2xl font-bold text-purple-400 mt-1">{selectedMatch.educationMatchScore}%</span>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${selectedMatch.educationMatchScore}%` }} />
              </div>
            </Card>
          </div>

          {/* Mathematical Proof Box */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 text-xs font-mono text-gray-300 flex items-center justify-between flex-wrap gap-2">
            <div>
              <strong className="text-indigo-400">Deterministic Mathematical Proof: </strong>
              <span>{selectedMatch.breakdown.formulaExplanation}</span>
            </div>
            <Badge variant="primary">No Hallucinations</Badge>
          </div>

          {/* Skills Breakdown Grid (Matched vs Partial vs Missing) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matched Skills */}
            <Card className="border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">
                  Fully Matched Skills ({selectedMatch.matchedSkills.length})
                </h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">Exact competencies validated in your profile.</p>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.matchedSkills.map((s) => (
                  <Badge key={s} variant="emerald">
                    {s}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Partially Matched Skills */}
            <Card className="border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white text-sm">
                  Partially Matched Skills ({selectedMatch.partialSkills.length})
                </h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">Adjacent technologies or foundational family knowledge.</p>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.partialSkills.length > 0 ? (
                  selectedMatch.partialSkills.map((s) => (
                    <Badge key={s} variant="amber">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">None</p>
                )}
              </div>
            </Card>

            {/* Missing Skills */}
            <Card className="border-rose-500/20">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-rose-400" />
                <h4 className="font-bold text-white text-sm">
                  Missing Skill Gaps ({selectedMatch.missingSkills.length})
                </h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">Primary barriers holding back a 100% match score.</p>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.missingSkills.length > 0 ? (
                  selectedMatch.missingSkills.map((s) => (
                    <Badge key={s} variant="rose">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-emerald-400">Zero critical gaps found!</p>
                )}
              </div>
            </Card>
          </div>

          {/* Actionable Recommendations */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Actionable Recommendations to Elevate Your Score</span>
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/roadmaps')}
                icon={<Compass className="w-4 h-4" />}
              >
                Generate Tailored Roadmap
              </Button>
            </div>

            <div className="space-y-3">
              {selectedMatch.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-100">{rec.title}</span>
                      <Badge
                        variant={rec.priority === 'HIGH' ? 'rose' : rec.priority === 'MEDIUM' ? 'amber' : 'gray'}
                        size="sm"
                      >
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500 text-sm">
          Select a resume and job above, then click "Compute Explainable Match" to generate a detailed report.
        </div>
      )}

      {/* Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <span>SkillBridge AI Scoring Architecture</span>
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed">
              We reject arbitrary AI-generated numbers. SkillBridge calculates match percentage using a deterministic mathematical model:
            </p>

            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <strong className="text-white">1. Technical Skills (60% Weight):</strong>
                <p className="text-gray-400 mt-1">Exact matches score 1.0, partial / technology-family matches score 0.6, missing score 0. Preferred skills add up to +10 bonus points.</p>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <strong className="text-white">2. Practical Experience (25% Weight):</strong>
                <p className="text-gray-400 mt-1">Ratio of verified candidate years to job required years (capped at 100%).</p>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <strong className="text-white">3. Education Alignment (15% Weight):</strong>
                <p className="text-gray-400 mt-1">Evaluates degree alignment against job requirements with structured baseline scoring.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowFormulaModal(false)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
