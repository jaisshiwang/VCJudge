from llm.analyzer import analyze_pitch_deck

if __name__ == "__main__":
    with open("data/sample_pitch_text.txt") as f:
        deck_text = f.read()
    
    results = analyze_pitch_deck(deck_text)
    print(results)