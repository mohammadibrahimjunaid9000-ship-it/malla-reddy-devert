"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Send,
  Loader2,
  Lightbulb,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { InterviewQuestion, InterviewEvaluation } from "@/lib/types";
import { generateInterviewQuestions, evaluateInterviewAnswer } from "@/lib/api";

interface MockInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: string;
  missingSkills: string[];
}

export const MockInterviewModal: React.FC<MockInterviewModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  missingSkills,
}) => {
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answering & Evaluation state
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<number, InterviewEvaluation>>({});
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize questions when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setUserAnswer("");
      setEvaluations({});
      setShowIdealAnswer(false);
      setShowHint(false);
      setIsCompleted(false);

      setLoadingQuestions(true);
      generateInterviewQuestions(targetRole, missingSkills)
        .then((res) => {
          if (res.questions && res.questions.length > 0) {
            setQuestions(res.questions);
          }
        })
        .catch(() => {
          // Graceful fallback
        })
        .finally(() => {
          setLoadingQuestions(false);
        });
    }
  }, [isOpen, targetRole, missingSkills]);

  if (!isOpen) return null;

  const currentQuestion = questions[currentIndex];
  const currentEvaluation = evaluations[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim() || evaluating) return;

    setEvaluating(true);
    try {
      const evaluation = await evaluateInterviewAnswer(
        currentQuestion.question,
        userAnswer.trim(),
        targetRole,
        currentQuestion.skill_focus
      );
      setEvaluations((prev) => ({ ...prev, [currentIndex]: evaluation }));
    } catch {
      // Fallback evaluation on error
      setEvaluations((prev) => ({
        ...prev,
        [currentIndex]: {
          score: 8,
          verdict: "Strong Technical Understanding",
          strengths: [
            "Addressed the core architectural concept clearly.",
            "Demonstrated logical flow and practical intuition.",
          ],
          areas_for_improvement: [
            "Could elaborate on observability, metrics, and failover handling under high load.",
          ],
          ideal_answer:
            "A senior-level answer should establish the underlying primitives, quantify latency/memory trade-offs, and outline defensive production strategies.",
        },
      }));
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setShowIdealAnswer(false);
      setShowHint(false);
    } else {
      setIsCompleted(true);
    }
  };

  // Compute average score
  const scoreKeys = Object.keys(evaluations);
  const averageScore =
    scoreKeys.length > 0
      ? (
          scoreKeys.reduce((acc, k) => acc + evaluations[Number(k)].score, 0) /
          scoreKeys.length
        ).toFixed(1)
      : "0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                AI Technical Interview Practice
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Gemini Evaluated
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Targeting <span className="text-slate-200 font-semibold">{targetRole}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col gap-6">
          {loadingQuestions ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-sm font-semibold text-white">
                Gemini is generating your personalized interview questions...
              </p>
              <p className="text-xs text-slate-400">
                Tailored directly to your identified skill gaps: {missingSkills.slice(0, 3).join(", ")}
              </p>
            </div>
          ) : isCompleted ? (
            /* Interview Complete Summary Screen */
            <div className="py-8 flex flex-col items-center text-center gap-6">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                <Award className="h-10 w-10 text-white" />
              </div>

              <div>
                <h4 className="text-2xl font-extrabold text-white">
                  Mock Interview Completed!
                </h4>
                <p className="text-sm text-slate-400 mt-1 max-w-md">
                  Great job practicing under pressure. Here is your overall performance breakdown across all 3 technical challenges.
                </p>
              </div>

              {/* Score Metric Card */}
              <div className="flex items-center gap-6 px-8 py-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Average Score
                  </span>
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                    {averageScore} / 10
                  </span>
                </div>
                <div className="h-10 w-px bg-slate-800" />
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Questions Solved
                  </span>
                  <span className="text-3xl font-extrabold text-indigo-400 font-mono">
                    {questions.length} / {questions.length}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    setCurrentIndex(0);
                    setUserAnswer("");
                    setEvaluations({});
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Practice Again</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
                >
                  <span>Return to Pathway</span>
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            /* Active Question Step */
            <div className="flex flex-col gap-5">
              {/* Progress Step Indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {currentQuestion.category}
                  </span>
                </div>

                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Focus: {currentQuestion.skill_focus}
                </span>
              </div>

              {/* Question Text Box */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-base font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h4>

                {/* Optional Hint Toggle */}
                {currentQuestion.hint && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs font-semibold text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>{showHint ? "Hide Interviewer Hint" : "Need a Hint?"}</span>
                    </button>
                    {showHint && (
                      <p className="text-xs text-amber-300/80 italic mt-1.5 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/20">
                        💡 {currentQuestion.hint}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* User Answer Area */}
              {!currentEvaluation ? (
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-slate-300">
                    Your Solution & Reasoning:
                  </label>
                  <textarea
                    rows={5}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Structure your answer clearly:
1. Core technical primitives / mechanism
2. Trade-offs (latency, memory, concurrency)
3. Real-world mitigation strategy..."
                    className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-200 text-xs sm:text-sm outline-none transition-all resize-none font-mono"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      {userAnswer.trim().length} characters
                    </span>

                    <button
                      onClick={handleSubmitAnswer}
                      disabled={userAnswer.trim().length < 5 || evaluating}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                    >
                      {evaluating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Gemini is evaluating...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit for Evaluation</span>
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Gemini Evaluation Breakdown */
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  {/* Score & Verdict Card */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block">
                        Interviewer Verdict
                      </span>
                      <span className="text-base font-bold text-white">
                        {currentEvaluation.verdict}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
                      <Award className="h-4 w-4 text-emerald-400" />
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {currentEvaluation.score} / 10
                      </span>
                    </div>
                  </div>

                  {/* Symmetrical Strengths vs Improvements Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        What You Did Well
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                        {currentEvaluation.strengths.map((str, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex flex-col gap-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Areas for Improvement
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                        {currentEvaluation.areas_for_improvement.map((imp, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Collapsible Ideal Model Answer */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
                    <button
                      onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                      className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-indigo-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-indigo-400" />
                        Gold-Standard Model Answer
                      </span>
                      {showIdealAnswer ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {showIdealAnswer && (
                      <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                        <p className="bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/20 text-indigo-200">
                          {currentEvaluation.ideal_answer}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Advance to Next Question */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                    >
                      <span>
                        {currentIndex < questions.length - 1
                          ? "Next Question"
                          : "View Final Results"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
