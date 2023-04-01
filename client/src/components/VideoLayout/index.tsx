import styled from "styled-components";
import * as Icon from "react-feather";
import useTheme from "../../hooks/useTheme";
import ReactPlayer from "react-player";
import { useState } from "react";
import useUser from "../../hooks/useUser";
import SettingsModal from "../SettingsModal";

const types = ["All Chat", "Participants"];

const VideoLayout = () => {
  const {
    socket,
    stream,
    setStream,
    user,
    setUser,
    viewers,
    broadcasterName,
    messagesList,
    setMessagesList,
    broadcasterChannels,
    viewerChannel,
    muteMicrophone,
    toggleMicrophone,
    muteVideo,
    toggleVideo,
    setRoomJoined,
    setName,
    setRoom,
  } = useUser();
  const isBroadcaster = broadcasterName === user.name;
  const [active, setActive] = useState(types[0]);
  const [message, setMessage] = useState<string>("");
  const [showSettingModal, setShowSettingModal] = useState<boolean>(false)
  const toggleSettingModal = () => setShowSettingModal(!showSettingModal)
  const { theme } = useTheme();
  const formatName = (str: string) => str.slice(0, 2);

  const onSendMessage = () => {
    try {
      if (!message) return;
      if (isBroadcaster) broadcasterChannels.forEach((ch) => ch.send(message));
      else viewerChannel.send(message);
      const messages = [...messagesList, { name: user.name, text: message }];
      setMessagesList(messages);
      setMessage("");
    } catch (e) {
      console.log("Error while sending message:", e);
    }
  };

  const handleEndCall = () => {
    if (isBroadcaster) {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
      // @ts-ignore
      setStream(null);
      socket.emit("broadcaster left", user);
    }
    setName("");
    setRoom("");
    setUser({ name: "", room: "" });
    setRoomJoined(false);
  };

  return (
    <Container>
      <LeftView>
        <TopBar>
          <BroadcasterBox>{broadcasterName} is broadcasting</BroadcasterBox>
          <Row>
            <InfoItem>
              <p>Room:</p>
              <div>{user.room}</div>
            </InfoItem>
            <InfoItem>
              <p>Participants:</p>
              <div>{viewers?.length}</div>
            </InfoItem>
          </Row>
        </TopBar>
        <VideoContainer>
          <ReactPlayer url={stream} playing width="100%" height="100%" />
          <ActionButtons>
            <ControlButton onClick={toggleMicrophone}>
              {muteMicrophone ? (
                isBroadcaster ? (
                  <Icon.MicOff color={theme.colors.white} />
                ) : (
                  <Icon.VolumeX color={theme.colors.white} />
                )
              ) : isBroadcaster ? (
                <Icon.Mic color={theme.colors.white} />
              ) : (
                <Icon.Volume2 color={theme.colors.white} />
              )}
            </ControlButton>
            <ControlButton className="end" onClick={handleEndCall}>
              <Icon.Phone color={theme.colors.white} />
            </ControlButton>
            <ControlButton onClick={toggleVideo}>
              {muteVideo ? (
                <Icon.VideoOff color={theme.colors.white} />
              ) : (
                <Icon.Video color={theme.colors.white} />
              )}
            </ControlButton>
            {isBroadcaster && <ControlButton onClick={toggleSettingModal}>
              <Icon.Settings color={theme.colors.white} />
            </ControlButton>}
          </ActionButtons>
        </VideoContainer>
      </LeftView>
      <ChatContainer>
        <p className="title">Chat</p>
        <ButtonGroup>
          {types.map((type) => (
            <Tab
              key={type}
              active={active === type}
              onClick={() => setActive(type)}
            >
              {type}
            </Tab>
          ))}
        </ButtonGroup>
        <div className="column-between">
          {/* All Chats */}
          {active === types[0] ? (
            <>
              <ItemContainer>
                {messagesList.map((item, ind) =>
                  item.name !== user.name ? (
                    <RowItem key={ind}>
                      <div className="circle">{formatName(item.name)}</div>
                      <div>
                        <div className="name-text">{item.name}</div>
                        <div className="message-text">{item.text}</div>
                      </div>
                    </RowItem>
                  ) : (
                    <RowItem key={ind} me>
                      <div className="message-text me">{item.text}</div>
                    </RowItem>
                  )
                )}
              </ItemContainer>
              <div className="input-group">
                <input
                  placeholder="Write your message...."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  disabled={!message}
                  className="send-btn"
                  onClick={onSendMessage}
                >
                  <Icon.Send color={theme.colors.text} size={20} />
                </button>
              </div>
            </>
          ) : (
            // Participants
            <ItemContainer>
              {viewers.map((v, ind) => (
                <RowItem key={ind} alignItems="center" fontSize="14px">
                  <div className="circle">{formatName(v)}</div>
                  <div>
                    <div className="name-text">{v}</div>
                  </div>
                </RowItem>
              ))}
            </ItemContainer>
          )}
        </div>
      </ChatContainer>
      <SettingsModal 
          isOpen={showSettingModal}
          onRequestClose={() => toggleSettingModal()}
        />
    </Container>
  );
};

const ItemContainer = styled.div`
  padding: 38px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
const RowItem = styled.div<{
  me?: boolean;
  alignItems?: string;
  fontSize?: string;
}>`
  display: flex;
  align-items: ${({ alignItems }) => alignItems || "flex-start"};
  gap: 16px;
  justify-content: ${({ me }) => (me ? "flex-end" : "flex-start")};
  .circle {
    height: 46px;
    width: 46px;
    border-radius: 46px;
    background: ${({ theme }) => theme.colors.backgroundAlt};
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.white};
  }
  .name-text {
    font-weight: 800;
    font-size: ${({ fontSize }) => fontSize || "12px"};
    line-height: 14px;
    color: ${({ theme }) => theme.colors.text};
  }
  .message-text {
    background: ${({ theme }) => theme.colors.primaryDark};
    border-radius: 0px 6px 8px 8px;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: ${({ theme }) => theme.colors.text};
    padding: 16px;
    margin-top: 8px;
    &.me {
      background: ${({ theme }) =>
        theme.isDark
          ? " linear-gradient(96.79deg, #4285f4 0%, #186efc 100%)"
          : "#36EBA9"};
      box-shadow: ${({ theme }) =>
        theme.isDark ? "0px 0px 24px rgba(41, 132, 255, 0.56)" : ""};
      border-radius: 8px 0px 8px 8px;
    }
  }
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 0px;
  cursor: pointer;
  border: 0;
  outline: 0;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSubtle};
  background: unset;
  border-radius: 2px;

  ${({ active, theme }) =>
    active &&
    `
    font-weight: 600;
    background: linear-gradient(96.79deg, #4285f4 0%, #186efc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    text-shadow: ${theme.isDark ? "0px 0px 24px rgba(41, 132, 255, 0.56)" : ""};
    border-bottom: 2px solid ${theme.colors.borderSecondary};
  `}
`;
const ButtonGroup = styled.div`
  display: flex;
  padding: 0 20px;
  gap: 45px;
  border-bottom: 0.2px solid ${({ theme }) => theme.colors.borderLight};
`;

const Container = styled.div`
  padding: 32px 50px 56px 50px;
  display: flex;
  justify-content: space-between;
  gap: 50px;
`;
const VideoContainer = styled.div`
  position: relative;
  height: calc(100vh - 280px);
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  video {
    height: 100% !important;
    width: 100% !important;
    object-fit: cover;
    z-index: 9;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;
const InfoItem = styled.div<{ borderRadius?: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.white};
  p {
    font-weight: 500;
    font-size: 14px;
    line-height: 14px;
    letter-spacing: 0.055em;
    color: ${({ theme }) => theme.colors.text};
  }
  div {
    font-size: 12px;
    font-weight: 700;
    border-radius: 4px;
    padding: 6px;
    background: linear-gradient(96.79deg, #4285f4 0%, #186efc 100%);
    box-shadow: ${({ theme }) =>
      theme.isDark ? "0px 0px 24px rgba(41, 132, 255, 0.56)" : ""};
  }
`;
const TopBar = styled(Row)`
  margin-bottom: 33px;
`;
const BroadcasterBox = styled.div`
  background: linear-gradient(96.79deg, #4285f4 0%, #186efc 100%);
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0px 0px 24px rgba(41, 132, 255, 0.56)" : ""};
  border-radius: 8px;
  padding: 15px 16px 15px 16px;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: ${({ theme }) => theme.colors.white};
`;
const LeftView = styled.div`
  flex: 1;
`;

const ChatContainer = styled.div`
  background: ${({ theme }) => theme.colors.chatBgColor};
  // border: 1px solid ${({ theme }) =>
    !theme.isDark && theme.colors.borderLight};
  border-radius: 20px;
  min-width: 408px;
  padding: 16px 0 37px 0;
  .title {
    font-weight: 600;
    font-size: 24px;
    line-height: 29px;
    color: ${({ theme }) => theme.colors.text};
    padding-left: 20px;
  }
  .input-group {
    padding: 0 20px;
    display: flex;
    gap: 24px;
    align-items: center;
    input {
      flex: 1;
      outline: none;
      border: none;
      background: ${({ theme }) => theme.colors.primaryDark};
      border-radius: 50px;
      padding: 16px 20px;
      color: ${({ theme }) => theme.colors.text};
    }
    .send-btn {
      cursor: pointer;
      border: none;
      width: 48px;
      height: 48px;
      background: ${({ theme }) => theme.colors.primaryDark};
      border-radius: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
  .column-between {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: calc(100% - 112px);
  }
`;
const ActionButtons = styled.div`
  padding: 32px;
  transform: translate(0%, -100%);
  display: flex;
  justify-content: center;
  gap: 16px;
`;
const ControlButton = styled.div`
  background: rgba(19, 21, 23, 0.63);
  backdrop-filter: blur(3px);
  border-radius: 50px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  &.end {
    svg {
      transform: rotate(135deg);
    }
    background: ${({ theme }) => theme.colors.failure};
    border-radius: 15px;
    width: 56px;
    height: 56px;
  }
`;

export default VideoLayout;
