#!/usr/bin/env python3

import requests

# (Optional) Set your API endpoint (for example, if you're running the Flask backend locally on port 5001)
# (If you're running on a remote server, replace "http://localhost:5001" with your endpoint.)
API_ENDPOINT = "http://localhost:5001"

# (Optional) If your backend requires an "Authorization" header (for example, a Bearer token), uncomment and set it.
# (For example, if you're using a "Bearer" token, uncomment the line below and replace "your_token" with your actual token.)
# API_KEY = "your_token"

# (Optional) If you're using an "Authorization" header, uncomment the following line (and comment out the "requests.post" line below).
# headers = { "Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}" }

# (If you're not using an "Authorization" header, use the following header.)
headers = { "Content-Type": "application/json" }

# Sample payload (for /api/analyze/sop) – adjust as needed.
payload = {
    "document": "Your SOP text here... (for example, a sample SOP text.)",
    "college_info": {
        "name": "Stanford University",
        "program": "Computer Science",
        "department": "School of Engineering",
        "keywords": ["AI", "Machine Learning"]
    }
}

# (Optional) If you're testing /api/analyze/lor, uncomment the following payload (and comment out the above payload).
# payload = {
#     "document": "Your LOR text here... (for example, a sample LOR text.)",
#     "college_info": {
#         "name": "Stanford University",
#         "program": "Computer Science",
#         "department": "School of Engineering",
#         "keywords": ["AI", "Machine Learning"]
#     }
# }

# (Optional) If you're using an "Authorization" header, uncomment the following line (and comment out the "requests.post" line below).
# response = requests.post(f"{API_ENDPOINT}/api/analyze/sop", headers=headers, json=payload)

# (If you're not using an "Authorization" header, use the following line.)
response = requests.post(f"{API_ENDPOINT}/api/analyze/sop", headers=headers, json=payload)

# (Optional) If you're testing /api/analyze/lor, uncomment the following line (and comment out the "requests.post" line above).
# response = requests.post(f"{API_ENDPOINT}/api/analyze/lor", headers=headers, json=payload)

# Print the response (status code and JSON (if any) or text).
print("Status Code:", response.status_code)
if response.headers.get("content-type") == "application/json":
    print("Response JSON:", response.json())
else:
    print("Response Text:", response.text) 