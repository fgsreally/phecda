import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createPhecda, defaultWebInject} from 'phecda-react'

defaultWebInject()

createPhecda()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
 
)
