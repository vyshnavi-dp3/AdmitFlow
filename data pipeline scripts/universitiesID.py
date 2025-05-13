import requests
import csv

def fetch_all_universities():
    base_url = "https://api.yocket.com/explore/list"
    all_universities = []

    # There are 42 pages; iterate over pages 1 to 42.
    for page in range(1, 43):
        params = {
            "page": page,
            "items": 21,
            "query_source": "w",
            "slug": "usa"
        }
        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()

            # Access the list of universities from the JSON response.
            universities = data["data"]["filter_results"]["result"]

            # Extract university_id and university_name for each entry.
            for uni in universities:
                all_universities.append({
                    "university_id": uni.get("university_id"),
                    "university_name": uni.get("university_name")
                })

            print(f"Page {page} processed.")
        except requests.exceptions.RequestException as e:
            print(f"An error occurred on page {page}: {e}")

    return all_universities

def write_to_csv(universities, filename="universities.csv"):
    # Define the header fields.
    fieldnames = ["university_id", "university_name"]
    try:
        with open(filename, mode="w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(universities)
        print(f"Data written to {filename} successfully!")
    except Exception as e:
        print(f"Error writing CSV: {e}")

if __name__ == "__main__":
    # Fetch all university data from the API.
    university_list = fetch_all_universities()
    print(f"Total universities fetched: {len(university_list)}")
    
    # Write the data to a CSV file.
    write_to_csv(university_list)
