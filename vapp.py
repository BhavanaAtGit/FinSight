# app.py
from flask import Flask, render_template, jsonify
import yfinance as yf
from datetime import datetime
import pandas as pd

app = Flask(__name__)

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
    return render_template('index.html')

@app.route('/api/stock/data/<symbol>')
def get_stock_data(symbol):
    try:
        # Get all data in a single call
        stock = yf.Ticker(symbol)
        info = stock.info
        
        # Get historical data for chart
        hist = stock.history(period="1mo")
        
        # Basic error checking
        if not info:
            return jsonify({'error': 'Unable to fetch stock data'}), 404

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
                    'totalShareholderEquity': info.get('totalStockholderEquity', 0),
                    'cashAndCashEquivalents': info.get('totalCash', 0)
                }
            },
            'chart_data': {
                'dates': hist.index.strftime('%Y-%m-%d').tolist(),
                'prices': hist['Close'].tolist()
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)