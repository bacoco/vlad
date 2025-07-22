---
version: 1.0
project_type: "Progressive Web App (PWA)"
author: "Your Name"
created_at: "2025-01-22"
workflow:
  git_enabled: true
  auto_commit: true
  test_before_commit: true
  commit_style: detailed
  feature_branch: false
  auto_push_github: false
---

## FEATURE: Current Weather Display

[HIGH PRIORITY] Display current weather conditions with a clean, Google Weather-inspired interface. Show temperature (large, prominent), weather conditions, precipitation percentage, humidity, and wind speed. Include weather icon/animation that matches current conditions.

## FEATURE: Location Detection and Management

[HIGH PRIORITY] Automatic geolocation detection using browser API with fallback to IP-based location. Allow users to search and add multiple locations. Save favorite locations in localStorage for quick access. Show "Use exact location" option like Google Weather.

## FEATURE: Weather Forecast

[HIGH PRIORITY] Display 5-day weather forecast with daily high/low temperatures and weather icons. Include hourly forecast view with smooth temperature graph visualization over 24 hours. Tabbed interface to switch between Temperature, Precipitation, and Wind views.

## FEATURE: Progressive Web App Capabilities

[HIGH PRIORITY] Full PWA implementation with service worker for offline functionality. Cache last viewed weather data and display when offline. Add to home screen capability with app manifest. Push notifications for weather alerts (if time permits).

## FEATURE: Responsive Mobile Design

[HIGH PRIORITY] Mobile-first responsive design optimized for touch interactions. Smooth animations and transitions. Fast loading and performance optimized for mobile devices. Support for both portrait and landscape orientations.

## FEATURE: Temperature Unit Toggle

[MEDIUM PRIORITY] Toggle between Celsius and Fahrenheit with single tap on temperature display. Remember user preference in localStorage. Update all temperature displays simultaneously.

## FEATURE: Dark/Light Theme

[MEDIUM PRIORITY] Automatic theme based on system preference with manual toggle option. Smooth transition between themes. Persist theme preference. Ensure good contrast and readability in both modes.

## FEATURE: Weather Animations

[MEDIUM PRIORITY] Animated weather icons that represent current conditions (sun, clouds, rain, etc.). Subtle background animations or gradients that match weather conditions. Smooth transitions between different weather states.

## FEATURE: Weather Alerts

[LOW PRIORITY] Display weather warnings and alerts from Open-Meteo API. Push notifications for severe weather (if implemented). Visual indicators for alerts in the UI.

Dependencies: Location Detection and Management, Progressive Web App Capabilities

## FEATURE: Weather Map View

[LOW PRIORITY] Interactive weather radar/map showing precipitation. Temperature overlay on map. Basic zoom and pan functionality.

Dependencies: Location Detection and Management

## FEATURE: Share Weather

[LOW PRIORITY] Share current weather via Web Share API. Generate shareable weather snapshot image. Copy weather info to clipboard.

Dependencies: Current Weather Display

## EXAMPLES:

- Google Weather UI screenshot provided showing clean, modern interface with temperature graph
- Key UI elements: Location header, large temperature display, condition details, hourly graph, daily forecast cards

## DOCUMENTATION:

- https://open-meteo.com/en/docs - Open-Meteo API documentation (free, no API key required)
- https://nextjs.org/docs/app - Next.js App Router documentation
- https://web.dev/progressive-web-apps/ - PWA best practices
- https://react.dev/ - React documentation

## CONSTRAINTS:

- None specified - demo project with flexibility

## OTHER CONSIDERATIONS:

- Timeline: 1 week for complete demo
- Focus on polished UI matching Google Weather aesthetic
- Ensure smooth performance on mobile devices
- Use Open-Meteo API for all weather data (no API key needed)
- Implement comprehensive error handling for failed API calls or no network
- Consider implementing a simple loading skeleton while fetching data
- Use React Context or similar for global state (theme, units, locations)