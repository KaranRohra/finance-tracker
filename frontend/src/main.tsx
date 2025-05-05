import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {GoogleOAuthProvider} from "@react-oauth/google";
const clientId = "888528412958-g3lb5df45ufgq0497b8uiq1mg23d24bq.apps.googleusercontent.com"
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
    <App />
    </GoogleOAuthProvider>
   
  </StrictMode>,
)
