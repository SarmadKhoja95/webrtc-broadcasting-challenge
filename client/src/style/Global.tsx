import { createGlobalStyle } from 'styled-components'


const GlobalStyle = createGlobalStyle`
  * {
    font-family: Montserrat;
  }
  body {
    background-color: ${({ theme }) => theme.colors.background};

    .ReactModal__Overlay {
      background: rgba(32,33,36,.6) !important;
    }

    img {
      height: auto;
      max-width: 100%;
    }
  }
`

export default GlobalStyle
