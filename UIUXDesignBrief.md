# Touristo - UI/UX Design Brief

## 1. Introduction
This document outlines the visual and interactive design principles for the Touristo application. It defines the color palette, typography, and general layout guidelines to ensure a consistent and appealing user experience.

## 2. Brand Identity & Mood
*   **Core Concept:** Trust, Discovery, Adventure, Simplicity.
*   **Mood:** Friendly, Modern, Reliable, Inviting, Pakistani Cultural Elements (subtle).

## 3. Color Palette
### 3.1 Primary Colors
*   **Primary Blue:** #007BFF (Trust, Reliability, Action Buttons)
*   **Primary Green:** #28A745 (Success, Confirmations, Positive Actions)
*   **Primary Red:** #DC3545 (Errors, Destructive Actions, SOS Feature)

### 3.2 Secondary Colors
*   **Accent Orange:** #FD7E14 (Highlights, Promotions, Important Info)
*   **Neutral Gray:** #6C757D (Text, Borders, Disabled States)
*   **Light Gray:** #F8F9FA (Backgrounds, Cards)
*   **Dark Gray:** #343A40 (Headings, Text on Light)

### 3.3 Background & Surface Colors
*   **Main Background:** #FFFFFF (Clean, Bright)
*   **Card Background:** #FFFFFF (Or subtle #F8F9FA if contrast is needed)

## 4. Typography
### 4.1 Font Family
*   **Primary Font:** Inter or a similar modern, clean sans-serif font for readability on mobile devices.

### 4.2 Hierarchy
*   **H1 (Page Titles):** 28px, Bold
*   **H2 (Section Headers):** 24px, Semi-Bold
*   **H3 (Sub-Headers):** 20px, Semi-Bold
*   **Body Large:** 16px, Regular
*   **Body Small:** 14px, Regular
*   **Caption:** 12px, Regular
*   **Button Text:** 16px, Medium

## 5. Layout & Spacing
### 5.1 Grid System
*   Use a flexible grid system based on Tailwind CSS principles for responsiveness.
*   Standard gutter width: 16px (1rem).
*   Margin/Padding scale based on 4px increments (e.g., 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64).

### 5.2 Screen Layout Principles
*   **Mobile-First:** Prioritize single-column layouts.
*   **Consistent Margins:** Maintain 16px margin from screen edges.
*   **Touch Targets:** Ensure all interactive elements (buttons, links) are at least 44x44 pixels for easy tapping.
*   **Card-Based Design:** Use cards to group related content on the Home, Search, and Explore screens.

## 6. Key UI Components
### 6.1 Buttons
*   **Primary Button:** Solid background with primary blue, white text.
*   **Secondary Button:** Outline with primary blue border and text.
*   **Danger Button:** Solid red background, white text.
*   **Size:** Minimum height of 44px, padding horizontal 16px.

### 6.2 Input Fields
*   **Style:** Rounded corners (e.g., `rounded-lg`), border outline.
*   **Padding:** 12px vertical, 16px horizontal.
*   **Focus State:** Border color changes to primary blue with a subtle shadow.

### 6.3 Navigation
*   **Bottom Tab Bar:** For primary app navigation (Home, Search, Bookings, Profile).
*   **Header:** Clear back button, title, and potential action icons (e.g., search, menu).

## 7. Design Guidelines
*   **Clarity:** Prioritize clear, scannable information.
*   **Feedback:** Provide immediate feedback for user actions (button presses, loading states).
*   **Accessibility:** Ensure sufficient color contrast and support for screen readers.
*   **Visual Hierarchy:** Use size, weight, and color to guide the user's eye.
*   **Loading States:** Implement skeleton screens or spinners for API calls.