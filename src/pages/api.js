export const fetchStockData = async (symbol, period = '1mo') => {
    const res = await fetch(`http://127.0.0.1:5000/stock/${symbol}?period=${period}`);
    if (!res.ok) {
        throw new Error('Failed to fetch stock data');
    }
    return await res.json();
};