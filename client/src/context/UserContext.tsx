import React, { createContext, useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { REACT_APP_SIGNALING_SERVER } from "../config";
import { IUser } from "./types";

// constants
const iceServers = {
    iceServers: [
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:stun.l.google.com:19302" },
    ],
};
// variables
let rtcPeerConnections: Record<string, RTCPeerConnection> = {};
let broadcasterChannels: RTCDataChannel[] = []

// @ts-ignore
const UserContext = createContext<IUser>(null);

const UserContextProvider = ({ children }: any) => {
    const socket = useMemo(
        () => io(REACT_APP_SIGNALING_SERVER, { autoConnect: false }),
        []
    );
    const [user, setUser] = useState<{ name: string, room: string }>({ name: '', room: '' })
    const [name, setName] = useState<string>("");
    const [room, setRoom] = useState<string>("");
    const [broadcasterName, setBroadcasterName] = useState<string>("");
    const [roomJoined, setRoomJoined] = useState<boolean>(false);
    // @ts-ignore
    const [stream, setStream] = useState<MediaStream>(null);
    const [viewers, setViewers] = useState<string[]>([]);
    const [broadcasters, setBroadcasters] = useState<Record<string, { id: string, name: string }>>({})
    const [muteMicrophone, setMuteMicrophone] = useState<boolean>(false)
    const [muteVideo, setMuteVideo] = useState<boolean>(false)
    const [viewerChannel, setViewerChannel] = useState<RTCDataChannel | undefined>(undefined)
    const [messagesList, setMessagesList] = useState<{ name: string, text: string }[]>([])
    const [message, setMessage] = useState<{ name: string, text: string }>({ name: '', text: '' })

    useEffect(() => {
        const updateMessagesList = () => {
            setMessagesList([...messagesList, message])
            setMessage({ name: '', text: '' })
        }
        message.name && message.text && updateMessagesList()
    }, [message, messagesList])

    useEffect(() => {
        const handleNewViewer = async (viewer: { id: string, name: string }) => {
            try {
                rtcPeerConnections[viewer.id] = new RTCPeerConnection(iceServers);

                stream.getTracks().forEach((track) => rtcPeerConnections[viewer.id].addTrack(track, stream));

                rtcPeerConnections[viewer.id].onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("candidate", viewer.id, {
                            type: "candidate",
                            label: event.candidate.sdpMLineIndex,
                            id: event.candidate.sdpMid,
                            candidate: event.candidate.candidate,
                        });
                    }
                };

                const channel = rtcPeerConnections[viewer.id].createDataChannel('messaging-channel', { ordered: true })
                broadcasterChannels.push(channel)
                // setBroadcasterChannel(channel)
                channel.binaryType = 'arraybuffer'
                channel.onopen = () => {
                    console.log('broadcaster channel opened!!!!')
                }
                channel.onclose = () => {
                    console.log('broadcaster channel closed!!!!')
                }
                channel.onmessage = (e) => {
                    console.log(`Remote message received by viewer: ${e.data}`);
                    setMessage({ name: viewer.name, text: e.data })
                }
                const offerSdp = await rtcPeerConnections[viewer.id].createOffer();
                rtcPeerConnections[viewer.id].setLocalDescription(offerSdp);
                socket.emit("offer", viewer.id, {
                    type: "offer",
                    sdp: offerSdp,
                    broadcaster: user,
                });
                setViewers([viewer.name, ...viewers,]);
            } catch (e) {
                console.log("Error in new viewer handler: ", e);
            }
        };

        const handleCandidate = (id: string, event: { label: number, candidate: RTCIceCandidate["candidate"] }) => {
            try {
                var candidate = new RTCIceCandidate({
                    sdpMLineIndex: event.label,
                    candidate: event.candidate,
                });
                rtcPeerConnections[id].addIceCandidate(candidate);
            } catch (e) {
                console.log("Error in candidate handler: ", e);
            }
        };

        const handleOffer = async (broadcaster: { name: string, id: string }, sdp: RTCSessionDescription) => {
            try {
                setBroadcasterName(broadcaster.name);

                rtcPeerConnections[broadcaster.id] = new RTCPeerConnection(iceServers);

                rtcPeerConnections[broadcaster.id].setRemoteDescription(sdp);

                rtcPeerConnections[broadcaster.id].ontrack = (event) => setStream(event.streams[0]);

                rtcPeerConnections[broadcaster.id].ondatachannel = (event) => {
                    console.log(`onRemoteDataChannel: ${JSON.stringify(event)}`);
                    const channel = event.channel
                    channel.binaryType = 'arraybuffer'
                    setViewerChannel(channel)
                    channel.onopen = () => {
                        console.log('viewer channel opened!!!!')
                    }
                    channel.onclose = () => {
                        console.log('viewer channel closed!!!!')
                    }
                    channel.onmessage = (e) => {
                        console.log(`Remote message received by broadcaster: ${e.data}`);
                        setMessage({ name: broadcaster.name, text: e.data })
                    }
                }

                const answerSdp = await rtcPeerConnections[broadcaster.id].createAnswer();
                rtcPeerConnections[broadcaster.id].setLocalDescription(answerSdp);
                socket.emit("answer", {
                    type: "answer",
                    sdp: answerSdp,
                    room: user.room,
                });

                rtcPeerConnections[broadcaster.id].onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("candidate", broadcaster.id, {
                            type: "candidate",
                            label: event.candidate.sdpMLineIndex,
                            id: event.candidate.sdpMid,
                            candidate: event.candidate.candidate,
                        });
                    }
                };
            } catch (e) {
                console.log("Error in candidate handler: ", e);
            }
        };

        const handleAnswer = (viewerId: string, event: RTCSessionDescriptionInit) => {
            try {
                rtcPeerConnections[viewerId].setRemoteDescription(
                    new RTCSessionDescription(event)
                );
            } catch (e) {
                console.log("Error in answer handler: ", e);
            }
        };

        const handleBroadcasters = (data: any) => {
            try {
                setBroadcasters(data)
            } catch (e) {
                console.log('Error in broadsters handler:', e)
            }
        }

        // message handlers
        socket.on("new viewer", handleNewViewer);
        socket.on("candidate", handleCandidate);
        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("broadcasters", handleBroadcasters)

        return () => {
            socket.off("new viewer", handleNewViewer);
            socket.off("candidate", handleCandidate);
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("broadcasters", handleBroadcasters)
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stream, setBroadcasterName, setName, setStream, setViewers, socket, viewers, user, setBroadcasters]);

    useEffect(() => {
        socket.connect()
        return () => {
            socket.disconnect()
        }
    }, [socket])

    const toggleMicrophone = () => {
        try {
            const audioTrack = stream.getAudioTracks()[0];
            setMuteMicrophone(!muteMicrophone)
            audioTrack.enabled = !audioTrack.enabled;
        } catch (e) {
            console.log('Error in microphone toggler:', e)
        }
    }

    const toggleVideo = () => {
        try {
            const videoTrack = stream.getVideoTracks()[0];
            setMuteVideo(!muteVideo)
            videoTrack.enabled = !videoTrack.enabled;
        } catch (e) {
            console.log('Error in video toggler:', e)
        }
    }

    const replaceTracks = (videoTrack: MediaStreamTrack, audioTrack: MediaStreamTrack) => {
        try {
            Object.values(rtcPeerConnections).forEach(pc => {
                const video = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (video) {
                    video.replaceTrack(videoTrack)
                }
                const audio = pc.getSenders().find(s => s.track && s.track.kind === 'audio');
                if (audio) {
                    audio.replaceTrack(audioTrack)
                }
            });
        } catch (e) {
            console.log('Error in replacing senders tracks:', e)
        }
    }

    return (
        <UserContext.Provider
            value={{
                socket,
                name,
                setName,
                room,
                setRoom,
                broadcasterName,
                setBroadcasterName,
                roomJoined,
                setRoomJoined,
                stream,
                setStream,
                viewers,
                user,
                setUser,
                broadcasters,
                muteMicrophone,
                toggleMicrophone,
                muteVideo,
                toggleVideo,
                replaceTracks,
                viewerChannel,
                broadcasterChannels,
                messagesList,
                setMessagesList
            } as IUser
            }
        >
            {children}
        </UserContext.Provider>
    );
};

export { UserContextProvider, UserContext };
