import { hydrate, render } from "react-dom"
import "./styles/global.css"
import App from './App'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from "react-router-dom";


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
