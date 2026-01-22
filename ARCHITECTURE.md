# SearchScreen Architecture - Simple & Clean

## Screen Structure (Split into 3 sections)

```
SearchScreen (Container Component)
├── SearchHeader (Top Section)
│   ├── Search Input
│   └── Filter Icon
├── UsersList (Middle Section)  
│   ├── FlatList
│   └── UserRow Components
└── BottomNav (Bottom Section)
    └── Navigation Tabs
```

## Files Organization

### Screen
- **SearchScreen.tsx** - Main container, handles search logic only

### Components
- **SearchHeader.tsx** - Isolated search input component
- **UsersList.tsx** - List container with empty state handling
- **BottomNav.tsx** - Already exists, reused

### Data & Types
- **types/index.ts** - UserProfile interface definition
- **data/mockData.ts** - MOCK_USERS data

## Key Improvements

1. **Split Screen into 3 Sections**
   - Clear separation: Search → List → Navigation
   - Each section can scale independently

2. **Component Reusability**
   - SearchHeader can be used in other screens
   - UsersList is a standalone component
   - BottomNav is shared across the app

3. **Simple Architecture**
   - Minimal state management (only searchTerm)
   - useMemo for filtering optimization
   - No nested components cluttering the main screen

4. **Scalability**
   - Easy to add filters
   - Can add sorting/pagination to UsersList
   - Components are testable individually

## Data Flow

```
SearchScreen
    ↓
[searchTerm] → Filter MOCK_USERS → [filteredUsers]
    ↓
    ├→ SearchHeader (input)
    └→ UsersList (filtered output)
```

## Component Responsibilities

| Component | Responsibility |
|-----------|-----------------|
| SearchScreen | State management, filtering logic |
| SearchHeader | Input UI, no state |
| UsersList | Display list, empty state |
| BottomNav | Navigation between screens |
