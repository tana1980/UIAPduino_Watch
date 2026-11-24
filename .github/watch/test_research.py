"""Offline checks for the research boundary. Run with python -m unittest discover -s .github/watch."""
import hashlib
import io
import json
import unittest
from unittest.mock import Mock, patch

import research


class ResearchTests(unittest.TestCase):
    domains = ["publisher.example"]
    seed = "https://publisher.example/news"
    detail = "https://publisher.example/article/1"
    quote = "A published project summary"

    def test_allowlist_and_visible_content(self):
        for url in ("http://publisher.example", "https://publisher.example.evil.test/",
                    "https://other@publisher.example/", "https://publisher.example:9999/"):
            self.assertFalse(research.allowed(url, self.domains))
        text, _ = research.source_details("<main>Title<script>untrusted</script></main>", "text/html")
        self.assertEqual(text, "Title")
        with self.assertRaisesRegex(ValueError, "excerpt_missing"):
            research.verify_quote(text, "untrusted")

    def test_only_fetched_urls_with_matching_evidence_are_returned(self):
        index = f'<main><a href="{self.detail}">Project</a></main>'
        def fetch(url, domains):
            text = index if url == self.seed else self.quote
            return text.encode(), text, "text/html"
        valid = {"title": "Project", "url": self.detail, "evidence": self.quote}
        rows = [valid, {**valid, "url": self.seed + "/invented"},
                {**valid, "evidence": "unverified claim"}]
        reply = {"candidates": [{"finishReason": "STOP", "content": {
            "parts": [{"text": json.dumps(rows)}]}}]}
        response = io.BytesIO(json.dumps(reply).encode())
        opener = Mock()
        opener.open.return_value = response
        with patch.object(research, "fetch_source", side_effect=fetch), \
             patch.object(research, "build_opener", return_value=opener), \
             patch.dict(research.os.environ, GEMINI_API_KEY="offline-placeholder"):
            result = research.research("Public project news", domains=self.domains, seeds=[self.seed])
        self.assertEqual(result, [{**valid, "source_sha256": hashlib.sha256(self.quote.encode()).hexdigest(),
                                   "title_grounded": False}])
        request = opener.open.call_args.args[0]
        self.assertEqual(request.full_url, research.ENDPOINT)
        self.assertNotIn("tools", json.loads(request.data))
        self.assertNotIn("offline-placeholder", request.data.decode())

    def test_feed_and_structural_failures(self):
        rss = f"<rss><channel><item><link>{self.detail}</link></item></channel></rss>"
        self.assertEqual(research.source_details(rss, "application/rss+xml"), ("", [self.detail]))
        with self.assertRaisesRegex(ValueError, "Repeated"):
            json.loads('{"url":"a","url":"b"}', object_pairs_hook=research.unique_keys)
        with patch.object(research, "fetch_source", side_effect=ValueError("source_http_503")):
            with self.assertRaisesRegex(RuntimeError, "No readable"):
                research.collect_sources([self.seed], self.domains)


if __name__ == "__main__":
    unittest.main()
