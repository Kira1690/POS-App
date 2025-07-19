# POS App Authentication - Component Library

## Core UI Components for POS Authentication

### 1. AuthButton Component
**Purpose**: Primary button component for all authentication actions

#### Variants
- `primary` - Main actions (Login, Register, Continue)
- `secondary` - Secondary actions (Cancel, Back, Skip)
- `ghost` - Minimal actions (Forgot Password, Switch Account)
- `danger` - Destructive actions (Logout, Delete Account)

#### Props Interface
```typescript
interface AuthButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}
```

#### Design Specifications
- **Border Radius**: 24px (pill-shaped)
- **Height**: Small 40px, Medium 48px, Large 56px
- **Minimum Touch Target**: 48px
- **Horizontal Padding**: 24px
- **Icon Spacing**: 8px from text
- **Animation**: Spring physics (200ms)

### 2. AuthInput Component
**Purpose**: Consistent text input for forms with validation states

#### Variants
- `text` - Standard text input
- `email` - Email input with validation
- `password` - Password input with show/hide toggle
- `phone` - Phone number input with formatting
- `search` - Search input with clear button

#### Props Interface
```typescript
interface AuthInputProps {
  variant: 'text' | 'email' | 'password' | 'phone' | 'search';
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
}
```

#### Design Specifications
- **Border Radius**: 12px
- **Height**: 56px for optimal touch targets
- **Padding**: 16px horizontal, 18px vertical
- **Label Animation**: Floating label with smooth transition
- **Border States**: Default, Focused, Error, Disabled
- **Error Display**: Red text below input, slide-in animation

### 3. AuthCard Component
**Purpose**: Container for authentication forms with glassmorphism effect

#### Props Interface
```typescript
interface AuthCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  glassmorphism?: boolean;
  padding?: 'small' | 'medium' | 'large';
  elevation?: number;
}
```

#### Design Specifications
- **Border Radius**: 16px
- **Padding**: Medium 24px, Large 32px
- **Background**: Glassmorphism with backdrop blur
- **Shadow**: Soft shadow with 8px blur
- **Border**: 1px subtle border for glass effect

### 4. LoadingOverlay Component
**Purpose**: Elegant loading states for async operations

#### Props Interface
```typescript
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}
```

#### Design Specifications
- **Background**: Semi-transparent overlay
- **Spinner**: Custom animated spinner
- **Message**: Optional loading text
- **Animation**: Fade in/out transition

### 5. Toast Component
**Purpose**: Non-intrusive notifications for feedback

#### Props Interface
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}
```

#### Design Specifications
- **Position**: Top of screen with safe area
- **Border Radius**: 12px
- **Animation**: Slide down from top
- **Auto Dismiss**: 3-4 seconds default
- **Colors**: Semantic colors based on type

## Layout Components

### 1. AuthLayout Component
**Purpose**: Consistent wrapper for all authentication screens

#### Props Interface
```typescript
interface AuthLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  keyboardAvoiding?: boolean;
  scrollable?: boolean;
  backgroundImage?: string;
}
```

#### Features
- **Safe Area**: Automatic safe area handling
- **Keyboard Avoidance**: Smart keyboard handling
- **Background**: Gradient or image background
- **Header**: Optional header with back navigation
- **Scrolling**: Optional scroll container

### 2. ResponsiveContainer Component
**Purpose**: Adaptive container for different screen sizes

#### Props Interface
```typescript
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: 'small' | 'medium' | 'large';
  centered?: boolean;
}
```

#### Breakpoint Behavior
- **Phone (< 768px)**: Full width with padding
- **Tablet (768px+)**: Max width 480px, centered
- **Large Tablet (1024px+)**: Max width 600px, centered

### 3. SplitLayout Component
**Purpose**: Side-by-side layout for tablet landscape mode

#### Props Interface
```typescript
interface SplitLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  ratio?: number; // 0.5 = 50/50, 0.6 = 60/40
  minScreenWidth?: number;
}
```

## Form Components

### 1. FormField Component
**Purpose**: Wrapper for form inputs with label and error handling

#### Props Interface
```typescript
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}
```

### 2. PasswordInput Component
**Purpose**: Enhanced password input with strength indicator

#### Props Interface
```typescript
interface PasswordInputProps extends Omit<AuthInputProps, 'variant'> {
  showStrength?: boolean;
  minLength?: number;
  requireSpecialChars?: boolean;
}
```

#### Features
- **Show/Hide Toggle**: Eye icon to toggle visibility
- **Strength Indicator**: Color-coded strength bar
- **Validation**: Real-time password validation
- **Requirements**: Display password requirements

### 3. PhoneInput Component
**Purpose**: International phone number input with country selection

#### Props Interface
```typescript
interface PhoneInputProps {
  value: string;
  onChangeNumber: (number: string) => void;
  onChangeCountry: (country: Country) => void;
  defaultCountry?: string;
  disabled?: boolean;
  error?: string;
}
```

### 4. OTPInput Component
**Purpose**: One-time password input with individual digit boxes

#### Props Interface
```typescript
interface OTPInputProps {
  length: number;
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
}
```

#### Design Specifications
- **Digit Boxes**: Individual input boxes for each digit
- **Auto Focus**: Automatic focus progression
- **Paste Support**: Handle pasted OTP codes
- **Animation**: Smooth transitions between boxes

### 5. BiometricButton Component
**Purpose**: Biometric authentication (fingerprint/face) button

#### Props Interface
```typescript
interface BiometricButtonProps {
  type: 'fingerprint' | 'face' | 'auto';
  onPress: () => void;
  disabled?: boolean;
  available?: boolean;
}
```

## POS-Specific Components

### 1. RoleSelector Component
**Purpose**: Role selection for staff members

#### Props Interface
```typescript
interface RoleSelectorProps {
  roles: Role[];
  selectedRole?: Role;
  onRoleSelect: (role: Role) => void;
  disabled?: boolean;
}
```

### 2. RestaurantSelector Component
**Purpose**: Multi-location restaurant selection

#### Props Interface
```typescript
interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant;
  onRestaurantSelect: (restaurant: Restaurant) => void;
  showBranding?: boolean;
}
```

### 3. ShiftSelector Component
**Purpose**: Shift selection for staff login

#### Props Interface
```typescript
interface ShiftSelectorProps {
  shifts: Shift[];
  selectedShift?: Shift;
  onShiftSelect: (shift: Shift) => void;
  allowNewShift?: boolean;
  onNewShift?: () => void;
}
```

## Animation Specifications

### Timing Functions
- **Fast**: 200ms for micro-interactions
- **Normal**: 300ms for component transitions  
- **Slow**: 500ms for page transitions

### Easing Functions
- **Spring**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`
- **Ease Out**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- **Ease In Out**: `cubic-bezier(0.4, 0, 0.2, 1)`

### Component Animations
- **Button Press**: Scale down to 0.95 with spring back
- **Input Focus**: Border color change with smooth transition
- **Card Appear**: Slide up from bottom with fade in
- **Toast**: Slide down from top
- **Loading**: Smooth spinner rotation

This component library ensures **consistent, accessible, and POS-optimized** authentication UI components that work seamlessly across all device sizes and orientations.