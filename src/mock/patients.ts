// Fake data for prototypes. Every name and detail here is invented.
// Never replace these with real patient, provider, or staff information.

export type Patient = {
  id: string;
  name: string;
  age: number;
  reason: string;
  status: "Checked in" | "In room" | "Waiting" | "Done";
};

export const patients: Patient[] = [
  { id: "p1", name: "Avery Sample", age: 42, reason: "Annual physical", status: "Checked in" },
  { id: "p2", name: "Jordan Placeholder", age: 67, reason: "Follow-up visit", status: "In room" },
  { id: "p3", name: "Riley Example", age: 29, reason: "Sore throat", status: "Waiting" },
  { id: "p4", name: "Casey Demo", age: 54, reason: "Medication review", status: "Done" },
];
