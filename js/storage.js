/**
 * CivicFix - LocalStorage Data Management Layer
 * Handles persistence, demo data seeding, statistics computation, and CRUD operations.
 */

const STORAGE_KEY = 'civicfix_complaints';
const APP_INIT_KEY = 'civicfix_initialized_v1';

// Preset sample photo SVGs as lightweight Data URLs for realistic preview
const SAMPLE_PHOTOS = {
  pothole: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23334155'/%3E%3Cpath d='M0,280 Q150,260 300,280 T600,270 L600,400 L0,400 Z' fill='%231e293b'/%3E%3Cellipse cx='280' cy='290' rx='140' ry='50' fill='%230f172a' stroke='%23475569' stroke-width='6'/%3E%3Cellipse cx='270' cy='295' rx='110' ry='35' fill='%23020617'/%3E%3Cpath d='M200,280 L230,310 M310,275 L350,305 M160,290 L180,315' stroke='%23e2e8f0' stroke-width='2' stroke-dasharray='4' opacity='0.7'/%3E%3Crect x='30' y='30' width='160' height='36' rx='8' fill='%23f59e0b'/%3E%3Ctext x='45' y='54' fill='%23000' font-family='sans-serif' font-weight='bold' font-size='14'%3EROAD HAZARD%3C/text%3E%3C/svg%3E",
  streetlight: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23090d16'/%3E%3Cpath d='M300,50 L300,400' stroke='%2364748b' stroke-width='14'/%3E%3Cpath d='M300,90 Q340,60 390,70 L410,95' fill='none' stroke='%2394a3b8' stroke-width='10' stroke-linecap='round'/%3E%3Cpath d='M380,95 L440,95 L425,120 L395,120 Z' fill='%23475569'/%3E%3Ccircle cx='410' cy='130' r='14' fill='%23fef08a' opacity='0.3'/%3E%3Ctext x='30' y='50' fill='%23f87171' font-family='sans-serif' font-weight='bold' font-size='16'%3E[OFFLINE LAMP UNIT]%3C/text%3E%3C/svg%3E",
  garbage: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23e2e8f0'/%3E%3Crect x='180' y='160' width='240' height='180' rx='12' fill='%23059669'/%3E%3Crect x='160' y='140' width='280' height='26' rx='6' fill='%23047857'/%3E%3Cpath d='M200,140 Q250,90 320,110 Q370,80 410,135 Z' fill='%2364748b' opacity='0.9'/%3E%3Ccircle cx='230' cy='115' r='20' fill='%23475569'/%3E%3Ccircle cx='340' cy='100' r='26' fill='%23334155'/%3E%3Crect x='30' y='30' width='180' height='36' rx='8' fill='%23ef4444'/%3E%3Ctext x='45' y='54' fill='%23fff' font-family='sans-serif' font-weight='bold' font-size='14'%3EOVERFLOW BIN%3C/text%3E%3C/svg%3E",
  water: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%230284c7'/%3E%3Cpath d='M0,260 C150,220 300,320 450,250 C520,220 570,260 600,240 L600,400 L0,400 Z' fill='%230369a1'/%3E%3Ccircle cx='220' cy='180' r='40' fill='%2338bdf8' opacity='0.6'/%3E%3Ccircle cx='340' cy='130' r='24' fill='%237dd3fc' opacity='0.7'/%3E%3Crect x='30' y='30' width='160' height='36' rx='8' fill='%230ea5e9'/%3E%3Ctext x='45' y='54' fill='%23fff' font-family='sans-serif' font-weight='bold' font-size='14'%3EWATER LEAKAGE%3C/text%3E%3C/svg%3E"
};

/**
 * Demo Complaints Dataset
 * Reflects real-world Indian municipal civic situations with realistic workflows.
 */
const DEMO_COMPLAINTS = [
  {
    id: "CF-2026-48291",
    name: "Rajesh Sharma",
    email: "rajesh.sharma@example.com",
    phone: "9876543210",
    category: "Road Damage",
    title: "Severe deep potholes causing vehicle damage near Metro Gate 2",
    description: "There are multiple deep crater-like potholes spanning across the main intersection near Metro Station Gate 2. Two two-wheelers skidded during the recent monsoon showers. Immediate asphalt patching is required to prevent major accidents.",
    location: "Sector 14, Main Arterial Road",
    landmark: "Opposite Metro Station Gate 2 & Community Market",
    priority: "High",
    status: "In Progress",
    department: "Road & Infrastructure Engineering Wing",
    assignedOfficer: "Suresh Verma (Assistant Engineer)",
    imageUrl: SAMPLE_PHOTOS.pothole,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Citizen reported road hazard with geo-tagged coordinate validation.",
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Verification Completed",
        note: "Ward Inspector inspected the site and confirmed multiple potholes requiring heavy bitumen mix.",
        timestamp: new Date(Date.now() - 2.4 * 86400000).toISOString(),
        actor: "Ward Control Center"
      },
      {
        status: "Assigned",
        title: "Work Order Dispatched",
        note: "Allocated to Division 4 Pavement Repair Crew under AE Suresh Verma.",
        timestamp: new Date(Date.now() - 1.8 * 86400000).toISOString(),
        actor: "Municipal Infrastructure Dept"
      },
      {
        status: "In Progress",
        title: "Patch Repair Underway",
        note: "Cold-mix asphalt application and steam-roller compaction currently in progress.",
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        actor: "Field Maintenance Team"
      }
    ]
  },
  {
    id: "CF-2026-39104",
    name: "Pooja Sundaram",
    email: "pooja.s@example.com",
    phone: "9811223344",
    category: "Streetlight",
    title: "Dark stretch due to 5 consecutive faulty LED streetlight poles",
    description: "Streetlights on poles #12 to #16 have been dark for over a week, creating safety concerns for women and evening commuters returning from the local bus terminal.",
    location: "Model Town, Block C, Street 4",
    landmark: "Behind Central Girls Senior Secondary School",
    priority: "Medium",
    status: "Resolved",
    department: "Electrical & Public Illumination Wing",
    assignedOfficer: "Ramesh Rao (Electrical Overseer)",
    imageUrl: SAMPLE_PHOTOS.streetlight,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Registered via CivicFix web portal.",
        timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Inspection Logged",
        note: "Feeder box short-circuit diagnosed.",
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
        actor: "Electrical Wing"
      },
      {
        status: "Assigned",
        title: "Repair Crew Allocated",
        note: "Work ticket handed to linemen unit.",
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
        actor: "Sub-Station Division"
      },
      {
        status: "In Progress",
        title: "Choke & Luminaire Replacement",
        note: "Replaced 4 burnt luminaires and updated MCB breaker switch.",
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        actor: "Lineman Team 2"
      },
      {
        status: "Resolved",
        title: "Illumination Restored & Verified",
        note: "Night survey completed; all 5 streetlight poles fully illuminated and tested.",
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        actor: "Electrical Overseer"
      }
    ]
  },
  {
    id: "CF-2026-51820",
    name: "Dr. Ananya Roy",
    email: "ananya.roy@example.com",
    phone: "9745123890",
    category: "Water Supply",
    title: "Turbid and low-pressure drinking water supplied in morning hours",
    description: "The morning municipal water supply is brownish with distinct mud sediments and foul odor. Over 40 households in Lane 2 are affected. We cannot use this for drinking or cooking.",
    location: "Green Park Extension, Lane 2",
    landmark: "Near Arya Samaj Mandir",
    priority: "Critical",
    status: "Under Review",
    department: "Water Supply & Sewerage Board",
    assignedOfficer: "K. N. Murthy (Water Quality Executive)",
    imageUrl: SAMPLE_PHOTOS.water,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 3600000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Escalated automatically under High Water Health Priority.",
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Water Sample Collection Scheduled",
        note: "Water testing lab team dispatched to test turbidity and residual chlorine levels.",
        timestamp: new Date(Date.now() - 7 * 3600000).toISOString(),
        actor: "Jal Board Quality Cell"
      }
    ]
  },
  {
    id: "CF-2026-22941",
    name: "Mohammad Irfan",
    email: "irfan.m@example.com",
    phone: "9988776655",
    category: "Garbage Collection",
    title: "Overflowing community dumper bin attracting stray cattle and foul smell",
    description: "The primary 4.5 cubic meter waste container has not been lifted for 4 consecutive days. Stray animals are scattering waste all over the road, blocking pedestrian access.",
    location: "Main Market, Sabzi Mandi Road",
    landmark: "Beside Old Grain Silos",
    priority: "High",
    status: "Assigned",
    department: "Solid Waste Management Cell",
    assignedOfficer: "Vikram Jadhav (Sanitation Superintendent)",
    imageUrl: SAMPLE_PHOTOS.garbage,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Registered with photo evidence of bin overflow.",
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Sanitation Route Scrutiny",
        note: "Mechanical compactor truck breakdown caused delay.",
        timestamp: new Date(Date.now() - 1.5 * 86400000).toISOString(),
        actor: "Solid Waste Control"
      },
      {
        status: "Assigned",
        title: "Compactor Truck Rerouted",
        note: "Truck No. DL-01-GB-3342 scheduled for special lifting round this evening.",
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        actor: "Zonal Sanitation Officer"
      }
    ]
  },
  {
    id: "CF-2026-64019",
    name: "Sunita Deshmukh",
    email: "sunita.d@example.com",
    phone: "9823091122",
    category: "Drainage",
    title: "Clogged stormwater drain causing knee-deep waterlogging",
    description: "Silt and plastic waste has choked the primary roadside culvert. Water has started backing up into ground floor residential compounds during rains.",
    location: "Civil Lines, Lane 4",
    landmark: "Near District Court Roundabout",
    priority: "High",
    status: "Resolved",
    department: "Stormwater Drainage & Sewerage",
    assignedOfficer: "Pravin Kadam (Drainage Supervisor)",
    imageUrl: SAMPLE_PHOTOS.water,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Monsoon emergency complaint lodged.",
        timestamp: new Date(Date.now() - 8 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Urgent Priority Tagged",
        note: "Culvert obstruction verified by ward drainage engineer.",
        timestamp: new Date(Date.now() - 7.5 * 86400000).toISOString(),
        actor: "Disaster Monitoring Desk"
      },
      {
        status: "Assigned",
        title: "Super-Sucker Machine Assigned",
        note: "Suction desilting machine assigned for deep block clearing.",
        timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
        actor: "Drainage Fleet Dept"
      },
      {
        status: "In Progress",
        title: "Mechanical Desilting",
        note: "Removed 3.2 metric tons of silt and polythene choking the main pipe.",
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
        actor: "Desilting Crew"
      },
      {
        status: "Resolved",
        title: "Free Water Flow Restored",
        note: "Water drained completely; new concrete gratings installed to prevent blockages.",
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        actor: "Drainage Supervisor"
      }
    ]
  },
  {
    id: "CF-2026-78342",
    name: "Arun Malhotra",
    email: "arun.malhotra@example.com",
    phone: "9899112233",
    category: "Electricity",
    title: "Sparking transformer & loose dangling HT overhead wires",
    description: "Distribution transformer 250kVA is sparking loudly with continuous burning odor. Loose hanging high-tension wire is only 7 feet above street level.",
    location: "Station Road, Near Railway Colony",
    landmark: "Pillar No. 42, Opposite Railway Dispensary",
    priority: "Critical",
    status: "In Progress",
    department: "Electricity Distribution Corporation (DISCOM)",
    assignedOfficer: "Er. Deepak Negi (Sub-Divisional Officer)",
    imageUrl: SAMPLE_PHOTOS.streetlight,
    createdAt: new Date(Date.now() - 1.2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Marked Critical due to life-safety hazard.",
        timestamp: new Date(Date.now() - 1.2 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Power Emergency Alert Dispatched",
        note: "Grid control notified to execute emergency feeder isolation if required.",
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        actor: "DISCOM Control Room"
      },
      {
        status: "Assigned",
        title: "Emergency Response Vehicle Dispatched",
        note: "SDO Deepak Negi taking charge on-site.",
        timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
        actor: "Rapid Action Unit"
      },
      {
        status: "In Progress",
        title: "Transformer Bushing Replacement",
        note: "Overhead wire re-tensioning and replacement of damaged insulator bushing underway.",
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        actor: "Technical Crew"
      }
    ]
  },
  {
    id: "CF-2026-11847",
    name: "Gurpreet Singh",
    email: "gurpreet.singh@example.com",
    phone: "9872134567",
    category: "Sanitation",
    title: "Public convenience complex unattended with broken cisterns",
    description: "The public washroom complex at Central Bus Terminal has broken taps causing continuous water wastage, no running water in ladies section, and unhygienic conditions.",
    location: "Central Bus Terminal, Sector 17",
    landmark: "Platform Bay 3 Exit Gate",
    priority: "Medium",
    status: "Submitted",
    department: "Public Health & Sanitation",
    assignedOfficer: "Pending Assignment",
    imageUrl: SAMPLE_PHOTOS.water,
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Reported with photos of damaged plumbing fixtures.",
        timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
        actor: "Citizen Portal"
      }
    ]
  },
  {
    id: "CF-2026-89203",
    name: "Meenakshi Iyer",
    email: "meenakshi.iyer@example.com",
    phone: "9940123456",
    category: "Public Safety",
    title: "Missing cast-iron manhole cover creating open pit on pedestrian footpath",
    description: "A heavy cast iron manhole cover was stolen or broken, leaving a 6-foot deep storm well exposed right next to a nursery school walkway. Severe hazard.",
    location: "Sector 22, Ring Road Corner",
    landmark: "Adjacent to Little Angels Play School",
    priority: "Critical",
    status: "Resolved",
    department: "Civil Works & Safety Wing",
    assignedOfficer: "Amit Saxena (Junior Engineer)",
    imageUrl: SAMPLE_PHOTOS.pothole,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Critical safety hazard tagged.",
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Barricade Installed Immediately",
        note: "Temporary yellow safety barricade and danger cone placed within 2 hours.",
        timestamp: new Date(Date.now() - 6.8 * 86400000).toISOString(),
        actor: "Ward Patrol"
      },
      {
        status: "Assigned",
        title: "FRP Cover Procurement",
        note: "Heavy-duty anti-theft Fiber Reinforced Polymer (FRP) cover dispatched from central store.",
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
        actor: "Municipal Stores"
      },
      {
        status: "In Progress",
        title: "Masonry Frame Construction",
        note: "Concrete collar frame cast and cured.",
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
        actor: "Civil Works Crew"
      },
      {
        status: "Resolved",
        title: "Permanent Lockable Cover Fixed",
        note: "New heavy duty lockable FRP cover installed and flush with sidewalk. Safe for pedestrians.",
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        actor: "Site Engineer"
      }
    ]
  },
  {
    id: "CF-2026-30491",
    name: "Farhan Akhtar",
    email: "farhan.a@example.com",
    phone: "9830114455",
    category: "Water Supply",
    title: "Underground main feeder pipe burst leaking thousands of liters",
    description: "Drinking water pipe has ruptured beneath the road surface. Water is gushing onto the tarmac and flooding nearby basements.",
    location: "Old City, Chowk Bazar Road",
    landmark: "Near Clock Tower Fountain",
    priority: "High",
    status: "In Progress",
    department: "Public Health Engineering Department (PHED)",
    assignedOfficer: "Virender Tyagi (Assistant Executive Engineer)",
    imageUrl: SAMPLE_PHOTOS.water,
    createdAt: new Date(Date.now() - 1.5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Citizen flagged massive water wastage.",
        timestamp: new Date(Date.now() - 1.5 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Isolation Valve Shut Off",
        note: "Upstream sluice valve closed to stop high pressure gush.",
        timestamp: new Date(Date.now() - 1.2 * 86400000).toISOString(),
        actor: "PHED Control Desk"
      },
      {
        status: "Assigned",
        title: "Excavation Crew Mobilized",
        note: "JCB excavator assigned to unearth the 300mm cracked ductile iron pipe.",
        timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
        actor: "PHED Emergency Team"
      },
      {
        status: "In Progress",
        title: "Sleeve Clamp Welding",
        note: "Split collar repair clamp being fitted by specialized pipe fitters.",
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
        actor: "Field Crew"
      }
    ]
  },
  {
    id: "CF-2026-57128",
    name: "Bhavna Joshi",
    email: "bhavna.j@example.com",
    phone: "9910987654",
    category: "Garbage Collection",
    title: "Illegal dumping of building debris and construction rubble on green verge",
    description: "Unidentified dumper trucks unloaded concrete debris and plaster sacks overnight onto the public green belt adjacent to Sector 9 park wall.",
    location: "Shastri Nagar, Sector 9",
    landmark: "Perimeter road of Neighborhood Children's Park",
    priority: "Low",
    status: "Submitted",
    department: "Town Planning & Enforcement",
    assignedOfficer: "Pending Assignment",
    imageUrl: SAMPLE_PHOTOS.garbage,
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Citizen reported unauthorized debris dumping with location tags.",
        timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
        actor: "Citizen Portal"
      }
    ]
  },
  {
    id: "CF-2026-44219",
    name: "Satish Chand",
    email: "satish.chand@example.com",
    phone: "9820556677",
    category: "Road Damage",
    title: "Settled pavement around sewer chamber causing severe bumps",
    description: "The road layer around the central sewer inspection chamber has settled by nearly 4 inches, causing severe impact to speeding vehicles and buses.",
    location: "Industrial Area Phase 1",
    landmark: "Near Truck Weighbridge Gate",
    priority: "Medium",
    status: "Under Review",
    department: "Highways & Heavy Traffic Corridors",
    assignedOfficer: "Subhash Yadav",
    imageUrl: SAMPLE_PHOTOS.pothole,
    createdAt: new Date(Date.now() - 2.5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Reported by industrial transport union member.",
        timestamp: new Date(Date.now() - 2.5 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Level Survey Conducted",
        note: "Road levelling instrument verified 4.2-inch depression.",
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        actor: "Highway Survey Unit"
      }
    ]
  },
  {
    id: "CF-2026-95381",
    name: "Kavita Rao",
    email: "kavita.rao@example.com",
    phone: "9845012399",
    category: "Other",
    title: "Large dead tree limb hanging precariously over footpath",
    description: "A huge dry branch from a heritage banyan tree snapped during high winds and is hanging tangled in telephone cables right over the sidewalk.",
    location: "Defence Colony, Pocket A",
    landmark: "Outside House No. A-114",
    priority: "Low",
    status: "Resolved",
    department: "Horticulture & Urban Forestry",
    assignedOfficer: "G. S. Rawat (Forest Officer)",
    imageUrl: SAMPLE_PHOTOS.streetlight,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        title: "Complaint Lodged",
        note: "Citizen notified dangerous hanging branch.",
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
        actor: "Citizen Portal"
      },
      {
        status: "Under Review",
        title: "Site Clearance Approved",
        note: "Horticulture team cleared the removal with municipal arborist.",
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
        actor: "Horticulture Wing"
      },
      {
        status: "Assigned",
        title: "Hydraulic Crane Deployed",
        note: "Tree pruning vehicle with boom lift dispatched.",
        timestamp: new Date(Date.now() - 3.5 * 86400000).toISOString(),
        actor: "Arboriculture Team"
      },
      {
        status: "Resolved",
        title: "Hazardous Limb Cleared",
        note: "Dead branch safely pruned, bundled, and carted away to nursery composting facility. Sidewalk fully safe.",
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        actor: "Forest Officer"
      }
    ]
  }
];

/**
 * Storage Service
 */
const StorageService = {
  /**
   * Initializes demo dataset in LocalStorage if not already present or if forced.
   */
  init(force = false) {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing || force || JSON.parse(existing).length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_COMPLAINTS));
        localStorage.setItem(APP_INIT_KEY, 'true');
        return DEMO_COMPLAINTS;
      }
      return JSON.parse(existing);
    } catch (e) {
      console.warn('LocalStorage error, falling back to in-memory demo data', e);
      return DEMO_COMPLAINTS;
    }
  },

  /**
   * Gets all complaints array
   */
  getComplaints() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return this.init(true);
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse complaints from LocalStorage', e);
      return [];
    }
  },

  /**
   * Saves raw complaints array
   */
  saveComplaints(complaints) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
      return true;
    } catch (e) {
      console.error('Failed to save complaints to LocalStorage', e);
      return false;
    }
  },

  /**
   * Generates unique complaint ID in CF-2026-XXXXX format
   */
  generateComplaintId() {
    const year = new Date().getFullYear();
    const existing = this.getComplaints();
    const existingIds = new Set(existing.map(c => c.id.toUpperCase()));
    
    let uniqueId = '';
    do {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      uniqueId = `CF-${year}-${randomNum}`;
    } while (existingIds.has(uniqueId));
    
    return uniqueId;
  },

  /**
   * Adds a new complaint
   */
  addComplaint(data) {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    
    const newComplaint = {
      id: data.id || this.generateComplaintId(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      category: data.category,
      title: data.title.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      landmark: data.landmark ? data.landmark.trim() : '',
      priority: data.priority || 'Medium',
      status: 'Submitted',
      department: data.department || this.getDefaultDepartment(data.category),
      assignedOfficer: 'Unassigned (Under Review)',
      imageUrl: data.imageUrl || null,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [
        {
          status: 'Submitted',
          title: 'Complaint Registered',
          note: 'Complaint successfully received on CivicFix citizen portal. Awaiting review by ward desk.',
          timestamp: nowIso,
          actor: 'Citizen Portal'
        }
      ]
    };

    complaints.unshift(newComplaint);
    this.saveComplaints(complaints);
    return newComplaint;
  },

  /**
   * Retrieves single complaint by ID (case-insensitive)
   */
  getComplaintById(id) {
    if (!id) return null;
    const cleanId = id.trim().toUpperCase();
    const complaints = this.getComplaints();
    return complaints.find(c => c.id.toUpperCase() === cleanId) || null;
  },

  /**
   * Updates an existing complaint
   */
  updateComplaint(id, updates) {
    const complaints = this.getComplaints();
    const index = complaints.findIndex(c => c.id.toUpperCase() === id.trim().toUpperCase());
    if (index === -1) return null;

    const current = complaints[index];
    const nowIso = new Date().toISOString();

    const updated = {
      ...current,
      ...updates,
      updatedAt: nowIso
    };

    complaints[index] = updated;
    this.saveComplaints(complaints);
    return updated;
  },

  /**
   * Updates status with automatic timeline audit event
   */
  updateComplaintStatus(id, newStatus, optionalNote = '') {
    const complaint = this.getComplaintById(id);
    if (!complaint) return null;

    const nowIso = new Date().toISOString();
    const defaultNotes = {
      'Submitted': 'Complaint status marked as Submitted.',
      'Under Review': 'Municipal ward desk has acknowledged and initiated verification.',
      'Assigned': 'Work ticket assigned to the responsible department field officer.',
      'In Progress': 'Ground maintenance crew dispatched to the site.',
      'Resolved': 'Issue remediated and quality verification confirmed on-site.',
      'Rejected': 'Complaint closed: Insufficient jurisdictional basis or duplicate entry.'
    };

    const newTimelineItem = {
      status: newStatus,
      title: `Status: ${newStatus}`,
      note: optionalNote.trim() || defaultNotes[newStatus] || `Status updated to ${newStatus}.`,
      timestamp: nowIso,
      actor: 'Municipal Authority'
    };

    const timeline = Array.isArray(complaint.timeline) ? [...complaint.timeline] : [];
    timeline.push(newTimelineItem);

    return this.updateComplaint(id, {
      status: newStatus,
      timeline
    });
  },

  /**
   * Deletes a complaint by ID
   */
  deleteComplaint(id) {
    const cleanId = id.trim().toUpperCase();
    const complaints = this.getComplaints();
    const initialLength = complaints.length;
    const filtered = complaints.filter(c => c.id.toUpperCase() !== cleanId);
    
    if (filtered.length !== initialLength) {
      this.saveComplaints(filtered);
      return true;
    }
    return false;
  },

  /**
   * Resets data to initial demo set
   */
  resetToDemo() {
    return this.init(true);
  },

  /**
   * Returns aggregated statistics calculated dynamically
   */
  getStatistics() {
    const list = this.getComplaints();
    const total = list.length;
    
    let resolved = 0;
    let inProgress = 0;
    let underReview = 0;
    let submitted = 0;
    let assigned = 0;
    let rejected = 0;

    const byCategory = {};
    const byPriority = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0
    };
    const byStatus = {
      Submitted: 0,
      'Under Review': 0,
      Assigned: 0,
      'In Progress': 0,
      Resolved: 0,
      Rejected: 0
    };

    list.forEach(c => {
      // Status counting
      if (c.status === 'Resolved') resolved++;
      else if (c.status === 'In Progress') inProgress++;
      else if (c.status === 'Under Review') underReview++;
      else if (c.status === 'Submitted') submitted++;
      else if (c.status === 'Assigned') assigned++;
      else if (c.status === 'Rejected') rejected++;

      if (byStatus[c.status] !== undefined) {
        byStatus[c.status]++;
      } else {
        byStatus[c.status] = 1;
      }

      // Priority counting
      if (byPriority[c.priority] !== undefined) {
        byPriority[c.priority]++;
      } else {
        byPriority[c.priority] = 1;
      }

      // Category counting
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    });

    const pending = total - resolved - rejected;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      resolved,
      inProgress,
      underReview,
      submitted,
      assigned,
      rejected,
      pending,
      resolutionRate,
      byCategory,
      byPriority,
      byStatus
    };
  },

  /**
   * Default department mapping based on category
   */
  getDefaultDepartment(category) {
    const mapping = {
      'Water Supply': 'Water Supply & Sewerage Board',
      'Sanitation': 'Public Health & Sanitation Wing',
      'Garbage Collection': 'Solid Waste Management Cell',
      'Road Damage': 'Road & Infrastructure Engineering',
      'Streetlight': 'Electrical & Illumination Dept',
      'Electricity': 'State Power Distribution (DISCOM)',
      'Drainage': 'Stormwater Drainage & Flood Control',
      'Public Safety': 'Civil Defense & Safety Cell',
      'Other': 'General Municipal Administration'
    };
    return mapping[category] || 'Municipal Works Department';
  },

  /**
   * Exports data as formatted JSON string
   */
  exportJSON() {
    const complaints = this.getComplaints();
    return JSON.stringify(complaints, null, 2);
  },

  /**
   * Exports data as CSV string
   */
  exportCSV() {
    const complaints = this.getComplaints();
    const headers = ['Complaint ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Citizen Name', 'Phone', 'Created Date'];
    
    const rows = complaints.map(c => [
      `"${c.id}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.priority}"`,
      `"${c.status}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};

// Auto-seed on initial load
StorageService.init();

// Export to window for global access
window.StorageService = StorageService;
window.SAMPLE_PHOTOS = SAMPLE_PHOTOS;

