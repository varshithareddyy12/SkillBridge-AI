import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Target,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { jobAPI } from '../services/api.js';
import { JobDescription } from '../types/index.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

export const JobAnalyzerPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [rawText, setRawText] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await jobAPI.getAll();
      if (res.data.success) {
        setJobs(res.data.data.jobs);
        if (res.data.data.jobs.length > 0 && !selectedJob) {
          setSelectedJob(res.data.data.jobs[0]);
        }
      }
    } catch (err: any) {
      setError('Failed to fetch analyzed jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) {
      setError('Job title and description text are required.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await jobAPI.create({
        title: title.trim(),
        company: company.trim() || 'Undisclosed Tech Company',
        experienceLevel,
        rawText: rawText.trim(),
      });

      if (res.data.success) {
        setSuccess(`Job "${title}" analyzed successfully!`);
        await fetchJobs();
        setSelectedJob(res.data.data.job);
        // Reset form
        setTitle('');
        setCompany('');
        setRawText('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze job description.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this job description?')) return;
    try {
      await jobAPI.delete(id);
      const updated = jobs.filter((j) => j.id !== id);
      setJobs(updated);
      setSelectedJob(updated[0] || null);
      setSuccess('Job description deleted.');
    } catch (err) {
      setError('Failed to delete job description.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Job Description Analyzer</h2>
        <p className="text-xs text-gray-400 mt-1">
          Paste any job posting to extract required technical competencies, preferred qualifications, and experience benchmarks.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Input Form Card */}
      <Card>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Analyze New Job Posting</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Job Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                required
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Google, Startup"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Target Seniority</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Entry-Level / Junior">Entry-Level / Junior (0–2 Yrs)</option>
                <option value="Mid-Level">Mid-Level (2–5 Yrs)</option>
                <option value="Senior">Senior (5+ Yrs)</option>
                <option value="Lead / Staff">Lead / Staff Architect</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Paste Job Description Text *
            </label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full job posting, responsibilities, and requirements here..."
              required
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isAnalyzing}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Analyze Requirements
            </Button>
          </div>
        </form>
      </Card>

      {/* Analyzed Jobs List & Breakdown View */}
      {isLoading ? (
        <LoadingSpinner message="Loading analyzed job inventory..." />
      ) : jobs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Saved Jobs List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Analyzed Roles ({jobs.length})
            </h3>
            {jobs.map((j) => (
              <div
                key={j.id}
                onClick={() => setSelectedJob(j)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedJob?.id === j.id
                    ? 'bg-[#151D30] border-indigo-500/60 shadow-md shadow-indigo-500/10'
                    : 'bg-[#111827] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm font-semibold text-white truncate">{j.title}</h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{j.company}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(j.id);
                    }}
                    title="Delete Job"
                    className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Job Requirements Breakdown */}
          {selectedJob && (
            <Card className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedJob.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedJob.company} • {selectedJob.experienceLevel}</p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/matches')}
                  icon={<Target className="w-4 h-4" />}
                >
                  Match With My Resumes
                </Button>
              </div>

              {/* Required Skills */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                  Mandatory Technical Skills ({(selectedJob.parsedData?.requiredSkills || []).length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedJob.parsedData?.requiredSkills || []).map((skill) => (
                    <Badge key={skill} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              {selectedJob.parsedData?.preferredSkills && selectedJob.parsedData.preferredSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                    Preferred / Nice-to-Have Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.parsedData.preferredSkills.map((skill) => (
                      <Badge key={skill} variant="cyan">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {selectedJob.parsedData?.softSkills && selectedJob.parsedData.softSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                    Soft Skills & Collaboration
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.parsedData.softSkills.map((skill) => (
                      <Badge key={skill} variant="purple">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities list */}
              {selectedJob.parsedData?.responsibilities && selectedJob.parsedData.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Key Role Responsibilities</span>
                  </h4>
                  <ul className="space-y-2 mt-2">
                    {selectedJob.parsedData.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 bg-gray-900/40 p-2.5 rounded-lg border border-gray-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
