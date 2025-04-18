from flask import Flask, request, jsonify
import os
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from flask_cors import CORS
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load environment variables from .env file
load_dotenv()

# Set API keys from environment variables
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "default_key_if_missing")  # Fallback for testing
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "default_key_if_missing")  # Fallback for testing

genai.configure(api_key=GEMINI_API_KEY)

# Function to create prompts for Gemini AI
def get_prompt(text, summary_type="concise"):
    if summary_type == "concise":
        return f"Summarize the following article in a concise yet detailed way. {text}"
    elif summary_type == "overview":
        return f"Provide an overview of the following article.everything should Only be related to stock market and business and answered {text}"
    else:
        return f"Summarize the following article in a way that highlights detailed information. {text}"

# Function to search Google using Serper API
def search_serper(query):
    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    payload = {"q": query, "num": 3}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        links = [result["link"] for result in data.get("organic", [])]
        return links
    except requests.exceptions.RequestException as e:
        return []

# Function to fetch and clean webpage content
def fetch_clean_content(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        paragraphs = soup.find_all('p')
        content = ' '.join([para.get_text() for para in paragraphs])
        return content if len(content) > 100 else "Content is too short or not readable."
    except requests.exceptions.RequestException:
        return ""

# Function to summarize content using Gemini AI
def summarize_with_gemini(text, summary_type="overview"):
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = get_prompt(text, summary_type)
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return "Error in summarization."

@app.route('/api/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get("query", "")
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    top_links = search_serper(query)
    all_content = ""
    sources = []

    for link in top_links:
        content = fetch_clean_content(link)
        if content and "Content is too short" not in content:
            all_content += content + "\n\n"
            sources.append(link)
    
    if all_content:
        summary = summarize_with_gemini(all_content, "concise")
        return jsonify({"answer": summary, "sources": sources})
    else:
        return jsonify({"error": "No relevant content found."})

if __name__ == '__main__':
    app.run(debug=True, port=5002)