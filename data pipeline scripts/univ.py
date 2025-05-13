import requests
import csv

# Define the base URL for the API endpoint
base_url = "https://www.usnews.com/best-graduate-schools/api/search?format=json&program=top-computer-science-schools&_page="

# Define headers for the request
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Connection": "keep-alive"
}

# Initialize an empty list to store all universities data
all_universities = []

# Loop through all pages (assuming there are 10 pages as an example, adjust based on actual page count)
for page_num in range(1, 110):  # Change 11 to however many pages you expect
    url = f"{base_url}{page_num}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        universities = data['data']['items']
        
        # Append the universities data to the list
        all_universities.extend(universities)
    else:
        print(f"Failed to fetch data from page {page_num}. Status code: {response.status_code}")

# Define the CSV file name
csv_filename = "top_computer_science_schools.csv"

# Write the data to CSV
with open(csv_filename, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=["name", "city", "state", "url", "ranking", "schoolData"])
    writer.writeheader()
    
    for university in all_universities:
        writer.writerow({
            "name": university["name"],
            "city": university["city"],
            "state": university["state"],
            "url": university["url"],
            "ranking": university["ranking"]["display_rank"] if university.get("ranking") else None,
            "schoolData": university["schoolData"].get("c_avg_acad_rep_score") if university.get("schoolData") else None
        })

print(f"Data has been saved to {csv_filename}")
