import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import ArticleGrid from "@/components/rss/ArticleGrid";
import { useRssPage } from "@/components/rss/hooks";
import RssHeader from "@/components/rss/RssHeader";
import { ScrollArea } from "@/components/ui/scroll-area";

const rssSearchSchema = z.object({
	filter: z.string().nullable().catch(null),
});

export const Route = createFileRoute("/rss/")({
	component: RssComponent,
	validateSearch: rssSearchSchema,
});

function RssComponent() {
	const { filter } = Route.useSearch();
	const d = useRssPage(filter);

	return (
		<div className="flex h-full flex-col">
			<RssHeader
				mainTitle={d.mainTitle}
				unreadCount={d.unreadCount}
				search={d.search}
				onSearchChange={d.setSearch}
				viewMode={d.viewMode}
				onViewModeChange={d.setViewMode}
				isRefreshing={d.isRefreshing}
				onRefresh={d.handleRefresh}
			/>

			<ScrollArea className="flex-1">
				<div className="p-6">
					<ArticleGrid
						articles={d.articles}
						feeds={d.feeds}
						toggleArticleRead={d.toggleArticleRead}
						toggleArticleLike={d.toggleArticleLike}
						toggleArticleSave={d.toggleArticleSave}
						viewMode={d.viewMode}
					/>
				</div>
			</ScrollArea>
		</div>
	);
}
