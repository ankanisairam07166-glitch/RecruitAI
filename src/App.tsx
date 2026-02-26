import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Plus, 
  Users, 
  Clock, 
  ChevronRight, 
  BrainCircuit, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Code,
  Layout,
  ArrowLeft,
  Search,
  Sparkles
} from 'lucide-react';
import { Exam, Question, Submission } from './types';
import { generateQuestions, suggestTopics } from './services/geminiService';

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }: any) => {
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
    secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
    ghost: 'text-zinc-600 hover:bg-zinc-100',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

// --- Views ---

const LandingView = ({ onSelectRole }: { onSelectRole: (role: 'recruiter' | 'candidate') => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#E4E3E0] p-6">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full text-center space-y-8"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-zinc-300 rounded-full text-xs font-mono uppercase tracking-wider text-zinc-500">
        <BrainCircuit size={14} />
        Powered by Gemini AI
      </div>
      <h1 className="text-6xl md:text-8xl font-serif italic tracking-tight text-zinc-900 leading-none">
        RecruitAI
      </h1>
      <p className="text-xl text-zinc-600 max-w-2xl mx-auto font-sans">
        The next-generation examination platform for high-stakes software recruitment. 
        Automated proctoring, AI-driven evaluation, and enterprise-grade security.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4 mt-12">
        <button 
          onClick={() => onSelectRole('recruiter')}
          className="group relative p-8 bg-zinc-900 text-white rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95"
        >
          <Layout className="mb-4 text-zinc-400 group-hover:text-white transition-colors" size={32} />
          <h3 className="text-2xl font-medium mb-2">Recruiter Portal</h3>
          <p className="text-zinc-400 text-sm">Create exams, manage candidates, and view AI-analyzed results.</p>
          <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={24} />
          </div>
        </button>

        <button 
          onClick={() => onSelectRole('candidate')}
          className="group relative p-8 bg-white border border-zinc-300 text-zinc-900 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95"
        >
          <ClipboardList className="mb-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" size={32} />
          <h3 className="text-2xl font-medium mb-2">Candidate Portal</h3>
          <p className="text-zinc-500 text-sm">Take your assigned recruitment exam in a secure environment.</p>
          <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={24} />
          </div>
        </button>
      </div>
    </motion.div>
  </div>
);

const RecruiterDashboard = ({ onNewExam, onBack, onViewResults }: { onNewExam: () => void; onBack: () => void; onViewResults: (exam: Exam) => void }) => {
  const [exams, setExams] = useState<(Exam & { candidate_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => {
        setExams(data);
        setLoading(false);
      });
  }, []);

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    exam.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F4] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-4 transition-colors">
              <ArrowLeft size={16} />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
            <h2 className="text-4xl font-serif italic text-zinc-900">Recruitment Hub</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all w-64"
              />
            </div>
            <Button onClick={onNewExam} icon={Plus}>Create Job Role</Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-zinc-200 animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredExams.map(exam => (
              <Card key={exam.id} className="hover:border-zinc-400 transition-colors cursor-pointer group flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                      <ClipboardList size={20} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                        ID: {exam.id.slice(0, 8)}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = `${window.location.origin}?examId=${exam.id}`;
                          navigator.clipboard.writeText(link);
                          alert('Exam link copied to clipboard!');
                        }}
                        className="p-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-all flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider"
                      >
                        <Plus size={12} />
                        Copy Link
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900 mb-2">{exam.title}</h3>
                  <p className="text-zinc-500 text-sm line-clamp-2 mb-4">{exam.description}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {exam.duration}m
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      {exam.candidate_count} Candidates
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onViewResults(exam)}
                  className="w-full px-6 py-3 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center group-hover:bg-zinc-100 transition-colors text-left"
                >
                  <span className="text-xs font-medium text-zinc-600">View Results</span>
                  <ChevronRight size={14} className="text-zinc-400" />
                </button>
              </Card>
            ))}
            {filteredExams.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
                <p className="text-zinc-400">
                  {searchTerm ? `No exams found matching "${searchTerm}"` : 'No exams created yet. Start by creating your first recruitment test.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CreateExamView = ({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [savedExamId, setSavedExamId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length > 3 && !topic) {
        setIsSuggesting(true);
        try {
          const suggestions = await suggestTopics(title);
          setTopic(suggestions);
        } catch (error) {
          console.error("Failed to suggest topics:", error);
        } finally {
          setIsSuggesting(false);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title]);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const generated = await generateQuestions(topic, 20);
      setQuestions(generated.map((q, i) => ({ ...q, id: crypto.randomUUID() })));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    const examId = crypto.randomUUID();
    const exam: Exam = {
      id: examId,
      title,
      description: `Exam on ${topic}`,
      duration,
      questions: questions as Question[]
    };

    await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam)
    });
    setSavedExamId(examId);
  };

  const examLink = `${window.location.origin}?examId=${savedExamId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(examLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (savedExamId) {
    return (
      <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full p-12 text-center space-y-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-serif italic">Exam Created!</h2>
              <p className="text-zinc-500">Share this link with your candidates to start the assessment.</p>
            </div>
            
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-3">
              <input 
                readOnly 
                value={examLink} 
                className="flex-1 bg-transparent text-xs font-mono text-zinc-600 focus:outline-none"
              />
              <button 
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-all ${isCopied ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
              >
                {isCopied ? <CheckCircle2 size={16} /> : <ClipboardList size={16} />}
              </button>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button onClick={onSave} className="w-full">Go to Dashboard</Button>
              <Button variant="secondary" onClick={() => {
                setSavedExamId(null);
                setTitle('');
                setTopic('');
                setQuestions([]);
              }} className="w-full">Create Another</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F4] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button onClick={onCancel} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-4 transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Cancel</span>
          </button>
          <h2 className="text-4xl font-serif italic text-zinc-900">Create Exam</h2>
        </div>

        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Job Role / Position</label>
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Senior Python Developer"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Technical Topics</label>
              <div className="relative">
                <input 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder={isSuggesting ? "Suggesting topics..." : "e.g. Django, Fast API, SQL"}
                  className={`w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all ${isSuggesting ? 'opacity-50' : ''}`}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <BrainCircuit size={20} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Duration (Minutes)</label>
              <input 
                type="number"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Sample Questions ({questions.length})</label>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center text-xs font-mono font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${q.type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {q.type}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">{q.points} Points</span>
                    </div>
                    <p className="text-sm text-zinc-700 line-clamp-2">{q.content}</p>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
                  <p className="text-zinc-400 text-sm">Enter technical topics and click the brain icon to see sample questions.</p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 italic">Note: These are sample questions. Each candidate will receive a unique set of 20 questions generated on-the-fly based on your topics.</p>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button disabled={!title || questions.length === 0} onClick={handleSave}>Save Exam</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const CandidatePortal = ({ onBack }: { onBack: () => void }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/exams').then(res => res.json()).then(data => {
      setExams(data);
      const params = new URLSearchParams(window.location.search);
      const examId = params.get('examId');
      if (examId) {
        const exam = data.find((e: Exam) => e.id === examId);
        if (exam) setSelectedExam(exam);
      }
    });
  }, []);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (isStarted && timeLeft === 0) {
      handleSubmit();
    }
  }, [isStarted, timeLeft]);

  const handleStart = async (exam: Exam) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      // Generate unique questions for this candidate based on exam description/topic
      let topic = exam.description.replace('Exam on ', '').trim();
      if (!topic || topic.length < 3) {
        topic = exam.title;
      }
      // If still too short, add some context
      if (topic.length < 5) {
        topic = `${topic} Technical Assessment`;
      }
      
      const generated = await generateQuestions(topic, 20);
      
      if (!generated || generated.length === 0) {
        throw new Error("No questions were generated. Please try again.");
      }

      const questionsWithIds = generated.map(q => ({ ...q, id: crypto.randomUUID() })) as Question[];
      
      setSessionQuestions(questionsWithIds);
      setSelectedExam(exam);
      setTimeLeft(exam.duration * 60);
      setIsStarted(true);
    } catch (error: any) {
      console.error("Failed to generate unique questions:", error);
      setGenerationError(error.message || "Failed to prepare your unique exam. This might be due to a temporary connection issue.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedExam) return;
    
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        exam_id: selectedExam.id,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        questions: sessionQuestions,
        answers
      })
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    const isDirectLink = !!new URLSearchParams(window.location.search).get('examId');
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full p-12 space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-serif italic">Congratulations, your exam is complete</h2>
            <p className="text-zinc-600">Your assessment has been successfully submitted. You may now close this window.</p>
            {!isDirectLink ? (
              <Button onClick={onBack} className="w-full">Return to Home</Button>
            ) : (
              <Button onClick={() => window.close()} className="w-full">Close Window</Button>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isGenerating || generationError) {
    return (
      <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md space-y-6">
          {isGenerating ? (
            <>
              <div className="w-20 h-20 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={24} className="text-zinc-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={10} />
                  Gemini AI Powered
                </div>
                <h2 className="text-2xl font-serif italic">Preparing Your Unique Exam</h2>
                <p className="text-zinc-500 text-sm">Crafting a custom set of questions just for you...</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif italic text-red-600">Generation Failed</h2>
                <p className="text-zinc-500 text-sm">{generationError}</p>
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <Button onClick={() => selectedExam && handleStart(selectedExam)} className="w-full">Try Again</Button>
                <Button variant="secondary" onClick={() => {
                  setGenerationError(null);
                  setSelectedExam(null);
                }} className="w-full">Go Back</Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  if (isStarted && selectedExam) {
    const q = sessionQuestions[currentQuestionIdx];
    if (!q) return <div className="p-20 text-center">Loading questions...</div>;
    
    const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const rs = s % 60;
      return `${m}:${rs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="min-h-screen bg-[#F5F5F4] flex flex-col">
        {/* Header */}
        <header className="bg-white border-bottom border-zinc-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-serif italic text-xl">R</div>
            <div>
              <h3 className="font-medium text-zinc-900">{selectedExam.title}</h3>
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">{candidateName}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-zinc-100 text-zinc-900'}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Question Nav */}
          <div className="md:col-span-1 space-y-4">
            <Card className="p-4">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-4">Questions</h4>
              <div className="grid grid-cols-4 gap-2">
                {sessionQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-full aspect-square rounded-lg border flex items-center justify-center text-xs font-mono transition-all
                      ${currentQuestionIdx === idx ? 'bg-zinc-900 text-white border-zinc-900' : 
                        answers[sessionQuestions[idx].id] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </Card>
            <Button variant="danger" className="w-full" onClick={handleSubmit} icon={Send}>Submit Exam</Button>
          </div>

          {/* Question Content */}
          <div className="md:col-span-3">
            <Card className="p-8 min-h-[500px] flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 bg-zinc-100 rounded text-zinc-500">
                  Question {currentQuestionIdx + 1} of {sessionQuestions.length}
                </span>
                <span className="text-xs font-mono text-zinc-400">{q.points} Points</span>
              </div>

              <div className="flex-1">
                <h3 className="text-xl text-zinc-900 mb-8 leading-relaxed whitespace-pre-wrap">{q.content}</h3>

                {q.type === 'mcq' ? (
                  <div className="space-y-3">
                    {q.options?.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 group
                          ${answers[q.id] === opt ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono
                          ${answers[q.id] === opt ? 'bg-white/20 border-white/40' : 'bg-zinc-50 border-zinc-200 group-hover:border-zinc-300'}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
                      <Code size={14} />
                      Solution Editor
                    </div>
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Write your code here..."
                      className="w-full h-64 p-4 rounded-xl border border-zinc-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-100 flex justify-between">
                <Button 
                  variant="secondary" 
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant={currentQuestionIdx === sessionQuestions.length - 1 ? 'primary' : 'secondary'}
                  onClick={() => {
                    if (currentQuestionIdx < sessionQuestions.length - 1) {
                      setCurrentQuestionIdx(prev => prev + 1);
                    } else {
                      handleSubmit();
                    }
                  }}
                >
                  {currentQuestionIdx === sessionQuestions.length - 1 ? 'Finish' : 'Next Question'}
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F4] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <button 
            onClick={onBack} 
            className={`flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-4 transition-colors ${new URLSearchParams(window.location.search).get('examId') ? 'invisible' : ''}`}
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
          <h2 className="text-4xl font-serif italic text-zinc-900">Candidate Portal</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Candidate Info</h3>
              <div className="space-y-3">
                <input 
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <input 
                  value={candidateEmail}
                  onChange={e => setCandidateEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={18} />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Ensure your information matches your application. Once started, the timer cannot be paused.
                </p>
              </div>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              {selectedExam ? "Selected Position" : "Available Positions"}
            </h3>
            <div className="space-y-3">
              {selectedExam ? (
                <Card className="p-8 space-y-6 border-2 border-zinc-900">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="text-2xl font-serif italic text-zinc-900">{selectedExam.title}</h4>
                      <p className="text-zinc-500 text-sm">{selectedExam.description}</p>
                    </div>
                    <div className="p-3 bg-zinc-100 rounded-xl text-zinc-900">
                      <ClipboardList size={24} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Duration</label>
                      <div className="flex items-center gap-2 text-zinc-900 font-medium">
                        <Clock size={16} />
                        {selectedExam.duration} Minutes
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Assessment</label>
                      <div className="flex items-center gap-2 text-zinc-900 font-medium">
                        <Users size={16} />
                        Unique AI Session
                      </div>
                    </div>
                  </div>

                  <Button 
                    disabled={!candidateName || !candidateEmail} 
                    onClick={() => handleStart(selectedExam)} 
                    className="w-full py-4 text-lg"
                    icon={ChevronRight}
                  >
                    Start Assessment
                  </Button>
                  
                  {!new URLSearchParams(window.location.search).get('examId') && (
                    <button 
                      onClick={() => setSelectedExam(null)}
                      className="w-full text-xs font-mono text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      Change Position
                    </button>
                  )}
                </Card>
              ) : (
                <>
                  {exams.map(exam => (
                    <Card key={exam.id} className="p-6 flex justify-between items-center group">
                      <div>
                        <h4 className="font-medium text-zinc-900 mb-1">{exam.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                          <span className="flex items-center gap-1"><Clock size={12} /> {exam.duration}m</span>
                          <span className="text-emerald-600 font-bold">AI Dynamic Session</span>
                        </div>
                      </div>
                      <Button 
                        variant="secondary" 
                        onClick={() => setSelectedExam(exam)}
                        icon={ChevronRight}
                      >
                        Select Role
                      </Button>
                    </Card>
                  ))}
                  {exams.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
                      <p className="text-zinc-400">No exams are currently active.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultsView = ({ exam, onBack }: { exam: Exam; onBack: () => void }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetch(`/api/submissions/${exam.id}`)
      .then(res => res.json())
      .then(data => {
        setSubmissions(data);
        setLoading(false);
      });
  }, [exam.id]);

  return (
    <div className="min-h-screen bg-[#F5F5F4] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-4 transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <h2 className="text-4xl font-serif italic text-zinc-900">Results: {exam.title}</h2>
          <p className="text-zinc-500 mt-2">Viewing all candidate submissions for this assessment.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-200 animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Card className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400">Candidate</th>
                      <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400">Status</th>
                      <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400">Score</th>
                      <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400">Date</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {submissions.map(sub => (
                      <tr 
                        key={sub.id} 
                        className={`hover:bg-zinc-50 transition-colors cursor-pointer ${selectedSubmission?.id === sub.id ? 'bg-zinc-50' : ''}`}
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{sub.candidate_name}</div>
                          <div className="text-xs text-zinc-400">{sub.candidate_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${sub.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          {sub.score !== null ? `${sub.score}%` : 'Pending'}
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-400 font-mono">
                          {new Date(sub.created_at!).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight size={16} className="text-zinc-300 inline" />
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">
                          No submissions yet for this exam.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <AnimatePresence mode="wait">
                {selectedSubmission ? (
                  <motion.div
                    key={selectedSubmission.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card className="p-6 space-y-6 sticky top-8">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium">Submission Details</h3>
                        <div className="w-12 h-12 bg-zinc-900 text-white rounded-full flex items-center justify-center font-serif italic text-xl">
                          {selectedSubmission.candidate_name?.[0] || '?'}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {(selectedSubmission.questions as Question[] || []).map((q, idx) => {
                          const answer = (selectedSubmission.answers as any)[q.id];
                          const isCorrect = q.type === 'mcq' && answer === q.correct_answer;

                          return (
                            <div key={q.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-zinc-400 uppercase">Q{idx + 1} • {q.type}</span>
                                {q.type === 'mcq' && (
                                  isCorrect ? 
                                    <CheckCircle2 size={14} className="text-emerald-500" /> : 
                                    <AlertCircle size={14} className="text-red-500" />
                                )}
                              </div>
                              <p className="text-xs text-zinc-600 font-medium line-clamp-2">{q.content}</p>
                              <div className="pt-2 border-t border-zinc-200">
                                <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-1">Candidate Answer</label>
                                <p className={`text-sm font-mono break-words ${q.type === 'coding' ? 'bg-zinc-900 text-zinc-300 p-2 rounded text-[10px] whitespace-pre-wrap' : ''}`}>
                                  {answer || <span className="italic opacity-50">No answer provided</span>}
                                </p>
                              </div>
                              {q.type === 'mcq' && !isCorrect && (
                                <div className="pt-1">
                                  <label className="text-[9px] font-mono uppercase text-emerald-600 block">Correct Answer</label>
                                  <p className="text-xs text-emerald-700">{q.correct_answer}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-12 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400">
                    <p className="text-sm">Select a candidate from the list to view their detailed answers.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'landing' | 'recruiter' | 'candidate' | 'create-exam' | 'results'>('landing');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isDirectExamLink, setIsDirectExamLink] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('examId');
    if (examId) {
      setView('candidate');
      setIsDirectExamLink(true);
    }
  }, []);

  return (
    <div className="font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <AnimatePresence mode="wait">
        {view === 'landing' && !isDirectExamLink && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingView onSelectRole={role => setView(role)} />
          </motion.div>
        )}
        {view === 'recruiter' && !isDirectExamLink && (
          <motion.div key="recruiter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RecruiterDashboard 
              onNewExam={() => setView('create-exam')} 
              onBack={() => setView('landing')} 
              onViewResults={(exam) => {
                setSelectedExam(exam);
                setView('results');
              }}
            />
          </motion.div>
        )}
        {view === 'create-exam' && !isDirectExamLink && (
          <motion.div key="create-exam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CreateExamView onCancel={() => setView('recruiter')} onSave={() => setView('recruiter')} />
          </motion.div>
        )}
        {view === 'results' && selectedExam && !isDirectExamLink && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultsView exam={selectedExam} onBack={() => setView('recruiter')} />
          </motion.div>
        )}
        {view === 'candidate' && (
          <motion.div key="candidate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CandidatePortal onBack={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
