import React, { useState, useEffect } from 'react';
import { Newspaper, Filter, ExternalLink, Loader, BookOpen } from 'lucide-react';
import NewsAPI, { NewsItem } from '../lib/newsApi';

const NewsPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'news' | 'resources'>('news');
  
  const categories = [
    { id: '', label: 'All' },
    { id: 'policy', label: 'Policy Updates' },
    { id: 'market', label: 'Market Trends' },
    { id: 'technology', label: 'Technology' },
    { id: 'weather', label: 'Weather Impact' }
  ];

  const govResources = [
    {
      title: "Price Data Management Committee",
      description: "Monitor and manage agricultural commodity prices",
      url: "https://pdmc.da.gov.in/",
      category: "Price Management"
    },
    {
      title: "Krishi DSS",
      description: "Decision Support System for Indian Agriculture",
      url: "https://krishidss.da.gov.in/krishi-dss/",
      category: "Decision Support"
    },
    {
      title: "Gramin Credit Evaluation System",
      description: "Credit evaluation system for rural development",
      url: "https://gces.dac.gov.in/#/",
      category: "Finance"
    },
    {
      title: "Krishi Mapper",
      description: "Agricultural mapping and geospatial data",
      url: "https://krishimapper.dac.gov.in/",
      category: "Mapping"
    },
    {
      title: "Unified Portal for Agricultural Governance",
      description: "Integrated platform for agricultural services",
      url: "https://upag.gov.in/",
      category: "Governance"
    },
    {
      title: "Seed Traceability",
      description: "Track and verify seed quality and origin",
      url: "https://seedtrace.gov.in/ms014/",
      category: "Seeds"
    },
    {
      title: "PM-KISAN",
      description: "Direct Benefit Transfer to farmers",
      url: "https://pmkisan.gov.in/",
      category: "Schemes"
    },
    {
      title: "PM Fasal Bima Yojana",
      description: "Crop insurance scheme",
      url: "https://pmfby.gov.in/",
      category: "Insurance"
    },
    {
      title: "National Food Security Mission",
      description: "Enhance food security through increased production",
      url: "https://www.nfsm.gov.in/",
      category: "Food Security"
    },
    {
      title: "Agri-Clinics",
      description: "Agricultural extension services",
      url: "https://www.agriclinics.net/",
      category: "Extension"
    },
    {
      title: "Seed Portal",
      description: "Information about quality seeds",
      url: "https://seednet.gov.in/",
      category: "Seeds"
    },
    {
      title: "Natural Farming",
      description: "Promote and support natural farming practices",
      url: "https://naturalfarming.dac.gov.in",
      category: "Sustainable Agriculture"
    }
  ];

  useEffect(() => {
    let mounted = true;

    const fetchNews = async () => {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await NewsAPI.getNews(selectedCategory || undefined);
        if (mounted) {
          setNews(data);
        }
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to load news. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (activeTab === 'news') {
      fetchNews();
    }

    return () => {
      mounted = false;
    };
  }, [selectedCategory, activeTab]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Newspaper className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agricultural News & Resources</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'news'
              ? 'bg-green-50 text-green-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            <span>News</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'resources'
              ? 'bg-green-50 text-green-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span>Government Resources</span>
          </div>
        </button>
      </div>

      {activeTab === 'news' && (
        <>
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 font-medium">Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* News List */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 text-green-600 animate-spin" />
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No news articles found.
              </div>
            ) : (
              news.map(item => (
                <article
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-6">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h2>
                      <p className="text-gray-600 mb-4">{item.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{item.source}</span>
                          <span>•</span>
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-600 hover:text-green-700"
                        >
                          Read more <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {govResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:bg-green-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {resource.description}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {resource.category}
                  </span>
                </div>
                <ExternalLink className="h-5 w-5 text-green-600 flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsPage;