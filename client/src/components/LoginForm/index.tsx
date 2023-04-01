import { useState } from "react";
import styled from "styled-components";
import usePermissions from "../../hooks/usePermissions";
import useUser from "../../hooks/useUser";

const streamConstraints = { audio: true, video: { height: 480 } };

const LoginForm = () => {
  const {
    socket,
    name,
    setName,
    room,
    setRoom,
    setBroadcasterName,
    setRoomJoined,
    setStream,
    setUser,
    broadcasters,
  } = useUser();
  const { permission } = usePermissions();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinBroadcaster = async () => {
    try {
      if (room === "" || name === "") {
        setError("Please type a room number and a name");
        return;
      }
      // Stop if someone is already broadcasting in the same room
      if (broadcasters[room]) {
        setError(
          `${broadcasters[room].name} is already broadcating in room ${room}`
        );
        return;
      }
      if (!permission) {
        setError("You do not appear to have a camera or microphone attached");
        return;
      }
      setLoading(true);
      const newUser = { room, name };
      setUser(newUser);
      setBroadcasterName(name);
      const myStream = await navigator.mediaDevices.getUserMedia(
        streamConstraints
      );
      setStream(myStream);
      socket.emit("register as broadcaster", newUser);
      setRoomJoined(true);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(String(e));
      console.log("Erron in getting user media:", e);
    }
  };
  const handleJoinViewer = () => {
    try {
      if (room === "" || name === "") {
        setError("Please type a room number and a name");
        return;
      }
      // Stop if no one is broadcasting in the room
      if (!broadcasters[room]) {
        setError(`No broadcaster found in room ${room}!`);
        return;
      }
      setLoading(true);
      const viewer = { room, name };
      setUser(viewer);
      socket.emit("register as viewer", viewer);
      setRoomJoined(true);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log("Erron in joiing as viewer:", e);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Login to Join Room</Title>
        <InputGroup>
          <p>Name</p>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setError("");
              setName(e.target.value);
            }}
          />
        </InputGroup>
        <InputGroup>
          <p>Room</p>
          <input
            placeholder="Enter room number"
            value={room}
            onChange={(e) => {
              setError("");
              setRoom(e.target.value);
            }}
          />
          {!loading && error && <p className="error-msg">{error}</p>}
        </InputGroup>
        <Button disabled={loading} onClick={handleJoinBroadcaster}>
          Join as broadcaster
        </Button>
        <Button disabled={loading} onClick={handleJoinViewer}>
          Join as viewer
        </Button>
      </Card>
    </Container>
  );
};

const Container = styled.div`
  min-height: calc(100vh - 90px);
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Card = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 12px;
  padding: 60px 45px 50px 45px;
`;
const Title = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 40px;
`;
const InputGroup = styled.div`
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  p {
    font-size: 16px;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
    &.error-msg {
      color: ${({ theme }) => theme.colors.failure};
      font-size: 12px;
    }
  }
  input {
    outline: none;
    border: none;
    background: ${({ theme }) => theme.colors.primaryDark};
    border-radius: 50px;
    padding: 16px 20px;
    color: ${({ theme }) => theme.colors.text};
  }
`;
const Button = styled.button`
  margin-top: 25px;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) =>
    theme.isDark
      ? "linear-gradient(96.79deg, #4285f4 0%, #186efc 100%)"
      : "#36EBA9"};
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 18px;
  font-weight: 500;
  width: 100%;
  cursor: pointer;
`;

export default LoginForm;
