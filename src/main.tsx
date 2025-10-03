import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Theme } from '@radix-ui/themes'
import {BrowserRouter, Routes, Route} from "react-router";
import SponsorUs from './SponsorUs.tsx'
import SchedulePage from './horario/SchedulePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme panelBackground='solid' radius='full' accentColor='purple'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SchedulePage/>}/>
          <Route path="/sponsor-us" element={<SponsorUs/>}/>
          <Route path="/horario" element={<SchedulePage/>}/>
        </Routes>
      </BrowserRouter>
    </Theme>
  </StrictMode>,
)
