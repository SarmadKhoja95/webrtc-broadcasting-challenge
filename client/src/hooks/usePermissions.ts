import { useEffect, useState } from "react"

const usePermissions = () => {
  const [microphoneOptions, setMicrophoneOptions] = useState<{label: string, value: string}[]>([])
  // @ts-ignore
  const [microphone, setMicrophone] = useState<{label: string, value: string}>(undefined)
    // @ts-ignore
  const [camera, setCamera] = useState<{label: string, value: string}>(undefined)
  const [cameraOptions, setCameraOptions] = useState<{label: string, value: string}[]>([])
  const [permission, setPermission] = useState<boolean>(false)

  useEffect(() => {
    const detectPermissions = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mDevices = devices.filter(d => d.kind === 'audioinput');
        setMicrophoneOptions(mDevices.map(m => ({label: m.label, value: m.deviceId})))
        setMicrophone({label: mDevices[0].label, value: mDevices[0].deviceId})
        const cDevices = devices.filter(d => d.kind === 'videoinput');
        setCameraOptions(cDevices.map(c => ({label: c.label, value: c.deviceId})))
        setCamera({label: cDevices[0].label, value: cDevices[0].deviceId})
        const hasCamera = !!devices.find(d => d.kind === 'videoinput');
        const hasMicrophone = !!devices.find(d => d.kind === 'audioinput');
        const hasCameraPermission = !!devices.find(d => d.kind === 'videoinput' && d.label !== '');
        const hasMicrophonePermission = !!devices.find(d => d.kind === 'audioinput' && d.label !== '');
        if ((hasCamera && hasCameraPermission) && (hasMicrophone && hasMicrophonePermission)) {
          // We have permissions, go ahead and call getUserMedia
          setPermission(true)
          return true
        } else {
          if (hasCamera || hasMicrophone) {
            // Show a dialog to explain the user you are going to request permission
            setPermission(true)
            return true
          } else {
            setPermission(false)
            throw new Error('You do not appear to have a camera or microphone attached')
          }
        }
      } catch (e: unknown) {
        console.log('Err while detecting permission:', e)
      }
    }
    detectPermissions()
  }, [])
  
  return { permission, microphone, microphoneOptions, camera, cameraOptions, setMicrophone, setCamera }
}

export default usePermissions
