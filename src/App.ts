




import {modal, showModal, closeModal} from "./components/Rating";

const App = () => {

  // Rating Modal //

  const container = document.createElement("div");

  container.appendChild(modal());

  showModal()
  closeModal()

  return container;

  // Rating Modal //



};

export default App;
