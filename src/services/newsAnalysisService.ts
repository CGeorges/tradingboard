import { NewsItem } from '../types/market';

interface NewsAnalysis {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keyPoints: string[];
  marketImpact: string;
  tradingSignals: string[];
}

export class NewsAnalysisService {
  // This will be replaced with proper agent-forge integration
  private agentForgeInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      // TODO: Initialize agent-forge framework here
      // const { AgentForge } = await import('agent-forge');
      // await AgentForge.initialize();
      console.log('News analysis service initialized (mock mode)');
      this.agentForgeInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize news analysis service:', error);
      return false;
    }
  }

  async analyzeNews(newsItem: NewsItem): Promise<NewsAnalysis> {
    try {
      // TODO: Replace with agent-forge AI agent
      // For now, use enhanced analysis
      return {
        summary: await this.generateAISummary(newsItem),
        sentiment: this.analyzeSentiment(newsItem.content, newsItem.title),
        keyPoints: this.extractKeyPoints(newsItem.content),
        marketImpact: this.assessMarketImpact(newsItem.content, newsItem.symbols),
        tradingSignals: this.identifyTradingSignals(newsItem.content, newsItem.symbols)
      };
    } catch (error) {
      console.error('Failed to analyze news:', error);
      // Fallback analysis
      return this.fallbackAnalysis(newsItem);
    }
  }

  private async generateAISummary(newsItem: NewsItem): Promise<string> {
    // TODO: Replace with agent-forge AI agent call
    // This is a placeholder that will be replaced with proper agent-forge integration
    
    const keyTerms = this.extractKeyTerms(newsItem.content, newsItem.title);
    const impact = this.assessMarketImpact(newsItem.content, newsItem.symbols);
    const sentiment = this.analyzeSentiment(newsItem.content, newsItem.title);
    
    // Generate a more intelligent summary based on analysis
    let summary = '';
    
    if (keyTerms.includes('earnings') || keyTerms.includes('quarter')) {
      summary = `${newsItem.symbols.join(', ')} reported ${sentiment === 'positive' ? 'strong' : sentiment === 'negative' ? 'weak' : 'mixed'} quarterly results. `;
    } else if (keyTerms.includes('upgrade') || keyTerms.includes('downgrade')) {
      summary = `Analysts ${keyTerms.includes('upgrade') ? 'upgraded' : 'downgraded'} ${newsItem.symbols.join(', ')} with ${impact} market impact expected. `;
    } else if (keyTerms.includes('merger') || keyTerms.includes('acquisition')) {
      summary = `${newsItem.symbols.join(', ')} announced strategic corporate action with ${impact} market implications. `;
    } else {
      summary = `${newsItem.symbols.join(', ')} news with ${sentiment} sentiment and ${impact} expected market impact. `;
    }
    
    // Add trading implication
    if (sentiment === 'positive') {
      summary += 'Potential bullish catalyst for traders to monitor.';
    } else if (sentiment === 'negative') {
      summary += 'Bearish development that may create selling pressure.';
    } else {
      summary += 'Mixed signals require careful analysis before trading decisions.';
    }
    
    return summary;
  }

  private extractKeyTerms(content: string, title: string): string[] {
    const text = (content + ' ' + title).toLowerCase();
    const terms = [
      'earnings', 'quarter', 'revenue', 'profit', 'loss',
      'upgrade', 'downgrade', 'price target', 'analyst',
      'merger', 'acquisition', 'partnership', 'deal',
      'growth', 'decline', 'beat', 'miss', 'guidance'
    ];
    
    return terms.filter(term => text.includes(term));
  }

  private analyzeSentiment(content: string, title: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = [
      'growth', 'beat', 'exceed', 'strong', 'surge', 'rise', 'upgrade', 'bullish',
      'profit', 'gain', 'success', 'outperform', 'boost', 'rally', 'jump'
    ];
    const negativeWords = [
      'decline', 'miss', 'weak', 'fall', 'drop', 'downgrade', 'bearish', 'loss',
      'struggle', 'plunge', 'crash', 'underperform', 'concern', 'warning', 'cut'
    ];
    
    const text = (content + ' ' + title).toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    // Count occurrences with weight
    positiveWords.forEach(word => {
      const matches = (text.match(new RegExp(word, 'g')) || []).length;
      positiveScore += matches;
    });
    
    negativeWords.forEach(word => {
      const matches = (text.match(new RegExp(word, 'g')) || []).length;
      negativeScore += matches;
    });
    
    // Apply context weight
    if (text.includes('beat expectations') || text.includes('above guidance')) {
      positiveScore += 2;
    }
    if (text.includes('miss expectations') || text.includes('below guidance')) {
      negativeScore += 2;
    }
    
    const threshold = 1;
    if (positiveScore > negativeScore + threshold) return 'positive';
    if (negativeScore > positiveScore + threshold) return 'negative';
    return 'neutral';
  }

  private extractKeyPoints(content: string): string[] {
    // Split into sentences and find the most informative ones
    const sentences = content.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.length < 250);
    
    // Score sentences based on trading relevance
    const scoredSentences = sentences.map(sentence => {
      let score = 0;
      const lowerSentence = sentence.toLowerCase();
      
      // Financial keywords
      const financialTerms = [
        'revenue', 'earnings', 'profit', 'loss', 'guidance', 'forecast',
        'analyst', 'price target', 'upgrade', 'downgrade', 'estimate'
      ];
      financialTerms.forEach(term => {
        if (lowerSentence.includes(term)) score += 2;
      });
      
      // Market action words
      const actionWords = ['announced', 'reported', 'launched', 'acquired', 'signed'];
      actionWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 1;
      });
      
      // Numbers increase relevance
      if (/\d+/.test(sentence)) score += 1;
      
      return { sentence, score };
    });
    
    // Return top 3 most relevant sentences
    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sentence);
  }

  private assessMarketImpact(content: string, symbols: string[]): string {
    const text = content.toLowerCase();
    let impactScore = 0;
    
    // High impact events
    const highImpactKeywords = [
      'earnings', 'acquisition', 'merger', 'bankruptcy', 'fda approval',
      'clinical trial', 'lawsuit', 'regulatory', 'partnership', 'contract'
    ];
    highImpactKeywords.forEach(keyword => {
      if (text.includes(keyword)) impactScore += 3;
    });
    
    // Medium impact events
    const mediumImpactKeywords = [
      'upgrade', 'downgrade', 'analyst', 'price target', 'guidance',
      'forecast', 'revenue', 'profit', 'expansion'
    ];
    mediumImpactKeywords.forEach(keyword => {
      if (text.includes(keyword)) impactScore += 2;
    });
    
    // Low impact events
    const lowImpactKeywords = [
      'comment', 'statement', 'interview', 'opinion', 'meeting', 'conference'
    ];
    lowImpactKeywords.forEach(keyword => {
      if (text.includes(keyword)) impactScore += 1;
    });
    
    // Market cap consideration for impact
    if (symbols.some(symbol => ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].includes(symbol))) {
      impactScore += 1; // Large cap stocks have broader market impact
    }
    
    if (impactScore >= 6) return 'high';
    if (impactScore >= 3) return 'medium';
    return 'low';
  }

  private identifyTradingSignals(content: string, symbols: string[]): string[] {
    const signals: string[] = [];
    const text = content.toLowerCase();
    
    // Earnings signals
    if (text.includes('beat') && text.includes('earnings')) {
      signals.push('Bullish earnings beat');
    }
    if (text.includes('miss') && text.includes('earnings')) {
      signals.push('Bearish earnings miss');
    }
    
    // Analyst signals
    if (text.includes('upgrade')) {
      signals.push('Analyst upgrade');
    }
    if (text.includes('downgrade')) {
      signals.push('Analyst downgrade');
    }
    if (text.includes('price target') && text.includes('raised')) {
      signals.push('Price target increase');
    }
    
    // Corporate action signals
    if (text.includes('partnership') || text.includes('deal') || text.includes('contract')) {
      signals.push('Strategic partnership');
    }
    if (text.includes('acquisition') || text.includes('merger')) {
      signals.push('M&A activity');
    }
    
    // Financial performance signals
    if (text.includes('revenue') && text.includes('growth')) {
      signals.push('Revenue growth');
    }
    if (text.includes('guidance') && (text.includes('raised') || text.includes('increased'))) {
      signals.push('Guidance raise');
    }
    if (text.includes('guidance') && (text.includes('lowered') || text.includes('reduced'))) {
      signals.push('Guidance cut');
    }
    
    // Volume/momentum signals
    if (text.includes('volume') && text.includes('surge')) {
      signals.push('Volume surge');
    }
    
    return signals.slice(0, 5); // Limit to 5 most relevant signals
  }

  private fallbackAnalysis(newsItem: NewsItem): NewsAnalysis {
    return {
      summary: newsItem.summary || 'Unable to generate AI summary',
      sentiment: 'neutral',
      keyPoints: [newsItem.summary || newsItem.title],
      marketImpact: 'low',
      tradingSignals: []
    };
  }
}

export const newsAnalysisService = new NewsAnalysisService(); 