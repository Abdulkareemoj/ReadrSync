// Enhanced search-related hooks with mobile optimizations
import { useCallback, useMemo, useState } from "react";

export function useMobileSearch() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Generate search suggestions based on available bookmarks
	const generateSuggestions = (bookmarks: any[], query: string): string[] => {
		if (!query.trim()) return [];

		const lowerQuery = query.toLowerCase();
		const suggestions: string[] = [];

		// Prioritize title matches
		bookmarks.forEach((bookmark) => {
			if (bookmark.title.toLowerCase().includes(lowerQuery)) {
				suggestions.push(bookmark.title);
			}
		});

		// Add tag matches
		bookmarks.forEach((bookmark) => {
			bookmark.tags?.forEach((tag) => {
				if (
					tag.toLowerCase().includes(lowerQuery) &&
					!suggestions.includes(tag)
				) {
					suggestions.push(tag);
				}
			});
		});

		return suggestions.slice(0, 5);
	};

	const handleSearch = useCallback((text: string) => {
		setSearchQuery(text);

		// Generate suggestions
		if (text.trim()) {
			const suggestions = generateSuggestions([], text);
			setSearchSuggestions(suggestions);
		} else {
			setSearchSuggestions([]);
		}

		setIsSearching(true);

		// Simulate loading for better UX
		setTimeout(() => {
			setIsSearching(false);
		}, 300);
	}, []);

	const clearSearch = useCallback(() => {
		setSearchQuery("");
		setSearchSuggestions([]);
	}, []);

	return {
		searchQuery,
		setSearchQuery: handleSearch, // Keep for compatibility
		searchSuggestions,
		isSearching,
		handleSearch,
		clearSearch,
	};
}
