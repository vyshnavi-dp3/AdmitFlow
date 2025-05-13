import requests
import csv
import time

# Define the header with the Bearer token.
headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGdvcml0aG0iOiJFUzI1NiIsImlkIjoiNTNjMDUzNTktYTc5Ni00MzgxLTlmOWEtNDRlN2FkMDBiZjFmIiwiaWF0IjoxNzQxNDg0NDgwLCJleHAiOjE3NDQxMTQyMjZ9.hGGs0fP6iYOmSrw1RiC_o--_wtU-Wuzz99RMYQ-WAec'
}

# Read the older universities CSV (with columns: university_id, university_name).
universities = []
with open('universities.csv', mode='r', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        # Skip rows with null or empty university_id.
        if not row.get('university_id'):
            print(f"Skipping row with null university_id: {row}")
            continue
        
        try:
            # Convert university_id to integer.
            row['university_id'] = int(float(row['university_id']))
        except ValueError:
            print(f"Skipping row with invalid university_id format: {row}")
            continue
        
        # Ensure university_name is present.
        if not row.get('university_name'):
            print(f"Skipping row with missing university_name: {row}")
            continue
        
        universities.append(row)

print(f"Total valid universities loaded: {len(universities)}")

# A list to store the final results.
results = []

# Constant base URL.
base_url = "https://api.yocket.com/connect/filter/v2/53c05359-a796-4381-9f9a-44e7ad00bf1f"

# Iterate through each university.
for uni in universities:
    uni_id = uni.get('university_id')
    university_name = uni.get('university_name')
    
    print(f"\nProcessing University ID: {uni_id}, Name: {university_name}")
    
    # Loop through pages 0 to 30.
    for page in range(0, 31):
        params = {
            "page": page,
            "items": 9,
            "university_id": uni_id,
            "application_status": "6,7",
            "course_taxonomy_id": 23989,
            "country_id": 1,
            "level": 2
        }
        
        try:
            response = requests.get(base_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Extract the student profiles from the response.
            student_profiles = data.get("data", {}).get("results", [])
            
            if not student_profiles:
                print(f"No profiles found for University ID {uni_id} on page {page}. Ending pagination for this university.")
                break
            
            for profile in student_profiles:
                applications = profile.get("university_applications", [])
                for app in applications:
                    record = {
                        "student_id": app.get("student_id"),
                        "university_id": app.get("university_id"),
                        "university_name": university_name
                    }
                    results.append(record)
            
            print(f"University ID {uni_id}, page {page} processed: {len(student_profiles)} profile(s) found.")
            time.sleep(0.5)
            
        except requests.exceptions.RequestException as e:
            print(f"Error processing University ID {uni_id}, page {page}: {e}")
            break

# Write the collected results into a new CSV file.
output_filename = "student_university_results.csv"
with open(output_filename, mode="w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ["student_id", "university_id", "university_name"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(results)

print(f"\nData written to {output_filename} successfully! Total records: {len(results)}")
