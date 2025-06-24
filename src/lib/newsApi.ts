import axios from 'axios';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'policy' | 'market' | 'technology' | 'weather';
  date: string;
  source: string;
  url: string;
  imageUrl?: string;
}

class NewsAPI {
  private static API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
  private static BASE_URL = 'https://gnews.io/api/v4/search';

  private static categoryQueries = {
    policy: 'agricultural policy farming regulations',
    market: 'agricultural market prices crops',
    technology: 'agricultural technology farming innovation',
    weather: 'agricultural weather farming climate'
  };

  static async getNews(category?: string): Promise<NewsItem[]> {
    try {
      const query = category 
        ? this.categoryQueries[category as keyof typeof this.categoryQueries]
        : 'agriculture farming';

      const response = await axios.get(this.BASE_URL, {
        params: {
          q: query,
          token: this.API_KEY,
          lang: 'en',
          country: 'in', // Focus on Indian news
          max: 10, // Number of articles to fetch
          sortby: 'publishedAt'
        }
      });

      if (!response.data || !response.data.articles) {
        throw new Error('Invalid response format from GNews API');
      }

      return response.data.articles.map((article: any, index: number) => ({
        id: `news-${index}`,
        title: article.title || 'Untitled',
        summary: article.description || 'No description available',
        category: category || this.determineCategory(article.title || ''),
        date: article.publishedAt || new Date().toISOString(),
        source: article.source?.name || 'Unknown Source',
        url: article.url || '#',
        imageUrl: article.image || undefined
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch news: ${error.message}`);
      }
      throw new Error('Failed to fetch news');
    }
  }

  private static determineCategory(title: string): 'policy' | 'market' | 'technology' | 'weather' {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('policy') || lowerTitle.includes('regulation') || lowerTitle.includes('law')) {
      return 'policy';
    }
    if (lowerTitle.includes('market') || lowerTitle.includes('price') || lowerTitle.includes('trade')) {
      return 'market';
    }
    if (lowerTitle.includes('tech') || lowerTitle.includes('innovation') || lowerTitle.includes('digital')) {
      return 'technology';
    }
    return 'weather'; // Default category
  }
}

export default NewsAPI;