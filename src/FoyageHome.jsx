import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './FoyageHome.css'
import { useNavigate } from "react-router-dom";


function FoyageHome() {
    const navigate = useNavigate();
  return (
    <>
      <h1 className="header">Welcome to Foyage</h1>
      <div className="card">
        <p className="read-the-docs">
          Let's start planning your next journey!
        </p>
        <button onClick={() => navigate('/foyage.github.io/register')}>
          Start
        </button>
      </div>
    </>
  )
}

export default FoyageHome
