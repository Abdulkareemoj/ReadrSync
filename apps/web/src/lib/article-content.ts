import { extractArticleContent, needsFullContent } from "@packages/utils";
import type { StoreApi } from "zustand";
import type { ReaderState } from "./store";

/**
 * Web/desktop wiring for the reader store's fetchArticleContent. The shared
 * store ships an unwired stub because the extractors live in @packages/utils
 * (web-only as React Native cannot bundle them); mobile wires its own
 * implementation in apps/mobile/lib/mobile-init.ts.
 */
export function wireWebFetchArticleContent(store: StoreApi<ReaderState>): void {
	store.setState({
		fetchArticleContent: async (id) => {
			const article = store.getState().articles.find((a) => a.id === id);
			if (!article || !article.link) return;

			const contentText = (article.content ?? "")
				.replace(/<[^>]*>/g, "")
				.trim();
			if ((article as any).fullContent || contentText.length >= 500) return;

			try {
				if (!needsFullContent(article)) return;

				const extracted = await extractArticleContent(article.link);
				if (!extracted?.content) return;

				const imageUrl = article.imageUrl ?? extracted.image ?? null;
				await store
					.getState()
					.rssAgent.updateArticleContent(id, extracted.content, imageUrl);

				store.setState((s) => ({
					articles: s.articles.map((a) =>
						a.id === id
							? { ...a, fullContent: extracted.content, imageUrl }
							: a,
					),
				}));
			} catch (err) {
				console.warn("[fetchArticleContent] Failed:", err);
			}
		},
	});
}
