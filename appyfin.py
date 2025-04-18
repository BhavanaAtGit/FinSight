from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='template')
CORS(app)  # Enable CORS for all routes

def format_number(number):
    try:
        num = float(number)
        if num >= 1e9:
            return f"{num/1e9:.2f}B"
        elif num >= 1e6:
            return f"{num/1e6:.2f}M"
        elif num >= 1e3:
            return f"{num/1e3:.2f}K"
        return f"{num:.2f}"
    except:
        return "N/A"

@app.route('/')
def home():
    return send_from_directory('template', 'index.html')  # Serve index.html as a static file

@app.route('/api/stock/data/<symbol>')
def get_stock_data(symbol):
    try:
        period = request.args.get('period', '1mo')
        logger.debug(f"Request for symbol: {symbol}, period: {period}")
        stock = yf.Ticker(symbol)
        info = stock.info
        
        # Use specific date range for 1 month
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)  # Last 30 days
        if period == '1mo':
            hist = stock.history(start=start_date, end=end_date)
        else:
            hist = stock.history(period=period)

        if not info or hist.empty:
            logger.error(f"No data available for symbol: {symbol}")
            return jsonify({'error': f'No data available for symbol: {symbol}'}), 404

        logger.debug(f"Successfully fetched data for {symbol}")
        return jsonify({
            'real_time': {
                'price': info.get('currentPrice', 0),
                'change': info.get('regularMarketChange', 0),
                'change_percent': info.get('regularMarketChangePercent', 0),
                'volume': info.get('regularMarketVolume', 0),
                'latest_trading_day': datetime.now().strftime('%Y-%m-%d')
            },
            'company_info': {
                'name': info.get('longName', symbol),
                'sector': info.get('sector', 'N/A'),
                'market_cap': info.get('marketCap', 0),
                'pe_ratio': info.get('trailingPE', 0),
                'dividend_yield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
                'beta': info.get('beta', 0)
            },
            'financials': {
                'income_statement': {
                    'totalRevenue': info.get('totalRevenue', 0),
                    'grossProfit': info.get('grossProfit', 0),
                    'operatingIncome': info.get('operatingIncome', 0),
                    'netIncome': info.get('netIncome', 0)
                },
                'balance_sheet': {
                    'totalAssets': info.get('totalAssets', 0),
                    'totalLiabilities': info.get('totalDebt', 0),
                    'totalStockholderEquity': info.get('totalStockholderEquity', 0),
                    'cashAndCashEquivalents': info.get('totalCash', 0)
                }
            },
            'chart_data': {
                'dates': hist.index.strftime('%Y-%m-%d').tolist(),
                'prices': hist['Close'].tolist()
            }
        })
    except Exception as e:
        logger.error(f"Error fetching data for {symbol}: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)