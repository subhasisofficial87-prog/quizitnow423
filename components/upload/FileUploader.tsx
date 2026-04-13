'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, Loader2, Plus, BookOpen, Calendar } from 'lucide-react';
import { classLevels, classDisplayName } from '@/lib/utils';

interface FileUploaderProps {
  board: 'odia_board' | 'cbse' | 'icse';
  onUploadComplete: (bookId: number) => void;
}

type TabType = 'pdf' | 'images';

// Days per chapter based on class level
function getDaysPerChapter(classLevel: string): number {
  const n = classLevel === 'lkg' ? 0 : classLevel === 'ukg' ? 0.5 : parseInt(classLevel) || 1;
  if (n <= 2) return 3;   // 3 days per chapter for LKG–Class 2
  if (n <= 5) return 5;   // 5 days for Class 3–5
  if (n <= 8) return 7;   // 7 days for Class 6–8
  return 10;              // 10 days for Class 9–12
}

function calcLectureDays(uploadedChapters: number, classLevel: string): number {
  if (!uploadedChapters || uploadedChapters <= 0) return 0;
  const dpc = getDaysPerChapter(classLevel);
  const lectureDays = uploadedChapters * dpc;
  // Round to full weeks (add revision + doubt days)
  const weeks = Math.ceil(lectureDays / 5);
  return weeks * 7; // total days incl weekends
}

export function FileUploader({ board, onUploadComplete }: FileUploaderProps) {
  const [tab, setTab] = useState<TabType>('pdf');
  const [classLevel, setClassLevel] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [totalChapters, setTotalChapters] = useState('');
  const [uploadedChapters, setUploadedChapters] = useState('');
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
    });

  // Computed preview
  const upCh = parseInt(uploadedChapters) || 0;
  const totCh = parseInt(totalChapters) || 0;
  const lectureDaysPreview = upCh > 0 && classLevel ? calcLectureDays(upCh, classLevel) : 0;
  const lectureDaysPerChap = classLevel ? getDaysPerChapter(classLevel) : 5;

  const handleSubmit = useCallback(async () => {
    if (!classLevel) { setError('Please select a class level'); return; }
    if (tab === 'pdf' && pdfFiles.length === 0) { setError('Please select at least one PDF file'); return; }
    if (tab === 'images' && imageFiles.length === 0) { setError('Please select at least one image'); return; }

    setError('');
    setStatus('uploading');
    setProgress(10);
    setProgressMsg('Creating book record...');

    try {
      const autoTitle = pdfFiles.length > 1
        ? `${pdfFiles[0].name.replace('.pdf', '')} + ${pdfFiles.length - 1} more`
        : (pdfFiles[0]?.name ?? imageFiles[0]?.name ?? 'My Book');

      const bookRes = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board,
          classLevel,
          title: bookTitle || autoTitle,
          fileType: tab,
          originalFilename: tab === 'pdf'
            ? pdfFiles.map((f) => f.name).join(', ')
            : `${imageFiles.length} images`,
        }),
      });

      if (!bookRes.ok) {
        const data = await bookRes.json() as { error?: string };
        if (bookRes.status === 401) {
          window.location.href = `/register?board=${board}`;
          return;
        }
        throw new Error(data.error ?? 'Failed to create book');
      }

      const { bookId } = await bookRes.json() as { bookId: number };
      setProgress(25);
      setStatus('processing');

      let base64Pdfs: string[] | undefined;
      let images: string[] | undefined;

      if (tab === 'pdf') {
        setProgressMsg(`Converting ${pdfFiles.length} PDF${pdfFiles.length > 1 ? 's' : ''} to base64...`);
        base64Pdfs = await Promise.all(pdfFiles.map(toBase64));
        setProgress(50);
      } else {
        setProgressMsg('Converting images...');
        images = await Promise.all(imageFiles.map(toBase64));
        setProgress(50);
      }

      setProgressMsg('AI is analysing and building your study plan...');
      setProgress(60);

      const processRes = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          fileType: tab,
          base64Pdfs,
          base64Pdf: base64Pdfs?.[0],
          images,
          classLevel,
          board,
          totalChapters: totCh > 0 ? totCh : undefined,
          uploadedChapters: upCh > 0 ? upCh : undefined,
        }),
      });

      if (!processRes.ok) {
        const data = await processRes.json() as { error?: string };
        throw new Error(data.error ?? 'Processing failed');
      }

      setProgress(100);
      setProgressMsg('Done! Redirecting to your study plan...');
      setStatus('done');
      onUploadComplete(bookId);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [tab, classLevel, bookTitle, pdfFiles, imageFiles, board, onUploadComplete, upCh, totCh]);

  const removePdf = (idx: number) => setPdfFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeImage = (idx: number) => setImageFiles((prev) => prev.filter((_, i) => i !== idx));

  const totalPdfSize = pdfFiles.reduce((sum, f) => sum + f.size, 0);
  const isLoading = status === 'uploading' || status === 'processing';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Tab Switch */}
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        {(['pdf', 'images'] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => !isLoading && setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
              tab === t
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t === 'pdf' ? <FileText className="w-4 h-4" /> : <Image className="w-4 h-4" />}
            {t === 'pdf' ? 'PDF Files' : 'Images'}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-5">
        {/* Class Level */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Class Level <span className="text-red-500">*</span>
          </label>
          <select
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Select your class</option>
            {classLevels().map((level) => (
              <option key={level} value={level}>{classDisplayName(level)}</option>
            ))}
          </select>
        </div>

        {/* Book Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Book Title (optional)
          </label>
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="e.g. Class 7 Science"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Chapter Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              Total Chapters in Book
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={totalChapters}
              onChange={(e) => setTotalChapters(e.target.value)}
              placeholder="e.g. 15"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-green-500" />
              Chapters Uploaded
            </label>
            <input
              type="number"
              min="1"
              max={totCh > 0 ? totCh : 100}
              value={uploadedChapters}
              onChange={(e) => setUploadedChapters(e.target.value)}
              placeholder="e.g. 5"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Live Day Preview */}
        {upCh > 0 && classLevel && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl px-4 py-3 border border-blue-100 dark:border-blue-800 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Your study plan: <span className="text-blue-600 dark:text-blue-400">{lectureDaysPreview} days</span>
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                {upCh} chapters × {lectureDaysPerChap} lecture days = {upCh * lectureDaysPerChap} lecture days
                {totCh > 0 && upCh < totCh && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400">
                    ({totCh - upCh} chapters remaining to upload later)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        {tab === 'pdf' ? (
          <div className="space-y-3">
            <div
              onClick={() => !isLoading && pdfInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                pdfFiles.length > 0
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
              } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-600 dark:text-gray-300">
                {pdfFiles.length > 0 ? 'Click to add more PDFs' : 'Click to upload PDF files'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Multiple PDFs supported — all will be combined into one study plan</p>
            </div>
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setPdfFiles((prev) => [...prev, ...files]);
                e.target.value = '';
              }}
            />

            {pdfFiles.length > 0 && (
              <div className="space-y-2">
                {pdfFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-2.5 border border-blue-100 dark:border-blue-800">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">{f.name}</p>
                      <p className="text-xs text-blue-500">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      onClick={() => removePdf(i)}
                      disabled={isLoading}
                      className="w-6 h-6 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {pdfFiles.length} PDF{pdfFiles.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">
                      Total: {(totalPdfSize / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      onClick={() => !isLoading && pdfInputRef.current?.click()}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline text-xs"
                    >
                      <Plus className="w-3 h-3" />Add More
                    </button>
                  </div>
                </div>
              </div>
            )}

            {pdfFiles.length > 1 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
                💡 Multiple PDFs will be processed together into one unified study plan.
                Each PDF should be under 100 pages for best results.
              </p>
            )}
          </div>
        ) : (
          <div>
            <div
              onClick={() => !isLoading && imgInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                imageFiles.length > 0
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10'
              } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <Image className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-600 dark:text-gray-300">Click to upload images</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG — Multiple files allowed (max 30)</p>
            </div>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setImageFiles((prev) => [...prev, ...files].slice(0, 30));
              }}
            />
            {imageFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {imageFiles.map((f, i) => (
                  <div key={i} className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-xs text-center">
                    <p className="truncate text-gray-700 dark:text-gray-300">{f.name}</p>
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {isLoading && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{progressMsg}</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {pdfFiles.length > 1
                ? `Processing ${pdfFiles.length} PDFs — this may take 2-5 minutes. Please don't close the page.`
                : "This may take 1-3 minutes. Please don't close the page."}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || status === 'done'}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
            </>
          ) : status === 'done' ? (
            '✅ Done! Redirecting...'
          ) : (
            <>
              🚀 Start Learning
              {lectureDaysPreview > 0
                ? ` — ${lectureDaysPreview}-day plan`
                : pdfFiles.length > 1 ? ` (${pdfFiles.length} PDFs)` : ''}
              !
            </>
          )}
        </button>
      </div>
    </div>
  );
}
