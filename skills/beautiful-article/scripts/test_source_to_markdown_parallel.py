"""Response/error regressions for the optional MCP extraction helper."""
import contextlib
import importlib.util
import io
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "parallel_source", Path(__file__).with_name("source-to-markdown-parallel.py")
)
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


class ExtractionTests(unittest.TestCase):
    def test_full_content_not_excerpts(self):
        page = {"url": "https://example.com", "title": "Article", "publish_date": "2026-01-01",
                "excerpts": ["short summary"], "full_content": "## Body\n\n```python\nprint(1)\n```"}
        output = helper.render_fetch({"results": [page], "errors": []})
        self.assertIn("Source: https://example.com", output)
        self.assertIn("Published: 2026-01-01", output)
        self.assertIn(page["full_content"], output)
        self.assertNotIn("short summary", output)

    def test_missing_full_content_is_failure(self):
        for value in (None, "", "   "):
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, "No full page"):
                helper.render_fetch({"results": [{"url": "https://example.com",
                                                  "excerpts": ["summary"], "full_content": value}]})

    def test_extraction_errors_are_not_silenced(self):
        with self.assertRaisesRegex(ValueError, "403"):
            helper.render_fetch({"errors": [{"http_status_code": 403}], "results": []})
        with self.assertRaisesRegex(ValueError, "one extracted page"):
            helper.render_fetch({"results": []})

    def test_tool_error_and_text_json(self):
        block = SimpleNamespace(type="text", text='{"results": []}')
        result = SimpleNamespace(isError=False, structuredContent=None, content=[block])
        self.assertEqual(helper.response_data(result), {"results": []})
        result.isError = True
        block.text = "Rate limit: Retry-After 60"
        with self.assertRaisesRegex(ValueError, "Retry-After 60"):
            helper.response_data(result)

    def test_warnings_are_visible(self):
        result = SimpleNamespace(isError=False, content=[], structuredContent={
            "results": [], "warnings": [{"message": "Content may be truncated"}]})
        stderr = io.StringIO()
        with contextlib.redirect_stderr(stderr):
            helper.response_data(result)
        self.assertIn("Content may be truncated", stderr.getvalue())

    def test_failure_preserves_existing_draft(self):
        async def fail(args):
            raise ValueError("No full page content")

        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "source.md"
            output.write_text("Existing source", encoding="utf-8")
            with patch.object(helper, "execute", fail), patch("sys.argv", [
                "helper", "fetch", "https://example.com", "-o", str(output)
            ]), contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(helper.main(), 1)
            self.assertEqual(output.read_text(), "Existing source")

    def test_local_file_url_rejected(self):
        with patch("sys.argv", ["helper", "fetch", "file:///etc/hosts"]), \
                contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as raised:
            helper.main()
        self.assertEqual(raised.exception.code, 2)


if __name__ == "__main__":
    unittest.main()
