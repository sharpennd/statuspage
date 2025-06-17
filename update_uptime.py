import json
import requests
from datetime import datetime

DATA_FILE = "data.json"

def check_web():
    try:
        requests.head("https://www.sharpennd.xyz", timeout=5)
        return "online"
    except:
        return "offline"

def check_mc():
    try:
        res = requests.get("https://api.mcsrvstat.us/2/mc.sharpennd.xyz", timeout=5)
        return "online" if res.json().get("online") else "offline"
    except:
        return "offline"

def trim_history(history, limit=60):
    return (history + [])[-limit:]

def main():
    try:
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
    except:
        data = {}

    if "uptime" not in data:
        data["uptime"] = {"mc": [], "web": []}

    data["uptime"]["mc"] = trim_history(data["uptime"].get("mc", []) + [check_mc()])
    data["uptime"]["web"] = trim_history(data["uptime"].get("web", []) + [check_web()])

    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    main()
