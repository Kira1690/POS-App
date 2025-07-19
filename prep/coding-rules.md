# Coding Rules and Best Practices

## CRITICAL RULES - NEVER VIOLATE

### 1. SOLID Principles (MANDATORY)
- **Single Responsibility**: Each class/function has ONE reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: No client should depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### 2. No Over-Engineering (STRICT RULE)
- Write the simplest solution that works
- Don't add features "just in case"
- Avoid premature optimization
- Don't create unnecessary abstractions
- If you can't explain why you need it now, don't add it

### 3. Component Design Rules
- Maximum 300 lines per component file
- Break into smaller components at 200+ lines
- Each component has ONE clear purpose
- Props interface must be explicit and typed
- No inline functions in JSX (performance rule)

### 4. Service Layer Rules
- One service class per microservice/domain
- All API calls go through service layer
- No direct API calls from components
- Services return typed responses only
- Error handling in service layer, not components

### 5. State Management Rules
- Use Context API only for truly global state
- Local state (useState) for component-specific data
- No prop drilling beyond 2 levels
- State updates must be immutable
- No direct state mutation ever

## UI OPTIMIZATION RULES

### Performance Requirements
- First meaningful paint: < 2 seconds
- Component render time: < 16ms
- List items: Use FlatList for 10+ items
- Images: Always optimize and lazy load
- Navigation: Lazy load screens

### React Native Optimization
```typescript
// REQUIRED: Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// REQUIRED: Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// REQUIRED: Use useCallback for functions passed as props
const handlePress = useCallback(() => {
  // Handler logic
}, [dependency]);
```

### FlatList Optimization (MANDATORY)
```typescript
// REQUIRED for all lists with 5+ items
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout} // REQUIRED if fixed height
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={10}
/>
```

## TypeScript Rules (STRICT)

### Type Safety Requirements
- NO `any` types allowed (use `unknown` if needed)
- All function parameters and returns must be typed
- All component props must have interfaces
- Use type guards for runtime type checking
- Generic types when reusability is needed

### Required Type Patterns
```typescript
// REQUIRED: API response typing
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// REQUIRED: Component props typing
interface ComponentProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}

// REQUIRED: Service method typing
class OrderService {
  async createOrder(order: CreateOrderRequest): Promise<ApiResponse<Order>> {
    // Implementation
  }
}
```

## Error Handling Rules

### Service Layer Error Handling
```typescript
// REQUIRED pattern for all service methods
async serviceMethod(): Promise<Result<T, Error>> {
  try {
    const response = await apiCall();
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Service error:', error);
    return { success: false, error: error.message };
  }
}
```

### Component Error Handling
```typescript
// REQUIRED: Error boundaries for all screen components
const ScreenWithErrorBoundary = () => (
  <ErrorBoundary fallback={<ErrorScreen />}>
    <MainScreen />
  </ErrorBoundary>
);
```

## Security Rules (NON-NEGOTIABLE)

### Data Protection
- NEVER log sensitive data (tokens, passwords, PII)
- NEVER hardcode secrets or API keys
- ALWAYS validate input data
- ALWAYS sanitize user inputs
- Use secure storage for sensitive data only

### Authentication Rules
```typescript
// REQUIRED: Token validation before API calls
const isTokenValid = async (): Promise<boolean> => {
  const token = await getToken();
  if (!token) return false;
  
  // Check expiration
  const payload = parseJWT(token);
  return payload.exp > Date.now() / 1000;
};
```

## File Organization Rules

### Required Directory Structure
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── forms/           # Form components only
│   ├── business/        # Domain-specific components
│   └── navigation/      # Navigation components
├── screens/             # One folder per feature
├── services/            # One service per microservice
├── hooks/               # Custom hooks only
├── utils/               # Pure functions only
├── types/               # Type definitions only
└── constants/           # Configuration only
```

### File Naming Rules
- Components: PascalCase (UserProfile.tsx)
- Services: camelCase (userService.ts)
- Hooks: camelCase starting with 'use' (useAuth.ts)
- Types: camelCase with .types.ts (user.types.ts)
- Constants: UPPER_SNAKE_CASE (API_ENDPOINTS.ts)

## Testing Rules (MANDATORY)

### Coverage Requirements
- Minimum 70% coverage for all metrics
- 100% coverage for service layer
- 100% coverage for utility functions
- Integration tests for all API calls

### Required Test Patterns
```typescript
// REQUIRED: Service testing pattern
describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create order successfully', async () => {
    // Test implementation
  });

  it('should handle API errors gracefully', async () => {
    // Error test implementation
  });
});
```

## Performance Rules

### Bundle Size Limits
- Total bundle size: < 50MB
- Individual chunk: < 5MB
- Images: < 500KB each
- Use bundle analyzer monthly

### Memory Management
```typescript
// REQUIRED: Cleanup pattern for all effects
useEffect(() => {
  const subscription = subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Code Review Requirements

### Before Committing
1. Run all tests (npm test)
2. Run type checking (npm run type-check)
3. Run linting (npm run lint)
4. Check bundle size impact
5. Verify no console.logs in production code

### Pull Request Rules
- Maximum 500 lines changed
- Include tests for new features
- Update documentation if needed
- Performance impact assessment
- Security review for sensitive changes

## Accessibility Rules

### Required Accessibility Features
```typescript
// REQUIRED: Accessibility props for interactive elements
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Submit order"
  accessibilityRole="button"
  accessibilityHint="Submits the current order to kitchen"
>
```

### Color and Contrast
- Minimum contrast ratio: 4.5:1
- Support for system color schemes
- Never rely on color alone for information

## Documentation Rules

### Code Documentation
- JSDoc comments for all public functions
- README.md for each major feature
- Type definitions serve as documentation
- Complex logic must have inline comments

### API Documentation
```typescript
/**
 * Creates a new order in the system
 * @param order - The order data to create
 * @param restaurantId - ID of the restaurant
 * @returns Promise resolving to created order
 * @throws {ValidationError} When order data is invalid
 * @throws {AuthError} When user lacks permission
 */
async createOrder(order: CreateOrderRequest, restaurantId: string): Promise<Order>
```

## VIOLATION CONSEQUENCES

### Critical Rule Violations (Auto-Reject)
- Using `any` type
- Over-engineering solutions
- Violating SOLID principles
- Security violations
- Missing error handling

### Warning Level Violations (Fix Required)
- Performance anti-patterns
- Missing TypeScript types
- Inadequate test coverage
- Accessibility issues
- Documentation gaps

These rules are non-negotiable and must be followed in every piece of code written for this project.