import React, { useState } from 'react';
import { Brain, Loader, TrendingUp, Grid, Calculator, MessageSquare } from 'lucide-react';
import { generateGeminiResponse } from '../../lib/gemini';
import { DataPoint } from './types';

interface AIAnalysisProps {
  data: DataPoint[];
  columns: string[];
}

type AnalysisType = 'trends' | 'clustering' | 'statistics' | 'chat';

const AIAnalysis: React.FC<AIAnalysisProps> = ({ data, columns }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('trends');
  const [question, setQuestion] = useState('');

  const generateAnalysisPrompt = () => {
    const selectedData = data.map(item => {
      const filteredItem: Record<string, any> = {};
      selectedColumns.forEach(col => {
        filteredItem[col] = item[col];
      });
      return filteredItem;
    });

    let prompt = '';
    switch (analysisType) {
      case 'trends':
        prompt = `Examine the provided agricultural data to uncover key trends, patterns, and correlations. Highlight their potential implications on farming decisions, including productivity, resource optimization, and sustainability:\n\n${JSON.stringify(selectedData)}`;
        break;
      case 'clustering':
        prompt = `Group and segment the following agricultural data into meaningful clusters. Explain the characteristics of each cluster and their implications for farming strategies:\n\n${JSON.stringify(selectedData)}`;
        break;
      case 'statistics':
        prompt = `"Perform a comprehensive statistical analysis of the given agricultural data. Include metrics such as mean, median, variance, standard deviation, and identify any significant outliers. Present the results in a well-structured manner,Numbers or ordered lists
A table for structured representation :\n\n${JSON.stringify(selectedData)}`;
        break;
      case 'chat':
        prompt = `Give answer to questions:
        \n\nQuestion: ${question}\n\nProvide a clear and concise answer .`;
        break;
    }
    return prompt;
  };

  const handleAnalysis = async () => {
    if ((analysisType !== 'chat' && selectedColumns.length === 0) || 
        (analysisType === 'chat' && !question)) return;
    
    setLoading(true);
    setAnalysis(null);
    
    try {
      const prompt = generateAnalysisPrompt();
      const response = await generateGeminiResponse(prompt);
      setAnalysis(response);
    } catch (error) {
      setAnalysis(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const analysisTypes = [
    { type: 'trends', icon: TrendingUp, label: 'Trend Analysis' },
    { type: 'clustering', icon: Grid, label: 'Data Clustering' },
    { type: 'statistics', icon: Calculator, label: 'Statistical Analysis' },
    { type: 'chat', icon: MessageSquare, label: 'Ask Questions' }
  ];

  return (
    <div className="space-y-8">
      {/* Analysis Type Selection */}
      <div className="flex flex-wrap gap-4">
        {analysisTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => {
              setAnalysisType(type as AnalysisType);
              setAnalysis(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              analysisType === type
                ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Column Selection (for non-chat analysis types) */}
      {analysisType !== 'chat' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select Columns for Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {columns.map(column => (
              <label
                key={column}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedColumns(prev => [...prev, column]);
                    } else {
                      setSelectedColumns(prev => prev.filter(col => col !== column));
                    }
                  }}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{column}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {analysisType === 'chat' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your data..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {/* Analysis Button */}
      <div className="flex justify-center">
        <button
          onClick={handleAnalysis}
          disabled={loading || (analysisType !== 'chat' && selectedColumns.length === 0) || (analysisType === 'chat' && !question)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Brain className="h-5 w-5" />
              <span>{analysisType === 'chat' ? 'Get Answer' : 'Generate Analysis'}</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {analysis && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">
            {analysisType === 'chat' ? 'Answer' : 'Analysis Results'}
          </h3>
          <div className="prose prose-green max-w-none dark:prose-invert">
            <p className="text-green-700 dark:text-green-300 whitespace-pre-wrap">{analysis}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;