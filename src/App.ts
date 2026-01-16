




import {modal, showModal} from "./components/Rating";

const App = () => {

  // Rating Modal //

  const container = document.createElement("div");
  container.appendChild(modal());

  showModal()
  return container;

  // Rating Modal //



};

export default App;
