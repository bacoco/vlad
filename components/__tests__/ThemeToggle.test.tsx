import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '../ThemeToggle'
import { useTheme } from '@/components/providers/ThemeProvider'

// Mock the ThemeProvider hook
jest.mock('@/components/providers/ThemeProvider', () => ({
  useTheme: jest.fn()
}))

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })
  })

  it('renders without crashing', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /theme toggle/i })).toBeInTheDocument()
  })

  it('displays correct icon for light theme', () => {
    render(<ThemeToggle />)
    expect(screen.getByText('☀️')).toBeInTheDocument()
  })

  it('displays correct icon for dark theme', () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    })
    
    render(<ThemeToggle />)
    expect(screen.getByText('🌙')).toBeInTheDocument()
  })

  it('displays correct icon for system theme', () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme
    })
    
    render(<ThemeToggle />)
    expect(screen.getByText('💻')).toBeInTheDocument()
  })

  it('opens theme menu on click', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /theme toggle/i })
    await user.click(toggleButton)
    
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('changes theme when option is selected', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /theme toggle/i })
    await user.click(toggleButton)
    
    const darkButton = screen.getByRole('button', { name: /dark/i })
    await user.click(darkButton)
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('closes menu after theme selection', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /theme toggle/i })
    await user.click(toggleButton)
    
    const darkButton = screen.getByRole('button', { name: /dark/i })
    await user.click(darkButton)
    
    expect(screen.queryByText('Dark')).not.toBeInTheDocument()
  })

  it('closes menu when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <ThemeToggle />
        <button>Outside button</button>
      </div>
    )
    
    const toggleButton = screen.getByRole('button', { name: /theme toggle/i })
    await user.click(toggleButton)
    
    expect(screen.getByText('Light')).toBeInTheDocument()
    
    // Click outside by clicking the overlay
    const overlay = document.querySelector('.fixed.inset-0')
    await user.click(overlay!)
    
    expect(screen.queryByText('Light')).not.toBeInTheDocument()
  })

  it('highlights current theme in menu', async () => {
    const user = userEvent.setup()
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    })
    
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /theme toggle/i })
    await user.click(toggleButton)
    
    const darkButton = screen.getByRole('button', { name: /dark/i })
    expect(darkButton).toHaveClass('bg-gray-100', 'dark:bg-gray-700')
  })

  it('toggles menu open and closed', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /theme toggle/i })
    
    // Open menu
    await user.click(toggleButton)
    expect(screen.getByText('Light')).toBeInTheDocument()
    
    // Close menu
    await user.click(toggleButton)
    expect(screen.queryByText('Light')).not.toBeInTheDocument()
  })

  it('applies correct hover styles', () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /theme toggle/i })
    expect(toggleButton).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800')
  })
})