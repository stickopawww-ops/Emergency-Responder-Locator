export const responders = [
  { id: "ambulance-1", name: "Ambulance 1", category: "Ambulance", station: "Ginatilan Rural Health Unit", status: "Available", distance: "1.2 km" },
  { id: "fire-1", name: "Fire Truck 1", category: "Fire Station", station: "BFP R7 Ginatilan Fire Station", status: "Available", distance: "1.2 km" },
  { id: "fire-2", name: "Fire Truck 2", category: "Fire Station", station: "BFP R7 Samboan Fire Station", status: "Available", distance: "2.1 km" },
  { id: "tanod-1", name: "Barangay Tanod", category: "Barangay Tanod", station: "San Roque Barangay Hall", status: "Available", distance: "1.1 km" },
  { id: "police-1", name: "Police 1", category: "Police", station: "Ginatilan Municipal Police Station", status: "Available", distance: "1.0 km" },
  { id: "ambulance-2", name: "Ambulance 2", category: "Ambulance", station: "Ginatilan Municipal Health Office", status: "Busy", distance: "1.9 km" },
  { id: "tanod-2", name: "Barangay Tanod", category: "Barangay Tanod", station: "Palanas Barangay Hall", status: "Busy", distance: "2.6 km" },
  { id: "police-2", name: "Police 2", category: "Police", station: "Samboan Municipal Police Station", status: "Busy", distance: "3.0 km" }
];

export const outageResponder = {
  id: "cebeco-1", name: "Cebeco 1", category: "Power Outage",
  station: "Cebu I Electric Cooperative, Inc.", status: "Available", distance: "2.0 km"
};

export const categories = [
  { id: "ambulance", label: "Ambulance", icon: "＋", category: "Ambulance" },
  { id: "fire", label: "Fire Station", icon: "◇", category: "Fire Station" },
  { id: "tanod", label: "Barangay Tanod", icon: "⌂", category: "Barangay Tanod" },
  { id: "police", label: "Police", icon: "▣", category: "Police" },
  { id: "nearest", label: "Nearest Any", icon: "⌖", category: "Any" }
];

const incidentSeeds = [
  { id: "INC-1042", title: "Medical emergency", place: "Poblacion, Ginatilan", priority: "High", status: "Active", unit: "Ambulance 1", time: "2 min ago" },
  { id: "INC-1041", title: "Road accident", place: "N. Bacalso Highway", priority: "Urgent", status: "Unassigned", unit: "", time: "8 min ago" },
  { id: "INC-1040", title: "Fire report", place: "San Roque, Ginatilan", priority: "High", status: "Active", unit: "Fire Truck 1", time: "14 min ago" },
  { id: "INC-1039", title: "Medical assistance", place: "Palanas, Ginatilan", priority: "Normal", status: "Resolved", unit: "Ambulance 1", time: "Yesterday" },
  { id: "INC-1038", title: "False alarm", place: "Samboan, Cebu", priority: "Normal", status: "False Alarm", unit: "Police 1", time: "Nov 12" }
];

const teamSeeds = [
  { id: "unit-ambulance-1", name: "Ambulance 1", person: "Juan Dela Cruz", station: "Ginatilan Rural Health Unit", status: "Available" },
  { id: "unit-fire-1", name: "Fire Truck 1", person: "Maria Cabahug", station: "BFP Ginatilan", status: "Available" },
  { id: "unit-police-1", name: "Police 1", person: "Ramon Tan", station: "Ginatilan Police Station", status: "Busy" },
  { id: "unit-ambulance-2", name: "Ambulance 2", person: "Jose Reyes", station: "Samboan Health Center", status: "Off" }
];

export const initialState = {
  citizenCalls: [],
  responder: { status: "Available", approved: false, phone: "" },
  admin: {
    incidents: incidentSeeds,
    team: teamSeeds,
    approvals: [
      { id: "approval-juan", name: "Juan Dela Cruz", unit: "Ambulance 1", station: "Ginatilan Rural Health Unit", requested: "12 min ago" },
      { id: "approval-maria", name: "Maria Cabahug", unit: "Fire Truck 2", station: "Samboan Fire Station", requested: "1 hour ago" },
      { id: "approval-ramon", name: "Ramon Tan", unit: "Police 2", station: "Ginatilan Police Station", requested: "Yesterday" }
    ],
    logs: []
  }
};
