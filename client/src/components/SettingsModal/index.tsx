import styled from "styled-components";
import useUser from "../../hooks/useUser";
import StyledModal from "../Modals";
import usePermissions from "../../hooks/usePermissions";
import StyledSelect from "../Select";

const SettingsModal = ({ isOpen, onRequestClose }: any) => {
  const { microphone, setMicrophone, microphoneOptions, camera, cameraOptions, setCamera } = usePermissions();
  const { stream, setStream, replaceTracks } = useUser()

  const onChangeTracks = async (audioSource: any, videoSource: any) => {
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
        audio: { deviceId: audioSource.value ? { exact: audioSource.value } : undefined },
        video: { deviceId: videoSource.value ? { exact: videoSource.value } : undefined, height: 480 }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)
      replaceTracks(newStream.getVideoTracks()[0], newStream.getAudioTracks()[0])
    } catch (e) {
      console.log('Error in changing tracks:', e)
    }
  }

  return (
    <StyledModal show={isOpen} setShow={onRequestClose}>
      <>
        <Title>Settings</Title>
        <Row>
          <p>Microphone:</p>
          <StyledSelect value={microphone} options={microphoneOptions as any} onChange={e => onChangeTracks(e, camera)} />
        </Row>
        <Row>
          <p>Camera:</p>
          <StyledSelect value={camera} options={cameraOptions as any} onChange={e => onChangeTracks(microphone, e)} />
        </Row>
      </>
    </StyledModal>
  );
};

const Title = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  font-weight: 600;
  padding: 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;
const Row = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  p {
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }
`;

export default SettingsModal;
