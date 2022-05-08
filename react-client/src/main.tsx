import { hydrate, render } from "react-dom"
import { BrowserRouter } from "react-router-dom";
import App from './App'
import "./styles/global.css"
import 'react-toastify/dist/ReactToastify.css';


const rootElement = document.getElementById("root");
const elements = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

if (rootElement?.hasChildNodes()) {
  hydrate(elements, rootElement);
} else {
  render(elements, rootElement);
}
