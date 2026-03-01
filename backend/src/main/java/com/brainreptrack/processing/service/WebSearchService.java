package com.brainreptrack.processing.service;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Searches the web (via DuckDuckGo HTML) for additional context when the
 * captured content doesn't contain enough information for an extensive summary.
 * <p>
 * No API key required — uses the public DuckDuckGo HTML endpoint.
 */
@Slf4j
@Service
public class WebSearchService {

    private static final String DDG_URL = "https://html.duckduckgo.com/html/?q=";
    private static final int MAX_RESULTS = 5;
    private static final int TIMEOUT_MS = 10_000;

    /**
     * A single search result with title, snippet, and URL.
     */
    public record SearchResult(String title, String snippet, String url) {
    }

    /**
     * Performs a web search for the given query and returns up to
     * {@value MAX_RESULTS} result snippets.
     *
     * @param query the search query (plain text — will be URL-encoded)
     * @return list of search results; empty on failure
     */
    public List<SearchResult> search(String query) {
        List<SearchResult> results = new ArrayList<>();
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = DDG_URL + encoded;

            log.info("[WebSearch] Searching DuckDuckGo for: {}", query);

            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .timeout(TIMEOUT_MS)
                    .get();

            Elements resultDivs = doc.select("div.result");

            for (Element div : resultDivs) {
                if (results.size() >= MAX_RESULTS)
                    break;

                Element titleEl = div.selectFirst("a.result__a");
                Element snippetEl = div.selectFirst("a.result__snippet");

                String title = titleEl != null ? titleEl.text() : "";
                String snippet = snippetEl != null ? snippetEl.text() : "";
                String link = titleEl != null ? titleEl.attr("href") : "";

                if (!title.isBlank() || !snippet.isBlank()) {
                    results.add(new SearchResult(title, snippet, link));
                }
            }

            log.info("[WebSearch] Found {} results for query: {}", results.size(), query);
        } catch (Exception e) {
            log.warn("[WebSearch] Search failed for query '{}': {}", query, e.getMessage());
        }
        return results;
    }

    /**
     * Formats search results into a single text block suitable for
     * inclusion in an AI prompt.
     */
    public String formatResultsAsContext(List<SearchResult> results) {
        if (results.isEmpty())
            return "";

        StringBuilder sb = new StringBuilder();
        sb.append("\n--- INFORMACIÓN ADICIONAL DE INTERNET ---\n");
        for (int i = 0; i < results.size(); i++) {
            SearchResult r = results.get(i);
            sb.append(String.format("\n[Fuente %d] %s\n", i + 1, r.title()));
            if (!r.snippet().isBlank()) {
                sb.append(r.snippet()).append("\n");
            }
            if (!r.url().isBlank()) {
                sb.append("URL: ").append(r.url()).append("\n");
            }
        }
        sb.append("\n--- FIN INFORMACIÓN ADICIONAL ---\n");
        return sb.toString();
    }
}
