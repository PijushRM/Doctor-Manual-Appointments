// Guards against late network answers. Kept apart from the stores so they
// can all use it without importing each other.
//
// session: bumped when the doctor logs out (or another doctor logs in), so a
//   request that started before then must not put its data on screen.
// saves:   bumped after every save, so a refresh that started before a save
//   knows its copy may be missing what was just saved.
let session = 0;
let saves = 0;

export const currentSession = () => session;
export const endSession = () => {
  session += 1;
};

export const savesSoFar = () => saves;
export const noteSave = () => {
  saves += 1;
};
