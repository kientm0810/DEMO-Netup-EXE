# NetUp Chatbot Context (Demo)

## Purpose
This file defines the context knowledge for the NetUp demo chatbot.
The chatbot should answer questions about website features and provide basic court/session suggestions.

## Product Scope
- Player can discover sessions, filter options, book by 2 modes, and receive QR demo.
- Owner can monitor dashboard, manage courts, and check-in users by booking code.
- Admin can manage platform configuration (platform fee, floor fee, matching radius, risk rules).

## Key Feature Explanations
1. Booking modes
- Solo mode (Group A): pay per slot + floor fee.
- Full-court mode (Group B): pay full court price, floor fee = 0.

2. Discovery Map
- Users can switch List/Map view after filtering.
- Map markers show court locations and active sessions.

3. Check-in
- Booking success page generates a QR demo.
- Owner check-in page can validate booking code and mark check-in.

4. Admin config
- Platform fee
- Floor fee
- Matching radius
- No-show strike limit
- Auto release minutes

5. Player self-assessment
- User fills a form (frequency, experience, stamina, technique, tactical).
- System calculates score and classifies level.
- Level is used to suggest suitable sessions.

## Recommendation Rules (Demo)
- Prioritize sport match.
- Prioritize skill compatibility.
- Prefer selected district.
- Prefer sessions within budget.
- Prefer sessions with open slots.

## Limitation
- Demo chatbot is local rule-based logic, not connected to external AI model.
- All answers are based on static context + mock data.
