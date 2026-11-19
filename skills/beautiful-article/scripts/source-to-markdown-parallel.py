#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["mcp>=1.26,<2"]
# ///
"""Optional anonymous Parallel Search MCP source helper. Run with uv run."""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
import uuid
from pathlib import Path
from urllib.parse import urlparse

ENDPOINT = "https://search.parallel.ai/mcp"
USER_AGENT = (
    "garden-skills/beautiful-article "
    "(+https://github.com/ConardLi/garden-skills)"
)


def response_data(result) -> dict:
    """Accept structured MCP output or its JSON text representation."""
    if result.isError:
        message = "\n".join(
            block.text for block in result.content if block.type == "text"
        )
        raise ValueError(message or "MCP tool failed")
    data = result.structuredContent
    if data is None:
        text = "\n".join(
            block.text for block in result.content if block.type == "text"
        )
        data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("Expected an MCP result object")
    for warning in data.get("warnings") or []:
        print(f"Warning: {warning.get('message', warning)}", file=sys.stderr)
    return data


def render_fetch(data: dict) -> str:
    if data.get("errors"):
        raise ValueError("Page extraction failed: " + json.dumps(data["errors"]))
    results = data.get("results") or []
    if len(results) != 1:
        raise ValueError("Expected one extracted page")
    page = results[0]
    content = page.get("full_content")
    if not isinstance(content, str) or not content.strip():
        raise ValueError("No full page content returned; excerpts are not a source draft")
    title = page.get("title") or page["url"]
    date = f"\nPublished: {page['publish_date']}\n" if page.get("publish_date") else ""
    return f"# {title}\n\nSource: {page['url']}\n{date}\n{content.strip()}\n"


async def execute(args) -> str:
    from mcp import ClientSession
    from mcp.client.streamable_http import streamablehttp_client

    arguments = {"session_id": args.session_id}
    if args.command == "fetch":
        tool = "web_fetch"
        arguments.update(urls=[args.url], full_content=True)
    else:
        tool = "web_search"
        arguments.update(objective=args.objective, search_queries=args.query)
    # No auth object, credential file, environment key or Authorization header.
    async with streamablehttp_client(
        ENDPOINT, headers={"User-Agent": USER_AGENT},
        timeout=30, sse_read_timeout=120,
    ) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            data = response_data(await session.call_tool(tool, arguments))
    if args.command == "fetch":
        return render_fetch(data)
    if not data.get("results"):
        raise ValueError("Search returned no sources; refine the query")
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def http_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise argparse.ArgumentTypeError("Use an http:// or https:// source URL")
    return value


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    fetch = commands.add_parser("fetch", help="Fetch one URL as a full-page Markdown draft")
    fetch.add_argument("url", type=http_url)
    search = commands.add_parser("search", help="Find sources for user-requested research (JSON)")
    search.add_argument("--objective", required=True)
    search.add_argument("--query", action="append", required=True, help="Repeat for multiple queries")
    for command in (fetch, search):
        command.add_argument("-o", "--output", type=Path, help="Write a file instead of stdout")
        command.add_argument("--session-id", default=str(uuid.uuid4()),
                             help="Reuse one ID across related search/fetch calls")
    args = parser.parse_args()
    if not 1 <= len(args.session_id) <= 100:
        parser.error("--session-id must contain 1–100 characters")
    try:
        output = asyncio.run(asyncio.wait_for(execute(args), timeout=150))
        # Extraction failures never overwrite an existing source draft.
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(output, encoding="utf-8")
        else:
            print(output, end="")
        print(f"Session: {args.session_id}", file=sys.stderr)
        return 0
    except KeyboardInterrupt:
        return 130
    except Exception as error:
        print(f"Parallel source extraction failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
