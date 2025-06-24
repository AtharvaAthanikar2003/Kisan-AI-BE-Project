import React, { useCallback, useState } from 'react';
import { Upload, Link, Loader, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { DataPoint } from './types';

interface DataUploaderProps {
  onDataLoaded: (data: DataPoint[], columns: string[]) => void;
}

const DataUploader: React.FC<DataUploaderProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('');

  const validateCSVData = (data: any[]): boolean => {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }
    // Check if all rows have the same structure
    const firstRowKeys = Object.keys(data[0]).sort();
    return data.every(row => {
      const rowKeys = Object.keys(row).sort();
      return rowKeys.length === firstRowKeys.length &&
        rowKeys.every((key, index) => key === firstRowKeys[index]);
    });
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          const errorMessage = results.errors
            .map(err => err.message)
            .join(', ');
          setError(`CSV parsing error: ${errorMessage}`);
          setLoading(false);
          return;
        }

        const parsedData = results.data as DataPoint[];
        
        // Validate parsed data
        if (!validateCSVData(parsedData)) {
          setError('Invalid CSV format. Please ensure all rows have the same columns and are properly formatted.');
          setLoading(false);
          return;
        }

        const headers = results.meta.fields || [];
        if (headers.length === 0) {
          setError('No columns found in the CSV file');
          setLoading(false);
          return;
        }

        onDataLoaded(parsedData, headers);
        setLoading(false);
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
        setLoading(false);
      }
    });
  }, [onDataLoaded]);

  const handleApiFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data format. Expected a non-empty array of objects.');
      }

      const headers = Object.keys(data[0]);
      if (!validateCSVData(data)) {
        throw new Error('Invalid data structure. All items must have the same properties.');
      }

      onDataLoaded(data as DataPoint[], headers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload CSV File</h2>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-2">Drag and drop your CSV file here, or</p>
            <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Browse Files
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              File must be a valid CSV with consistent columns
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fetch from API</h2>
        <form onSubmit={handleApiFetch} className="space-y-4">
          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com/data"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={!apiUrl}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fetch Data
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataUploader;