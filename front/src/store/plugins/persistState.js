export default function persistState(store) {
  const storedState = localStorage.getItem("store");
  if (storedState) {
    store.replaceState(Object.assign({}, store.state, JSON.parse(storedState)));
  }

  store.subscribe((mutation, state) => {
    localStorage.setItem("store", JSON.stringify(state));
  });
}
