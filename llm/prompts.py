PITCH_ANALYSIS_PROMPT = """
Given the following startup pitch content, score the startup on each of the following 10 metrics (0–10) and provide 1-2 lines of explanation for each:

1. Team Experience and track record  
2. Market Size  
3. Problem-Solution Fit  
4. Product Market Fit  
5. Competitive Landscape  
6. Traction (If not Pre-seed)  
7. Business Model  
8. Financial Projections  
9. GTM Strategy  
10. Scalability

Startup Pitch Deck Text:
{deck_text}

Format the output as:

Metric Name: X/10  
Reason: Your reasoning here.
"""