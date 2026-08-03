import { useNavigation } from "@react-navigation/native";
import {
	Clock,
	ExternalLink,
	Filter,
	Heart,
	Search,
	TrendingUp,
	X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import BookmarkCard from "@/components/bookmarks/bookmark-card";
import { useReaderStore } from "@/lib/store";

interface MobileBookmarksScreenProps {
	filter?: string;
	tags?: string;
}

// Enhanced search history management
const useSearchHistory = () => {
	const [searchHistory, setSearchHistory] = useState<string[]>(() => {
		// Load from AsyncStorage in real implementation
		return [];
	});

	const addToHistory = (query: string) => {
		setSearchHistory((prev) => {
			// Remove duplicates and add to beginning
			const filtered = prev.filter((item) => item !== query);
			return [query, ...filtered].slice(0, 5); // Keep last 5 searches
		});
	};

	const clearHistory = () => {
		setSearchHistory([]);
	};

	return { searchHistory, addToHistory, clearHistory };
};

// Enhanced search filters for mobile
interface SearchFilters {
	query: string;
	collection: string | null;
	tags: string[];
	favorites: boolean;
	archived: boolean;
}

// Search suggestions generation
const useSearchSuggestions = (query: string) => {
	const bookmarks = useReaderStore((state) => state.bookmarks);

	return useMemo(() => {
		if (!query.trim()) return [];

		const lowerQuery = query.toLowerCase();
		const suggestions: string[] = [];
		const seen = new Set<string>();

		// Get tag suggestions
		bookmarks.forEach((bookmark) => {
			bookmark.tags?.forEach((tag) => {
				if (tag.toLowerCase().includes(lowerQuery) && !seen.has(tag)) {
					suggestions.push(tag);
					seen.add(tag);
				}
			});
		});

		// Get title suggestions
		bookmarks.forEach((bookmark) => {
			if (
				bookmark.title.toLowerCase().includes(lowerQuery) &&
				!seen.has(bookmark.title)
			) {
				suggestions.push(bookmark.title);
				seen.add(book.title);
			}
		});

		return suggestions.slice(0, 5); // Limit suggestions
	}, [bookmarks, query]);
};

// Mobile-optimized bookmarks screen with UX enhancements
export function MobileBookmarksScreen({
	filter = "all",
	tags,
}: MobileBookmarksScreenProps) {
	const navigation = useNavigation();
	const bookmarks = useReaderStore((state) => state.bookmarks);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [searchFilters, setSearchFilters] = useState<SearchFilters>({
		query: "",
		collection: filter === "all" ? null : filter,
		tags: tags ? tags.split(",").filter(Boolean) : [],
		favorites: filter === "favorites",
		archived: filter === "archive",
	});

	const { searchHistory, addToHistory, clearHistory } = useSearchHistory();
	const suggestions = useSearchSuggestions(searchFilters.query);

	// Enhanced search handlers with UX improvements
	const handleSearch = useCallback(
		(text: string) => {
			setSearchFilters((prev) => ({ ...prev, query: text }));
			setSearchQuery(text);

			// Track analytics (basic console logging for now)
			console.log("Mobile search performed:", text);

			if (text.trim()) {
				addToHistory(text);
			}
		},
		[addToHistory],
	);

	const clearSearch = useCallback(() => {
		setSearchQuery("");
		setSearchFilters((prev) => ({ ...prev, query: "" }));
	}, []);

	const applySuggestion = useCallback(
		(suggestion: string) => {
			handleSearch(suggestion);
		},
		[handleSearch],
	);

	// Enhanced bookmark filtering logic
	const filteredBookmarks = useMemo(() => {
		let results = bookmarks;

		// Apply search query
		if (searchFilters.query) {
			const query = searchFilters.query.toLowerCase();
			results = results.filter(
				(bookmark) =>
					bookmark.title.toLowerCase().includes(query) ||
					bookmark.url.toLowerCase().includes(query) ||
					bookmark.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
					bookmark.description?.toLowerCase().includes(query),
			);
		}

		// Apply collection filter
		if (searchFilters.favorites) {
			results = results.filter((b) => b.favorite); // Fix: use 'favorite' not 'liked'
		} else if (searchFilters.archived) {
			results = results.filter((b) => !b.saved || b.collectionId === "archive"); // Fix: use saved and archive logic
		} else if (searchFilters.collection) {
			results = results.filter(
				(b) => b.collectionId === searchFilters.collection,
			);
		}

		// Apply tag filter
		if (searchFilters.tags.length > 0) {
			results = results.filter((bookmark) =>
				searchFilters.tags.every((tag) =>
					bookmark.tags?.some(
						(bookmarkTag) => bookmarkTag.toLowerCase() === tag.toLowerCase(),
					),
				),
			);
		}

		return results;
	}, [bookmarks, searchFilters]);

	// Auto-suggest loading for better UX
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setIsSearching(false);
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchFilters.query]);

	// Render search bar with enhanced UX
	const renderSearchBar = () => (
		<View className="border-b bg-background px-4 py-3">
			{/* Main search container */}
			<View className="relative">
				{/* Search input with better visual hierarchy */}
				<View className="relative flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
					<Search size={20} className="mr-2 text-gray-400" />
					<TextInput
						placeholder="Search bookmarks..."
						value={searchQuery}
						onChangeText={handleSearch}
						className="flex-1 py-1 text-base text-gray-900"
						autoCapitalize="none"
						autoCorrect={false}
						returnKeyType="search"
					/>

					{/* Clear button with haptic feedback */}
					{searchQuery.length > 0 && (
						<TouchableOpacity
							onPress={clearSearch}
							className="ml-2 rounded-full bg-gray-200 p-1"
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<X size={18} className="text-gray-600" />
						</TouchableOpacity>
					)}
				</View>

				{/* Search suggestions */}
				{suggestions.length > 0 && (
					<View className="mt-2 rounded-lg border border-gray-200 bg-white shadow-sm">
						{suggestions.map((suggestion, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => applySuggestion(suggestion)}
								className="flex-row items-center border-gray-100 border-b px-3 py-2.5 last:border-b-0 hover:bg-gray-50 active:bg-gray-100"
							>
								<Search size={16} className="mr-3 text-gray-400" />
								<Text
									className="flex-1 text-gray-700 text-sm"
									numberOfLines={1}
								>
									{suggestion}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				)}

				{/* Search history */}
				{searchQuery.length === 0 && searchHistory.length > 0 && (
					<View className="mt-3">
						<View className="mb-2 flex-row items-center justify-between">
							<Text className="font-medium text-gray-700 text-sm">
								Recent Searches
							</Text>
							<TouchableOpacity onPress={clearHistory}>
								<Text className="text-gray-500 text-xs">Clear All</Text>
							</TouchableOpacity>
						</View>
						<View className="flex-row flex-wrap gap-2">
							{searchHistory.map((item, index) => (
								<TouchableOpacity
									key={index}
									onPress={() => handleSearch(item)}
									className="rounded-full bg-gray-100 px-3 py-1.5 active:bg-gray-200"
								>
									<Text className="text-gray-700 text-sm">{item}</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				)}
			</View>

			{/* Search results count */}
			{searchQuery.length > 0 && (
				<View className="mt-2 px-1">
					<Text className="text-gray-500 text-xs">
						{filteredBookmarks.length} result
						{filteredBookmarks.length !== 1 ? "s" : ""}
					</Text>
				</View>
			)}
		</View>
	);

	// Enhanced sorting/filtering controls for mobile
	const renderSortingControls = () => (
		<View className="flex-row border-b bg-background px-4 py-2">
			<View className="flex-row flex-wrap gap-2">
				{/* Quick action buttons */}
				<TouchableOpacity
					onPress={() => {
						// Open collection picker or show filters
						navigation.navigate("Collections" as any);
					}}
					className="flex-row items-center rounded-full bg-blue-50 px-3 py-1.5 active:bg-blue-100"
				>
					<Filter size={16} className="mr-1 text-blue-600" />
					<Text className="font-medium text-blue-600 text-sm">
						{searchFilters.collection ||
							(searchFilters.favorites ? "Favorites" : "All")}
					</Text>
				</TouchableOpacity>

				{searchFilters.tags.length > 0 && (
					<TouchableOpacity
						onPress={() => {
							// Show tag filter modal or remove tags
							setSearchFilters((prev) => ({ ...prev, tags: [] }));
						}}
						className="flex-row items-center rounded-full bg-purple-50 px-3 py-1.5 active:bg-purple-100"
					>
						<Text className="mr-1 font-medium text-purple-600 text-sm">
							Tags: {searchFilters.tags.length}
						</Text>
						<X size={14} className="text-purple-600" />
					</TouchableOpacity>
				)}

				{(searchFilters.favorites ||
					searchFilters.archived ||
					searchFilters.collection ||
					searchFilters.tags.length > 0) && (
					<TouchableOpacity
						onPress={() => {
							// Clear all filters
							setSearchFilters({
								query: "",
								collection: null,
								tags: [],
								favorites: false,
								archived: false,
							});
							setSearchQuery("");
						}}
						className="flex-row items-center rounded-full bg-gray-100 px-3 py-1.5 active:bg-gray-200"
					>
						<X size={14} className="mr-1 text-gray-600" />
						<Text className="text-gray-600 text-sm">Clear Filters</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);

	// Enhanced bookmark list rendering with mobile optimizations
	const renderBookmarkList = () => (
		<FlatList
			data={filteredBookmarks}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => (
				<View className="mx-4 mb-3">
					<BookmarkCard
						{...item}
						onLike={() => {
							// Handle like action
							console.log("Toggle like for:", item.id);
						}}
						onSave={() => {
							// Handle save action
							console.log("Toggle save for:", item.id);
						}}
						onDelete={() => {
							// Handle delete action
							console.log("Delete bookmark:", item.id);
						}}
						onEdit={() => {
							// Open edit screen
							console.log("Edit bookmark:", item.id);
						}}
						onOpenExternal={() => {
							// Open in browser
							console.log("Open external:", item.url);
						}}
					/>
				</View>
			)}
			contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
			ListHeaderComponent={() => (
				<View className="mb-4">{renderSortingControls()}</View>
			)}
			ListEmptyComponent={
				<View className="flex-1 items-center justify-center px-6 py-12">
					{searchQuery.length > 0 ? (
						<>
							<Search size={48} className="mb-4 text-gray-300" />
							<Text className="mb-2 font-medium text-gray-700 text-lg">
								No matching bookmarks
							</Text>
							<Text className="text-center text-gray-500 text-sm">
								Try adjusting your search or filters
							</Text>
						</>
					) : (
						<>
							<ExternalLink size={48} className="mb-4 text-gray-300" />
							<Text className="mb-2 font-medium text-gray-700 text-lg">
								No bookmarks found
							</Text>
							<Text className="text-center text-gray-500 text-sm">
								Add some bookmarks to get started
							</Text>
						</>
					)}
				</View>
			}
		/>
	);

	return (
		<View className="flex-1 bg-background">
			{/* Enhanced search bar */}
			{renderSearchBar()}

			{/* Bookmark list */}
			{renderBookmarkList()}

			{/* Search loading indicator */}
			{isSearching && (
				<View className="absolute right-4 bottom-4 rounded-full bg-blue-500 p-2 shadow-lg">
					<ActivityIndicator size="small" color="white" />
				</View>
			)}

			{/* Accessibly hidden skip link for screen readers */}
			<View className="sr-only">
				<TouchableOpacity onPress={() => {}}>
					Skip to bookmarks list
				</TouchableOpacity>
			</View>
		</View>
	);
}
