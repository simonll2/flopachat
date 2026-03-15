export default function persistState(store) {
  const storedState = localStorage.getItem("store");
  if (storedState) {
    const parsedState = JSON.parse(storedState);
    store.replaceState({
      ...store.state,
      ...parsedState,
      auth: {
        ...parsedState.auth,
        token: store.state.auth.token, // Preserve token loaded from localStorage
      },
    });
  }

  store.subscribe((mutation, state) => {
    // Exclude sensitive data (token) from persisted state
    const stateToPersist = JSON.parse(JSON.stringify(state));
    if (stateToPersist.auth) {
      delete stateToPersist.auth.token;
    }
    localStorage.setItem("store", JSON.stringify(stateToPersist));
  });
}
