"""Incident data loading from synthetic JSON data only (per spec requirement)

This module loads community incidents from local JSON files.
No external APIs are used - all data is synthetic and included in the repo.
"""

import os
import json
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


def load_incidents_from_json(file_path: str = None) -> List[Dict]:
    """
    Load incidents from local JSON file.

    Args:
        file_path: Path to incidents.json. If None, tries common locations.

    Returns:
        List of incident dicts with raw_text and location
    """
    if file_path is None:
        # Try multiple paths (relative to different working directories)
        possible_paths = [
            "data/incidents.json",
            "../data/incidents.json",
            "../../data/incidents.json"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                file_path = path
                break

    if file_path is None or not os.path.exists(file_path):
        logger.warning("incidents.json not found")
        return []

    try:
        with open(file_path, 'r') as f:
            incidents = json.load(f)

        logger.info("Loaded %d incidents from JSON", len(incidents))
        return incidents

    except FileNotFoundError:
        logger.warning("File not found: %s", file_path)
        return []
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in %s: %s", file_path, e)
        return []
    except Exception as e:
        logger.error("Error loading JSON: %s", e)
        return []


async def get_incidents(
    location: str = "India",
    category: str = "general"
) -> List[Dict]:
    """
    Get incidents from synthetic JSON data.
    """
    incidents = load_incidents_from_json()
    return incidents
