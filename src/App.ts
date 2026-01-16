



import createStars from "./components/Rating";

const App = () => {
  const container = document.createElement("div");
  container.appendChild(createStars());
  return container;
};

export default App;
