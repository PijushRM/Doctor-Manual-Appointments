// Guards against late network answers. Kept apart from the stores so they
// can all use it without importing each other.
//
// session: bumped when the doctor logs out (or another doctor logs in), so a
//   request that started before then must not put its data on screen.
// saves:   bumped after every save, so a refresh that started before a save
//   knows its copy may be missing what was just saved.
let session = 0;
let saves = 0;

// Patients deleted in this session: a refresh that started before the delete
// still has them, and must not bring them back on screen.
const deleted = new Set<string>();
export const isDeleted = (patientId: string) => deleted.has(patientId);
export const noteDeleted = (patientId: string) => {
  deleted.add(patientId);
};

export const currentSession = () => session;
export const endSession = () => {
  session += 1;
  deleted.clear();
};

export const savesSoFar = () => saves;
export const noteSave = () => {
  saves += 1;
};
