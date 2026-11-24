import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Compass,
  Mic,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BarChart2,
  Code2,
  FileText,
  Zap,
} from 'lucide-react';
import { Button } from '../components/Button.js';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="h-20 border-b border-gray-800/80 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
              SkillBridge <span className="text-xs bg-indigo-500/20 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-500/30">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 lg:px-12 text-center max-w-5xl mx-auto flex flex-col items-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Gen Full-Stack Career Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Don’t just discover if you’re <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">job-ready</span>.
          <br className="hidden sm:inline" /> Discover exactly how to become it.
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
          The explainable career platform that analyzes resumes, calculates deterministic job match scores, prioritizes skill gaps, creates custom 30–90 day roadmaps, and conducts AI mock interviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto" icon={<ArrowRight className="w-5 h-5" />}>
              Start Career Diagnostic
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Demo Workspace
            </Button>
          </Link>
        </div>

        {/* Badges row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Free & Open-Source</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL Backed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Explainable Scoring</span>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Built for Serious Engineering Careers
          </h2>
          <p className="text-gray-400 text-base">
            No black-box guesses. SkillBridge AI combines transparent mathematical formulas with Google Gemini intelligence to give you actionable career velocity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Resume Intelligence</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Upload PDF or DOCX resumes. Automatically extract structured technical skills, experience spans, and education with full review and editing capabilities.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Explainable Matching Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Transparent, deterministic score calculations: 60% skills, 25% experience, and 15% education alignment. Understand exactly why you scored each percentage point.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Skill Gap Analysis</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Differentiate self-reported skills from resume-extracted and project-verified competencies. Pinpoint exactly what target employers demand that you lack.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">30/60/90 Day Roadmaps</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Personalized, sequential milestones designed to close your skill gaps. Track study topics, recommended resources, practice exercises, and milestone completion.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Portfolio Project Studio</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Get targeted project recommendations engineered specifically around your missing skills, complete with architectural problem statements and implementation steps.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Mock Interview Studio</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Practice Technical, HR, Behavioral, and System Design interviews. Receive transparent evaluations based on relevance, technical accuracy, clarity, and depth.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Formula Callout */}
      <section className="py-16 px-6 lg:px-12 bg-[#0F172A] border-y border-gray-800">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Transparent Formula</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Deterministic Job Matching Architecture
            </h2>
            <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
              Unlike generic LLM wrappers that fabricate a match percentage, SkillBridge AI computes scores deterministically on the backend:
            </p>
            <div className="mt-4 font-mono text-xs text-indigo-300 bg-gray-900/80 p-3.5 rounded-lg border border-gray-800">
              Score = (Skills × 60%) + (Experience × 25%) + (Education × 15%)
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            <Link to="/register">
              <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Calculate Your Match Score
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 lg:px-12 border-t border-gray-800/80 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-gray-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>SkillBridge AI &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-gray-400">
            Crafted for students, fresh graduates, and career transitioners. Zero budget friendly.
          </p>
          <div className="flex items-center gap-4 text-gray-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
