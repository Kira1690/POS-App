// UNIVERSAL APPLE DESIGN PRIMITIVES
// Following SOLID principles for maximum reusability and maintainability

// FOUNDATIONAL PRIMITIVE COMPONENTS
export { AppleCard } from './AppleCard';
export { ApplePill } from './ApplePill';
export { AppleInteractive } from './AppleInteractive';

// USAGE PHILOSOPHY:
// These primitives replace ALL component-specific styling throughout the app.
// Each primitive follows SOLID principles:
// - Single Responsibility: One clear purpose
// - Open/Closed: Extensible without modification
// - Liskov Substitution: Interchangeable with existing components
// - Interface Segregation: Small, focused interfaces
// - Dependency Inversion: Depends on theme abstractions

// EXAMPLES OF UNIVERSAL REUSABILITY:
//
// Settings Screen:
// <AppleCard layer="surface" size="large">
//   <AppleInteractive onPress={navigate} feedbackType="highlight">
//     <ApplePill text="General" variant="action" />
//   </AppleInteractive>
// </AppleCard>
//
// Dashboard Screen:
// <AppleCard layer="surfaceVariant" size="medium" interactive>
//   <ApplePill text="Active Orders" color="success" />
// </AppleCard>
//
// Table Management:
// <AppleCard layer="surface" size="small" onPress={selectTable}>
//   <ApplePill text="Available" color="success" size="small" />
// </AppleCard>
//
// Order Management:
// <AppleCard layer="surfaceElevated" size="medium">
//   <ApplePill text="Ready" variant="status" color="success" />
// </AppleCard>
//
// Payment Interface:
// <AppleCard layer="surface" size="hero" shadow>
//   <AppleInteractive onPress={processPayment} touchTarget="large">
//     <ApplePill text="Pay $25.99" variant="action" color="primary" />
//   </AppleInteractive>
// </AppleCard>