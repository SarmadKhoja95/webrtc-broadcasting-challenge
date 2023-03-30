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
    setUser: (e: { name: string, room: string }) => void
    broadcasters: Record<string, { id: string, name: string }>
}