from flask import Flask, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def scrape_news():
    """Scrape stock market news from Moneycontrol."""
    try:
        url = 'https://www.moneycontrol.com/news/business/markets/'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        news_items = []
        articles = soup.select('li.clearfix')[:12]  # Limit to 10 recent articles

        for article in articles:
            title_elem = article.select_one('h2 a')
            desc_elem = article.select_one('p')
            link_elem = article.select_one('h2 a')
            date_elem = article.get('data-published')  # Moneycontrol uses data-published

            if not (title_elem and desc_elem and link_elem):
                continue

            title = title_elem.text.strip()
            description = desc_elem.text.strip()
            url = link_elem['href']
            published_at = date_elem or datetime.now().isoformat()

            try:
                published_at = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
            except ValueError:
                published_at = datetime.now().isoformat()

            news_items.append({
                'title': title,
                'description': description,
                'url': url,
                'published_at': published_at
            })

        logger.debug(f"Scraped {len(news_items)} news articles")
        return news_items
    except Exception as e:
        logger.error(f"Error scraping news: {str(e)}")
        return []

@app.route('/news')
def get_news():
    try:
        news = scrape_news()
        if not news:
            return jsonify([]), 200
        return jsonify(news)
    except Exception as e:
        logger.error(f"Error serving news: {str(e)}")
        return jsonify({'error': 'Failed to fetch news'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)