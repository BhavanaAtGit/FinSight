# scraping moneycontrol websites

from flask import Flask, jsonify, request
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time
import os
import re
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)
# Serper API details
SERPER_API_URL = "https://google.serper.dev/search"
SERPER_API_KEY = "505c4dc550fc8ca51646db77ad6a4ffad8e7163c"

# Financial document types to search for
financial_documents = [
    "Balance Sheet", "P & L", "Quarterly Results",
    "Half Yearly Results", "Nine Months Results",
    "Yearly Results", "Cash Flows Ratios", "Capital Structure"
]

def get_chrome_options():
    """Configure Chrome options for headless operation"""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    return options

def search_financial_links(company_name, document_type):
    """Search for financial documents using Serper API"""
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    query = f"{company_name} {document_type} site:moneycontrol.com"
    payload = {'q': query, 'num': 1}
    
    try:
        response = requests.post(SERPER_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error searching for {document_type}: {e}")
        return None

def clean_numeric_data(df):
    """Clean numeric data by removing commas, percentage signs, and converting to numeric"""
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].apply(lambda x: re.sub(r'[^\d.]', '', str(x)) if pd.notnull(x) else x)
            df[col] = pd.to_numeric(df[col], errors='coerce')
    return df

def extract_table_data(driver, url):
    """Extract main table data from the page with multiple parsing attempts"""
    try:
        # Wait for the page to load
        time.sleep(3)  # Add a small delay to ensure content loads
        
        # Try multiple table class names that might exist
        table_classes = ['mctable1', 'table4', 'table']
        
        for class_name in table_classes:
            try:
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CLASS_NAME, class_name))
                )
                
                # Get page source and create soup
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                
                # Try finding tables with different methods
                tables = []
                
                # Method 1: Direct class search
                main_table = soup.find('table', class_=class_name)
                if main_table:
                    tables.append(main_table)
                
                # Method 2: Find all tables and process
                all_tables = soup.find_all('table')
                if all_tables:
                    tables.extend(all_tables)
                
                # Process found tables
                for table in tables:
                    try:
                        # Try multiple parsers
                        parsers = ['lxml', 'html5lib', 'html.parser']
                        for parser in parsers:
                            try:
                                df = pd.read_html(str(table), flavor=parser)[0]
                                if not df.empty:
                                    df = clean_numeric_data(df)
                                    return df
                            except Exception:
                                continue
                    except Exception as e:
                        print(f"Error processing table: {e}")
                        continue
                
            except Exception:
                continue
        
        # If no tables found with class names, try getting any table
        try:
            dfs = pd.read_html(driver.page_source)
            if dfs:
                df = dfs[0]
                df = clean_numeric_data(df)
                return df
        except Exception as e:
            print(f"Final attempt to extract table failed: {e}")
            
        return None
        
    except Exception as e:
        print(f"Error extracting table data from {url}: {e}")
        return None

def scrape_financial_data(url):
    """Scrape financial data focusing only on main content"""
    driver = None
    try:
        options = get_chrome_options()
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        driver.set_page_load_timeout(20)
        
        driver.get(url)
        
        data = extract_table_data(driver, url)
        
        if data is not None:
            print(f"\nExtracted Data Shape: {data.shape}")
            print("\nFirst few rows of data:")
            print(data.head())
            return data
            
    except Exception as e:
        print(f"Error processing {url}: {e}")
        return None
    finally:
        if driver:
            driver.quit()

def process_company_financials(company_name):
    """Main function to process all financial documents for a company"""
    all_data = {}
    
    for doc_type in financial_documents:
        print(f"\nProcessing {doc_type}...")
        search_results = search_financial_links(company_name, doc_type)
        
        if search_results and 'organic' in search_results:
            for result in search_results['organic']:
                url = result['link']
                print(f"Scraping: {url}")
                data = scrape_financial_data(url)
                if data is not None:
                    all_data[doc_type] = data
        
    return all_data

import pandas as pd
import re

def generate_financial_data_dict(company_name, financial_data):
    """Generate a dictionary of CSV-like DataFrames for use in the prompt."""
    try:
        # Ensure financial_data is valid
        if not financial_data or not isinstance(financial_data, dict):
            print(f"Warning: No valid financial data found for {company_name}.")
            return {}

        financial_data_dict = {}

        # Process each sheet and convert it to a cleaned DataFrame
        for doc_type, data in financial_data.items():
            if isinstance(data, pd.DataFrame) and not data.empty:
                data = data.copy()  # Prevent modifying the original DataFrame
                
                # Convert numeric values (if needed)
                data = clean_numeric_data(data)
                
                # Ensure valid dictionary keys (avoid invalid characters in sheet names)
                sheet_name = re.sub(r'[^a-zA-Z0-9_]', '_', doc_type[:31])
                
                # Store the cleaned DataFrame
                financial_data_dict[sheet_name] = data

        print(f"\n✅ Successfully processed financial data into dictionary for {company_name}.")

        return financial_data_dict  # Return the final processed dictionary
    
    except Exception as e:
        print(f"❌ Error processing data into dictionary: {e}")
        return {}


genai.configure(api_key="AIzaSyDnoG9oV3vq339P_3-WZRdMxA-8T9Uazsk")

def generate_analysis_with_gemini(prompt):
    """Send financial analysis prompt to Gemini Pro and get the response."""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {e}"



def generate_financial_analysis_prompt(financial_data):
    """Generate a structured prompt for financial analysis."""
    
    data_sections = ""
    for doc_type, data in financial_data.items():
        data_summary = data.describe(include='all').to_string()
        data_sections += f"**{doc_type}**:\n{data_summary}\n\n"

    prompt = f"""
    ### **Financial Analysis Prompt**  
    
    As a **Financial Analyst and AI expert**, provide a **comprehensive analysis** of the company based on the following financial data. **Focus on key insights, trends, and strategic recommendations.**  
     ### **Financial Data:**  
    {data_sections}
    Give me a final output of the stock narratives with probabilistic consistency in correspondence to below data.
    the answers should be backed by numeric data.
    ### **Data Analysis Required:**  
    1. **Financial Health Assessment:**  
       - Analyze **key financial ratios and metrics**  
       - Identify **trends in revenue, costs, and profitability**  
       - Evaluate **capital structure and liquidity position**  
    
    2. **Performance Analysis:**  
       - **Year-over-year growth** patterns  
       - **Quarterly performance trends**  
       - **Comparison with industry benchmarks** (if available)  
    
    3. **Risk Assessment:**  
       - Identify **potential financial risks**  
       - Analyze **debt levels and coverage ratios**  
       - **Working capital management**  
    
    4. **Strategic Insights:**  
       - **Recommend areas for improvement**  
       - Suggest **potential AI/ML applications** for:  
         - Revenue optimization  
         - Cost management  
         - Operational efficiency  
         - Risk management  
    
    ### **Structured Output Format (in Markdown):**  
    
    #### **1. Executive Summary**  
    [Provide a brief overview of key findings]  
    
    #### **2. Financial Health Analysis**  
    - **Profitability:** [Analysis]  
    - **Liquidity:** [Analysis]  
    - **Solvency:** [Analysis]  
    - **Growth:** [Analysis]  
    
    #### **3. Key Performance Indicators**  
    [List and analyze important KPIs]  
    
    #### **4. Risk Factors**  
    [Identify and explain key risks]  
    
    #### **5. Strategic Recommendations**  
    [Provide actionable recommendations]  

    
    #### **6. Future Outlook**  
    [Provide forward-looking analysis]  
    
    ### **Important Instructions:**  
    ✅ **Do not include NaN values** in the output.  
    ✅ **Use Markdown formatting** for clarity and readability.  
    ✅ **Include specific numbers and percentages** where relevant.  
    ✅ **Highlight unusual patterns, risks, or areas of concern.**  
    """
    return prompt



@app.route('/analyze', methods=['GET'])
def analyze():
    """API endpoint to analyze financial data for a company"""
    company_name = request.args.get('company', 'Zomato')  # Default to 'Zomato' if no company is provided
    financial_data = process_company_financials(company_name)
    financial_data_dict = generate_financial_data_dict(company_name, financial_data)
    prompt = generate_financial_analysis_prompt(financial_data_dict)
    prompt1 = generate_analysis_with_gemini(prompt)
    return jsonify({
        "company_name": company_name,
        "prompt1": prompt1,
    })

if __name__ == "__main__":
    app.run(debug=True)



from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

# Load the Excel file
file_path = "Zomato_financial_data.xlsx"
xls = pd.ExcelFile(file_path)

def get_cleaned_data(sheet_name):
    df = xls.parse(sheet_name)
    df = df.dropna(how='all')  # Remove empty rows
    df = df.fillna('')  # Replace NaN with empty string for JSON
    return df.to_dict(orient='records')

@app.route("/api/sheets", methods=["GET"])
def get_sheets():
    return jsonify({"sheets": xls.sheet_names})

@app.route("/api/data/<sheet_name>", methods=["GET"])
def get_sheet_data(sheet_name):
    if sheet_name in xls.sheet_names:
        data = get_cleaned_data(sheet_name)
        return jsonify({"sheet": sheet_name, "data": data})
    return jsonify({"error": "Sheet not found"}), 404

if __name__ == "__main__":
    app.run(debug=True,port=5000)
