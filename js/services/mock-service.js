export function createMockService({ getState, updateState }) {
  return {
    recordCall(responder) {
      updateState((state) => ({
        ...state,
        citizenCalls: [{
          id: `${Date.now()}`,
          name: responder.name,
          station: responder.station,
          time: new Date().toLocaleString()
        }, ...state.citizenCalls]
      }));
    },

    createIncident(title, priority = "High") {
      const incident = {
        id: `INC-${Date.now().toString().slice(-6)}`,
        title,
        place: "Ginatilan, Cebu",
        priority,
        status: "Unassigned",
        unit: "",
        time: "Just now"
      };
      updateState((state) => ({
        ...state,
        admin: { ...state.admin, incidents: [incident, ...state.admin.incidents] }
      }));
      return incident;
    },

    assignIncident(incidentId) {
      const availableUnit = getState().admin.team.find((unit) => unit.status === "Available");
      if (!availableUnit) return null;
      updateState((state) => ({
        ...state,
        admin: {
          ...state.admin,
          incidents: state.admin.incidents.map((incident) => incident.id === incidentId
            ? { ...incident, status: "Active", unit: availableUnit.name }
            : incident),
          team: state.admin.team.map((unit) => unit.id === availableUnit.id ? { ...unit, status: "Busy" } : unit),
          responder: availableUnit.id === "unit-ambulance-1" ? { ...state.responder, status: "Busy" } : state.responder
        }
      }));
      return availableUnit;
    },

    setResponderStatus(status) {
      updateState((state) => ({
        ...state,
        responder: { ...state.responder, status },
        admin: {
          ...state.admin,
          team: state.admin.team.map((unit) => unit.id === "unit-ambulance-1"
            ? { ...unit, status: status === "Off duty" || status === "Break" ? "Off" : status }
            : unit)
        }
      }));
    },

    approveRequest(id, decision) {
      const request = getState().admin.approvals.find((item) => item.id === id);
      if (!request) return null;
      updateState((state) => {
        const team = decision === "approve"
          ? state.admin.team.some((unit) => unit.name === request.unit)
            ? state.admin.team.map((unit) => unit.name === request.unit
              ? { ...unit, person: request.name, station: request.station, status: "Available" }
              : unit)
            : [...state.admin.team, {
              id: `unit-${id}`, name: request.unit, person: request.name,
              station: request.station, status: "Available"
            }]
          : state.admin.team;
        return {
          ...state,
          responder: request.name === "Juan Dela Cruz"
            ? { ...state.responder, approved: decision === "approve" }
            : state.responder,
          admin: {
            ...state.admin,
            approvals: state.admin.approvals.filter((item) => item.id !== id),
            team
          }
        };
      });
      return request;
    },

    setResponderApproved(approved) {
      updateState((state) => ({
        ...state,
        responder: { ...state.responder, approved },
        admin: {
          ...state.admin,
          team: state.admin.team.map((unit) => unit.id === "unit-ambulance-1"
            ? { ...unit, status: state.responder.status || "Available" }
            : unit)
        }
      }));
    },

    addResponder(unit) {
      updateState((state) => ({
        ...state,
        admin: { ...state.admin, team: [...state.admin.team, unit] }
      }));
    }
  };
}
