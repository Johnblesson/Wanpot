// The sermon prompt template (we'll fill in the topic)
const SERMON_PROMPT_TEMPLATE = (topic) => `
Generate a complete, spirit-filled sermon based on the following theme/title/subject:
👉 ${topic}

When generating the sermon, please do the following:

1. Make the message deeply intimate and full of revelation.
• Carry the tone of deep communion, prophetic depth, and spiritual hunger.
• Let the message penetrate the heart, stir spiritual hunger, and build divine awareness.

2. Provide a rich exegetical interpretation of the main text(s).
• Break down key Greek/Hebrew words and their meanings.
• Give detailed contextual, historical, and linguistic analysis.
• Show the connective threads between Old and New Testament.
• Extract doctrinal truths, prophetic patterns, typologies, and divine mysteries.

3. Include multiple supportive scriptures.
For each scripture:
• Explain the meaning.
• Give the revelation it unlocks.
• Show how it strengthens the message.

4. Produce a structured sermon outline.
Include:
Introduction
Foundational text(s)
Exegesis section
Revelation points
Prophetic insights
Application dimensions
Wise sayings / “Words of the Spirit”
Conclusion
Prayer points (5–10)
Prophetic declarations

5. Modify, expand, and amplify the user’s ideas.
• If the user provides notes, transform them into a complete, polished, sound message.
• Maintain theological accuracy.
• Make the style authoritative, refined, and deeply spiritual.

6. Provide suggested related topics.
Offer 5–10 advanced, prophetic, and doctrinally-rich sermon themes that can continue the series.

7. Maintain a Spirit-filled tone throughout.
• Carry weight.
• Carry atmosphere.
• Carry depth.
• Carry intimacy.
• Carry the fragrance of revelation.
`;