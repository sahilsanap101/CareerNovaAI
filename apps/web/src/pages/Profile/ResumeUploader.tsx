import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Loader';
import { parsePdfText, parseDocxText } from '@/lib/resumeParser';
import { extractResumeData, type ExtractedResumeData } from '@/lib/resumeExtractor';

interface ResumeUploaderProps {
    onSuccess: (data: ExtractedResumeData) => void;
    onSkip: () => void;
}

export function ResumeUploader({ onSuccess, onSkip }: ResumeUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const processFile = async (file: File) => {
        setErrorMsg('');
        if (!file) {
            setErrorMsg('The selected file is empty. Please choose another file.');
            return;
        }

        const type = file.type;
        const name = file.name.toLowerCase();

        let text = '';

        try {
            if (type === 'application/pdf' || name.endsWith('.pdf')) {
                setLoadingMsg('Reading your resume...');
                text = await parsePdfText(file);
            } else if (
                type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                name.endsWith('.docx')
            ) {
                setLoadingMsg('Reading your word document...');
                text = await parseDocxText(file);
            } else {
                setErrorMsg('Unsupported file type. Please upload a PDF or DOCX resume.');
                return;
            }

            setLoadingMsg('Extracting your profile information...');
            const extracted = await extractResumeData(text);

            setLoadingMsg('Success! Directing you to review...');
            setTimeout(() => {
                onSuccess(extracted);
            }, 800);

        } catch (err: any) {
            setLoadingMsg('');
            setErrorMsg(err.message || 'An unexpected error occurred while processing the file.');
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            await processFile(e.target.files[0]);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-2 border-slate-200 dark:border-slate-800">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
                <CardDescription>Automatically fill your profile from your resume.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {!loadingMsg && !errorMsg && (
                    <div
                        className={`border-2 border-dashed rounded-2xl p-10 mt-4 text-center transition-all ${dragActive
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-slate-300 dark:border-slate-700 hover:border-primary-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="hidden"
                            onChange={handleChange}
                            aria-label="Upload Resume"
                        />

                        <UploadCloud className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Drag & drop your resume or click to browse — PDF or DOCX
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Supported: .pdf, .docx
                        </p>
                    </div>
                )}

                {loadingMsg && (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <Spinner size="lg" />
                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 animate-pulse">
                            {loadingMsg}
                        </p>
                    </div>
                )}

                {errorMsg && (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center border rounded-2xl bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 max-w-md">
                            {errorMsg}
                        </p>
                        <div className="flex gap-3 pt-2">
                            <Button size="sm" variant="outline" onClick={() => {
                                setErrorMsg('');
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Try Another File
                            </Button>
                            <Button size="sm" onClick={onSkip}>
                                Continue Manually
                            </Button>
                        </div>
                    </div>
                )}

                {(!loadingMsg || errorMsg) && (
                    <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={onSkip}
                            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
                        >
                            Skip resume import / Enter manually instead
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
