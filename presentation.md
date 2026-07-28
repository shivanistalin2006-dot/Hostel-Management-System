---
marp: true
theme: default
class: lead
backgroundColor: #f8fafc
---

# Hostel Room Allocation and Maintenance Register
## SIH 2026 - Internal Practical Assessment

---

# 1. The Problem
- **Current State:** Hostel uses printed lists for room allocation and logs complaints verbally at the desk.
- **Consequences:** 
  - Nobody knows which rooms are vacant quickly.
  - Complaints get lost, and outstanding issues are forgotten.
  - Students complain repeatedly because past logs aren't visible.
  - Management has no oversight over repair times.

---

# 2. The Solution
A unified, digital register that tracks real-time room occupancy and securely logs maintenance complaints with full history, ensuring no issue is ever lost and management can immediately identify urgent outstanding faults.

---

# 3. Application Screenshots
*(Insert screenshot of the Add Room and Log Complaint Form here)*
*(Insert screenshot of the Complaint Register Listing here)*

> **Note:** The application features a glassmorphic dark theme tailored for clarity and ease of use, prioritizing urgent outstanding complaints at the top of the list.

---

# 4. How Derived Figures Are Calculated
- **Days Outstanding:** Calculated dynamically on the server by taking the difference between the current timestamp (`julianday('now')`) and the `created_at` timestamp of the complaint.
- **Hours Outstanding:** Derived by multiplying the days outstanding by 24.
- **Logic:** Server-side calculation ensures all users see exactly the same figure regardless of their local timezone or browser settings.

---

# 5. Project Status
- **What Works:**
  - End-to-end room registration and complaint logging.
  - Server-side validation and derived figure calculation.
  - Listing ordered by outstanding status and age.
  - Status history tracking in a separate database table.
  - Docker containerization.
- **What is Unfinished:**
  - Authentication for desk clerks/wardens.
  - Demonstration video recording.

---

# 6. Future Improvement
- **Improvement:** Implement automated email/SMS notifications to the maintenance staff when a complaint becomes "urgent" (e.g., > 48 hours outstanding). This would proactively reduce the time students wait for critical repairs.
