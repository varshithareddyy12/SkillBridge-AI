import React, { useState, useEffect } from 'react';
import {
  Mic,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  History,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { interviewAPI } from '../services/api.js';
import { InterviewSession } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

export const MockInterviewPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New session form
  const [category, setCategory] = useState<'TECHNICAL' | 'HR' | 'BEHAVIORAL' | 'ROLE_SPECIFIC' | 'PROJECT_BASED'>('TECHNICAL');
  const [difficulty, setDifficulty] = useState<'ENTRY' | 'MID' | 'SENIOR'>('MID');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await interviewAPI.getAll();
      if (res.data.success) {
        setSessions(res.data.data.sessions);
        if (res.data.data.sessions.length > 0 && !activeSession) {
          setActiveSession(res.data.data.sessions[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const res = await interviewAPI.startSession({
        category,
        difficulty,
        targetRole: user?.targetRole || 'Full Stack Software Engineer',
        questionCount: 5,
      });

      if (res.data.success) {
        const newSession = res.data.data.session;
        setSessions((prev) => [newSession, ...prev]);
        setActiveSession(newSession);
        setSelectedQuestionIndex(0);
        setUserAnswer('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start interview session.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeSession || !userAnswer.trim()) return;

    const currentQuestion = activeSession.questions[selectedQuestionIndex];
    if (!currentQuestion) return;

    setIsEvaluating(true);
    setError(null);
    try {
      const res = await interviewAPI.submitAnswer(activeSession.id, {
        questionId: currentQuestion.id,
        userText: userAnswer.trim(),
      });

      if (res.data.success) {
        const evalAnswer = res.data.data.answer;

        // Update local session question answers
        const updatedQuestions = activeSession.questions.map((q, idx) =>
          idx === selectedQuestionIndex
            ? { ...q, answers: [evalAnswer] }
            : q
        );

        const updatedSession = {
          ...activeSession,
          questions: updatedQuestions,
        };

        setActiveSession(updatedSession);
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSession.id ? updatedSession : s))
        );
        setUserAnswer('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to evaluate answer.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading mock interview sessions and rubric engines..." size="lg" />;
  }

  const currentQuestion = activeSession?.questions[selectedQuestionIndex];
  const currentAnswer = currentQuestion?.answers?.[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Config Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Mock Interview Studio</h2>
          <p className="text-xs text-gray-400 mt-1">
            Simulate realistic technical and behavioral interviews evaluated strictly by transparent engineering rubrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={category}
            onChange={(e: any) => setCategory(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="TECHNICAL">Technical Architecture</option>
            <option value="BEHAVIORAL">Behavioral (STAR Method)</option>
            <option value="ROLE_SPECIFIC">Role-Specific Deep Dive</option>
            <option value="PROJECT_BASED">Project Walkthrough</option>
            <option value="HR">HR & Cultural Fit</option>
          </select>

          <select
            value={difficulty}
            onChange={(e: any) => setDifficulty(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ENTRY">Entry-Level</option>
            <option value="MID">Mid-Level</option>
            <option value="SENIOR">Senior-Level</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handleStartSession}
            isLoading={isStarting}
            icon={<Sparkles className="w-4 h-4" />}
          >
            New Interview
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Index Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Session Questions ({activeSession.questions.length})
                </h3>
                <Badge variant="cyan">{activeSession.category}</Badge>
              </div>

              <div className="space-y-2">
                {activeSession.questions.map((q, idx) => {
                  const isAnswered = q.answers && q.answers.length > 0;
                  const isSelected = idx === selectedQuestionIndex;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuestionIndex(idx)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500/60 text-white font-medium'
                          : 'bg-gray-900/40 border-gray-800 text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-gray-400">Q{idx + 1}.</span>
                        <span className="truncate">{q.questionText}</span>
                      </div>

                      {isAnswered ? (
                        <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {q.answers![0].score}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {activeSession.overallScore && (
                <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Average Performance:</span>
                  <span className="font-bold text-indigo-400">{activeSession.overallScore}%</span>
                </div>
              )}
            </Card>

            {/* Rubric Criteria Explanation */}
            <Card className="p-4 space-y-2 text-xs text-gray-400">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>Evaluation Rubric</span>
              </h4>
              <p>Responses are assessed against 4 dimensions:</p>
              <ul className="space-y-1 text-gray-300">
                <li>• <strong>Relevance (30%):</strong> Addresses the core prompt</li>
                <li>• <strong>Technical (35%):</strong> Engineering accuracy & trade-offs</li>
                <li>• <strong>Clarity (20%):</strong> Structured articulation</li>
                <li>• <strong>Depth (15%):</strong> Edge cases & production experience</li>
              </ul>
            </Card>
          </div>

          {/* Question & Answer Evaluation Stage */}
          {currentQuestion && (
            <Card className="lg:col-span-2 space-y-6">
              {/* Question Banner */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    Question {selectedQuestionIndex + 1} of {activeSession.questions.length}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-gray-400">{activeSession.difficulty} Difficulty</span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {currentQuestion.questionText}
                </h3>
              </div>

              {/* If already evaluated, show scores and feedback */}
              {currentAnswer ? (
                <div className="space-y-5 animate-fade-in">
                  {/* Score breakdown pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 text-center">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Overall</span>
                      <p className="text-2xl font-black text-indigo-400 mt-0.5">{currentAnswer.score}%</p>
                    </div>
                    <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 text-center">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Technical</span>
                      <p className="text-2xl font-black text-emerald-400 mt-0.5">{currentAnswer.technicalScore}%</p>
                    </div>
                    <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 text-center">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Relevance</span>
                      <p className="text-2xl font-black text-cyan-400 mt-0.5">{currentAnswer.relevanceScore}%</p>
                    </div>
                    <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 text-center">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Clarity & Depth</span>
                      <p className="text-2xl font-black text-purple-400 mt-0.5">{currentAnswer.depthScore}%</p>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-xs text-gray-300 space-y-2">
                    <p className="font-semibold text-white">Evaluator Feedback:</p>
                    <p className="leading-relaxed">{currentAnswer.feedback}</p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-emerald-950/10 rounded-xl border border-emerald-500/20">
                      <p className="font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Key Strengths</span>
                      </p>
                      <ul className="space-y-1 text-gray-300">
                        {((currentAnswer.strengths as string[]) || []).map((s, idx) => (
                          <li key={idx}>• {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-rose-950/10 rounded-xl border border-rose-500/20">
                      <p className="font-semibold text-rose-400 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Growth Areas</span>
                      </p>
                      <ul className="space-y-1 text-gray-300">
                        {((currentAnswer.weaknesses as string[]) || []).map((w, idx) => (
                          <li key={idx}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Improvement Recommendation */}
                  <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-500/20 text-xs text-gray-300">
                    <strong className="text-indigo-400">How to elevate this answer: </strong>
                    <span>{currentAnswer.improvementSuggestions}</span>
                  </div>

                  {/* Your submitted response */}
                  <div>
                    <h5 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Your Submitted Response</h5>
                    <p className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300 whitespace-pre-wrap font-mono">
                      {currentAnswer.userText}
                    </p>
                  </div>
                </div>
              ) : (
                /* Answer input form */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Type Your Answer (Be thorough, structured, and explain technical trade-offs):
                    </label>
                    <textarea
                      rows={8}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Start articulating your answer... e.g. 'In PostgreSQL, indexing primarily uses B-Tree structures to achieve O(log N) lookup complexity. However, on write-heavy workloads...'"
                      className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-gray-500">
                      Answers are evaluated based on relevance, technical correctness, clarity, and depth.
                    </p>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSubmitAnswer}
                      isLoading={isEvaluating}
                      disabled={!userAnswer.trim()}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Submit for Evaluation
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      ) : (
        <Card className="text-center py-16">
          <Mic className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Mock Interview In Progress</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-6">
            Select a category and difficulty above, then click "New Interview" to generate interactive questions.
          </p>
          <Button variant="primary" size="md" onClick={handleStartSession} icon={<Sparkles className="w-4 h-4" />}>
            Start First Session
          </Button>
        </Card>
      )}
    </div>
  );
};
