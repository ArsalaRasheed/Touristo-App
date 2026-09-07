# Touristo — UI/UX Design Brief

## 1. Introduction

Touristo is a modern Pakistan-first tourism marketplace designed to connect travelers with tour companies and tour guides.

The interface should communicate:

* Trust
* Discovery
* Adventure
* Simplicity
* Safety
* Professionalism

The design should feel modern and premium without becoming visually complicated.

---

# 2. Design Direction

## Overall Mood

* Modern
* Clean
* Friendly
* Trustworthy
* Travel-focused
* Professional
* Energetic
* Easy to navigate

Subtle Pakistani cultural elements may be used where appropriate, but the interface should remain contemporary rather than heavily decorative.

---

# 3. Color System

The application should use the existing project theme and CSS variables rather than introducing a new fixed palette in individual screens.

Use semantic theme variables such as:

```text
--surface-primary
--surface-secondary
--text-primary
--text-secondary
--border-primary
--accent-primary
```

Components should remain consistent with the existing Touristo visual system.

### Important

Do not introduce unrelated blue/green/orange color systems into individual screens.

Status colors may still be used semantically:

* Success
* Warning
* Error
* Emergency/SOS

---

# 4. Typography

Use a clean modern sans-serif font.

Recommended hierarchy:

* Page title: 28–32px, bold
* Section heading: 20–24px, semibold
* Card title: 16–18px, semibold
* Body: 14–16px
* Supporting text: 12–14px
* Button text: 14–16px, medium/semibold

Typography should prioritize readability and hierarchy.

---

# 5. Layout

The interface should use:

* Responsive layouts
* Consistent spacing
* Flexible grids
* Clear content sections
* Appropriate whitespace
* Card-based grouping
* Responsive desktop/mobile behavior

Avoid overcrowded screens.

---

# 6. Cards

Cards should be used for:

* Destinations
* Tour packages
* Hosts
* Tour guides
* Experiences
* Booking information
* Inbox conversations

Cards should have:

* Clear hierarchy
* Consistent padding
* Subtle borders/shadows
* Appropriate image proportions
* Clear primary action
* Good hover/focus states

---

# 7. Package Cards

Package cards should clearly show:

* Package image
* Package title
* Host/company
* Verification indicator when available
* Rating
* Duration
* Price
* Short supporting information
* Primary action

Avoid excessive text inside cards.

---

# 8. Host Cards

Host cards should communicate:

* Company name
* Verification
* Rating
* Location
* Package availability
* Short description

The design should emphasize trust.

---

# 9. Tour Guide Cards

Tour-guide cards should show:

* Photo where available
* Name
* Specialty
* Rating

Pre-booking guide chat should not be presented as a primary action.

---

# 10. Navigation

### Traveler Primary Navigation

```text
Home
Search
AI Planner
SOS
Profile
```

### Host Primary Navigation

```text
Dashboard
My Packages
Bookings
Profile
```

Additional functionality such as Inbox is accessible through the Profile/Dashboard experience and contextual actions.

---

# 11. Inbox UX

The Inbox should provide:

### Traveler

* Conversation list
* Host/company identity
* Verification badge
* Last message
* Timestamp
* Unread count
* Package context
* Active conversation
* Message composer

### Host

* Customer inquiries
* Traveler identity
* Last message
* Unread count
* Package context
* Conversation workspace

The messaging experience should remain simple and marketplace-focused.

---

# 12. Booking UX

Booking screens should clearly display:

* Package
* Travel date
* Traveler count
* Special requests
* Price breakdown
* Payment-method selection
* Booking confirmation state

The UI must clearly distinguish booking submission from actual payment processing because the current MVP does not include a live payment gateway.

---

# 13. AI Trip Planner UX

The AI Planner should feel like a helpful travel assistant.

It should include:

* Conversation history
* User messages
* AI responses
* Loading state
* Error state
* Suggested prompts
* Language-aware responses

---

# 14. Safety UX

The SOS feature should be visually distinct and easy to access.

Important actions should be:

* Clearly labeled
* High contrast
* Large enough to tap
* Easy to understand under stress

The interface must not imply that the application automatically contacts emergency authorities when it does not.

---

# 15. Loading & Empty States

All API-driven screens should provide appropriate:

* Loading skeletons
* Empty states
* Error messages
* Retry actions

Empty states should explain what the user can do next instead of simply showing a blank screen.

---

# 16. Accessibility

The application should prioritize:

* Sufficient color contrast
* Keyboard accessibility
* Visible focus states
* Semantic buttons/links
* Descriptive labels
* Accessible touch targets
* Clear error messages

---

# 17. Responsive Design

The interface must work across:

* Mobile
* Tablet
* Desktop

Mobile layouts should prioritize:

* Single-column content
* Clear navigation
* Touch-friendly controls

Desktop layouts can use:

* Multi-column grids
* Sidebars
* Expanded content areas

---

# 18. Design Principles

### Clarity

Users should understand what each screen does immediately.

### Consistency

Similar components should look and behave consistently.

### Trust

Verification, ratings, pricing, and host information should be easy to understand.

### Simplicity

Avoid unnecessary decoration or excessive text.

### Feedback

Every important interaction should provide visual feedback.

### Responsiveness

Layouts should adapt smoothly to different screen sizes.
