import useUser from './hooks/useUser';
import Header from './components/Header';
import GlobalStyle from './style/Global';
import Layout from './components/VideoLayout';
import LoginForm from './components/LoginForm';


const App = () => {
  const { roomJoined } = useUser()

  return (
    <div className="">
      <GlobalStyle />
      <Header />
      {!roomJoined && <LoginForm />}
      {roomJoined && <Layout />}
    </div>
  );
}

export default App;
