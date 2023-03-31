import ReactPlayer from 'react-player';
import './App.css';
import useUser from './hooks/useUser';
import { useState } from 'react';

const streamConstraints = { audio: true, video: { height: 480 } };

const App = () => {
  const { socket, name, setName, room, setRoom, broadcasterName, setBroadcasterName, roomJoined, setRoomJoined, stream, setStream, viewers, user, setUser, broadcasters, muteMicrophone, toggleMicrophone, replaceTracks, viewerChannel, broadcasterChannels, messagesList, setMessagesList } = useUser()
  const isBroadcaster = broadcasterName === user.name
  const [microphoneOptions, setMicrophoneOptions] = useState<MediaDeviceInfo[]>([])
  const [microphone, setMicrophone] = useState<string>('')
  const [camera, setCamera] = useState<string>('')
  const [cameraOptions, setCameraOptions] = useState<MediaDeviceInfo[]>([])
  const [message, setMessage] = useState<string>('')

  const detectPermissions = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mDevices = devices.filter(d => d.kind === 'audioinput');
      setMicrophoneOptions(mDevices)
      setMicrophone(mDevices[0].deviceId)
      const cDevices = devices.filter(d => d.kind === 'videoinput');
      setCameraOptions(cDevices)
      setCamera(cDevices[0].deviceId)
      const hasCamera = !!devices.find(d => d.kind === 'videoinput');
      const hasMicrophone = !!devices.find(d => d.kind === 'audioinput');
      const hasCameraPermission = !!devices.find(d => d.kind === 'videoinput' && d.label !== '');
      const hasMicrophonePermission = !!devices.find(d => d.kind === 'audioinput' && d.label !== '');

      if ((hasCamera && hasCameraPermission) && (hasMicrophone && hasMicrophonePermission)) {
        // We have permissions, go ahead and call getUserMedia
        return true
      } else {
        if (hasCamera || hasMicrophone) {
          // Show a dialog to explain the user you are going to request permission
          return true
        } else {
          throw new Error('You do not appear to have a camera or microphone attached')
        }
      }
    } catch (e) {
      console.log('Err while detecting permission:', e)
    }
  }

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
      const permissions = await detectPermissions()
      if (!permissions) return
      const newUser = { room, name }
      setUser(newUser)
      setBroadcasterName(name)
      const myStream = await navigator.mediaDevices.getUserMedia(streamConstraints)
      setStream(myStream)
      socket.emit("register as broadcaster", newUser);
      setRoomJoined(true)
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

  const onChangeTracks = async (audioSource: string, videoSource: string) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
      // @ts-ignore
      setStream(null)
      setMicrophone(audioSource)
      setCamera(videoSource)
      const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        video: { deviceId: videoSource ? { exact: videoSource } : undefined, height: 480 }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)
      replaceTracks(newStream.getVideoTracks()[0], newStream.getAudioTracks()[0])
    } catch (e) {
      console.log('Error in changing tracks:', e)
    }
  }

  const onSendMessage = () => {
    try {
      if (!message) return
      if (isBroadcaster) broadcasterChannels.forEach(ch => ch.send(message))
      else viewerChannel.send(message)
      const messages = [...messagesList, { name: user.name, text: message }]
      setMessagesList(messages)
      setMessage('')
    } catch (e) {
      console.log('Error while sending message:', e)
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
            <div>
              <button onClick={toggleMicrophone}>{!muteMicrophone ? 'Mute microphone' : 'Unmute microphone'}</button>
              <p>Microphones: <select value={microphone} onChange={(e) => onChangeTracks(e.target.value, camera)}>
                <option value='' hidden>Pick a microphone</option>
                {microphoneOptions.map((m) => <option key={m.deviceId} value={m.deviceId}>{m.label}</option>)}
              </select>
              </p>
              <p>Cameras: <select value={camera} onChange={(e) => onChangeTracks(microphone, e.target.value)}>
                <option value='' hidden>Pick a camera</option>
                {cameraOptions.map((c) => <option key={c.deviceId} value={c.deviceId}>{c.label}</option>)}
              </select>
              </p>
            </div>
          </div>}
        </div>
        <div>
        </div>
        <div className='info-div'>
          <p>{broadcasterName} is broadcasting...</p>
          <ul>{viewers.map((v: string, index: number) => <li key={index}>{`${v} has joined`}</li>)}</ul>
        </div>
        <div className='chat-view'>
          <h3>Chat</h3>
          <p>Send to {isBroadcaster ? "viewers" : "broadcaster"}</p>
          <div className='messages-view'>
            {messagesList.length > 0 ?
              messagesList.map((item, index) => (
                <div key={index} className={`msg-item ${name === item.name && 'me'}`}>
                  <div>
                    <div className='user-text'>{item.name}</div>
                    <div className='msg-text'>{item.text}</div>
                  </div>
                </div>
              ))
              :
              <div className='empty-text'>Messages will be shown here</div>}
          </div>
          <div className='msg-box'>
            <input placeholder={`Write message here...`} value={message} onChange={(e) => setMessage(e.target.value)} />
            <button disabled={!viewers?.length || !message} onClick={onSendMessage}>Send</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

export default App;
