import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createPhecda, } from 'phecda-react'


createPhecda()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
 
)
