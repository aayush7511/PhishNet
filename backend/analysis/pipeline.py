"""Top-level analysis orchestrator: runs Layer 1 + Layer 2 and aggregates score."""
from .deterministic import check_urls, check_domain_spoof, check_sensitive_info
from .ai_layer import call_gpt
from .scorer import aggregate_score


def run_analysis(email_text: str) -> dict:
    """
    Run the full phishing analysis pipeline on the provided email text.

    Layer 1 (deterministic, ~100ms):
      - URL extraction & TLD check
      - Sender domain spoof check
      - Sensitive keyword scan

    Layer 2 (AI, GPT-4o-mini):
      - Urgency scoring
      - Coercive language detection
      - Impersonation detection

    Returns the complete API response dict ready for JSON serialisation.
    Raises no exceptions — all failures are handled internally with fallbacks.
    """
    # Layer 1
    url_result = check_urls(email_text)
    spoof_result = check_domain_spoof(email_text)
    info_result = check_sensitive_info(email_text)

    # Layer 2
    ai_result = call_gpt(email_text)

    # Aggregate
    return aggregate_score(url_result, spoof_result, info_result, ai_result)
