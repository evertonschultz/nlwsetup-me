import './lib/dayjs'
import './styles/global.css'

import { BrowserRouter } from 'react-router-dom'
import { Router } from './Router'


// import { Habit } from "./components/Habit";

export function App() {
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}
