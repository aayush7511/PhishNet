"""Layer 1: Deterministic phishing signal checks (no external calls)."""
import re
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SUSPICIOUS_TLDS = {".ru", ".xyz", ".tk", ".pw", ".top", ".gq", ".ml", ".cf", ".ga", ".work"}

BRANDS = {
    "paypal", "amazon", "apple", "microsoft", "google", "netflix",
    "bank", "chase", "citibank", "wellsfargo", "usbank", "barclays",
    "hsbc", "dhl", "fedex", "ups", "irs", "facebook", "instagram",
    "twitter", "linkedin", "dropbox", "docusign",
}

SENSITIVE_KEYWORDS = [
    "password", "passwd", "credit card", "card number", "social security",
    "ssn", "pin number", "cvv", "cvc", "bank account", "routing number",
    "login credentials", "verify your account", "confirm your details",
    "update your payment", "billing information", "mother's maiden name",
    "security question", "date of birth", "account number", "wire transfer",
    "provide your", "enter your password", "enter your username",
]

URL_PATTERN = re.compile(r"https?://[^\s<>\"')\]]+|www\.[^\s<>\"')\]]+", re.IGNORECASE)
FROM_PATTERN = re.compile(r"^From:\s*(.+)$", re.MULTILINE | re.IGNORECASE)
DISPLAY_EMAIL_PATTERN = re.compile(r"^(.*?)<([^>]+)>\s*$")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_domain(url: str) -> str:
    """Return the netloc (domain) of a URL string, stripping 'www.'."""
    try:
        parsed = urlparse(url if "://" in url else "http://" + url)
        netloc = parsed.netloc.lower()
        return netloc.lstrip("www.") if netloc.startswith("www.") else netloc
    except Exception:
        return ""


def _get_tld(domain: str) -> str:
    """Return the TLD portion of a domain (e.g. '.ru' from 'paypal-secure.ru')."""
    parts = domain.rsplit(".", 1)
    return "." + parts[-1] if len(parts) == 2 else ""


def _guess_impersonated_brand(domain: str) -> str:
    """Return a brand name if the domain appears to be impersonating one."""
    domain_lower = domain.lower()
    for brand in BRANDS:
        if brand in domain_lower:
            return brand
    return ""


# ---------------------------------------------------------------------------
# Check A: Suspicious URLs
# ---------------------------------------------------------------------------

def check_urls(email_text: str) -> dict:
    """
    Extract all URLs from the email and check each against known suspicious TLDs.

    Returns a finding dict with score_contribution=35 if any suspicious URL is found.
    Only counted once regardless of how many suspicious URLs appear.
    """
    urls = URL_PATTERN.findall(email_text)

    triggered_domain = None
    triggered_tld = None
    impersonated = ""

    for url in urls:
        domain = _extract_domain(url)
        if not domain:
            continue
        tld = _get_tld(domain)
        if tld in SUSPICIOUS_TLDS:
            triggered_domain = domain
            triggered_tld = tld
            impersonated = _guess_impersonated_brand(domain)
            break  # max once

    if triggered_domain:
        brand_note = f" mimicking {impersonated}.com" if impersonated else ""
        return {
            "id": "suspicious_url",
            "triggered": True,
            "label": f"Suspicious link: {triggered_domain}",
            "detail": f"Domain uses {triggered_tld} TLD{brand_note}",
            "passed": False,
            "score_contribution": 35,
        }

    return {
        "id": "suspicious_url",
        "triggered": False,
        "label": "No suspicious links found",
        "detail": "All URLs use standard, trusted TLDs",
        "passed": True,
        "score_contribution": 0,
    }


# ---------------------------------------------------------------------------
# Check B: Sender domain spoof
# ---------------------------------------------------------------------------

def check_domain_spoof(email_text: str) -> dict:
    """
    Parse the From header and flag mismatches between display name and sending domain.

    Looks for brand keywords in the display name that don't appear in the actual domain.
    """
    match = FROM_PATTERN.search(email_text)
    if not match:
        return {
            "id": "domain_mismatch",
            "triggered": False,
            "label": "Sender domain verified",
            "detail": "No From header found or no display name mismatch",
            "passed": True,
            "score_contribution": 0,
        }

    from_value = match.group(1).strip()
    display_match = DISPLAY_EMAIL_PATTERN.match(from_value)

    if not display_match:
        # Plain email, no display name — nothing to spoof
        return {
            "id": "domain_mismatch",
            "triggered": False,
            "label": "Sender domain verified",
            "detail": "Sender uses no display name — domain matches",
            "passed": True,
            "score_contribution": 0,
        }

    display_name = display_match.group(1).strip().lower()
    email_addr = display_match.group(2).strip().lower()

    # Extract sending domain
    at_idx = email_addr.rfind("@")
    if at_idx == -1:
        return {
            "id": "domain_mismatch",
            "triggered": False,
            "label": "Sender domain verified",
            "detail": "Could not parse sender email address",
            "passed": True,
            "score_contribution": 0,
        }
    from_domain = email_addr[at_idx + 1:]

    # Check if display name claims a brand but the from_domain is not a legitimate
    # domain for that brand.
    # "paypal" in display but from paypal-secure.ru → mismatch
    # "paypal" in display but from paypal.com       → OK
    impersonated_brand = None
    for brand in BRANDS:
        if brand not in display_name:
            continue
        # from_domain is legitimate if it IS exactly "{brand}.tld" or a subdomain thereof
        is_legit = (
            from_domain == f"{brand}.com"
            or from_domain.endswith(f".{brand}.com")
            or from_domain == f"{brand}.net"
            or from_domain.endswith(f".{brand}.net")
            or from_domain == f"{brand}.org"
            or from_domain.endswith(f".{brand}.org")
            or from_domain == f"{brand}.co"
            or from_domain.endswith(f".{brand}.co.uk")
        )
        if not is_legit:
            impersonated_brand = brand
            break

    if impersonated_brand:
        return {
            "id": "domain_mismatch",
            "triggered": True,
            "label": "Sender domain mismatch",
            "detail": (
                f"Display name claims to be '{display_match.group(1).strip()}' "
                f"but email sent from {from_domain}"
            ),
            "passed": False,
            "score_contribution": 20,
        }

    return {
        "id": "domain_mismatch",
        "triggered": False,
        "label": "Sender domain verified",
        "detail": f"Display name matches sending domain ({from_domain})",
        "passed": True,
        "score_contribution": 0,
    }


# ---------------------------------------------------------------------------
# Check C: Sensitive information requests
# ---------------------------------------------------------------------------

def check_sensitive_info(email_text: str) -> dict:
    """
    Scan the email body for keywords associated with credential/data harvesting.

    Returns a finding dict with score_contribution=25 if any keyword is found.
    """
    text_lower = email_text.lower()
    matched = [kw for kw in SENSITIVE_KEYWORDS if kw in text_lower]

    if matched:
        preview = ", ".join(matched[:3])
        suffix = f" (+{len(matched) - 3} more)" if len(matched) > 3 else ""
        return {
            "id": "sensitive_info",
            "triggered": True,
            "label": "Requests sensitive information",
            "detail": f"Keywords found: {preview}{suffix}",
            "passed": False,
            "score_contribution": 25,
        }

    return {
        "id": "sensitive_info",
        "triggered": False,
        "label": "No credential request found",
        "detail": "No sensitive information keywords detected",
        "passed": True,
        "score_contribution": 0,
    }
