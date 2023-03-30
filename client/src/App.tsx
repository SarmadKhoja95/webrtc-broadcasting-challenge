import ReactPlayer from 'react-player';
import './App.css';
import useUser from './hooks/useUser';

const streamConstraints = { audio: true, video: { height: 480 } };

const App = () => {
  const { socket, name, setName, room, setRoom, broadcasterName, setBroadcasterName, roomJoined, setRoomJoined, stream, setStream, viewers, user, setUser, broadcasters, muteMicrophone, toggleMicrophone } = useUser()
  const isBroadcaster = broadcasterName === user.name

  const handleJoinBroadcaster = async () => {
    try {
      if (room === "" || name === "") {
        alert("Please type a room number and a name");
        return
      }
      // Stop if someone is already broadcasting in the same room
      if (broadcasters[room]) {
        alert(`${broadcasters[room].name} is already broadcating in room ${room}`)
        return
      }
      const newUser = { room, name }
      setUser(newUser)
      setBroadcasterName(name)
      const myStream = await navigator.mediaDevices
        .getUserMedia(streamConstraints)
      setStream(myStream)
      setRoomJoined(true)
      socket.emit("register as broadcaster", newUser);
    } catch (e) {
      console.log('Erron in getting user media:', e)
    }
  }
  const handleJoinViewer = () => {
    try {
      if (room === "" || name === "") {
        alert("Please type a room number and a name");
        return
      }
      // Stop if no one is broadcasting in the room
      if (!broadcasters[room]) {
        alert(`No broadcaster found in room ${room}!`)
        return
      }
      const viewer = { room, name }
      setUser(viewer)
      socket.emit("register as viewer", viewer);
      setRoomJoined(true)
    } catch (e) {
      console.log('Erron in joiing as viewer:', e)
    }
  }

  return (
    <div className="App">
      <h1 className='heading'>WebRTC Video Conference Tutorial - Plain WebRTC</h1>
      {!roomJoined && <div className='form-row'>
        <input type="text" placeholder='Your name' value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder='Type the room number' value={room} onChange={(e) => setRoom(e.target.value)} />
        <button onClick={handleJoinBroadcaster}>Join as Broadcaster</button>
        <button onClick={handleJoinViewer}>Join as Viewer</button>
      </div>}

      {roomJoined && <div>
        <div className='video-div'>
          {stream && <ReactPlayer height='100%' width='100%' url={stream} playing />}
          {isBroadcaster && <div className='actions-div'>
            <button onClick={toggleMicrophone}>{!muteMicrophone ? 'Mute microphone' : 'Unmute microphone'}</button>
          </div>}
        </div>
        <div>
        </div>
        <div className='info-div'>
          <p>{broadcasterName} is broadcasting...</p>
          <ul>{viewers.map((v: string, index: number) => <li key={index}>{`${v} has joined`}</li>)}</ul>
        </div>
      </div>}
    </div>
  );
}

export default App;
