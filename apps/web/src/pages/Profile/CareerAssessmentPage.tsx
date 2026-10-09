import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Loader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile.api';
import { useToast } from '@/hooks/useToast';

interface Option {
  id: string;
  questionId: string;
  label: string;
  value: string;
}

interface Question {
  id: string;
  question: string;
  section: string;
  options: Option[];
  required: boolean;
}

interface ResponseItem {
  id: string;
  questionId: string;
  selectedValue: string;
}

export function CareerAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: ['assessment-questions'],
    queryFn: profileApi.getAssessmentQuestions,
  });

  const { data: responses = [], isLoading: isLoadingResponses } = useQuery<ResponseItem[]>({
    queryKey: ['assessment-responses'],
    queryFn: profileApi.getAssessmentResponses,
  });

  const { data: completion } = useQuery<any>({
    queryKey: ['assessment-completion'],
    queryFn: profileApi.getAssessmentCompletion,
  });

  useEffect(() => {
    if (responses.length > 0) {
      const answers: Record<string, string> = {};
      responses.forEach((r) => {
        answers[r.questionId] = r.selectedValue;
      });
      setLocalAnswers(answers);
    }
  }, [responses]);

  useEffect(() => {
    if (completion?.isComplete) {
      setIsSubmitted(true);
    }
  }, [completion]);

  const saveResponseMutation = useMutation({
    mutationFn: (variables: { questionId: string; selectedValue: string }) =>
      profileApi.saveAssessmentResponse(variables.questionId, variables.selectedValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-completion'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-responses'] });
    },
    onError: () => {
      toast.error('Failed to save response. Please try again.');
    },
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: profileApi.submitAssessment,
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success('Assessment completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['assessment-completion'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit assessment.');
    },
  });

  const handleSelectOption = (questionId: string, value: string) => {
    setLocalAnswers((prev) => ({ ...prev, [questionId]: value }));
    saveResponseMutation.mutate({ questionId, selectedValue: value });
    
    // Automatically advance to the next question if not on the last one
    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Check if all required are answered
    const requiredQuestions = questions.filter((q) => q.required);
    const allAnswered = requiredQuestions.every((q) => !!localAnswers[q.id]);
    if (!allAnswered) {
      toast.error('Please answer all required questions before submitting.');
      return;
    }
    submitAssessmentMutation.mutate();
  };

  const handleRetake = () => {
    setIsSubmitted(false);
    setCurrentStep(0);
  };

  if (isLoadingQuestions || isLoadingResponses) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <Breadcrumb />
        <Card className="max-w-3xl mx-auto mt-8 border-2 border-slate-200 dark:border-slate-800">
          <CardContent className="text-center py-16">
            <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Assessment Complete!</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              Thank you for completing the career assessment. Your responses have been saved and will be used to personalize your career recommendations.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => window.history.back()} variant="outline">
                Return to Profile
              </Button>
              <Button onClick={handleRetake}>
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progressPercentage = questions.length > 0 ? Math.round(((currentStep) / questions.length) * 100) : 0;
  
  // Calculate answered questions for the top progress bar
  const answeredCount = questions.filter(q => !!localAnswers[q.id]).length;
  const totalCompletionPercentage = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;


  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Breadcrumb />
      
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <Target className="h-8 w-8 text-purple-600" />
          Career Assessment
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Answer a short set of questions about your preferences, problem-solving style, technical interests, and career direction to personalize your career recommendations.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Overall Progress ({answeredCount} / {questions.length} answered)
          </span>
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            {totalCompletionPercentage}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-600 transition-all duration-300" 
            style={{ width: `${totalCompletionPercentage}%` }}
          />
        </div>
      </div>

      <Card className="max-w-3xl mx-auto border-2 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
                {currentQuestion?.section}
              </p>
              <CardTitle className="text-lg">
                Question {currentStep + 1} of {questions.length}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {currentQuestion ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                {currentQuestion.question.replace(/^Q\d+:\n/, '')}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = localAnswers[currentQuestion.id] === option.value;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(currentQuestion.id, option.value)}
                      className={`flex items-center justify-between p-4 text-left border rounded-xl transition-all group ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-slate-700 dark:text-slate-300'}`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep < questions.length - 1 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitAssessmentMutation.isPending || answeredCount < questions.filter(q => q.required).length}
                  >
                    {submitAssessmentMutation.isPending ? <Spinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Submit Assessment
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No questions found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
