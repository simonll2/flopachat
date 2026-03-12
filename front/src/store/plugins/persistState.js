export default function persistState(store) {
  const storedState = localStorage.getItem("store");
  if (storedState) {
    store.replaceState(Object.assign({}, store.state, JSON.parse(storedState)));
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
