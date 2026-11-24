import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  X,
  Briefcase,
  GraduationCap,
  Code2,
} from 'lucide-react';
import { resumeAPI } from '../services/api.js';
import { Resume } from '../types/index.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import { EmptyState } from '../components/EmptyState.js';

export const ResumeManagerPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit skill dialog state
  const [isEditingSkills, setIsEditingSkills] = useState<boolean>(false);
  const [newSkillName, setNewSkillName] = useState<string>('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const res = await resumeAPI.getAll();
      if (res.data.success) {
        setResumes(res.data.data.resumes);
        if (res.data.data.resumes.length > 0 && !selectedResume) {
          setSelectedResume(res.data.data.resumes[0]);
        }
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to fetch resumes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds 5MB maximum size limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await resumeAPI.upload(formData);
      if (res.data.success) {
        setSuccessMessage(`Resume "${file.name}" uploaded and parsed successfully!`);
        await fetchResumes();
        setSelectedResume(res.data.data.resume);
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to process resume file.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumeAPI.delete(id);
      setSuccessMessage('Resume removed.');
      const updated = resumes.filter((r) => r.id !== id);
      setResumes(updated);
      setSelectedResume(updated[0] || null);
    } catch (err: any) {
      setUploadError('Failed to delete resume.');
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await resumeAPI.update(id, { isPrimary: true });
      setResumes((prev) =>
        prev.map((r) => ({
          ...r,
          isPrimary: r.id === id,
        }))
      );
      if (selectedResume?.id === id) {
        setSelectedResume({ ...selectedResume, isPrimary: true });
      }
      setSuccessMessage('Primary resume updated.');
    } catch (err: any) {
      setUploadError('Failed to set primary resume.');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim() || !selectedResume) return;

    const currentSkills = selectedResume.parsedData.skills || [];
    const updatedSkills = [
      ...currentSkills,
      { name: newSkillName.trim(), category: 'Technical', proficiency: 'INTERMEDIATE' as const },
    ];

    const updatedParsedData = {
      ...selectedResume.parsedData,
      skills: updatedSkills,
    };

    try {
      const res = await resumeAPI.update(selectedResume.id, {
        parsedData: updatedParsedData,
      });
      if (res.data.success) {
        setSelectedResume(res.data.data.resume);
        setResumes((prev) =>
          prev.map((r) => (r.id === selectedResume.id ? res.data.data.resume : r))
        );
        setNewSkillName('');
      }
    } catch (err) {
      setUploadError('Failed to update skill profile.');
    }
  };

  const handleRemoveSkill = async (skillNameToRemove: string) => {
    if (!selectedResume) return;

    const currentSkills = selectedResume.parsedData.skills || [];
    const updatedSkills = currentSkills.filter((s) => s.name !== skillNameToRemove);

    const updatedParsedData = {
      ...selectedResume.parsedData,
      skills: updatedSkills,
    };

    try {
      const res = await resumeAPI.update(selectedResume.id, {
        parsedData: updatedParsedData,
      });
      if (res.data.success) {
        setSelectedResume(res.data.data.resume);
        setResumes((prev) =>
          prev.map((r) => (r.id === selectedResume.id ? res.data.data.resume : r))
        );
      }
    } catch (err) {
      setUploadError('Failed to remove skill.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Upload Zone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Resume Intelligence</h2>
          <p className="text-xs text-gray-400 mt-1">
            Upload PDF or DOCX resumes. Our parser generates structured ATS profiles with editable skills.
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="cursor-pointer shrink-0">
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            variant="primary"
            size="md"
            isLoading={isUploading}
            icon={<UploadCloud className="w-4 h-4" />}
          >
            Upload New Resume
          </Button>
        </label>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner message="Loading your resume inventory..." />
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No Resumes Uploaded Yet"
          description="Upload your current resume in PDF or DOCX format to parse your skills, background, and match scores."
          actionLabel="Upload PDF / DOCX"
          onAction={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume List sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Your Resumes ({resumes.length})
            </h3>
            {resumes.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedResume(r)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedResume?.id === r.id
                    ? 'bg-[#151D30] border-indigo-500/60 shadow-md shadow-indigo-500/10'
                    : 'bg-[#111827] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                      {r.isPrimary && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-500/30">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{r.fileName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!r.isPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(r.id);
                      }}
                      title="Set as Primary"
                      className="p-1.5 text-gray-400 hover:text-amber-400 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(r.id);
                    }}
                    title="Delete Resume"
                    className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Resume Detailed Profile View */}
          {selectedResume && (
            <Card className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {selectedResume.parsedData?.fullName || selectedResume.title}
                    </h3>
                    {selectedResume.isPrimary && (
                      <Badge variant="primary">Default Primary</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedResume.parsedData?.email} • {selectedResume.parsedData?.location || 'Remote'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="cyan">
                    {selectedResume.parsedData?.totalYearsExperience || 1}+ Years Exp
                  </Badge>
                  <Badge variant="purple">
                    {selectedResume.parsedData?.highestDegree || "Bachelor's Degree"}
                  </Badge>
                </div>
              </div>

              {/* Professional Summary */}
              {selectedResume.parsedData?.summary && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Professional Summary</h4>
                  <p className="text-xs sm:text-sm text-gray-300 bg-gray-900/50 p-3.5 rounded-xl border border-gray-800/80 leading-relaxed">
                    {selectedResume.parsedData.summary}
                  </p>
                </div>
              )}

              {/* Extracted Skills Section with Inline Add / Delete */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span>Identified Skills ({(selectedResume.parsedData?.skills || []).length})</span>
                  </h4>
                  <button
                    onClick={() => setIsEditingSkills((prev) => !prev)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingSkills ? 'Done Editing' : 'Edit Skills'}</span>
                  </button>
                </div>

                {isEditingSkills && (
                  <div className="flex items-center gap-2 mb-3 animate-slide-up">
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="Add a new skill (e.g. Docker, GraphQL)"
                      className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <Button variant="primary" size="sm" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(selectedResume.parsedData?.skills || []).map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900/90 text-gray-200 border border-gray-700 rounded-lg text-xs font-medium"
                    >
                      <span>{skill.name}</span>
                      {isEditingSkills && (
                        <button
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-gray-400 hover:text-rose-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Highlights */}
              {selectedResume.parsedData?.experience && selectedResume.parsedData.experience.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span>Experience History</span>
                  </h4>
                  <div className="space-y-3">
                    {selectedResume.parsedData.experience.map((exp, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-sm font-semibold text-white">{exp.title}</h5>
                            <p className="text-xs text-gray-400">{exp.company}</p>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {exp.startDate || '2023'} – {exp.endDate || 'Present'}
                          </span>
                        </div>
                        {exp.description && <p className="text-xs text-gray-400 mt-2">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Highlights */}
              {selectedResume.parsedData?.education && selectedResume.parsedData.education.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>Education</span>
                  </h4>
                  <div className="space-y-3">
                    {selectedResume.parsedData.education.map((edu, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-semibold text-white">{edu.degree}</h5>
                          <p className="text-xs text-gray-400">{edu.institution}</p>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono">{edu.graduationYear || '2024'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
