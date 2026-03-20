"""Incident data loading from synthetic JSON data only (per spec requirement)

This module loads community incidents from local JSON files.
No external APIs are used - all data is synthetic and included in the repo.
"""

import os
import json
from typing import List, Dict
from datetime import datetime


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
        print(f"incidents.json not found")
        return []

    try:
        with open(file_path, 'r') as f:
            incidents = json.load(f)

        print(f"Loaded {len(incidents)} incidents from JSON")
        return incidents

    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return []
    except json.JSONDecodeError as e:
        print(f"Invalid JSON in {file_path}: {str(e)}")
        return []
    except Exception as e:
        print(f"Error loading JSON: {str(e)}")
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
