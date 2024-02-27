import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createPhecda, storagePlugin, watchPlugin } from 'phecda-react'


createPhecda().use(storagePlugin(),watchPlugin())

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
 
)
