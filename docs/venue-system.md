# Venue System

Venues serve as the geographical anchors for all Matches on PlayGrid.

## Architecture

The Venue System integrates directly with **Mapbox GL** on the frontend, plotting venues geographically to allow intuitive match discovery.

## Lifecycle & Verification

To maintain data integrity and prevent malicious spam, Venues follow a verification workflow:
1. **Submission**: Any user can propose a new venue, providing coordinates, names, and images.
2. **Pending State**: The venue is held in a `PENDING` state and is invisible to standard users.
3. **Admin Approval**: A platform administrator reviews the submission and marks it as `VERIFIED`.
4. **Active State**: The venue can now be selected by any user to host Matches.

This ensures the platform's geographical data remains clean and highly accurate.
