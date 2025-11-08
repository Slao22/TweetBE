import React from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Link } from 'react-router-dom'

const getGoogleAuthURL = () => {
   const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env
   const url = "https://accounts.google.com/o/oauth2/v2/auth"
   const query = {
      client_id: VITE_GOOGLE_CLIENT_ID,
      redirect_uri: VITE_GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(' '),
      prompt: "consent",
      access_type: "offline"
   }
   const queryString = new URLSearchParams(query).toString()
   return `${url}?${queryString}`
}

const googleAuthURL = getGoogleAuthURL()
export default function Home() {
return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <video controls width={500}>
          <source src="http://localhost:4000/static/video/tadof15gg0ysabciasnuhal03.mp4" type='video/mp4' ></source>
        </video>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
       <Link to={googleAuthURL}>Login with google</Link>
      </div>
   
    </>
  )
}
