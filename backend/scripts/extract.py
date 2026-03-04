import pdfplumber
import datetime
from pymongo import MongoClient
import os

# MongoDB connection
MONGO_URI = "mongodb+srv://sadnanornob:dgZMISXUk2DlgOQk@test-db.essm8.mongodb.net/?retryWrites=true&w=majority&appName=test-db"
client = MongoClient(MONGO_URI)
db = client['test']  # Your database name
exam_schedules = db['examschedules']  # Collection name

# PDF path
pdf_path = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'Final Exam Schedule Fall 2024.pdf')

print(f"Reading PDF from: {pdf_path}")

# To store data from all pages
all_extracted_data = []  

with pdfplumber.open(pdf_path) as pdf:
    for page_num, page in enumerate(pdf.pages, 1):
        print(f"Processing page {page_num}")
        tables = page.extract_tables()

        for table_num, table in enumerate(tables, 1):
            print(f"Processing table {table_num} on page {page_num}")
            header = table[0]
            print(f"Header: {header}")
            data = table[1:]

            if not all_extracted_data:  
                for row in data:
                    if len(row) == len(header):
                        data_dict = {header[i].strip(): row[i].strip() if row[i] else '' for i in range(len(header))}
                        print(f"Extracted row: {data_dict}")
                        all_extracted_data.append(data_dict)
            else:
                # Skipping the header row on subsequent pages
                #data = data[1:]  
                for row in data:
                    if len(row) == len(header):
                        data_dict = {header[i].strip(): row[i].strip() if row[i] else '' for i in range(len(header))}
                        print(f"Extracted row: {data_dict}")
                        all_extracted_data.append(data_dict)

print(f"\nTotal extracted rows: {len(all_extracted_data)}")

# Clear existing records
delete_result = exam_schedules.delete_many({})
print(f"Cleared {delete_result.deleted_count} existing records")

# Process and insert data
inserted_count = 0
for data in all_extracted_data:
    try:
        data_dict = {
            'sl': data.get('SL.', '').strip(),
            'course': data.get('Course', '').strip(),
            'section': data.get('Section', '').strip(),
            'finalDate': datetime.datetime.strptime(data.get('Final Date', ''), '%d-%b-%y'),
            'startTime': data.get('Start Time', '').strip(),
            'endTime': data.get('End Time', '').strip(),
            'room': data.get('Room.', '').strip(),
            'dept': data.get('Dept.', '').strip(), 
            'createdAt': datetime.datetime.utcnow(),
            'updatedAt': datetime.datetime.utcnow()
        }
        exam_schedules.insert_one(data_dict)
        inserted_count += 1
    except Exception as e:
        print(f"Error processing row: {data}")
        print(f"Error details: {str(e)}")

print(f"Successfully inserted {inserted_count} exam schedules")
client.close()
