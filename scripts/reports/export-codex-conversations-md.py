from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "docs" / "codex-conversations" / "raw"
OUT_DIR = ROOT / "docs" / "codex-conversations" / "markdown"


THREAD_TOPICS = {
    "019e067a-f926-7153-adbe-fa52e550cd94": "Spec-driven project start and MVP implementation",
    "019e0aec-c240-7f63-8c73-1f9927b28aec": "MaaS generation testing and next-step plan",
    "019e0bac-1c8f-7953-8273-479d0904194e": "Public access, tunnel scripts, and public acceptance",
}


def thread_id_from_name(path: Path) -> str:
    match = re.search(r"([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})", path.name)
    return match.group(1) if match else path.stem


def extract_text(content: object) -> str:
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""

    parts: list[str] = []
    for item in content:
        if not isinstance(item, dict):
            continue
        item_type = item.get("type")
        if item_type in {"input_text", "output_text", "text"}:
            text = item.get("text")
            if isinstance(text, str) and text.strip():
                parts.append(text.rstrip())
        elif item_type in {"image", "local_image"}:
            image_desc = item.get("image_url") or item.get("path") or "[image]"
            parts.append(f"[Image: {image_desc}]")
    return "\n\n".join(parts).strip()


def iter_messages(path: Path):
    seen: set[tuple[str, str, str]] = set()
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            if obj.get("type") != "response_item":
                continue
            payload = obj.get("payload")
            if not isinstance(payload, dict):
                continue
            if payload.get("type") != "message":
                continue
            role = payload.get("role")
            if role not in {"user", "assistant"}:
                continue

            text = extract_text(payload.get("content"))
            if not text:
                continue

            timestamp = str(obj.get("timestamp") or "")
            key = (timestamp, role, text)
            if key in seen:
                continue
            seen.add(key)
            yield timestamp, role, text


def fence_if_needed(text: str) -> str:
    # Keep Markdown readable while preserving original content as much as possible.
    if "\n" not in text:
        return text
    return text


def write_conversation(path: Path) -> tuple[Path, int]:
    thread_id = thread_id_from_name(path)
    out_path = OUT_DIR / f"{thread_id}.md"
    topic = THREAD_TOPICS.get(thread_id, path.stem)
    messages = list(iter_messages(path))

    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        out.write(f"# Codex conversation: {thread_id}\n\n")
        out.write(f"- Source: `../raw/{path.name}`\n")
        out.write(f"- Topic: {topic}\n")
        out.write(f"- Exported messages: {len(messages)}\n\n")
        out.write("> This Markdown export contains user and assistant message text from the raw Codex session log. Tool calls and terminal outputs are intentionally omitted.\n\n")

        for index, (timestamp, role, text) in enumerate(messages, start=1):
            label = "User" if role == "user" else "Assistant"
            out.write(f"## {index}. {label}\n\n")
            if timestamp:
                out.write(f"Time: `{timestamp}`\n\n")
            out.write(f"{fence_if_needed(text)}\n\n")

    return out_path, len(messages)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    raw_files = sorted(RAW_DIR.glob("*.jsonl"))

    index_lines = [
        "# Markdown conversation exports",
        "",
        "These files are generated from `docs/codex-conversations/raw/*.jsonl`.",
        "",
        "| Thread ID | Messages | Markdown file |",
        "| --- | ---: | --- |",
    ]

    for raw_file in raw_files:
        out_path, count = write_conversation(raw_file)
        thread_id = thread_id_from_name(raw_file)
        rel = out_path.relative_to(OUT_DIR.parent).as_posix()
        index_lines.append(f"| `{thread_id}` | {count} | `{rel}` |")

    index_path = OUT_DIR / "README.md"
    index_path.write_text("\n".join(index_lines) + "\n", encoding="utf-8")

    print(f"Exported {len(raw_files)} conversations to {OUT_DIR}")


if __name__ == "__main__":
    main()
