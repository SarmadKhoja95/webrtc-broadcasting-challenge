import { useContext } from 'react'
import { UserContext } from '../context/UserContext'

const useUser = () => {
  const user = useContext(UserContext)
  return user
}

export default useUser