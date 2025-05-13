import requests
import csv
import time
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

def calculate_work_experience(start_date, end_date):
    start_date = datetime.fromisoformat(start_date.replace("Z", ""))
    end_date = datetime.fromisoformat(end_date.replace("Z", "")) if end_date else datetime.now()
    delta = end_date - start_date
    return delta.days // 30

headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGdvcml0aG0iOiJFUzI1NiIsImlkIjoiNTNjMDUzNTktYTc5Ni00MzgxLTlmOWEtNDRlN2FkMDBiZjFmIiwiaWF0IjoxNzQxNDg0NDgwLCJleHAiOjE3NDQxMTQyMjZ9.hGGs0fP6iYOmSrw1RiC_o--_wtU-Wuzz99RMYQ-WAec'
}


with open('school_data_with_ids_fuzzy.csv', mode='r', newline='', encoding='utf-8') as f:
    universities = [
        {**row, "university_id": int(float(row["university_id"]))}
        for row in csv.DictReader(f)
        if row.get('university_id') and row.get('name')
    ]

base_url = "https://api.yocket.com/connect/filter/v2/53c05359-a796-4381-9f9a-44e7ad00bf1f"
profile_url_template = "https://api.yocket.com/users/profile/{}/1"

output_filename = "final_pp.csv"
fieldnames = [
    "student_id", "university_id", "university_name", "username", "ielts_score",
    "gre_score", "toefl_score", "technical_papers_count", "work_experience",
    "total_work_experience_in_months", "bachelors_college", "bachelors_course",
    "course_preferences", "ranks_and_metadata"
]

profile_cache = {}

def fetch_student_profile(username):
    if username in profile_cache:
        return profile_cache[username]
    url = profile_url_template.format(username)
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    data = resp.json().get("data", {})
    profile_cache[username] = data
    return data

def process_application(app, profile, university_name):
    username = profile.get("username", "Not Available")
    student_id = app.get("student_id")
    profile_data = fetch_student_profile(username)

    ielts_score = gre_score = toefl_score = None
    for score in profile_data.get('user_test_scores', []):
        name, comp = score.get('name'), score.get('composite', 'Not Available')
        if name == "IELTS": ielts_score = comp
        elif name == "GRE": gre_score = comp
        elif name == "TOEFL": toefl_score = comp

    technical_papers_count = len(profile_data.get('technical_papers', []))
    work_data = profile_data.get('work_experiences', [])
    work_exp = [{"from_date": w.get("from_date"), "to_date": w.get("to_date")} for w in work_data]
    total_months = sum(calculate_work_experience(w["from_date"], w["to_date"]) for w in work_exp if w["from_date"])

    bachelors_college = bachelors_course = "Not Available"
    for edu in profile_data.get('user_education', []):
        inst = edu.get('institutes')
        course = edu.get('course')
        if inst: bachelors_college = inst.get('name', 'Not Available')
        if course: bachelors_course = course.get('name', 'Not Available')

    course_preferences = ', '.join(c.get('name', 'Not Available') for c in profile_data.get('course_preferences', []))

    # New: Extracting ranks & metadata
    ranks_and_metadata = {
        "status_rank": profile_data.get("status_rank"),
        "intake_rank": profile_data.get("intake_rank"),
        "testimonial_rank": profile_data.get("testimonial_rank"),
        "term": profile_data.get("term"),
        "year": profile_data.get("year"),
        "level": profile_data.get("level"),
        "user_stage": profile_data.get("user_stage"),
        "created_at": profile_data.get("created_at"),
        "updated_at": profile_data.get("updated_at"),
        "total_profile":profile
    }

    return {
        "student_id": student_id,
        "university_id": app.get("university_id"),
        "university_name": university_name,
        "username": username,
        "ielts_score": ielts_score,
        "gre_score": gre_score,
        "toefl_score": toefl_score,
        "technical_papers_count": technical_papers_count,
        "work_experience": json.dumps(work_exp),
        "total_work_experience_in_months": total_months,
        "bachelors_college": bachelors_college,
        "bachelors_course": bachelors_course,
        "course_preferences": course_preferences,
        "ranks_and_metadata": json.dumps(ranks_and_metadata)
    }

with open(output_filename, mode="w", newline="", encoding="utf-8") as out_csv:
    writer = csv.DictWriter(out_csv, fieldnames=fieldnames)
    writer.writeheader()

    for uni in universities:
        uni_id = uni["university_id"]
        uni_name = uni["name"]
        print(f"\nProcessing {uni_id} - {uni_name}")
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
                res = requests.get(base_url, headers=headers, params=params)
                res.raise_for_status()
                results = res.json().get("data", {}).get("results", [])
                if not results:
                    break

                tasks = []
                with ThreadPoolExecutor(max_workers=10) as executor:
                    for profile in results:
                        for app in profile.get("university_applications", []):
                            tasks.append(executor.submit(process_application, app, profile, uni_name))
                    for future in as_completed(tasks):
                        writer.writerow(future.result())

                print(f"Page {page} done: {len(results)} profiles")
            except Exception as e:
                print(f"Error {uni_id} page {page}: {e}")
                break

print(f"\nCompleted. Data saved to {output_filename}")
