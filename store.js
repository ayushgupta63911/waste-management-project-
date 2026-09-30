/**
 * State Management & LocalStorage Store
 * Pre-seeded with realistic Nagar Nigam civic data
 */

const STORAGE_KEYS = {
  USERS: 'swachh_nagar_users',
  CURRENT_USER: 'swachh_nagar_current_user',
  COMPLAINTS: 'swachh_nagar_complaints',
  SWEEPERS: 'swachh_nagar_sweepers',
  WARDS: 'swachh_nagar_wards',
  AWARENESS_QUIZ: 'swachh_nagar_quiz',
  ACTIVITY_LOG: 'swachh_nagar_activity'
};

const INITIAL_WARDS = [
  { id: 'W-01', name: 'Ward 1 - Hazratganj / Central Zone', officer: 'Er. Anil Verma', phone: '0522-220011', email: 'ward1@nagarnigam.gov.in', lat: 26.8524, lng: 80.9421 },
  { id: 'W-02', name: 'Ward 2 - Shanti Nagar / North Zone', officer: 'Dr. Meena Kapoor', phone: '0522-220022', email: 'ward2@nagarnigam.gov.in', lat: 26.8720, lng: 80.9310 },
  { id: 'W-03', name: 'Ward 3 - Gandhi Chowk / South Zone', officer: 'Shri Sanjay Yadav', phone: '0522-220033', email: 'ward3@nagarnigam.gov.in', lat: 26.8340, lng: 80.9250 },
  { id: 'W-04', name: 'Ward 4 - Civil Lines / East Zone', officer: 'Dr. Rajesh Sharma', phone: '0522-220044', email: 'ward4@nagarnigam.gov.in', lat: 26.8610, lng: 80.9580 },
  { id: 'W-05', name: 'Ward 5 - Subhash Nagar / West Zone', officer: 'Er. Rohit Tiwari', phone: '0522-220055', email: 'ward5@nagarnigam.gov.in', lat: 26.8450, lng: 80.9120 }
];

const INITIAL_SWEEPERS = [
  { id: 'SW-101', name: 'Ramesh Kumar', phone: '+91 94150 11223', wardId: 'W-04', wardName: 'Ward 4 - Civil Lines', vehicle: 'Auto Tipper (UP-32-BW-4821)', status: 'Available', tasksCompleted: 48, rating: 4.8 },
  { id: 'SW-102', name: 'Sita Devi', phone: '+91 94150 33445', wardId: 'W-02', wardName: 'Ward 2 - Shanti Nagar', vehicle: 'Compactor Van (UP-32-CV-1092)', status: 'On Duty', tasksCompleted: 62, rating: 4.9 },
  { id: 'SW-103', name: 'Vikram Singh', phone: '+91 98390 55667', wardId: 'W-05', wardName: 'Ward 5 - Subhash Nagar', vehicle: 'Bio-waste Van (UP-32-BW-9901)', status: 'Available', tasksCompleted: 35, rating: 4.7 },
  { id: 'SW-104', name: 'Rajesh Meena', phone: '+91 98891 77889', wardId: 'W-03', wardName: 'Ward 3 - Gandhi Chowk', vehicle: 'Tractor Trolley (UP-32-TT-4412)', status: 'Available', tasksCompleted: 53, rating: 4.6 },
  { id: 'SW-105', name: 'Sunita Rawat', phone: '+91 94520 88990', wardId: 'W-01', wardName: 'Ward 1 - Hazratganj', vehicle: 'Electric E-Cart (UP-32-EC-0055)', status: 'Available', tasksCompleted: 41, rating: 4.8 }
];

const INITIAL_USERS = [
  {
    id: 'USR-01',
    name: 'Ayush Gupta',
    email: 'ayush@gmail.com',
    password: 'password123',
    phone: '9876543210',
    role: 'citizen',
    ward: 'Ward 4 - Civil Lines / East Zone',
    address: 'Flat 402, Green Valley Apartments, Civil Lines'
  },
  {
    id: 'USR-02',
    name: 'Dr. Rajesh Sharma (Zonal Sanitary Inspector)',
    email: 'officer@nagarnigam.gov.in',
    password: 'admin',
    phone: '0522-220044',
    role: 'officer',
    ward: 'Ward 4 - Civil Lines / East Zone',
    department: 'Nagar Nigam Health & Sanitation Wing'
  },
  {
    id: 'USR-03',
    name: 'Ramesh Kumar (Sanitation Crew Lead)',
    email: 'ramesh@nagarnigam.gov.in',
    password: 'worker',
    phone: '+91 94150 11223',
    role: 'sweeper',
    ward: 'Ward 4 - Civil Lines / East Zone',
    sweeperId: 'SW-101'
  },
  {
    id: 'USR-04',
    name: 'Municipal Commissioner',
    email: 'commissioner@nagarnigam.gov.in',
    password: 'admin',
    phone: '0522-221100',
    role: 'admin',
    department: 'City Municipal Corporation Headquarters'
  }
];

// Realistic images for before/after demonstration
const SAMPLE_PHOTOS = {
  overflowing_bin: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=700&q=80',
  street_garbage: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=700&q=80',
  plastic_dump: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=700&q=80',
  cleaned_street: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=700&q=80',
  cleaned_bin: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=700&q=80'
};

const INITIAL_COMPLAINTS = [
  {
    id: 'NN-2026-8492',
    citizenName: 'Ayush Gupta',
    citizenPhone: '9876543210',
    citizenEmail: 'ayush@gmail.com',
    wardId: 'W-04',
    wardName: 'Ward 4 - Civil Lines / East Zone',
    wasteType: 'Overflowing Community Dustbin',
    severity: 'High',
    address: 'Near Civil Lines Metro Station Gate 2, Park Road',
    landmark: 'Opposite State Bank ATM',
    description: 'The green community dumpster has been overflowing for the last 48 hours. Stray cattle and dogs are scattering garbage across the main walking pathway.',
    photoBefore: SAMPLE_PHOTOS.overflowing_bin,
    photoAfter: null,
    status: 'Sweeper Dispatched', // Pending | Nagar Nigam Verified | Sweeper Dispatched | In Progress | Resolved
    createdAt: '2026-09-29T09:30:00Z',
    verifiedAt: '2026-09-29T10:15:00Z',
    assignedOfficer: 'Dr. Rajesh Sharma',
    officerInstruction: 'Deploy hydraulic tipper truck UP-32-BW-4821 immediately. Ensure waste is cleared from surrounding footpath and disinfect with calcium hypochlorite (lime powder) immediately.',
    assignedSweeperId: 'SW-101',
    assignedSweeperName: 'Ramesh Kumar',
    sweeperPhone: '+91 94150 11223',
    vehicleNumber: 'Auto Tipper (UP-32-BW-4821)',
    estimatedResolutionTime: '2026-09-30T14:00:00Z',
    resolvedAt: null,
    citizenRating: null,
    citizenFeedback: null,
    lat: 26.8615,
    lng: 80.9575
  },
  {
    id: 'NN-2026-8450',
    citizenName: 'Priya Sharma',
    citizenPhone: '98220 91823',
    citizenEmail: 'priya.s@yahoo.com',
    wardId: 'W-02',
    wardName: 'Ward 2 - Shanti Nagar / North Zone',
    wasteType: 'Illegal Roadside Garbage Dump',
    severity: 'Medium',
    address: 'Lane 4, Near Sabzi Mandi Corner, Shanti Nagar',
    landmark: 'Behind Community Temple',
    description: 'Rotting vegetable waste and single-use plastic bags piled up by vendors during the evening market. Bad foul smell spreading into residences.',
    photoBefore: SAMPLE_PHOTOS.street_garbage,
    photoAfter: SAMPLE_PHOTOS.cleaned_street,
    status: 'Resolved',
    createdAt: '2026-09-28T14:20:00Z',
    verifiedAt: '2026-09-28T15:00:00Z',
    assignedOfficer: 'Dr. Meena Kapoor',
    officerInstruction: 'Dispatch evening compactor van. Clean the wet vegetable compost and clear roadside drain grates.',
    assignedSweeperId: 'SW-102',
    assignedSweeperName: 'Sita Devi',
    sweeperPhone: '+91 94150 33445',
    vehicleNumber: 'Compactor Van (UP-32-CV-1092)',
    resolvedAt: '2026-09-28T17:45:00Z',
    resolutionNotes: 'Site completely cleared and deep swept. 1.2 metric tons of mixed waste sent to central MRF plant. Vendor warned against dumping.',
    citizenRating: 5,
    citizenFeedback: 'Spectacular turnaround! The Nagar Nigam team arrived in 2 hours and left the entire street spotless. Thank you Sita Devi and Ward 2 office!',
    lat: 26.8718,
    lng: 80.9325
  },
  {
    id: 'NN-2026-8511',
    citizenName: 'Vikas Malhotra',
    citizenPhone: '97992 44331',
    citizenEmail: 'vikas.m@gmail.com',
    wardId: 'W-03',
    wardName: 'Ward 3 - Gandhi Chowk / South Zone',
    wasteType: 'Construction & Demolition Debris',
    severity: 'Medium',
    address: 'Gandhi Chowk Main Circle, Near Clock Tower',
    landmark: 'Opposite City Library',
    description: 'Renovation debris (broken concrete blocks, plaster, and tiles) dumped overnight on the pedestrian footpath obstructing wheelchair access.',
    photoBefore: SAMPLE_PHOTOS.plastic_dump,
    photoAfter: null,
    status: 'Pending Verification',
    createdAt: '2026-09-30T07:15:00Z',
    verifiedAt: null,
    assignedOfficer: null,
    officerInstruction: null,
    assignedSweeperId: null,
    assignedSweeperName: null,
    sweeperPhone: null,
    vehicleNumber: null,
    resolvedAt: null,
    citizenRating: null,
    citizenFeedback: null,
    lat: 26.8345,
    lng: 80.9248
  },
  {
    id: 'NN-2026-8519',
    citizenName: 'Sunil Verma',
    citizenPhone: '94155 66778',
    citizenEmail: 'sunil.verma@gmail.com',
    wardId: 'W-05',
    wardName: 'Ward 5 - Subhash Nagar / West Zone',
    wasteType: 'Dead Animal Carcass / Biohazard',
    severity: 'High',
    address: 'Sector B Road, Subhash Nagar',
    landmark: 'Near Water Tank',
    description: 'Deceased stray animal on road side creating sanitary hazard and risk of disease spread. Needs urgent medical clearance.',
    photoBefore: SAMPLE_PHOTOS.street_garbage,
    photoAfter: null,
    status: 'In Progress',
    createdAt: '2026-09-30T08:00:00Z',
    verifiedAt: '2026-09-30T08:20:00Z',
    assignedOfficer: 'Er. Rohit Tiwari',
    officerInstruction: 'Bio-waste protocol: Worker Vikram Singh to wear full PPE safety kit. Transport to veterinary incinerator immediately.',
    assignedSweeperId: 'SW-103',
    assignedSweeperName: 'Vikram Singh',
    sweeperPhone: '+91 98390 55667',
    vehicleNumber: 'Bio-waste Van (UP-32-BW-9901)',
    resolvedAt: null,
    citizenRating: null,
    citizenFeedback: null,
    lat: 26.8455,
    lng: 80.9125
  }
];

class Store {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.WARDS)) {
      localStorage.setItem(STORAGE_KEYS.WARDS, JSON.stringify(INITIAL_WARDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SWEEPERS)) {
      localStorage.setItem(STORAGE_KEYS.SWEEPERS, JSON.stringify(INITIAL_SWEEPERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Ayush Gupta (Citizen) for immediate seamless experience
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
  }

  // --- Users & Auth ---
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  saveUser(user) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth:change', { detail: user }));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new CustomEvent('auth:change', { detail: null }));
  }

  // --- Complaints CRUD ---
  getComplaints() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS) || '[]');
  }

  getComplaintById(id) {
    const list = this.getComplaints();
    return list.find(c => c.id.toLowerCase() === id.toLowerCase().trim());
  }

  saveComplaint(complaint) {
    const list = this.getComplaints();
    list.unshift(complaint);
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));
    this.logActivity(`New complaint lodged: ${complaint.id} (${complaint.wasteType}) in ${complaint.wardName}`);
    window.dispatchEvent(new CustomEvent('complaints:update', { detail: complaint }));
    return complaint;
  }

  updateComplaint(id, updates) {
    const list = this.getComplaints();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));
      this.logActivity(`Complaint updated: ${id} -> Status: ${updates.status || list[idx].status}`);
      window.dispatchEvent(new CustomEvent('complaints:update', { detail: list[idx] }));
      return list[idx];
    }
    return null;
  }

  // --- Wards & Sweepers ---
  getWards() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WARDS) || '[]');
  }

  getSweepers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SWEEPERS) || '[]');
  }

  getSweepersByWard(wardId) {
    const all = this.getSweepers();
    return all.filter(s => s.wardId === wardId);
  }

  // --- Activity Logging ---
  logActivity(text) {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG) || '[]');
    logs.unshift({
      id: 'ACT-' + Date.now(),
      text,
      timestamp: new Date().toISOString()
    });
    if (logs.length > 50) logs.pop();
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(logs));
  }

  getActivityLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG) || '[]');
  }

  // Helper reset for testing
  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.WARDS, JSON.stringify(INITIAL_WARDS));
    localStorage.setItem(STORAGE_KEYS.SWEEPERS, JSON.stringify(INITIAL_SWEEPERS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    window.location.reload();
  }
}

window.appStore = new Store();
