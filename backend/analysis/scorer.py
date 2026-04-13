"""Score aggregation: combine deterministic and AI results into a final verdict."""

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

RISK_THRESHOLDS = [
    (67, "high",   "High risk — likely phishing"),
    (34, "medium", "Suspicious"),
    (0,  "low",    "Likely safe"),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_risk(score: int) -> tuple[str, str]:
    """Map a numeric score to (risk_level, risk_label)."""
    for threshold, level, label in RISK_THRESHOLDS:
        if score >= threshold:
            return level, label
    return "low", "Likely safe"


def _get_severity(contribution: int, urgency_score: int | None = None) -> str:
    """
    Map a score contribution to a severity badge string.

    HIGH  ≥ 25
    MED   10-24
    LOW   < 10 with low urgency language
    PASS  contribution == 0
    """
    if contribution == 0:
        return "PASS"
    if contribution >= 25:
        return "HIGH"
    if contribution >= 10:
        return "MED"
    # sub-10 contribution (urgency only)
    if urgency_score is not None and urgency_score < 31:
        return "LOW"
    return "MED"


def _urgency_label(urgency_score: int) -> str:
    """Return a human-readable label for the AI urgency score."""
    if urgency_score <= 30:
        return "Minor urgency language detected" if urgency_score > 0 else "No urgency language"
    if urgency_score <= 60:
        return "Urgent language pattern"
    return "Threatening urgency language"


def _build_det_finding(result: dict) -> dict:
    """Convert a deterministic check result into an API finding object."""
    return {
        "id": result["id"],
        "label": result["label"],
        "severity": "PASS" if result["passed"] else _get_severity(result["score_contribution"]),
        "detail": result["detail"],
        "passed": result["passed"],
    }


def _build_ai_findings(ai_result: dict, urgency_contrib: int) -> list[dict]:
    """Build the three AI-derived finding objects."""
    urgency_score = ai_result["urgency_score"]

    findings = [
        {
            "id": "ai_urgency",
            "label": _urgency_label(urgency_score),
            "severity": _get_severity(urgency_contrib, urgency_score),
            "detail": f"AI urgency score: {urgency_score}/100",
            "passed": urgency_score == 0,
        },
        {
            "id": "ai_coercive",
            "label": "Coercive language detected" if ai_result["coercive_language"] else "No coercive language",
            "severity": "MED" if ai_result["coercive_language"] else "PASS",
            "detail": "Email uses pressure tactics to force immediate action" if ai_result["coercive_language"] else "No coercive pressure language found",
            "passed": not ai_result["coercive_language"],
        },
        {
            "id": "ai_impersonation",
            "label": "Impersonation detected" if ai_result["impersonation_detected"] else "No impersonation detected",
            "severity": "MED" if ai_result["impersonation_detected"] else "PASS",
            "detail": "Email appears to impersonate a trusted brand or authority" if ai_result["impersonation_detected"] else "No brand impersonation detected",
            "passed": not ai_result["impersonation_detected"],
        },
    ]
    return findings


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def aggregate_score(
    url_result: dict,
    spoof_result: dict,
    info_result: dict,
    ai_result: dict,
) -> dict:
    """
    Combine deterministic and AI results into the final analysis response dict.

    Score formula (capped at 100):
      +35  suspicious URL found (max once)
      +25  sensitive info keywords found
      +20  sender domain mismatch
      +0-15 AI urgency contribution (urgency_score / 100 * 15)
      +10  AI coercive_language=true
      +10  AI impersonation_detected=true
    """
    score = 0

    if url_result["triggered"]:
        score += 35
    if info_result["triggered"]:
        score += 25
    if spoof_result["triggered"]:
        score += 20

    urgency_contrib = round(ai_result["urgency_score"] / 100 * 15)
    score += urgency_contrib

    if ai_result["coercive_language"]:
        score += 10
    if ai_result["impersonation_detected"]:
        score += 10

    score = min(score, 100)

    # Build findings in descending severity order
    findings = [
        _build_det_finding(url_result),
        _build_det_finding(info_result),
        _build_det_finding(spoof_result),
    ] + _build_ai_findings(ai_result, urgency_contrib)

    risk_level, risk_label = _get_risk(score)

    return {
        "score": score,
        "risk_level": risk_level,
        "risk_label": risk_label,
        "findings": findings,
        "ai_reasoning": ai_result["reasoning"],
    }
