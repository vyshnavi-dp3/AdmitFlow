import requests

url = "https://api.yocket.com/connect/filter/v2/c3fd8a26-6a70-4720-bb3b-be8f314d9a7e?page=1&items=9&university_id=736&application_status=6,7&level=2"

payload = {}
headers = {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGdvcml0aG0iOiJFUzI1NiIsImlkIjoiYzNmZDhhMjYtNmE3MC00NzIwLWJiM2ItYmU4ZjMxNGQ5YTdlIiwiaWF0IjoxNzQxNDk1MDQyLCJleHAiOjE3NDQxMjQ3ODh9.SlH_PxEUN6ayKNM6zvlRZ6xlKIotQUv83NVWGGz6bAU'
}

response = requests.request("GET", url, headers=headers, data=payload)

print(response.text)
