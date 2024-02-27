import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { resetActiveInstance } from 'phecda-react'



resetActiveInstance()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
 
)
