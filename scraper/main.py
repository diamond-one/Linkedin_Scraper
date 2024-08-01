import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scraper.search import Search

if __name__ == "__main__":
    # Define your search query here
    query = {
        'keywords': 'Data Analyst',
        'location': 'European Union'
    }

    # Create an instance of the Search class and start the job search
    search = Search(query)

    try:
        # Iterate through all pages and extract job data
        all_job_data = []
        while True:
            search.scroll_to_bottom()  # Scroll to load all jobs
            job_data = search.extract_job_data()
            all_job_data.extend(job_data)
            search.save_to_csv(job_data, append=True)  # Save data after each page
            if not search.click_next_page():  # Try clicking 'Next', if fails break the loop
                break
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        search.save_to_csv(all_job_data, append=True)  # Final save
        search.close()
