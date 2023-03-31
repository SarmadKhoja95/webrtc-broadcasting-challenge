import { Socket } from "socket.io-client";

export interface IUser {
    socket: Socket,
    name: string,
    setName: (e: string) => void,
    room: string,
    setRoom: (e: string) => void,
    broadcasterName: string,
    setBroadcasterName: (e: string) => void,
    roomJoined: boolean,
    setRoomJoined: (e: boolean) => void,
    stream: MediaStream,
    setStream: (e: MediaStream) => void,
    viewers: string[],
    user: { name: string, room: string }
    setUser: (e: { name: string, room: string }) => void
    broadcasters: Record<string, { id: string, name: string }>
    muteMicrophone: boolean
    toggleMicrophone: () => void,
    replaceTracks: (audio: MediaStreamTrack, video: MediaStreamTrack) => void
    viewerChannel: RTCDataChannel
    broadcasterChannels: RTCDataChannel[]
    messagesList: { name: string, text: string }[]
    setMessagesList: (e: unknown) => void
}