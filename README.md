# 🌿 Swachh Nagar (स्वच्छ नगर)
### Nagar Nigam Smart Waste Grievance Redressal & Operations Management System

An end-to-end municipal civic tech application designed to streamline urban waste reporting, automated routing to local Nagar Nigam ward offices, official sanitary instructions, sweeper pickup dispatch, live citizen grievance tracking, before-and-after photographic verification, civic analytics, and waste segregation awareness.

---

## 🌟 Core Modules Implemented

The application implements all 7 core specifications requested:

### 1. User Registration & Multi-Role Authentication
- **Citizen Registration**: Full name, mobile number, email, assigned residential ward, and password.
- **Role-Based Portals**:
  - 👤 **Citizen**: Reports waste issues, tracks tickets, reviews proof photos, submits satisfaction ratings.
  - 🏢 **Nagar Nigam Ward Officer**: Reviews incoming grievances for their zone, inspects photos, adds specific cleaning instructions, and assigns designated sweepers.
  - 🧹 **Sanitation Worker / Sweeper**: Receives official instructions, views pickup locations, updates status to "In Progress", and uploads "After-Cleaning" proof photos.
  - 👑 **Municipal Commissioner / Admin**: High-level city overview, GIS waste heatmap, workforce leaderboard, and resolution rate analytics.
- **Instant Role Switcher**: A quick role dropdown in the top header lets you immediately toggle between all 4 personas for rapid end-to-end testing without tedious re-logins.

### 2. Report Waste Issues
- **Comprehensive Issue Categories**: Overflowing Community Dustbin, Illegal Roadside Garbage Dump, Dead Animal Carcass (Biohazard), Plastic / E-Waste Dump, Construction & Demolition Debris, Blocked Open Drains.
- **GPS Location Auto-Detect**: One-click simulated GPS pinpointing with exact address and landmark fields.
- **Severity Classification**: Low, Medium, High / Urgent Biohazard.
- **Photographic Upload & Presets**: Supports local file uploads via drag-and-drop or 1-click test photos for instant demo verification.
- **Unique Grievance ID**: Generates official formatted tracking codes (e.g. `NN-2026-8492`).

### 3. Local Area Nagar Nigam Routing
- **Ward-Based Municipal Desks**: Dynamically routes complaints to designated municipal ward offices (Ward 1 - Hazratganj, Ward 2 - Shanti Nagar, Ward 3 - Gandhi Chowk, Ward 4 - Civil Lines, Ward 5 - Subhash Nagar).
- **Zonal Officer Contact Info**: Displays the assigned Sanitary Inspector's name, direct hotline, and desk address automatically as the citizen selects their colony.

### 4. Nagar Nigam Sweeper Instructions & Pickup Dispatch
- **Officer Review Desk**: Ward officers review citizen photos, location coordinates, severity, and timestamps.
- **Official Work Instructions**: Officers issue specific directives to the crew (e.g., *"Deploy hydraulic tipper truck UP-32-BW-4821 immediately. Ensure waste is cleared from surrounding footpath and disinfect with calcium hypochlorite (lime powder) immediately."*).
- **Crew & Vehicle Assignment**: Selects available ward sweepers (Ramesh Kumar, Sita Devi, Vikram Singh, etc.) and vehicles (Auto Tipper, Compactor Van, Bio-waste Van).
- **Pickup Request Dispatch**: Updates status to *"Sweeper Dispatched"* and routes the ticket to the worker's queue.

### 5. Complain Tracking & Citizen Feedback
- **Multi-Stage Visual Timeline**:
  1. 📌 *Citizen Grievance Lodged* (Timestamp, details, before photo)
  2. 🏢 *Routed to Local Area Nagar Nigam Office* (Ward office acknowledgment)
  3. 🚚 *Sweeper Dispatched & Work Instructions Issued* (Crew name, vehicle number, phone, official instructions)
  4. 🧹 *Cleaning & Pickup In Progress* (Active on-site cleanup)
  5. ✅ *Resolved & Verified* (Resolution notes and metric tons cleared)
- **Before vs After Photographic Verification**: Side-by-side photo comparison of the reported trash vs the cleaned site.
- **Citizen Feedback & 1-5 Star Rating**: Citizens rate service turnaround and leave satisfaction comments.

### 6. Admin & Municipal Operations Dashboard
- **Executive KPIs**: Total Complaints Lodged, Resolved, In Progress, Pending Verification, Cleared Metric Tons, Citizen Satisfaction Average.
- **Interactive GIS Heatmap (Leaflet.js)**: Color-coded pins (Red = Pending, Blue = Dispatched, Green = Resolved) with clickable popups.
- **Analytics Visualizations (Chart.js)**:
  - Resolution Ratio Donut Chart
  - Ward-wise Grievance Volume & Clearance Stacked Bar Chart
- **Workforce Performance Leaderboard**: Tracks sweepers' completed tasks, current status, and public ratings.
- **Export CSV Report**: 1-click CSV download of all complaint records for municipal archiving.

### 7. Waste Awareness & Citizen Education Hub
- **3-Color Segregation Guidelines**:
  - 🟢 **Green Bin**: Wet / Organic kitchen waste, composting tips.
  - 🔵 **Blue Bin**: Dry / Recyclable plastics, glass, paper, aluminum.
  - 🔴 **Red Bin**: Hazardous chemicals, expired medicines, sanitary, and e-waste.
- **"Which Bin Does It Belong To?" Smart Lookup**: Real-time search classifier that tells citizens exactly where items like pizza boxes, batteries, milk pouches, and broken glass belong.
- **By-Laws & Fines**: Outlines penalties under NGT directives for open waste burning (up to ₹25,000 fine) and littering.
- **Interactive Swachh Citizen Quiz**: 5 interactive questions with instant scoring, answer explanations, and a *Gold Citizen Badge*.

---

## 🚀 How to Run the Application

This is a zero-dependency, self-contained modern web application.

1. Navigate to:
   ```
   C:\Users\AYUSH GUPTA\.gemini\antigravity\scratch\nagar-nigam-waste-management
   ```
2. Double-click or open **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave).
3. Everything runs locally out of the box with offline-ready state persistence via `localStorage`.

---

## 🧪 Quick Test-Drive Walkthrough

1. **Submit a Complaint**:
   - On the default "Report Waste" tab, select an issue type (e.g. *Overflowing Community Dustbin*).
   - Select *Ward 4 - Civil Lines / East Zone*.
   - Click **"Auto-Detect GPS Location"** to fill sample coordinates.
   - Click the test button **"Overflowing Bin"** to load a sample waste photo.
   - Click **"Submit Waste Grievance to Nagar Nigam"**.
2. **Review as Nagar Nigam Officer**:
   - Switch role to **"Nagar Nigam Officer (Dr. Sharma)"** using the top-right role dropdown or click the **"Nagar Nigam Desk"** tab.
   - Click **"Instruct & Assign"** on the complaint.
   - Choose a sweeper (e.g., *Ramesh Kumar*), adjust official instructions, and click **"Dispatch Sweeper & Send Pickup Request"**.
3. **Fulfill as Sweeper**:
   - Switch role to **"Sweeper Crew (Ramesh Kumar)"** or navigate to the **"Sweeper Tasks"** tab.
   - Click **"Start Cleanup (En Route)"** to update the citizen tracker.
   - Click **"Complete & Upload Proof"**, review the after-cleaning photo, and submit.
4. **Track & Rate as Citizen**:
   - Go to the **"Track Complaint"** tab.
   - Notice the complete 5-stage progress timeline and side-by-side Before/After verification photos!
   - Give a 5-star rating and submit feedback.
5. **Inspect Analytics & Awareness**:
   - View the **"Admin Analytics"** tab to check the GIS map and updated KPI charts.
   - View the **"Waste Awareness"** tab to test the item classifier and take the Swachh Citizen Quiz.

---

## 📁 File Structure

```
nagar-nigam-waste-management/
├── index.html           # Main Single-Page Application
├── README.md            # Comprehensive documentation & walkthrough
├── css/
│   └── styles.css       # Custom styles, animations, badges & timeline
└── js/
    ├── store.js         # LocalStorage persistence & pre-seeded civic data
    ├── auth.js          # Authentication, multi-role switcher & profiles
    ├── complaints.js    # Grievance reporting, routing & sweeper dispatch
    ├── tracking.js      # Visual 5-step timeline, before/after proof & rating
    ├── admin.js         # Leaflet GIS map, Chart.js graphs, CSV export
    ├── awareness.js     # 3-Bin guide, smart item classifier & civic quiz
    └── app.js           # Navigation routing & global toast notifications
```
