from pathlib import Path
import json
from datetime import datetime, timezone

REPO_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = REPO_ROOT / "docs" / "data"

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Offseason mode: no live teams or scores yet
    teams = []
    scores = []

    with open(OUT_DIR / "teams.json", "w", encoding="utf-8") as f:
        json.dump(teams, f, indent=2, ensure_ascii=False)

    with open(OUT_DIR / "scores.json", "w", encoding="utf-8") as f:
        json.dump(scores, f, indent=2, ensure_ascii=False)

    with open(OUT_DIR / "meta.json", "w", encoding="utf-8") as f:
        json.dump(
            {"last_updated": datetime.now(timezone.utc).isoformat()},
            f,
            indent=2,
            ensure_ascii=False,
        )

    print("Exported offseason placeholder site data.")

if __name__ == "__main__":
    main()
