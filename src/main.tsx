import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import { Theme } from '@radix-ui/themes'
import {BrowserRouter, Routes, Route} from "react-router";
import LivePage from './live/LivePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme panelBackground='solid' radius='full' accentColor='purple'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LivePage/>}/>
        </Routes>
      </BrowserRouter>
    </Theme>
  </StrictMode>,
)
