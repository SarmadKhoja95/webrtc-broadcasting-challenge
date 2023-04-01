import styled from "styled-components";
import { AppLogo } from "../Svg";
import * as Icon from "react-feather";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";

const Header = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useUser()
  const name = user.name.slice(0, 2);
  return (
    <Container>
      <Row>
        <AppLogo />
        <Title>WebRTC Video Conferencing</Title>
      </Row>
      <Row>
        {!isDark ? (
          <Icon.Moon color={theme.colors.text} onClick={toggleTheme} />
        ) : (
          <Icon.Sun color={theme.colors.text} onClick={toggleTheme} />
        )}
        {user.name && <Userbox>{name}</Userbox>}
      </Row>
    </Container>
  );
};

const Container = styled.div`
  min-height: 84px;
  padding: 0 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid ${({ theme }) => theme.colors.borderColor};
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  svg {
    cursor: pointer;
  }
`;
const Title = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
`;
const Userbox = styled.div`
  height: 40px;
  width: 40px;
  border-radius: 28.474px;
  background: linear-gradient(
    96.79deg,
    rgba(66, 133, 244, 0.8) 0%,
    rgba(24, 110, 252, 0.8) 100%
  );
  filter: ${({ theme }) =>
    theme.isDark ? "drop-shadow(0px 0px 24px rgba(41, 132, 255, 0.56))" : ""};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
`;

export default Header;
