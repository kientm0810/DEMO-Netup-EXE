# NetUp MVP - Requirement Update Log (2026-03-24)

## Requested Changes
1. Add map option after search/filter in Discovery.
2. Change website main color style to Gray-Red.
3. Add demo chatbot:
- Answer feature questions from website context file.
- Suggest courts/sessions based on user input.
4. Add player capability assessment form:
- User self-input
- Classify skill level
- Use level for recommendations
5. Update README to reflect new requirements and target.
6. Add separate file(s) to keep requirement/context for future reference.

## Implemented
- `List / Map` toggle in Player Discovery.
- Court map integrated with `react-leaflet`.
- Gray-Red theme updates across layout and key UI components.
- New chatbot page: `/assistant/chatbot`.
- Added chatbot context doc: `CHATBOT_CONTEXT.md`.
- Added local chatbot knowledge data in `src/mocks/chatbotKnowledge.ts`.
- New player assessment page: `/player/assessment`.
- Assessment result connected to recommendation logic in Discovery and Chatbot.
- Root README updated for all new targets and routes.

## Notes
- This remains frontend-only MVP demo.
- No real backend, auth, payment, or AI model integration.
