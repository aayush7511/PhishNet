"""Layer 2: GPT-4o-mini linguistic analysis with graceful fallback."""
import json
import os
import re
import logging

import openai

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are a phishing detection assistant. Analyze the email text provided "
    "and return ONLY a valid JSON object. No markdown, no explanation, no extra text. "
    'Format: {"urgency_score": <integer 0-100>, "coercive_language": <true or false>, '
    '"impersonation_detected": <true or false>, "reasoning": "<one sentence max>"}'
)

FALLBACK = {
    "urgency_score": 0,
    "coercive_language": False,
    "impersonation_detected": False,
    "reasoning": "AI analysis unavailable",
}

# Truncate input to stay well within token budget
MAX_EMAIL_CHARS = 10_000

# Regex to strip ```json ... ``` or ``` ... ``` markdown fences
FENCE_PATTERN = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```", re.IGNORECASE)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_ai_response(raw: str) -> dict:
    """
    Attempt to parse the model's raw text output as JSON.

    Tries direct parse first, then strips markdown code fences and retries.
    Raises ValueError if parsing or validation fails.
    """
    # Direct parse
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        # Try stripping fences
        fence_match = FENCE_PATTERN.search(raw)
        if fence_match:
            parsed = json.loads(fence_match.group(1))
        else:
            raise ValueError(f"Model returned non-JSON: {raw[:200]}")

    required_keys = {"urgency_score", "coercive_language", "impersonation_detected", "reasoning"}
    missing = required_keys - set(parsed.keys())
    if missing:
        raise ValueError(f"AI response missing keys: {missing}")

    return {
        "urgency_score": int(parsed["urgency_score"]),
        "coercive_language": bool(parsed["coercive_language"]),
        "impersonation_detected": bool(parsed["impersonation_detected"]),
        "reasoning": str(parsed["reasoning"])[:500],
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def call_gpt(email_text: str) -> dict:
    """
    Send the email text to GPT-4o-mini and return the parsed analysis dict.

    On ANY failure (network, rate limit, bad JSON, missing keys) returns FALLBACK
    so the analysis pipeline always completes.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set — returning AI fallback")
        return FALLBACK

    try:
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": email_text[:MAX_EMAIL_CHARS]},
            ],
            temperature=0,
            max_tokens=150,
        )
        raw = response.choices[0].message.content.strip()
        return _parse_ai_response(raw)

    except (openai.APIConnectionError, openai.RateLimitError, openai.APIStatusError) as exc:
        logger.warning("OpenAI API error: %s — returning fallback", exc)
        return FALLBACK
    except (ValueError, KeyError, TypeError) as exc:
        logger.warning("AI response parse error: %s — returning fallback", exc)
        return FALLBACK
    except Exception as exc:
        logger.error("Unexpected error in call_gpt: %s — returning fallback", exc)
        return FALLBACK
