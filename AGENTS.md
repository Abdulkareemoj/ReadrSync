# Project: Cross-Platform Bookmark & RSS Manager

## 🎯 Overview

A personal cross-platform bookmark and RSS reader app built for desktop (Tauri), web, and mobile (Expo + React Native).
The app helps users organize, tag, and read bookmarked links and RSS feeds offline.
Syncing and user accounts will be added later.

### 🧩 Core Goals

- Manage and organize bookmarks with rich metadata (title, description, tags, favicon, collections)
- Read and manage RSS feeds directly within the app with offline caching
- Local-first data architecture across all platforms (SQLite for web/desktop, AsyncStorage for mobile)
- Consistent design system across all platforms using shadcn/ui principles
- Offline-ready with preparation for future cloud sync capabilities

### 🏗️ Architecture Overview

**Monorepo Architecture (Turborepo)** with platform-specific implementations:

```bash
apps/
  web/        → React 19 + Vite + TailwindCSS + shadcn/ui (Web)
  desktop/    → Tauri + React + Vite (Desktop shell)
  mobile/     → React Native (Expo) + UniWind (Mobile)
  website/    → React 19 + Vite (Marketing website)
packages/
  agents/     → Core database agents (BookmarkAgent, RssAgent, HighlightAgent)
  db/         → Drizzle ORM schema + migrations
  utils/      → Shared utilities (RSS parsing, metadata fetching, platform detection)
  hooks/      → Custom React hooks (cross-platform)
  store/      → Zustand state stores with persistence
```

## 📊 Platform Architecture

| Layer                      | Web/Desktop Implementation                           | Mobile Implementation                     |
| -------------------------- | --------------------------------------------------- | ---------------------------------------- |
| **UI Framework**            | React 19 + TailwindCSS 4 + shadcn/ui               | React Native + UniWind                   |
| **State Management**        | Zustand + Jotai (lightweight, cross-platform)       | Zustand                                  |
| **Database**                | SQLite (Drizzle ORM)                                | Expo SQLite / AsyncStorage               |
| **Navigation**              | Tanstack Start (web), React Router (desktop)       | Expo Router                              |
| **Styling**                 | TailwindCSS + shadcn/ui components                 | UniWind (Tailwind for React Native)      |
| **Build Tools**             | Vite + Tauri (desktop)                             | Expo CLI                                 |

**Key Architectural Decisions:**

1. **Agents Pattern**: Platform-agnostic database agents for consistent data operations
2. **Separation of Concerns**: Database logic (agents) vs. UI logic (platforms)
3. **Type Safety**: Complete TypeScript types across all layers
4. **Cross-Platform Consistency**: Shared types and interfaces, platform-specific implementations

### 🧠 Core Modules & Responsibilities

#### 1. Bookmark System (`packages/agents/src`)

**Responsibilities:**
- Create, read, update, delete bookmarks
- Manage favorites, likes, and saved states
- Tag and collection management
- Automatic metadata fetching (title, description, favicon)
- Search and filtering capabilities
- Local caching and synchronization

**Core Type Definition:**
```typescript
type Bookmark = {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  image?: string;
  tags?: string[];
  collectionId: string;           // "inbox" by default
  favorite?: boolean;
  liked?: boolean;
  saved?: boolean;                 // Always true for bookmarks
  dateAdded: string;
  lastUpdatedAt: string;
};
```

#### 2. RSS Reader System (`packages/agents/src`)

**Responsibilities:**
- Subscribe and manage RSS/Atom feeds
- Fetch and parse feed content using platform-specific parsers
- Cache articles locally for offline reading
- Track read/unread states
- Extract full article content

**Core Types:**
```typescript
type Feed = {
  id: string;
  title: string;
  feedUrl: string;
  siteUrl?: string;
  lastFetched?: string;
  unreadCount?: number;
  lastUpdatedAt: string;
};

type Article = {
  id: string;
  feedId: string;
  title: string;
  link: string;
  contentSnippet?: string;
  content?: string;
  fullContent?: string;
  imageUrl?: string;
  imageData?: string;
  pubDate?: string;
  read?: boolean;
  readAt?: string;
  liked?: boolean;
  saved?: boolean;
  lastUpdatedAt: string;
};
```

#### 3. Reading Experience (`packages/agents/src`)

**Responsibilities:**
- Store user highlights and annotations
- Manage article reading states
- Persist reader preferences

**Core Types:**
```typescript
type Highlight = {
  id: string;
  articleId: string;
  text: string;
  color: string;
  createdAt: string;
};

type Annotation = {
  id: string;
  highlightId: string;
  text: string;
  timestamp: string;
};
```

### 🛠️ Implementation Details

#### Database Layer (`packages/db`)

**Schema Overview:**
```typescript
// Main tables for bookmark management
const bookmarks = sqliteTable("bookmarks", { ... });
const feeds = sqliteTable("feeds", { ... });
const articles = sqliteTable("articles", { ... });

// Reading experience tables
const highlights = sqliteTable("highlights", { ... });
const annotations = sqliteTable("annotations", { ... });
```

**Key Features:**
- SQLite with Drizzle ORM for type-safe queries
- Automatic migrations with version tracking
- Full-text search preparation (SQLite FTS)
- Relationship constraints with cascading deletes

#### Agents Implementation (`packages/agents/src/index.ts`)

**BookmarkAgent Operations:**
- `addBookmark()`: Create new bookmark with metadata
- `getBookmark()`: Fetch single bookmark by ID
- `listBookmarks()`: Query with filtering and pagination
- `updateBookmark()`: Modify bookmark properties
- `deleteBookmark()`: Remove bookmark
- `toggleFavorite()/toggleLiked()/toggleSaved()`: State management
- `addTag()`: Tag assignment and deduplication

**RssAgent Operations:**
- `addFeed()`: Register and deduplicate feed URLs
- `removeFeed()`: Delete feed and cascade articles
- `listFeeds()`: Retrieve all subscriptions
- `insertArticles()`: Batch import articles with conflict resolution
- `updateFeedMeta()`: Track fetch status and counts
- `listArticles()`: Retrieve articles with feed filtering
- `markArticleRead()`: Reading state tracking

#### Utilities Layer (`packages/utils/src`)

**Platform-Specific Parsing:**

*Web/Desktop (uses @extractus):*
```typescript
import { extractFromXml, extractFromJson } from "@extractus/feed-extractor";
import { extract as extractArticle } from "@extractus/article-extractor";
```

*Mobile (custom implementation):*
```typescript
// Simple XML/JSON parsers optimized for mobile size
const parseFeedXML(): Promise<FeedData>;
const extractArticleContent(): Promise<ExtractedContent>;
```

**Network Utilities:**
- `fetchWithProxy()`: CORS bypass with multiple fallback proxies
- Automatic retry and fallback mechanisms
- Platform-appropriate request headers and error handling

### 📋 Development Workflow

#### Step-by-Step Implementation Guide

| Step | Action | Description |
| ---- | ------ | ----------- |
| **1️⃣** | **UI Foundation** | Build UIs in `apps/web` using shadcn/ui components (buttons, cards, forms) |
| **2️⃣** | **Mobile UI** | Build UIs in `apps/mobile` using NativeWind/Tamagui with consistent component patterns |
| **3️⃣** | **Database Core** | Define comprehensive Drizzle schema in `packages/db/src/schema.ts` |
| **4️⃣** | **Core Agents** | Implement BookmarkAgent, RssAgent, HighlightAgent in `packages/agents/src/index.ts` |
| **5️⃣** | **Storage Integration** | Wire up storage using Drizzle for web/desktop, AsyncStorage for mobile |
| **6️⃣** | **Future Sync** | Later add cloud sync with Supabase/custom backend (prepared interfaces) |

#### State Management Patterns

**Zustand Stores (`packages/store`):**
- BookmarkStore: CRUD operations + search/filtering
- RssStore: Feed management + article states
- UiStore: Theme, modals, and UI state
- ReadingStore: Highlights and annotations

**Cross-Platform Hooks (`packages/hooks`):**
- `useBookmarks()`: Generic hook for bookmark operations
- `useFeeds()`: Feed management hook
- `useArticles()`: Article operations with platform detection
- `useLocalStorage()`: Cross-platform storage abstraction

### 🔄 Current & Future

#### Current Capabilities (v1.0)
- ✅ Bookmark management with rich metadata
- ✅ RSS feed reader with offline storage
- ✅ Cross-platform consistent UI
- ✅ Local-first architecture (SQLite / AsyncStorage)
- ✅ Reading experience with highlights/annotations
- ✅ OAuth authentication (Google sign-in on web & desktop; mobile TBD)
- ✅ Dark mode support
- ✅ Search & filtering (advanced queries, tags, date range, booleans, pagination)
- ✅ Full-text search (SQLite FTS5 with multi-field LIKE fallback)
- ✅ JSON data import/export (web + mobile UI; desktop via shared web router)
- ✅ OPML/HTML import/export (web + mobile with format dropdown selector)
- ✅ State persistence via Zustand stores
- ✅ Cloud sync via Google Drive (web + desktop + mobile with OAuth PKCE, merge logic, auto-sync)

#### Planned Enhancements
- [ ] **Push Notifications**: Real-time feed updates
- [ ] **Folders/Collections**: Organize bookmarks hierarchically
- [ ] **Browser Extension**: Quick-save bookmarklet

## 📚 Architecture Benefits

### Performance Optimizations
1. **Database Indexing**: Optimized queries for bookmarks and articles
2. **Caching Strategy**: Local storage of feed content to minimize network calls
3. **Bundle Size**: Mobile-optimized utilities to reduce app size
4. **Offline Support**: Complete functionality without internet connectivity

### Developer Experience
1. **Type Safety**: Complete TypeScript coverage with generated types
2. **Consistent Interfaces**: Shared APIs across all platforms
3. **Platform Abstraction**: Common interfaces with platform-specific implementations
4. **Testing Strategy**: Unit tests for agents, integration tests for components

### Technical Excellence
1. **Clean Architecture**: Separation of concerns (agents → utils → platforms)
2. ** SOLID Principles**: Single responsibility, open/closed, dependency inversion
3. **Error Handling**: Comprehensive error boundaries and graceful fallbacks
4. **Accessibility**: Cross-platform ARIA support and keyboard navigation

## 🚀 Quick Start Summary

```bash
# Clone and setup
pnpm install
pnpm dev                    # Start all platforms
pnpm --filter web dev       # Web only
pnpm --filter desktop dev   # Desktop only
pnpm --filter mobile dev    # Mobile only

# Build all platforms
pnpm build
```

This architecture provides a solid foundation for a cross-platform bookmark and RSS reader with clear separation of concerns, excellent developer experience, and a clear path for future enhancements.
