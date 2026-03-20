"""Rule-based classification without AI - used as fallback"""

VAGUE_WORDS = [
    'maybe', 'seems', 'i think', 'heard', 'possibly',
    'might', 'apparently', 'supposedly', 'rumor', 'probably'
]

SPECIFIC_INDICATORS = [
    'address', 'phone', 'email',
    'police', 'fbi', 'cisa', 'fire department', 'fire service',
    '2024-', '2025-', '2026-', 'case #', 'incident report', 'confirmed breach',
    'pm', 'am', ':00', ':', 'march', 'april', 'january', 'february'
]

# Action summaries for different alert types
ACTION_SUMMARIES = {
    'phishing': "Do not click unknown links or share personal info. Enable 2FA on your accounts.",
    'breach': "Change your password immediately. Monitor your credit report for unusual activity.",
    'scam': "Do not send money or personal information. Report to authorities if requested.",
    'crime': "Contact local police if you have information. Document details for safety.",
    'accident': "Check if anyone needs help. Call emergency services if injuries are reported.",
    'disaster': "Follow official evacuation orders. Stay away from affected areas.",
    'outage': "Check official utility websites for updates. Conserve power if requested.",
    'general': "Stay informed and take practical security precautions."
}

def has_vague_language(text: str) -> bool:
    """Check if text contains vague language"""
    text_lower = text.lower()
    return any(word in text_lower for word in VAGUE_WORDS)

def has_specific_details(text: str) -> bool:
    """Check if text contains specific details"""
    text_lower = text.lower()
    return any(indicator in text_lower for indicator in SPECIFIC_INDICATORS)

def is_all_caps_complaint(text: str) -> bool:
    """Check if text is all caps (often indicates venting)"""
    if len(text) < 10:
        return False
    # Count uppercase letters, excluding punctuation
    caps_count = sum(1 for c in text if c.isupper())
    total_letters = sum(1 for c in text if c.isalpha())
    # If more than 50% caps in a short text, it's likely venting
    if total_letters > 5:
        caps_ratio = caps_count / total_letters
        return caps_ratio > 0.50

def classify_alert(title: str, description: str, alert_type: str = None) -> dict:
    """
    Rule-based classification with action summary
    Returns: {classification, confidence, reasoning, action_summary, method}
    """
    full_text = f"{title} {description}".lower()

    # Get action summary for the alert type
    action_summary = ACTION_SUMMARIES.get(alert_type or 'general', ACTION_SUMMARIES['general'])

    # Check for noise indicators first (vague language = noise)
    if has_vague_language(full_text):
        return {
            'classification': 'noise',
            'confidence': 0.80,
            'reasoning': 'Contains vague language (maybe, heard, seems, etc.)',
            'action_summary': action_summary,
            'ai_method': 'fallback'
        }

    if is_all_caps_complaint(title + " " + description):
        return {
            'classification': 'noise',
            'confidence': 0.75,
            'reasoning': 'All caps formatting indicates venting/complaint',
            'action_summary': action_summary,
            'ai_method': 'fallback'
        }

    # Check for verified indicators (specific details = verified)
    if has_specific_details(full_text):
        return {
            'classification': 'verified',
            'confidence': 0.75,
            'reasoning': 'Contains specific details (dates, addresses, times, case numbers, etc.)',
            'action_summary': action_summary,
            'ai_method': 'fallback'
        }

    # Default: unreviewed if unsure
    return {
        'classification': 'unreviewed',
        'confidence': 0.5,
        'reasoning': 'Insufficient information for classification',
        'action_summary': action_summary,
        'ai_method': 'fallback'
    }
