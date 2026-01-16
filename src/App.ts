



import Rating from "./components/Rating";

const App = () => {
  const container = document.createElement("div");
  container.appendChild(Rating());
  return container;
};

export default App;
