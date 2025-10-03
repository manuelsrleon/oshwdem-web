import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Theme } from '@radix-ui/themes'
import {BrowserRouter, Routes, Route} from "react-router";
import SchedulePage from './horario/SchedulePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme panelBackground='solid' radius='full' accentColor='purple'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SchedulePage/>}/>
          <Route path="/horario" element={<SchedulePage/>}/>
        </Routes>
      </BrowserRouter>
    </Theme>
  </StrictMode>,
)
