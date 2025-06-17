"use client"
import ResumeUploadDialog from '@/app/(routes)/dashboard/_components/ResumeUploadDialog';
import React, { useState } from 'react';

interface Section {
  score: number;
  comment: string;
  tips_for_improvement: string[];
  strengths: string[];
  needs_improvement: string[];
}

interface ReportProps {
  aiReport: {
    overall_score: number;
    overall_feedback: string;
    summary_comment?: string;
    sections: {
      [key: string]: Section;
    };
    tips_for_improvement: string[];
    strengths: string[];
    needs_improvement: string[];
  };
}

const Report: React.FC<ReportProps> = ({ aiReport }) => {
    const [openResumeUpload, setOpenResumeDialog] = useState(false)
  const colorMap = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  const iconMap: { [key: string]: string } = {
    contact_info: 'fas fa-user-circle',
    experience: 'fas fa-briefcase',
    education: 'fas fa-graduation-cap',
    skills: 'fas fa-lightbulb',
  };

  return (
    <div className="h-full overflow-y-auto px-6 pt-6 bg-gray-100 border-r border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 gradient-component-text">
          AI Analysis Results
        </h2>
        <button
          type="button"
          className="text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5"
          onClick={()=>setOpenResumeDialog(true)}
        >
          Re-analyze <i className="fa-solid fa-sync ml-2"></i>
        </button>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-tr from-[#BE575F] via-[#A338E3] to-[#AC76D6] rounded-lg shadow-md p-6 mb-6 border border-blue-200 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <i className="fas fa-star text-yellow-500 mr-2"></i> Overall Score
        </h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-6xl font-extrabold text-white">
            {aiReport?.overall_score}
            <span className="text-2xl">/100</span>
          </span>
          <div className="flex items-center">
            <i className="fas fa-arrow-up text-green-500 text-lg mr-2"></i>
            <span className="text-green-500 text-lg font-bold">Excellent!</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-white h-2.5 rounded-full"
            style={{ width: `${aiReport?.overall_score || 0}%` }}
          ></div>
        </div>
        <p className="text-gray-200 text-sm">{aiReport?.overall_feedback}</p>
      </div>

      {/* Section Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.entries(aiReport.sections).map(([key, section], i) => {
          const color = colorMap(section.score);
          const iconClass = iconMap[key] || 'fas fa-file-alt';

          return (
            <div
              key={i}
              className={`bg-white rounded-lg shadow-md p-5 border border-${color}-200 relative overflow-hidden group`}
            >
              <h4 className="text-lg font-semibold text-gray-700 mb-3">
                <i className={`${iconClass} text-gray-500 mr-2`}></i>{' '}
                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>
              <span className={`text-4xl font-bold text-${color}-600`}>
                {section.score}%
              </span>
              <p className="text-sm text-gray-600 mt-2">{section.comment}</p>
              <div
                className={`absolute inset-x-0 bottom-0 h-1 bg-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
          <i className="fas fa-lightbulb text-orange-400 mr-2"></i> Tips for Improvement
        </h3>
        <ol className="list-none space-y-4">
          {aiReport?.tips_for_improvement?.map((tip, i) => (
            <li className="flex items-start" key={i}>
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                <i className="fas fa-check"></i>
              </span>
              <div>
                <p className="text-gray-600 text-sm">{tip}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Good/Bad Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-5 border border-green-200">
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
            <i className="fas fa-thumbs-up text-green-500 mr-2"></i> What's Good
          </h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
            {aiReport?.strengths?.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5 border border-red-200">
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
            <i className="fas fa-thumbs-down text-red-500 mr-2"></i> Needs Improvement
          </h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
            {aiReport?.needs_improvement?.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white rounded-lg shadow-md p-6 mb-6 text-center">
        <h3 className="text-2xl font-bold mb-3">Ready to refine your resume?</h3>
        <p className="text-base mb-4">
          Make your application stand out with our premium insights and features.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-blue-600 bg-white hover:bg-gray-100"
        >
          Upgrade to Premium <i className="fas fa-arrow-right ml-2 text-blue-600"></i>
        </button>
      </div>
      <ResumeUploadDialog openResumeUpload={openResumeUpload} setOpenResumeDialog={()=>setOpenResumeDialog(false)}/>
    </div>
  );
};

export default Report;
