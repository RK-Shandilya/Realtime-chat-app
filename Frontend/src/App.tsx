import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  const [message, setMessage] = useState("")
  const [socket, setSocket] = useState<WebSocket|null>(null);

  useEffect(()=>{
    const socket = new WebSocket("ws://localhost:3000")
    setSocket(socket)
    
    socket.onopen = () => {
      console.log("Client connected to server")
    }

    socket.onmessage = (event) => {
      console.log(event.data)
    }

    socket.onclose = () => {
      console.log("Client disconnected from server");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

  },[])



  return (
    <>
      <header className="App-header">
        <img src={reactLogo} className="App-logo" alt="react logo" />
        <img src={viteLogo} className="App-logo" alt="vite logo" />
        <p>
          Edit <code>App.tsx</code> and save to test Vite + Express + WebSocket.
        </p>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={() => socket?.send(message)}>Send</button>
      </header>
    </>
  )
}

export default App
