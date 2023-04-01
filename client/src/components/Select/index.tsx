import React from 'react'
import Select from 'react-select'
import useTheme from '../../hooks/useTheme'

interface SelectTypes {
  options?: { label: string, value: string }[]
  value?: { label: string, value: string }
  placeholder?: string
  onChange: (e: any) => void
  isDisabled?: boolean
}

const StyledSelect: React.FC<SelectTypes> = (props) => {
  const { options, value, placeholder, onChange, isDisabled } =
    props
  const { theme } = useTheme()
  return (
    <Select
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      isDisabled={isDisabled}
      components={{ IndicatorSeparator: () => null }}
      options={options}
      styles={{
        option: (provided, state) => ({
          ...provided,
          border: 'none',
          color: state.isSelected
            ? theme.colors.borderSecondary
            : theme.colors.text,
          background: 'transparent',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          '&:hover': {
            color: state.isSelected
            ? theme.colors.borderSecondary
            : theme.colors.text,
          },
          '&:active': {
            background: 'none'
          }
        }),
        dropdownIndicator: (base) => ({
          ...base,
        }),
        control: (_, { isDisabled }) => ({
          display: 'flex !important',
          justifyContent: 'space-between !important',
          border: `0.1rem solid ${theme.colors.borderColor}`,
          borderRadius: '6px',
          width: '100%',
          fontSize: '12px',
          fontWeight: 400,
          opacity: isDisabled ? '0.35' : '1'
        }),
        singleValue: (provided, state: any) => ({
          ...provided,
          opacity: 1,
          color: theme.colors.text,
          transition: 'opacity 300ms',
        }),
        input: (provider) => {
          return {
            ...provider
          }
        },
        placeholder: (base) => ({
          ...base,
          color: theme.colors.text,
          minWidth: 'max-content'
        }),
        noOptionsMessage: (base) => ({
          ...base,
          color: theme.colors.text
        }),
        menuList: (base) => ({
          ...base,
          '&::-webkit-scrollbar': {
            width: '10px'
          },
          /* Track */
          '&::-webkit-scrollbar-track': {
            // boxShadow: `inset 0 0 5px ${theme.colors.borderColor}70`,
            borderRadius: '10px'
          },
          /* Handle */
          '&::-webkit-scrollbar-thumb': {
            // background: theme.colors.backgroundAlt,
            borderRadius: '10px'
          },
          /* Handle on hover */
          '&::-webkit-scrollbar-thumb:hover': {
            // background: `${theme.colors.backgroundAlt}95`
          }
        }),
        menu: (provided) => {
          return {
            ...provided,
            backgroundColor: theme.colors.background,
            borderRadius: '6px',
            border: `0.5px solid ${theme.colors.borderColor}`,
          }
        }
      }}
    />
  )
}

export default StyledSelect
